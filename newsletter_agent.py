#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI-Powered Newsletter Agent
LLM을 활용하여 자동으로 뉴스레터를 생성하는 AI 에이전트
"""

import os
import yaml
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import re

# Optional: OpenAI API (pip install openai)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Optional: Anthropic API (pip install anthropic)
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

from newsletter_generator import NewsletterGenerator


class NewsletterAgent(NewsletterGenerator):
    """AI 기반 뉴스레터 자동 생성 에이전트"""
    
    def __init__(self, config_path: str = "newsletter_agent_config.yaml"):
        """
        초기화
        
        Args:
            config_path: 에이전트 설정 파일 경로
        """
        super().__init__(config_path)
        
        # AI 설정
        self.ai_provider = self.config.get('ai_provider', 'openai')  # 'openai' or 'anthropic'
        self.ai_model = self.config.get('ai_model', 'gpt-4o-mini')
        self.ai_api_key = self.config.get('ai_api_key') or os.getenv('OPENAI_API_KEY') or os.getenv('ANTHROPIC_API_KEY')
        
        # 에이전트 설정
        self.auto_select = self.config.get('auto_select', True)
        self.auto_summarize = self.config.get('auto_summarize', True)
        self.max_wide_items = self.config.get('max_wide_items', 1)
        self.max_grid_items = self.config.get('max_grid_items', 4)
        
        # AI 클라이언트 초기화
        self._init_ai_client()
    
    def _init_ai_client(self):
        """AI 클라이언트 초기화"""
        if self.ai_provider == 'openai' and OPENAI_AVAILABLE and self.ai_api_key:
            openai.api_key = self.ai_api_key
            self.ai_client = 'openai'
        elif self.ai_provider == 'anthropic' and ANTHROPIC_AVAILABLE and self.ai_api_key:
            self.ai_client = anthropic.Anthropic(api_key=self.ai_api_key)
        else:
            self.ai_client = None
            print("⚠️  AI 클라이언트를 사용할 수 없습니다. 기본 모드로 실행됩니다.")
    
    def _call_llm(self, prompt: str, system_prompt: str = "") -> str:
        """
        LLM 호출
        
        Args:
            prompt: 프롬프트
            system_prompt: 시스템 프롬프트
            
        Returns:
            LLM 응답
        """
        if not self.ai_client:
            return ""
        
        try:
            if self.ai_provider == 'openai' and self.ai_client == 'openai':
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})
                
                response = openai.chat.completions.create(
                    model=self.ai_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                return response.choices[0].message.content
            
            elif self.ai_provider == 'anthropic' and isinstance(self.ai_client, anthropic.Anthropic):
                response = self.ai_client.messages.create(
                    model=self.ai_model,
                    max_tokens=1000,
                    system=system_prompt if system_prompt else "You are a helpful assistant.",
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text
            
        except Exception as e:
            print(f"⚠️  LLM 호출 오류: {e}")
            return ""
        
        return ""
    
    def analyze_post(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """
        포스트 분석 및 점수화
        
        Args:
            post: 포스트 정보
            
        Returns:
            분석 결과 (점수, 카테고리, 키워드 등)
        """
        if not self.ai_client:
            # AI 없이 기본 점수 계산
            score = 50  # 기본 점수
            
            # 최신 포스트에 가산점
            try:
                post_date = datetime.strptime(post['date'], '%Y-%m-%d')
                days_old = (datetime.now() - post_date).days
                score += max(0, 30 - days_old)  # 최대 30점
            except:
                pass
            
            # 설명 길이에 따라
            if post.get('description'):
                score += min(20, len(post['description']) / 10)
            
            return {
                'score': score,
                'category': 'general',
                'keywords': [],
                'importance': 'medium'
            }
        
        # AI를 사용한 분석
        prompt = f"""
다음 블로그 포스트를 분석해주세요:

제목: {post['title']}
날짜: {post['date']}
설명: {post.get('description', 'N/A')}

다음 형식의 JSON으로 답변해주세요:
{{
  "score": 0-100 사이의 점수 (뉴스레터에 포함할 가치),
  "category": "tech/ai/news/tutorial/review 등",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "importance": "high/medium/low",
  "reason": "점수를 준 이유 (간단히)"
}}
"""
        
        system_prompt = "당신은 블로그 포스트를 분석하고 뉴스레터에 적합한지 평가하는 전문가입니다."
        
        response = self._call_llm(prompt, system_prompt)
        
        try:
            # JSON 파싱
            result = json.loads(response)
            return result
        except:
            # 파싱 실패시 기본값
            return {
                'score': 50,
                'category': 'general',
                'keywords': [],
                'importance': 'medium',
                'reason': 'AI 분석 실패'
            }
    
    def generate_summary(self, post: Dict[str, Any], max_length: int = 150) -> str:
        """
        포스트 요약 생성
        
        Args:
            post: 포스트 정보
            max_length: 최대 길이 (글자 수)
            
        Returns:
            생성된 요약
        """
        # 기존 설명이 있으면 사용
        existing_desc = post.get('description', '')
        if existing_desc and len(existing_desc) <= max_length:
            return existing_desc
        
        if not self.ai_client:
            # AI 없이 기존 설명 자르기
            if existing_desc:
                return existing_desc[:max_length] + ('...' if len(existing_desc) > max_length else '')
            return post.get('title', '')[:max_length]
        
        # AI를 사용한 요약
        prompt = f"""
다음 블로그 포스트를 {max_length}자 이내로 간단히 요약해주세요.
뉴스레터에 들어갈 매력적인 한 문장으로 작성해주세요.

제목: {post['title']}
설명: {existing_desc}

요약만 작성하고, 다른 말은 하지 마세요.
"""
        
        system_prompt = "당신은 블로그 포스트를 간결하고 매력적으로 요약하는 전문가입니다."
        
        summary = self._call_llm(prompt, system_prompt).strip()
        
        # 따옴표 제거
        summary = summary.strip('"\'')
        
        return summary[:max_length] if summary else existing_desc[:max_length]
    
    def auto_select_posts(self, candidates: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        자동으로 포스트 선택
        
        Args:
            candidates: 후보 포스트 리스트
            
        Returns:
            {'wide_items': [...], 'grid_items': [...]}
        """
        print("\n🤖 AI가 포스트를 분석하고 선택하는 중...")
        
        # 각 포스트 분석
        analyzed = []
        for i, post in enumerate(candidates):
            print(f"   분석 중 ({i+1}/{len(candidates)}): {post['title'][:50]}...")
            
            analysis = self.analyze_post(post)
            post_with_analysis = {
                **post,
                'analysis': analysis,
                'score': analysis['score']
            }
            analyzed.append(post_with_analysis)
        
        # 점수 순으로 정렬
        analyzed.sort(key=lambda x: x['score'], reverse=True)
        
        # Wide items 선택 (높은 점수 순)
        wide_items = analyzed[:self.max_wide_items]
        
        # Grid items 선택 (그 다음 높은 점수)
        grid_items = analyzed[self.max_wide_items:self.max_wide_items + self.max_grid_items]
        
        # 요약 생성
        if self.auto_summarize:
            print("\n✍️  AI가 요약을 생성하는 중...")
            
            for item in wide_items + grid_items:
                summary = self.generate_summary(item, max_length=200 if item in wide_items else 150)
                item['description'] = summary
        
        print(f"\n✅ 선택 완료:")
        print(f"   📌 Wide Section: {len(wide_items)}개")
        for item in wide_items:
            print(f"      - {item['title']} (점수: {item['score']:.0f})")
        
        print(f"   📊 Grid Section: {len(grid_items)}개")
        for item in grid_items:
            print(f"      - {item['title']} (점수: {item['score']:.0f})")
        
        return {
            'wide_items': wide_items,
            'grid_items': grid_items
        }
    
    def generate_newsletter_title(self, selected_posts: Dict[str, List[Dict[str, Any]]]) -> str:
        """
        뉴스레터 제목 자동 생성
        
        Args:
            selected_posts: 선택된 포스트들
            
        Returns:
            생성된 제목
        """
        if not self.ai_client:
            # AI 없이 기본 제목
            return f"주간 뉴스레터 - {datetime.now().strftime('%Y년 %m월 %d일')}"
        
        # 주요 포스트 제목들
        titles = [p['title'] for p in selected_posts['wide_items'] + selected_posts['grid_items']]
        
        prompt = f"""
다음 포스트들을 포함하는 뉴스레터의 제목을 만들어주세요:

{chr(10).join(f"- {t}" for t in titles[:5])}

요구사항:
- 30자 이내
- 매력적이고 클릭하고 싶게
- 주요 주제를 포함
- 날짜 포함 (예: "2025년 10월 3주차")

제목만 작성하고, 다른 말은 하지 마세요.
"""
        
        system_prompt = "당신은 매력적인 뉴스레터 제목을 작성하는 전문가입니다."
        
        title = self._call_llm(prompt, system_prompt).strip()
        title = title.strip('"\'')
        
        return title if title else f"주간 뉴스레터 - {datetime.now().strftime('%Y년 %m월 %d일')}"
    
    def auto_generate_newsletter(
        self,
        days: int = None,
        title: str = None,
        save: bool = True
    ) -> Optional[Path]:
        """
        완전 자동으로 뉴스레터 생성
        
        Args:
            days: 최근 며칠 이내 포스트를 사용할지
            title: 뉴스레터 제목 (없으면 자동 생성)
            save: 파일로 저장할지
            
        Returns:
            저장된 파일 경로 (save=True인 경우)
        """
        print("=" * 80)
        print("🤖 AI 뉴스레터 에이전트")
        print("=" * 80)
        
        # 1. 후보 포스트 로드
        if days is None:
            days = self.config.get('candidate_days', 30)
        
        candidates = self.get_candidate_posts(days)
        
        if not candidates:
            print("\n❌ 후보 포스트가 없습니다.")
            return None
        
        print(f"\n📚 {len(candidates)}개의 후보 포스트를 찾았습니다.")
        
        # 2. 자동 선택
        selected = self.auto_select_posts(candidates)
        
        if not selected['wide_items'] and not selected['grid_items']:
            print("\n❌ 선택된 포스트가 없습니다.")
            return None
        
        # 3. 제목 생성
        if title is None:
            print("\n📝 AI가 제목을 생성하는 중...")
            title = self.generate_newsletter_title(selected)
            print(f"   ✅ 제목: {title}")
        
        # 4. 뉴스레터 생성
        print("\n⚙️  뉴스레터를 생성하는 중...")
        content = self.generate_newsletter_post(
            title=title,
            wide_items=selected['wide_items'],
            grid_items=selected['grid_items']
        )
        
        # 5. 저장
        if save:
            file_path = self.save_newsletter_post(content)
            
            print(f"\n✅ 뉴스레터가 생성되었습니다!")
            print(f"   📄 파일: {file_path}")
            print(f"   📝 제목: {title}")
            print(f"   🎨 Wide items: {len(selected['wide_items'])}개")
            print(f"   📊 Grid items: {len(selected['grid_items'])}개")
            print("\n" + "=" * 80)
            
            return file_path
        else:
            return content
    
    def interactive_generate_with_ai(self):
        """AI 지원 대화형 뉴스레터 생성"""
        print("=" * 80)
        print("🤖 AI 지원 뉴스레터 생성기")
        print("=" * 80)
        
        # 1. 후보 포스트 로드
        days = self.config.get('candidate_days', 30)
        candidates = self.get_candidate_posts(days)
        
        if not candidates:
            print("\n📭 최근 포스트가 없습니다.")
            return
        
        # 2. 모드 선택
        print("\n🎯 모드를 선택하세요:")
        print("   1) 완전 자동 (AI가 모두 선택)")
        print("   2) AI 추천 + 수동 선택")
        print("   3) 수동 선택만")
        
        mode = input("\n> ").strip()
        
        if mode == '1':
            # 완전 자동
            self.auto_generate_newsletter()
        
        elif mode == '2':
            # AI 추천 후 사용자가 선택
            print("\n🤖 AI가 포스트를 분석하는 중...")
            
            # 포스트 분석
            analyzed = []
            for post in candidates:
                analysis = self.analyze_post(post)
                post['analysis'] = analysis
                post['score'] = analysis['score']
                analyzed.append(post)
            
            # 점수순 정렬
            analyzed.sort(key=lambda x: x['score'], reverse=True)
            
            # AI 추천 표시
            print("\n📊 AI 추천 순위:")
            print("=" * 80)
            for i, post in enumerate(analyzed, 1):
                analysis = post['analysis']
                print(f"\n[{i}] {post['title']}")
                print(f"    점수: {analysis['score']:.0f}/100")
                print(f"    중요도: {analysis['importance']}")
                print(f"    카테고리: {analysis['category']}")
                if analysis.get('reason'):
                    print(f"    이유: {analysis['reason']}")
            print("\n" + "=" * 80)
            
            # 사용자 선택
            print("\n📝 뉴스레터 제목을 입력하세요 (엔터: AI 자동 생성):")
            title = input("> ").strip()
            
            print("\n🎨 Wide Section 번호 (쉼표 구분, 예: 1,2):")
            wide_input = input("> ").strip()
            
            print("\n📊 Grid Section 번호 (쉼표 구분, 예: 3,4,5,6):")
            grid_input = input("> ").strip()
            
            # 선택된 아이템 추출
            wide_items = []
            if wide_input:
                try:
                    indices = [int(i.strip()) - 1 for i in wide_input.split(',')]
                    wide_items = [analyzed[i] for i in indices if 0 <= i < len(analyzed)]
                except:
                    print("⚠️  잘못된 입력")
            
            grid_items = []
            if grid_input:
                try:
                    indices = [int(i.strip()) - 1 for i in grid_input.split(',')]
                    grid_items = [analyzed[i] for i in indices if 0 <= i < len(analyzed)]
                except:
                    print("⚠️  잘못된 입력")
            
            if not wide_items and not grid_items:
                print("\n⚠️  선택된 포스트가 없습니다.")
                return
            
            # 요약 생성
            if self.auto_summarize:
                print("\n✍️  AI가 요약을 생성하는 중...")
                for item in wide_items + grid_items:
                    item['description'] = self.generate_summary(item)
            
            # 제목 생성
            if not title:
                print("\n📝 AI가 제목을 생성하는 중...")
                title = self.generate_newsletter_title({
                    'wide_items': wide_items,
                    'grid_items': grid_items
                })
                print(f"   ✅ 제목: {title}")
            
            # 뉴스레터 생성
            content = self.generate_newsletter_post(
                title=title,
                wide_items=wide_items,
                grid_items=grid_items
            )
            
            file_path = self.save_newsletter_post(content)
            
            print(f"\n✅ 뉴스레터가 생성되었습니다!")
            print(f"   📄 파일: {file_path}")
            print(f"   📝 제목: {title}")
            print("\n" + "=" * 80)
        
        else:
            # 수동 모드
            self.interactive_generate()


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='AI 기반 Jekyll 뉴스레터 자동 생성 에이전트'
    )
    parser.add_argument(
        '--config',
        default='newsletter_agent_config.yaml',
        help='설정 파일 경로'
    )
    parser.add_argument(
        '--auto',
        action='store_true',
        help='완전 자동 모드 (AI가 모두 처리)'
    )
    parser.add_argument(
        '--interactive',
        action='store_true',
        help='대화형 모드 (AI 지원)'
    )
    parser.add_argument(
        '--days',
        type=int,
        help='최근 며칠 이내 포스트 사용'
    )
    parser.add_argument(
        '--title',
        help='뉴스레터 제목 (자동 모드에서 사용)'
    )
    
    args = parser.parse_args()
    
    # 에이전트 초기화
    agent = NewsletterAgent(args.config)
    
    if args.auto:
        # 완전 자동 모드
        agent.auto_generate_newsletter(
            days=args.days,
            title=args.title
        )
    elif args.interactive:
        # AI 지원 대화형 모드
        agent.interactive_generate_with_ai()
    else:
        # 기본: 완전 자동 모드
        agent.auto_generate_newsletter(
            days=args.days,
            title=args.title
        )


if __name__ == '__main__':
    main()

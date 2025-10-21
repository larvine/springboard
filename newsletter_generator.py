#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jekyll Newsletter Post Generator
Jekyll 블로그용 뉴스레터 포스트를 자동으로 생성하는 도구
"""

import os
import yaml
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import re


class NewsletterGenerator:
    """뉴스레터 포스트 생성기"""
    
    def __init__(self, config_path: str = "newsletter_config.yaml"):
        """
        초기화
        
        Args:
            config_path: 설정 파일 경로
        """
        self.config_path = config_path
        self.config = self.load_config()
        self.templates_dir = Path(self.config.get('templates_dir', 'templates'))
        self.posts_dir = Path(self.config.get('posts_dir', '_posts'))
        self.images_dir = Path(self.config.get('images_dir', 'assets/images'))
        
    def load_config(self) -> Dict[str, Any]:
        """설정 파일 로드"""
        if not os.path.exists(self.config_path):
            print(f"⚠️  설정 파일을 찾을 수 없습니다: {self.config_path}")
            print("기본 설정을 사용합니다.")
            return {}
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    
    def load_template(self, template_name: str) -> str:
        """템플릿 파일 로드"""
        template_path = self.templates_dir / template_name
        if not template_path.exists():
            raise FileNotFoundError(f"템플릿 파일을 찾을 수 없습니다: {template_path}")
        
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def get_candidate_posts(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        최근 포스팅을 후보로 추려서 반환
        
        Args:
            days: 최근 며칠 이내의 포스트를 가져올지
            
        Returns:
            포스트 정보 리스트
        """
        candidates = []
        
        # posts_dir이 없으면 빈 리스트 반환
        if not self.posts_dir.exists():
            print(f"⚠️  포스트 디렉토리를 찾을 수 없습니다: {self.posts_dir}")
            return candidates
        
        # 모든 마크다운 파일 검색
        for post_file in sorted(self.posts_dir.glob('*.md'), reverse=True):
            try:
                with open(post_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Front matter 파싱
                if content.startswith('---'):
                    parts = content.split('---', 2)
                    if len(parts) >= 3:
                        front_matter = yaml.safe_load(parts[1])
                        
                        # 날짜 체크
                        post_date = front_matter.get('date')
                        if post_date:
                            if isinstance(post_date, str):
                                post_date = datetime.strptime(post_date.split()[0], '%Y-%m-%d')
                            
                            days_diff = (datetime.now() - post_date).days
                            if days_diff <= days:
                                candidates.append({
                                    'file': post_file.name,
                                    'title': front_matter.get('title', '제목 없음'),
                                    'date': post_date.strftime('%Y-%m-%d'),
                                    'description': front_matter.get('description', ''),
                                    'image': front_matter.get('image', ''),
                                    'url': front_matter.get('url', ''),
                                })
            except Exception as e:
                print(f"⚠️  파일 읽기 오류 ({post_file.name}): {e}")
                continue
        
        return candidates
    
    def show_candidates(self, candidates: List[Dict[str, Any]]):
        """후보 포스트 목록 출력"""
        if not candidates:
            print("\n📭 최근 포스트가 없습니다.")
            return
        
        print("\n📚 뉴스레터 후보 포스트:")
        print("=" * 80)
        for i, post in enumerate(candidates, 1):
            print(f"\n[{i}] {post['title']}")
            print(f"    날짜: {post['date']}")
            if post.get('description'):
                print(f"    설명: {post['description'][:60]}...")
            if post.get('image'):
                print(f"    이미지: {post['image']}")
        print("\n" + "=" * 80)
    
    def generate_wide_section(self, item: Dict[str, Any]) -> str:
        """
        Wide section HTML 생성
        
        Args:
            item: 포스트 정보 (title, image, url, description 등)
            
        Returns:
            생성된 HTML 문자열
        """
        template = self.load_template('wide_section.html')
        
        return template.format(
            title=item.get('title', ''),
            image=item.get('image', ''),
            url=item.get('url', ''),
            description=item.get('description', '')
        )
    
    def generate_grid_section(self, items: List[Dict[str, Any]]) -> str:
        """
        Grid section HTML 생성
        
        Args:
            items: 포스트 정보 리스트
            
        Returns:
            생성된 HTML 문자열
        """
        template = self.load_template('grid_section.html')
        grid_item_template = self.load_template('grid_item.html')
        
        # 각 아이템에 대한 HTML 생성
        grid_items_html = []
        for item in items:
            item_html = grid_item_template.format(
                title=item.get('title', ''),
                image=item.get('image', ''),
                url=item.get('url', ''),
                description=item.get('description', '')
            )
            grid_items_html.append(item_html)
        
        # 전체 grid section 생성
        return template.format(items='\n'.join(grid_items_html))
    
    def generate_newsletter_post(
        self,
        title: str,
        wide_items: List[Dict[str, Any]],
        grid_items: List[Dict[str, Any]],
        date: str = None,
        **kwargs
    ) -> str:
        """
        뉴스레터 포스트 생성
        
        Args:
            title: 뉴스레터 제목
            wide_items: Wide section에 들어갈 아이템들
            grid_items: Grid section에 들어갈 아이템들
            date: 포스트 날짜 (YYYY-MM-DD), None이면 오늘 날짜
            **kwargs: 추가 front matter 필드
            
        Returns:
            생성된 마크다운 포스트 내용
        """
        # 날짜 설정
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Front matter 생성
        front_matter = {
            'layout': kwargs.get('layout', 'post'),
            'title': title,
            'date': f"{date} {datetime.now().strftime('%H:%M:%S')} +0900",
            'categories': kwargs.get('categories', ['newsletter']),
            'tags': kwargs.get('tags', []),
        }
        
        # 추가 필드
        for key, value in kwargs.items():
            if key not in front_matter:
                front_matter[key] = value
        
        # Wide sections 생성
        wide_sections_html = []
        for item in wide_items:
            wide_sections_html.append(self.generate_wide_section(item))
        
        # Grid section 생성
        grid_section_html = ""
        if grid_items:
            grid_section_html = self.generate_grid_section(grid_items)
        
        # 포스트 템플릿 로드
        post_template = self.load_template('post_template.md')
        
        # 최종 포스트 생성
        post_content = post_template.format(
            front_matter=yaml.dump(front_matter, allow_unicode=True, sort_keys=False),
            wide_sections='\n\n'.join(wide_sections_html),
            grid_section=grid_section_html
        )
        
        return post_content
    
    def save_newsletter_post(self, content: str, filename: str = None) -> Path:
        """
        뉴스레터 포스트 저장
        
        Args:
            content: 포스트 내용
            filename: 파일명 (없으면 자동 생성)
            
        Returns:
            저장된 파일 경로
        """
        # 파일명 생성
        if filename is None:
            date_str = datetime.now().strftime('%Y-%m-%d')
            filename = f"{date_str}-newsletter.md"
        
        # 디렉토리 생성
        self.posts_dir.mkdir(parents=True, exist_ok=True)
        
        # 파일 저장
        file_path = self.posts_dir / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return file_path
    
    def interactive_generate(self):
        """대화형으로 뉴스레터 생성"""
        print("=" * 80)
        print("🎯 Jekyll 뉴스레터 포스트 생성기")
        print("=" * 80)
        
        # 1. 후보 포스트 로드
        days = self.config.get('candidate_days', 30)
        candidates = self.get_candidate_posts(days)
        self.show_candidates(candidates)
        
        # 2. 뉴스레터 제목 입력
        print("\n📝 뉴스레터 제목을 입력하세요:")
        title = input("> ").strip()
        if not title:
            title = f"Weekly Newsletter - {datetime.now().strftime('%Y년 %m월 %d일')}"
        
        # 3. Wide section 아이템 선택
        print("\n🎨 Wide Section에 들어갈 포스트를 선택하세요:")
        print("   (번호를 쉼표로 구분하여 입력, 예: 1,3,5 또는 엔터로 건너뛰기)")
        wide_input = input("> ").strip()
        
        wide_items = []
        if wide_input:
            try:
                indices = [int(i.strip()) - 1 for i in wide_input.split(',')]
                wide_items = [candidates[i] for i in indices if 0 <= i < len(candidates)]
            except (ValueError, IndexError):
                print("⚠️  잘못된 입력입니다. Wide section을 건너뜁니다.")
        
        # 4. Grid section 아이템 선택
        print("\n📊 Grid Section에 들어갈 포스트를 선택하세요:")
        print("   (번호를 쉼표로 구분하여 입력, 예: 2,4,6 또는 엔터로 건너뛰기)")
        grid_input = input("> ").strip()
        
        grid_items = []
        if grid_input:
            try:
                indices = [int(i.strip()) - 1 for i in grid_input.split(',')]
                grid_items = [candidates[i] for i in indices if 0 <= i < len(candidates)]
            except (ValueError, IndexError):
                print("⚠️  잘못된 입력입니다. Grid section을 건너뜁니다.")
        
        # 5. 뉴스레터 생성
        if not wide_items and not grid_items:
            print("\n⚠️  선택된 포스트가 없습니다. 뉴스레터를 생성하지 않습니다.")
            return
        
        print("\n⚙️  뉴스레터를 생성하는 중...")
        content = self.generate_newsletter_post(
            title=title,
            wide_items=wide_items,
            grid_items=grid_items
        )
        
        # 6. 파일 저장
        file_path = self.save_newsletter_post(content)
        
        print(f"\n✅ 뉴스레터가 생성되었습니다!")
        print(f"   📄 파일: {file_path}")
        print(f"   📝 제목: {title}")
        print(f"   🎨 Wide items: {len(wide_items)}개")
        print(f"   📊 Grid items: {len(grid_items)}개")
        print("\n" + "=" * 80)
    
    def batch_generate(self, items_data: Dict[str, Any]) -> Path:
        """
        배치 모드로 뉴스레터 생성
        
        Args:
            items_data: 뉴스레터 데이터 (JSON 형식)
                {
                    "title": "뉴스레터 제목",
                    "wide_items": [...],
                    "grid_items": [...],
                    "date": "2025-10-21"  # optional
                }
        
        Returns:
            저장된 파일 경로
        """
        title = items_data.get('title', f"Newsletter - {datetime.now().strftime('%Y-%m-%d')}")
        wide_items = items_data.get('wide_items', [])
        grid_items = items_data.get('grid_items', [])
        date = items_data.get('date')
        
        content = self.generate_newsletter_post(
            title=title,
            wide_items=wide_items,
            grid_items=grid_items,
            date=date
        )
        
        filename = items_data.get('filename')
        file_path = self.save_newsletter_post(content, filename)
        
        return file_path


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Jekyll 블로그용 뉴스레터 포스트 생성기'
    )
    parser.add_argument(
        '--config',
        default='newsletter_config.yaml',
        help='설정 파일 경로 (기본값: newsletter_config.yaml)'
    )
    parser.add_argument(
        '--batch',
        help='배치 모드로 실행 (JSON 파일 경로)'
    )
    parser.add_argument(
        '--candidates',
        action='store_true',
        help='후보 포스트만 표시하고 종료'
    )
    
    args = parser.parse_args()
    
    # 생성기 초기화
    generator = NewsletterGenerator(args.config)
    
    # 후보 표시만
    if args.candidates:
        candidates = generator.get_candidate_posts()
        generator.show_candidates(candidates)
        
        # JSON으로도 출력
        print("\n📋 JSON 형식:")
        print(json.dumps(candidates, ensure_ascii=False, indent=2))
        return
    
    # 배치 모드
    if args.batch:
        with open(args.batch, 'r', encoding='utf-8') as f:
            items_data = json.load(f)
        
        file_path = generator.batch_generate(items_data)
        print(f"✅ 뉴스레터가 생성되었습니다: {file_path}")
        return
    
    # 대화형 모드
    generator.interactive_generate()


if __name__ == '__main__':
    main()

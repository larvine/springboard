#!/bin/bash
# AI Newsletter Agent 설치 스크립트

echo "================================================"
echo "🤖 AI Newsletter Agent 설치"
echo "================================================"

# Python 버전 확인
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python 버전: $python_version"

# pip 업그레이드
echo ""
echo "📦 pip 업그레이드 중..."
python3 -m pip install --upgrade pip

# 패키지 설치
echo ""
echo "📦 필수 패키지 설치 중..."
python3 -m pip install -r requirements_agent.txt

echo ""
echo "================================================"
echo "✅ 설치 완료!"
echo "================================================"
echo ""
echo "🎯 다음 단계:"
echo ""
echo "1. API 키 설정:"
echo "   export OPENAI_API_KEY='your-api-key-here'"
echo "   또는"
echo "   export ANTHROPIC_API_KEY='your-api-key-here'"
echo ""
echo "2. 설정 파일 수정:"
echo "   vi newsletter_agent_config.yaml"
echo ""
echo "3. 에이전트 실행:"
echo "   python3 newsletter_agent.py --auto"
echo ""
echo "4. 스케줄러 실행:"
echo "   python3 scheduler.py"
echo ""
echo "================================================"

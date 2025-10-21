#!/bin/bash
# Crontab 설정 헬퍼 스크립트

echo "================================================"
echo "⏰ Crontab 설정 헬퍼"
echo "================================================"

# 현재 디렉토리
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PYTHON_PATH=$(which python3)

echo ""
echo "현재 디렉토리: $SCRIPT_DIR"
echo "Python 경로: $PYTHON_PATH"

echo ""
echo "🎯 스케줄 예시:"
echo "1) 매주 월요일 오전 9시"
echo "2) 매일 오전 10시"
echo "3) 매주 금요일 오후 6시"
echo "4) 커스텀 설정"

echo ""
read -p "선택 (1-4): " choice

case $choice in
  1)
    CRON_EXPR="0 9 * * 1"
    DESC="매주 월요일 오전 9시"
    ;;
  2)
    CRON_EXPR="0 10 * * *"
    DESC="매일 오전 10시"
    ;;
  3)
    CRON_EXPR="0 18 * * 5"
    DESC="매주 금요일 오후 6시"
    ;;
  4)
    echo ""
    echo "Cron 표현식을 입력하세요 (예: 0 9 * * 1):"
    read -p "> " CRON_EXPR
    DESC="커스텀"
    ;;
  *)
    echo "❌ 잘못된 선택"
    exit 1
    ;;
esac

# Crontab 항목 생성
CRON_COMMAND="cd $SCRIPT_DIR && $PYTHON_PATH newsletter_agent.py --auto >> $SCRIPT_DIR/newsletter_agent.log 2>&1"
CRON_ENTRY="$CRON_EXPR $CRON_COMMAND"

echo ""
echo "================================================"
echo "📋 생성될 Crontab 항목:"
echo "================================================"
echo "$CRON_ENTRY"
echo ""

read -p "이 항목을 crontab에 추가하시겠습니까? (y/n): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  # 기존 crontab 백업
  crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null
  
  # 새 항목 추가
  (crontab -l 2>/dev/null; echo "# Newsletter Agent - $DESC"; echo "$CRON_ENTRY") | crontab -
  
  echo ""
  echo "✅ Crontab에 추가되었습니다!"
  echo ""
  echo "현재 Crontab 목록:"
  crontab -l
  
  echo ""
  echo "📝 로그 파일: $SCRIPT_DIR/newsletter_agent.log"
  echo ""
  echo "💡 팁:"
  echo "   - Crontab 확인: crontab -l"
  echo "   - Crontab 편집: crontab -e"
  echo "   - Crontab 삭제: crontab -r"
  echo "   - 로그 확인: tail -f $SCRIPT_DIR/newsletter_agent.log"
else
  echo ""
  echo "❌ 취소되었습니다."
fi

echo ""
echo "================================================"

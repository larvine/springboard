#!/bin/bash
# 메트릭 수집 스케줄러 설정 스크립트

echo "=========================================="
echo "메트릭 수집 스케줄러 설정"
echo "=========================================="
echo ""

echo "옵션 1: Celery Beat 사용 (권장)"
echo "-------------------------------------------"
echo "1. Redis 설치 및 실행:"
echo "   sudo apt-get install redis-server"
echo "   redis-server"
echo ""
echo "2. Celery Worker 실행 (터미널 1):"
echo "   celery -A backend worker --loglevel=info"
echo ""
echo "3. Celery Beat 실행 (터미널 2):"
echo "   celery -A backend beat --loglevel=info"
echo ""
echo "   => 5분마다 자동으로 메트릭 수집"
echo ""

echo "옵션 2: Cron 사용 (간단)"
echo "-------------------------------------------"
echo "crontab -e 로 다음 추가:"
echo "*/5 * * * * cd /workspace && python3 manage.py collect_metrics >> /tmp/metrics_collect.log 2>&1"
echo ""

echo "옵션 3: 수동 실행 (테스트)"
echo "-------------------------------------------"
echo "python3 manage.py collect_metrics"
echo ""

echo "=========================================="

"""
Celery Tasks

주기적으로 실행되는 비동기 작업들
"""

from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)


@shared_task
def collect_metrics_task():
    """
    Prometheus에서 메트릭을 수집하는 Celery task
    5분마다 자동 실행됨
    """
    try:
        logger.info("Starting metrics collection task...")
        call_command('collect_metrics')
        logger.info("Metrics collection task completed successfully")
        return "Metrics collected successfully"
    except Exception as e:
        logger.error(f"Metrics collection task failed: {str(e)}", exc_info=True)
        raise

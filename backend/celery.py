"""
Celery 설정

5분마다 메트릭을 수집하는 주기적 작업을 설정합니다.
"""

import os
from celery import Celery
from celery.schedules import crontab

# Django settings 모듈 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Django settings에서 celery 설정 로드
app.config_from_object('django.conf:settings', namespace='CELERY')

# Django app에서 tasks 자동 탐색
app.autodiscover_tasks()

# 주기적 작업 스케줄 설정
app.conf.beat_schedule = {
    'collect-metrics-every-5-minutes': {
        'task': 'api.tasks.collect_metrics_task',
        'schedule': 300.0,  # 5분 = 300초
        # 또는 crontab 사용:
        # 'schedule': crontab(minute='*/5'),  # 5분마다
    },
}

# 타임존 설정
app.conf.timezone = 'Asia/Seoul'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

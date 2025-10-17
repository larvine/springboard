"""
API URL Configuration
"""

from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    # 모델별 메트릭 조회 (P50, P95, P99 모두)
    path('metrics/', views.get_model_metrics, name='model_metrics'),
    
    # P95만 조회 (status.js용 - 가벼운 응답)
    path('metrics/p95/', views.get_model_p95_only, name='model_p95_only'),
    
    # 메트릭 히스토리 조회 (차트용)
    path('metrics/history/', views.get_model_metrics_history, name='model_metrics_history'),
    
    # 헬스 체크
    path('health/', views.health_check, name='health_check'),
]

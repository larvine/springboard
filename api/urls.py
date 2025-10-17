"""
API URL Configuration
"""

from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    # 모델별 P95 메트릭 조회
    path('metrics/p95/', views.get_model_p95_metrics, name='model_p95_metrics'),
    
    # 시간 범위 동안의 모델별 P95 메트릭 조회
    path('metrics/p95/range/', views.get_model_p95_range_metrics, name='model_p95_range_metrics'),
    
    # 여러 백분위수 조회
    path('metrics/percentiles/', views.get_model_multiple_percentiles, name='model_multiple_percentiles'),
]

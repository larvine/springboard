"""
API views for Model Metrics (DB 기반)
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from api.models import ModelMetric, ModelMetricHistory
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
def get_model_metrics(request):
    """
    DB에 저장된 최신 모델별 메트릭을 조회하는 API endpoint
    
    Query Parameters:
        - metric_name: 메트릭 이름 (기본값: request_duration_seconds)
        - time_range: 시간 범위 (기본값: 5m)
    
    Returns:
        JSON 형태의 모델별 메트릭 데이터
    """
    try:
        metric_name = request.GET.get('metric_name', 'request_duration_seconds')
        time_range = request.GET.get('time_range', '5m')
        
        # DB에서 최신 메트릭 조회
        metrics = ModelMetric.objects.filter(
            metric_name=metric_name,
            time_range=time_range
        ).order_by('model_name')
        
        if not metrics.exists():
            return Response(
                {
                    'status': 'success',
                    'message': 'No metrics found. Run "python3 manage.py collect_metrics" to collect data.',
                    'data': [],
                    'count': 0
                },
                status=status.HTTP_200_OK
            )
        
        # 데이터 포맷팅
        formatted_data = []
        for metric in metrics:
            formatted_data.append({
                'model': metric.model_name,
                'p50_latency_ms': metric.p50_latency_ms,
                'p95_latency_ms': metric.p95_latency_ms,
                'p99_latency_ms': metric.p99_latency_ms,
                'collected_at': metric.collected_at.isoformat(),
                'metric_name': metric.metric_name,
                'time_range': metric.time_range
            })
        
        # P95 기준으로 정렬 (내림차순)
        formatted_data.sort(key=lambda x: x.get('p95_latency_ms', 0) or 0, reverse=True)
        
        return Response({
            'status': 'success',
            'data': formatted_data,
            'count': len(formatted_data),
            'last_updated': metrics.first().collected_at.isoformat() if metrics.exists() else None
        })
        
    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_model_p95_only(request):
    """
    P95 메트릭만 조회하는 간단한 API endpoint (status.js 용)
    
    Query Parameters:
        - metric_name: 메트릭 이름 (기본값: request_duration_seconds)
    
    Returns:
        JSON 형태의 모델별 P95 메트릭 데이터 (간소화)
    """
    try:
        metric_name = request.GET.get('metric_name', 'request_duration_seconds')
        
        # DB에서 최신 메트릭 조회
        metrics = ModelMetric.objects.filter(
            metric_name=metric_name
        ).order_by('model_name')
        
        if not metrics.exists():
            return Response({
                'status': 'success',
                'data': [],
                'count': 0,
                'message': 'No data available. Waiting for metric collection.'
            })
        
        # 간단한 포맷 (status.js에서 사용하기 쉽게)
        formatted_data = []
        for metric in metrics:
            formatted_data.append({
                'model': metric.model_name,
                'p95_latency_ms': round(metric.p95_latency_ms, 2) if metric.p95_latency_ms else None,
                'collected_at': metric.collected_at.isoformat()
            })
        
        # P95 기준으로 정렬
        formatted_data.sort(key=lambda x: x.get('p95_latency_ms', 0) or 0, reverse=True)
        
        return Response({
            'status': 'success',
            'data': formatted_data,
            'count': len(formatted_data),
            'last_updated': metrics.first().collected_at.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching P95 metrics: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_model_metrics_history(request):
    """
    시간 범위 동안의 모델별 P95 메트릭 히스토리를 조회하는 API endpoint
    
    Query Parameters:
        - model_name: 모델 이름 (선택)
        - metric_name: 메트릭 이름 (기본값: request_duration_seconds)
        - hours: 조회할 시간 (기본값: 1시간)
    
    Returns:
        JSON 형태의 시간별 모델별 P95 메트릭 데이터
    """
    try:
        model_name = request.GET.get('model_name')
        metric_name = request.GET.get('metric_name', 'request_duration_seconds')
        hours = int(request.GET.get('hours', 1))
        
        # 시간 범위 계산
        end_time = timezone.now()
        start_time = end_time - timedelta(hours=hours)
        
        # 쿼리 필터
        filters = {
            'metric_name': metric_name,
            'timestamp__gte': start_time,
            'timestamp__lte': end_time
        }
        
        if model_name:
            filters['model_name'] = model_name
        
        # DB에서 히스토리 조회
        history = ModelMetricHistory.objects.filter(**filters).order_by('timestamp')
        
        if not history.exists():
            return Response({
                'status': 'success',
                'data': [],
                'count': 0
            })
        
        # 모델별로 그룹핑
        model_data = {}
        for record in history:
            if record.model_name not in model_data:
                model_data[record.model_name] = {
                    'model': record.model_name,
                    'data_points': []
                }
            
            model_data[record.model_name]['data_points'].append({
                'timestamp': record.timestamp.isoformat(),
                'p95_latency_ms': round(record.p95_latency_ms, 2)
            })
        
        formatted_data = list(model_data.values())
        
        return Response({
            'status': 'success',
            'data': formatted_data,
            'count': len(formatted_data),
            'time_range': {
                'start': start_time.isoformat(),
                'end': end_time.isoformat(),
                'hours': hours
            }
        })
        
    except ValueError:
        return Response(
            {
                'error': 'Invalid parameter',
                'message': 'hours must be an integer'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error fetching metrics history: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """
    헬스 체크 엔드포인트
    마지막 메트릭 수집 시간을 반환
    """
    try:
        latest_metric = ModelMetric.objects.order_by('-collected_at').first()
        
        if not latest_metric:
            return Response({
                'status': 'warning',
                'message': 'No metrics collected yet',
                'last_collection': None
            })
        
        # 마지막 수집이 10분 이상 지났는지 확인
        time_diff = timezone.now() - latest_metric.collected_at
        is_stale = time_diff > timedelta(minutes=10)
        
        return Response({
            'status': 'stale' if is_stale else 'healthy',
            'last_collection': latest_metric.collected_at.isoformat(),
            'minutes_ago': round(time_diff.total_seconds() / 60, 1),
            'model_count': ModelMetric.objects.count()
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}", exc_info=True)
        return Response(
            {
                'status': 'error',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

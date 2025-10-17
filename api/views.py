"""
API views for Prometheus metrics
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from query_p95_metrics import PrometheusP95Query
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
def get_model_p95_metrics(request):
    """
    모델별 P95 메트릭을 조회하는 API endpoint
    
    Query Parameters:
        - metric_name: 메트릭 이름 (기본값: request_duration_seconds)
        - time_range: 시간 범위 (기본값: 5m)
        - model_label: 모델 레이블 이름 (기본값: model)
        - prometheus_url: Prometheus URL (기본값: settings.PROMETHEUS_URL)
    
    Returns:
        JSON 형태의 모델별 P95 메트릭 데이터
    """
    try:
        # Query parameters
        metric_name = request.GET.get('metric_name', 'request_duration_seconds')
        time_range = request.GET.get('time_range', '5m')
        model_label = request.GET.get('model_label', 'model')
        prometheus_url = request.GET.get('prometheus_url', settings.PROMETHEUS_URL)
        
        # PrometheusP95Query 인스턴스 생성
        prom_query = PrometheusP95Query(prometheus_url)
        
        # P95 메트릭 조회
        results = prom_query.query_p95_by_model(
            metric_name=metric_name,
            time_range=time_range,
            model_label=model_label
        )
        
        # 결과 검증
        if not results or results.get('status') != 'success':
            return Response(
                {
                    'error': 'Failed to fetch metrics from Prometheus',
                    'details': results
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # 데이터 변환 (밀리초 단위로)
        data = results.get('data', {})
        result_list = data.get('result', [])
        
        formatted_data = []
        for item in result_list:
            metric = item.get('metric', {})
            model_name = metric.get(model_label, 'Unknown')
            
            if 'value' in item:
                timestamp, value = item['value']
                value_ms = float(value) * 1000  # 초를 밀리초로 변환
                
                formatted_data.append({
                    'model': model_name,
                    'p95_latency_ms': round(value_ms, 2),
                    'timestamp': timestamp,
                    'metric_name': metric_name,
                    'time_range': time_range
                })
        
        # 값 기준으로 정렬 (내림차순)
        formatted_data.sort(key=lambda x: x['p95_latency_ms'], reverse=True)
        
        return Response({
            'status': 'success',
            'data': formatted_data,
            'count': len(formatted_data)
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
def get_model_p95_range_metrics(request):
    """
    시간 범위 동안의 모델별 P95 메트릭을 조회하는 API endpoint
    
    Query Parameters:
        - metric_name: 메트릭 이름 (기본값: request_duration_seconds)
        - duration: 조회할 시간 길이 (기본값: 1h)
        - step: 데이터 포인트 간격 (기본값: 1m)
        - model_label: 모델 레이블 이름 (기본값: model)
        - prometheus_url: Prometheus URL (기본값: settings.PROMETHEUS_URL)
    
    Returns:
        JSON 형태의 시간별 모델별 P95 메트릭 데이터
    """
    try:
        # Query parameters
        metric_name = request.GET.get('metric_name', 'request_duration_seconds')
        duration = request.GET.get('duration', '1h')
        step = request.GET.get('step', '1m')
        model_label = request.GET.get('model_label', 'model')
        prometheus_url = request.GET.get('prometheus_url', settings.PROMETHEUS_URL)
        
        # PrometheusP95Query 인스턴스 생성
        prom_query = PrometheusP95Query(prometheus_url)
        
        # P95 range 메트릭 조회
        results = prom_query.query_p95_range_by_model(
            metric_name=metric_name,
            duration=duration,
            step=step,
            model_label=model_label
        )
        
        # 결과 검증
        if not results or results.get('status') != 'success':
            return Response(
                {
                    'error': 'Failed to fetch range metrics from Prometheus',
                    'details': results
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # 데이터 변환
        data = results.get('data', {})
        result_list = data.get('result', [])
        
        formatted_data = []
        for item in result_list:
            metric = item.get('metric', {})
            model_name = metric.get(model_label, 'Unknown')
            
            if 'values' in item:
                values = item['values']
                data_points = []
                
                for timestamp, value in values:
                    value_ms = float(value) * 1000  # 초를 밀리초로 변환
                    data_points.append({
                        'timestamp': timestamp,
                        'p95_latency_ms': round(value_ms, 2)
                    })
                
                formatted_data.append({
                    'model': model_name,
                    'data_points': data_points,
                    'metric_name': metric_name,
                    'duration': duration,
                    'step': step
                })
        
        return Response({
            'status': 'success',
            'data': formatted_data,
            'count': len(formatted_data)
        })
        
    except Exception as e:
        logger.error(f"Error fetching P95 range metrics: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_model_multiple_percentiles(request):
    """
    여러 백분위수를 한 번에 조회하는 API endpoint
    
    Query Parameters:
        - metric_name: 메트릭 이름 (기본값: request_duration_seconds)
        - percentiles: 백분위수 리스트 (기본값: 50,95,99)
        - time_range: 시간 범위 (기본값: 5m)
        - model_label: 모델 레이블 이름 (기본값: model)
        - prometheus_url: Prometheus URL (기본값: settings.PROMETHEUS_URL)
    
    Returns:
        JSON 형태의 모델별 여러 백분위수 메트릭 데이터
    """
    try:
        # Query parameters
        metric_name = request.GET.get('metric_name', 'request_duration_seconds')
        percentiles_str = request.GET.get('percentiles', '50,95,99')
        time_range = request.GET.get('time_range', '5m')
        model_label = request.GET.get('model_label', 'model')
        prometheus_url = request.GET.get('prometheus_url', settings.PROMETHEUS_URL)
        
        # 백분위수 파싱
        try:
            percentiles = [int(p.strip()) / 100 for p in percentiles_str.split(',')]
        except ValueError:
            return Response(
                {
                    'error': 'Invalid percentiles format',
                    'message': 'Percentiles should be comma-separated numbers (e.g., 50,95,99)'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # PrometheusP95Query 인스턴스 생성
        prom_query = PrometheusP95Query(prometheus_url)
        
        # 여러 백분위수 조회
        results = prom_query.query_multiple_percentiles(
            metric_name=metric_name,
            percentiles=percentiles,
            time_range=time_range,
            model_label=model_label
        )
        
        # 모델별로 데이터 재구성
        model_stats = {}
        
        for percentile, result in results.items():
            if result.get('status') == 'success':
                data = result.get('data', {})
                result_list = data.get('result', [])
                
                for item in result_list:
                    metric = item.get('metric', {})
                    model_name = metric.get(model_label, 'Unknown')
                    
                    if 'value' in item:
                        timestamp, value = item['value']
                        value_ms = float(value) * 1000  # 초를 밀리초로 변환
                        
                        if model_name not in model_stats:
                            model_stats[model_name] = {
                                'model': model_name,
                                'percentiles': {},
                                'timestamp': timestamp
                            }
                        
                        percentile_key = f'p{int(percentile*100)}'
                        model_stats[model_name]['percentiles'][percentile_key] = round(value_ms, 2)
        
        # 리스트로 변환
        formatted_data = list(model_stats.values())
        
        return Response({
            'status': 'success',
            'data': formatted_data,
            'count': len(formatted_data),
            'metric_name': metric_name,
            'time_range': time_range
        })
        
    except Exception as e:
        logger.error(f"Error fetching multiple percentiles: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

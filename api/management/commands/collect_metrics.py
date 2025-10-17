"""
Prometheus 메트릭 수집 Management Command

5분마다 실행되어 Prometheus에서 메트릭을 수집하고 DB에 저장합니다.

사용법:
    python3 manage.py collect_metrics
    python3 manage.py collect_metrics --prometheus-url http://prometheus:9090
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from api.models import ModelMetric, ModelMetricHistory
from query_p95_metrics import PrometheusP95Query
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Prometheus에서 모델별 메트릭을 수집하고 DB에 저장합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--prometheus-url',
            type=str,
            default=getattr(settings, 'PROMETHEUS_URL', 'http://localhost:9090'),
            help='Prometheus 서버 URL'
        )
        parser.add_argument(
            '--metric-name',
            type=str,
            default='request_duration_seconds',
            help='수집할 메트릭 이름'
        )
        parser.add_argument(
            '--time-range',
            type=str,
            default='5m',
            help='시간 범위'
        )
        parser.add_argument(
            '--model-label',
            type=str,
            default='model',
            help='모델 레이블 이름'
        )

    def handle(self, *args, **options):
        prometheus_url = options['prometheus_url']
        metric_name = options['metric_name']
        time_range = options['time_range']
        model_label = options['model_label']
        
        self.stdout.write(self.style.SUCCESS(
            f'\n{"="*60}\n'
            f'🚀 메트릭 수집 시작\n'
            f'{"="*60}'
        ))
        self.stdout.write(f'Prometheus URL: {prometheus_url}')
        self.stdout.write(f'메트릭: {metric_name}')
        self.stdout.write(f'시간 범위: {time_range}\n')
        
        try:
            # PrometheusP95Query 인스턴스 생성
            prom_query = PrometheusP95Query(prometheus_url)
            
            # 여러 백분위수 조회 (P50, P95, P99)
            percentiles = [0.50, 0.95, 0.99]
            results = prom_query.query_multiple_percentiles(
                metric_name=metric_name,
                percentiles=percentiles,
                time_range=time_range,
                model_label=model_label
            )
            
            # 수집 시간
            collected_at = timezone.now()
            
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
                                    'prometheus_timestamp': timestamp,
                                }
                            
                            percentile_key = f'p{int(percentile*100)}'
                            model_stats[model_name][percentile_key] = round(value_ms, 2)
            
            # DB에 저장
            saved_count = 0
            for model_name, stats in model_stats.items():
                # ModelMetric 저장 (최신 데이터)
                metric, created = ModelMetric.objects.update_or_create(
                    model_name=model_name,
                    metric_name=metric_name,
                    time_range=time_range,
                    defaults={
                        'p50_latency_ms': stats.get('p50'),
                        'p95_latency_ms': stats.get('p95'),
                        'p99_latency_ms': stats.get('p99'),
                        'prometheus_timestamp': stats.get('prometheus_timestamp'),
                        'collected_at': collected_at,
                    }
                )
                
                # ModelMetricHistory 저장 (히스토리)
                if stats.get('p95'):
                    ModelMetricHistory.objects.create(
                        model_name=model_name,
                        metric_name=metric_name,
                        p95_latency_ms=stats.get('p95'),
                        timestamp=collected_at,
                        prometheus_timestamp=stats.get('prometheus_timestamp'),
                    )
                
                saved_count += 1
                
                status_icon = "✨" if created else "🔄"
                self.stdout.write(
                    self.style.SUCCESS(
                        f'{status_icon} {model_name}: '
                        f'P50={stats.get("p50")}ms, '
                        f'P95={stats.get("p95")}ms, '
                        f'P99={stats.get("p99")}ms'
                    )
                )
            
            self.stdout.write(self.style.SUCCESS(
                f'\n{"="*60}\n'
                f'✅ 메트릭 수집 완료: {saved_count}개 모델\n'
                f'{"="*60}\n'
            ))
            
            # 로그 기록
            logger.info(
                f'Metrics collected: {saved_count} models, '
                f'metric={metric_name}, time_range={time_range}'
            )
            
        except Exception as e:
            error_msg = f'메트릭 수집 실패: {str(e)}'
            self.stdout.write(self.style.ERROR(f'\n❌ {error_msg}\n'))
            logger.error(error_msg, exc_info=True)
            raise

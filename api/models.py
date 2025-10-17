from django.db import models
from django.utils import timezone


class ModelMetric(models.Model):
    """
    모델별 메트릭을 저장하는 모델
    5분마다 Prometheus에서 수집한 데이터를 저장
    """
    
    # 모델 정보
    model_name = models.CharField(max_length=100, verbose_name="모델 이름")
    
    # 메트릭 정보
    metric_name = models.CharField(max_length=100, default="request_duration_seconds", verbose_name="메트릭 이름")
    
    # 백분위수 데이터 (밀리초 단위)
    p50_latency_ms = models.FloatField(null=True, blank=True, verbose_name="P50 레이턴시 (ms)")
    p95_latency_ms = models.FloatField(null=True, blank=True, verbose_name="P95 레이턴시 (ms)")
    p99_latency_ms = models.FloatField(null=True, blank=True, verbose_name="P99 레이턴시 (ms)")
    
    # 시간 정보
    time_range = models.CharField(max_length=20, default="5m", verbose_name="시간 범위")
    collected_at = models.DateTimeField(default=timezone.now, verbose_name="수집 시간")
    prometheus_timestamp = models.FloatField(null=True, blank=True, verbose_name="Prometheus 타임스탬프")
    
    # 메타 정보
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성 시간")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정 시간")
    
    class Meta:
        verbose_name = "모델 메트릭"
        verbose_name_plural = "모델 메트릭"
        ordering = ['-collected_at', 'model_name']
        indexes = [
            models.Index(fields=['model_name', '-collected_at']),
            models.Index(fields=['-collected_at']),
        ]
    
    def __str__(self):
        return f"{self.model_name} - P95: {self.p95_latency_ms}ms ({self.collected_at})"


class ModelMetricHistory(models.Model):
    """
    모델별 메트릭 히스토리를 저장하는 모델
    시계열 데이터 저장용
    """
    
    # 모델 정보
    model_name = models.CharField(max_length=100, verbose_name="모델 이름")
    
    # 메트릭 정보
    metric_name = models.CharField(max_length=100, default="request_duration_seconds", verbose_name="메트릭 이름")
    
    # P95 데이터 (밀리초 단위)
    p95_latency_ms = models.FloatField(verbose_name="P95 레이턴시 (ms)")
    
    # 시간 정보
    timestamp = models.DateTimeField(db_index=True, verbose_name="타임스탬프")
    prometheus_timestamp = models.FloatField(null=True, blank=True, verbose_name="Prometheus 타임스탬프")
    
    # 메타 정보
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성 시간")
    
    class Meta:
        verbose_name = "모델 메트릭 히스토리"
        verbose_name_plural = "모델 메트릭 히스토리"
        ordering = ['-timestamp', 'model_name']
        indexes = [
            models.Index(fields=['model_name', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.model_name} - P95: {self.p95_latency_ms}ms ({self.timestamp})"

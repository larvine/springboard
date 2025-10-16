# Prometheus 모델별 P95 메트릭 조회 가이드

## 개요

이 스크립트는 Prometheus에서 AI 모델별 P95 레이턴시 메트릭을 조회하는 도구입니다.

## 설치

```bash
pip install -r requirements.txt
```

## 기본 사용법

### 1. 단순 P95 조회

```bash
python query_p95_metrics.py --url http://localhost:9090
```

### 2. 특정 메트릭 조회

```bash
python query_p95_metrics.py --url http://localhost:9090 --metric api_latency_seconds
```

### 3. 시간 범위 지정

```bash
python query_p95_metrics.py --url http://localhost:9090 --time-range 10m
```

### 4. 시계열 데이터 조회 (Range Query)

```bash
python query_p95_metrics.py --url http://localhost:9090 --range 1h --step 5m
```

### 5. 여러 백분위수 동시 조회 (P50, P95, P99)

```bash
python query_p95_metrics.py --url http://localhost:9090 --percentiles 50 95 99
```

### 6. JSON 형식으로 출력

```bash
python query_p95_metrics.py --url http://localhost:9090 --json
```

## PromQL 쿼리 예시

스크립트에서 사용하는 기본 PromQL 쿼리:

### P95 레이턴시 (모델별)

```promql
histogram_quantile(0.95, 
  sum(rate(request_duration_seconds_bucket{job="api"}[5m])) 
  by (le, model)
)
```

### P99 레이턴시 (모델별)

```promql
histogram_quantile(0.99, 
  sum(rate(request_duration_seconds_bucket{job="api"}[5m])) 
  by (le, model)
)
```

### 모델별 평균 레이턴시

```promql
sum(rate(request_duration_seconds_sum{job="api"}[5m])) by (model)
/
sum(rate(request_duration_seconds_count{job="api"}[5m])) by (model)
```

### 모델별 요청 수 (QPS)

```promql
sum(rate(request_duration_seconds_count{job="api"}[5m])) by (model)
```

## 출력 예시

```
============================================================
📊 모델별 P95 레이턴시 메트릭
============================================================

🤖 모델: gpt-4               → P95:   245.67ms
🤖 모델: gpt-3.5-turbo       → P95:   123.45ms
🤖 모델: claude-2            → P95:   189.23ms
🤖 모델: palm-2              → P95:   156.78ms

============================================================
```

## Python 코드에서 사용하기

```python
from query_p95_metrics import PrometheusP95Query

# Prometheus 클라이언트 초기화
prom = PrometheusP95Query("http://localhost:9090")

# P95 조회
results = prom.query_p95_by_model(
    metric_name="request_duration_seconds",
    time_range="5m",
    model_label="model"
)

# 결과 출력
prom.format_results(results)

# 여러 백분위수 조회
multi_results = prom.query_multiple_percentiles(
    metric_name="request_duration_seconds",
    percentiles=[0.50, 0.95, 0.99],
    time_range="5m"
)

for percentile, result in multi_results.items():
    prom.format_results(result, percentile)
```

## 필수 요구사항

### Prometheus 메트릭 구조

스크립트가 작동하려면 Prometheus에 다음과 같은 구조의 히스토그램 메트릭이 필요합니다:

```
# HELP request_duration_seconds Request duration in seconds
# TYPE request_duration_seconds histogram
request_duration_seconds_bucket{model="gpt-4",le="0.005"} 10
request_duration_seconds_bucket{model="gpt-4",le="0.01"} 25
request_duration_seconds_bucket{model="gpt-4",le="0.025"} 50
request_duration_seconds_bucket{model="gpt-4",le="0.05"} 100
request_duration_seconds_bucket{model="gpt-4",le="0.1"} 200
request_duration_seconds_bucket{model="gpt-4",le="0.25"} 450
request_duration_seconds_bucket{model="gpt-4",le="0.5"} 800
request_duration_seconds_bucket{model="gpt-4",le="1"} 950
request_duration_seconds_bucket{model="gpt-4",le="+Inf"} 1000
request_duration_seconds_sum{model="gpt-4"} 245.67
request_duration_seconds_count{model="gpt-4"} 1000
```

### Python 클라이언트 라이브러리에서 메트릭 생성

```python
from prometheus_client import Histogram, start_http_server

# 히스토그램 메트릭 정의
request_duration = Histogram(
    'request_duration_seconds',
    'Request duration in seconds',
    ['model'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# 사용 예시
def process_request(model_name: str):
    with request_duration.labels(model=model_name).time():
        # 요청 처리 로직
        pass

# Prometheus 메트릭 서버 시작
start_http_server(8000)
```

## 고급 기능

### 커스텀 레이블 사용

모델 외에 다른 레이블로 그룹화하려면:

```bash
python query_p95_metrics.py \
  --url http://localhost:9090 \
  --model-label "service" \
  --metric "http_request_duration_seconds"
```

### 대시보드 연동

Grafana에서 사용할 수 있는 쿼리 템플릿:

```promql
# 변수: $model
histogram_quantile(0.95, 
  sum(rate(request_duration_seconds_bucket{model="$model"}[5m])) 
  by (le)
)
```

## 트러블슈팅

### 연결 오류

```bash
# Prometheus가 실행 중인지 확인
curl http://localhost:9090/-/healthy

# 네트워크 확인
ping localhost
```

### 데이터가 없는 경우

1. 메트릭 이름이 올바른지 확인
2. 시간 범위가 너무 좁지 않은지 확인
3. Prometheus에서 직접 쿼리 테스트:
   ```
   http://localhost:9090/graph
   ```

### 권한 오류

Prometheus에 인증이 필요한 경우 스크립트를 수정하여 헤더를 추가하세요:

```python
headers = {
    'Authorization': 'Bearer YOUR_TOKEN'
}

response = requests.get(
    f"{self.api_url}/query",
    params=params,
    headers=headers,
    timeout=10
)
```

## 추가 리소스

- [Prometheus 문서](https://prometheus.io/docs/)
- [PromQL 가이드](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Histogram과 Summary](https://prometheus.io/docs/practices/histograms/)

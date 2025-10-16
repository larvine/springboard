# Prometheus 모델별 P95 메트릭 조회 도구

프로메테우스에서 AI 모델별 P95 레이턴시 메트릭을 쉽게 조회할 수 있는 Python 도구입니다.

## 📋 목차

- [기능](#기능)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [사용 방법](#사용-방법)
- [PromQL 쿼리 예제](#promql-쿼리-예제)
- [설정 파일](#설정-파일)
- [예제 코드](#예제-코드)
- [문제 해결](#문제-해결)

## ✨ 기능

- 🎯 **모델별 P95 메트릭 조회**: AI 모델별로 95번째 백분위수 레이턴시를 조회
- 📊 **다중 백분위수 지원**: P50, P95, P99 등 여러 백분위수를 동시에 조회
- ⏱️ **시계열 데이터 조회**: 특정 기간 동안의 메트릭 추이 확인
- 🚨 **SLA 임계값 체크**: 설정한 임계값을 초과하는 모델 자동 감지
- 📈 **성능 비교**: 여러 모델의 성능을 한눈에 비교
- 💾 **다양한 출력 형식**: 텍스트, JSON 등 다양한 형식으로 출력

## 🚀 설치

### 1. 저장소 클론 또는 파일 다운로드

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

또는

```bash
pip install requests
```

## ⚡ 빠른 시작

### 1. 기본 사용

```bash
python query_p95_metrics.py --url http://localhost:9090
```

### 2. 결과 예시

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

## 📖 사용 방법

### 기본 명령어

```bash
# 기본 P95 조회
python query_p95_metrics.py --url http://localhost:9090

# 특정 메트릭 조회
python query_p95_metrics.py --url http://localhost:9090 --metric api_latency_seconds

# 시간 범위 지정 (5분, 10분, 1시간 등)
python query_p95_metrics.py --url http://localhost:9090 --time-range 10m

# 시계열 데이터 조회
python query_p95_metrics.py --url http://localhost:9090 --range 1h --step 5m

# 여러 백분위수 동시 조회
python query_p95_metrics.py --url http://localhost:9090 --percentiles 50 95 99

# JSON 형식으로 출력
python query_p95_metrics.py --url http://localhost:9090 --json
```

### 명령줄 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--url` | Prometheus 서버 URL | `http://localhost:9090` |
| `--metric` | 조회할 메트릭 이름 | `request_duration_seconds` |
| `--time-range` | 시간 범위 (5m, 1h, 24h 등) | `5m` |
| `--range` | Range 쿼리 시 조회 기간 | - |
| `--step` | Range 쿼리 시 스텝 간격 | `1m` |
| `--model-label` | 모델을 구분하는 레이블 이름 | `model` |
| `--percentiles` | 조회할 백분위수 (숫자 리스트) | - |
| `--json` | JSON 형식으로 출력 | `false` |

## 🔍 PromQL 쿼리 예제

### 1. 모델별 P95 레이턴시

```promql
histogram_quantile(0.95, 
  sum(rate(request_duration_seconds_bucket{job="api"}[5m])) 
  by (le, model)
)
```

### 2. 모델별 P99 레이턴시

```promql
histogram_quantile(0.99, 
  sum(rate(request_duration_seconds_bucket{job="api"}[5m])) 
  by (le, model)
)
```

### 3. 모델별 평균 레이턴시

```promql
sum(rate(request_duration_seconds_sum{job="api"}[5m])) by (model)
/
sum(rate(request_duration_seconds_count{job="api"}[5m])) by (model)
```

### 4. 모델별 요청 수 (QPS)

```promql
sum(rate(request_duration_seconds_count{job="api"}[5m])) by (model)
```

### 5. 에러율

```promql
sum(rate(request_errors_total{job="api"}[5m])) by (model)
/
sum(rate(request_total{job="api"}[5m])) by (model)
```

## ⚙️ 설정 파일

`config.yaml.example` 파일을 `config.yaml`로 복사하여 사용하세요:

```bash
cp config.yaml.example config.yaml
```

### 주요 설정 항목

```yaml
# Prometheus 서버
prometheus:
  url: "http://localhost:9090"
  
# 메트릭 설정
metrics:
  default_metric: "request_duration_seconds"
  
# 쿼리 설정
query:
  default_time_range: "5m"
  percentiles: [50, 95, 99]
  
# SLA 임계값 (밀리초)
sla:
  thresholds:
    gpt-4: 300
    gpt-3.5-turbo: 150
    default: 200
```

## 💻 예제 코드

### Python 코드에서 사용

```python
from query_p95_metrics import PrometheusP95Query

# 클라이언트 초기화
prom = PrometheusP95Query("http://localhost:9090")

# P95 조회
results = prom.query_p95_by_model(
    metric_name="request_duration_seconds",
    time_range="5m"
)

# 결과 출력
prom.format_results(results)
```

### 여러 백분위수 조회

```python
# P50, P95, P99 동시 조회
results = prom.query_multiple_percentiles(
    metric_name="request_duration_seconds",
    percentiles=[0.50, 0.95, 0.99],
    time_range="5m"
)

for percentile, result in results.items():
    prom.format_results(result, percentile)
```

### 시계열 데이터 조회

```python
# 지난 1시간 동안의 데이터
results = prom.query_p95_range_by_model(
    metric_name="request_duration_seconds",
    duration="1h",
    step="5m"
)

prom.format_results(results)
```

### SLA 임계값 체크

```python
SLA_THRESHOLD_MS = 200

results = prom.query_p95_by_model(
    metric_name="request_duration_seconds",
    time_range="5m"
)

if results.get('status') == 'success':
    data = results.get('data', {}).get('result', [])
    
    for item in data:
        model = item['metric'].get('model', 'Unknown')
        value_ms = float(item['value'][1]) * 1000
        
        if value_ms > SLA_THRESHOLD_MS:
            print(f"⚠️  {model}: {value_ms:.2f}ms (임계값 초과!)")
```

## 🎮 예제 실행

대화형 예제 스크립트를 실행하세요:

```bash
python example_usage.py
```

사용 가능한 예제:
1. 기본 P95 조회
2. 여러 백분위수 조회
3. 시계열 데이터 조회
4. 커스텀 메트릭 조회
5. JSON 출력
6. 모니터링 대시보드
7. SLA 임계값 체크
8. 모델 성능 비교

## 📊 Grafana 연동

### 대시보드 패널 설정

#### P95 레이턴시 (시계열)

```promql
histogram_quantile(0.95, 
  sum(rate(request_duration_seconds_bucket{job="api"}[5m])) 
  by (le, model)
)
```

**Legend**: `{{model}}`

#### 모델별 P95 비교 (Bar Gauge)

```promql
histogram_quantile(0.95, 
  sum(rate(request_duration_seconds_bucket{job="api"}[5m])) 
  by (le, model)
) * 1000
```

**Unit**: `milliseconds (ms)`

#### P50 vs P95 vs P99 (Graph)

```promql
# P50
histogram_quantile(0.50, sum(rate(request_duration_seconds_bucket{model="$model"}[5m])) by (le))

# P95
histogram_quantile(0.95, sum(rate(request_duration_seconds_bucket{model="$model"}[5m])) by (le))

# P99
histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{model="$model"}[5m])) by (le))
```

## 🔧 문제 해결

### 1. 연결 오류

```bash
# Prometheus 서버 상태 확인
curl http://localhost:9090/-/healthy

# 응답 예시: Prometheus is Healthy.
```

### 2. 데이터가 없는 경우

**원인:**
- 메트릭 이름이 잘못됨
- 시간 범위가 너무 좁음
- 데이터가 아직 수집되지 않음

**해결:**
```bash
# Prometheus 웹 UI에서 메트릭 확인
http://localhost:9090/graph

# 사용 가능한 메트릭 목록 조회
curl http://localhost:9090/api/v1/label/__name__/values
```

### 3. 히스토그램 메트릭이 없는 경우

애플리케이션에서 히스토그램 메트릭을 생성해야 합니다:

```python
from prometheus_client import Histogram

# 히스토그램 메트릭 생성
request_duration = Histogram(
    'request_duration_seconds',
    'Request duration in seconds',
    ['model'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# 사용
with request_duration.labels(model='gpt-4').time():
    # API 요청 처리
    process_request()
```

### 4. 권한 오류

Prometheus에 인증이 필요한 경우:

```python
# query_p95_metrics.py 수정
headers = {
    'Authorization': 'Bearer YOUR_TOKEN'
}

response = requests.get(
    f"{self.api_url}/query",
    params=params,
    headers=headers
)
```

## 📚 추가 리소스

- [Prometheus 공식 문서](https://prometheus.io/docs/)
- [PromQL 쿼리 가이드](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Histogram과 Summary 메트릭](https://prometheus.io/docs/practices/histograms/)
- [Grafana 대시보드 생성](https://grafana.com/docs/grafana/latest/dashboards/)

## 🤝 기여

버그 리포트나 기능 요청은 이슈로 등록해주세요.

## 📄 라이선스

MIT License

---

**만든 사람**: Cursor AI Assistant  
**최종 업데이트**: 2025-10-16

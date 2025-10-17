# Django Prometheus P95 Metrics API

`query_p95_metrics.py`를 사용하여 모델별 Prometheus 메트릭을 JSON 형태로 제공하는 Django REST API입니다.

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 데이터베이스 마이그레이션

```bash
python3 manage.py migrate
```

### 3. 서버 실행

```bash
python3 manage.py runserver
```

서버는 기본적으로 `http://localhost:8000`에서 실행됩니다.

## API 엔드포인트

### 1. 모델별 P95 메트릭 조회

**Endpoint:** `GET /api/metrics/p95/`

현재 시점의 모델별 P95 레이턴시 메트릭을 조회합니다.

**Query Parameters:**
- `metric_name` (선택): 메트릭 이름 (기본값: `request_duration_seconds`)
- `time_range` (선택): 시간 범위 (기본값: `5m`)
- `model_label` (선택): 모델 레이블 이름 (기본값: `model`)
- `prometheus_url` (선택): Prometheus 서버 URL (기본값: `http://localhost:9090`)

**응답 예시:**
```json
{
  "status": "success",
  "data": [
    {
      "model": "gpt-4",
      "p95_latency_ms": 245.67,
      "timestamp": 1729123456.789,
      "metric_name": "request_duration_seconds",
      "time_range": "5m"
    },
    {
      "model": "gpt-3.5-turbo",
      "p95_latency_ms": 123.45,
      "timestamp": 1729123456.789,
      "metric_name": "request_duration_seconds",
      "time_range": "5m"
    }
  ],
  "count": 2
}
```

**사용 예시:**
```bash
# 기본 조회
curl "http://localhost:8000/api/metrics/p95/"

# 시간 범위 지정
curl "http://localhost:8000/api/metrics/p95/?time_range=10m"

# 커스텀 메트릭 조회
curl "http://localhost:8000/api/metrics/p95/?metric_name=api_response_time_seconds&time_range=15m"
```

**프론트엔드 사용 예시 (JavaScript):**
```javascript
// Fetch API 사용
fetch('http://localhost:8000/api/metrics/p95/')
  .then(response => response.json())
  .then(data => {
    console.log('모델별 P95 메트릭:', data.data);
    data.data.forEach(item => {
      console.log(`${item.model}: ${item.p95_latency_ms}ms`);
    });
  });

// Axios 사용
axios.get('http://localhost:8000/api/metrics/p95/', {
  params: {
    time_range: '10m',
    metric_name: 'request_duration_seconds'
  }
})
.then(response => {
  console.log('메트릭 데이터:', response.data);
})
.catch(error => {
  console.error('에러:', error);
});

// React 컴포넌트 예시
function MetricsComponent() {
  const [metrics, setMetrics] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/metrics/p95/')
      .then(res => res.json())
      .then(data => setMetrics(data.data));
  }, []);
  
  return (
    <div>
      {metrics.map(item => (
        <div key={item.model}>
          {item.model}: {item.p95_latency_ms}ms
        </div>
      ))}
    </div>
  );
}
```

---

### 2. 시간 범위 동안의 모델별 P95 메트릭 조회

**Endpoint:** `GET /api/metrics/p95/range/`

지정된 시간 범위 동안의 모델별 P95 레이턴시 추이를 조회합니다.

**Query Parameters:**
- `metric_name` (선택): 메트릭 이름 (기본값: `request_duration_seconds`)
- `duration` (선택): 조회할 시간 길이 (기본값: `1h`)
- `step` (선택): 데이터 포인트 간격 (기본값: `1m`)
- `model_label` (선택): 모델 레이블 이름 (기본값: `model`)
- `prometheus_url` (선택): Prometheus 서버 URL (기본값: `http://localhost:9090`)

**응답 예시:**
```json
{
  "status": "success",
  "data": [
    {
      "model": "gpt-4",
      "data_points": [
        {
          "timestamp": 1729123456.0,
          "p95_latency_ms": 240.12
        },
        {
          "timestamp": 1729123516.0,
          "p95_latency_ms": 245.67
        }
      ],
      "metric_name": "request_duration_seconds",
      "duration": "1h",
      "step": "1m"
    }
  ],
  "count": 1
}
```

**사용 예시:**
```bash
# 1시간 동안의 데이터 조회
curl "http://localhost:8000/api/metrics/p95/range/?duration=1h&step=5m"

# 24시간 동안의 데이터 조회
curl "http://localhost:8000/api/metrics/p95/range/?duration=24h&step=1h"
```

**프론트엔드 사용 예시 (차트):**
```javascript
// Chart.js와 함께 사용
fetch('http://localhost:8000/api/metrics/p95/range/?duration=1h&step=5m')
  .then(response => response.json())
  .then(data => {
    const chartData = data.data.map(model => ({
      label: model.model,
      data: model.data_points.map(point => ({
        x: new Date(point.timestamp * 1000),
        y: point.p95_latency_ms
      }))
    }));
    
    // Chart.js 렌더링
    new Chart(ctx, {
      type: 'line',
      data: { datasets: chartData },
      options: {
        scales: {
          x: { type: 'time' },
          y: { title: { text: 'P95 Latency (ms)' } }
        }
      }
    });
  });
```

---

### 3. 여러 백분위수 조회

**Endpoint:** `GET /api/metrics/percentiles/`

모델별로 여러 백분위수(P50, P95, P99 등)를 한 번에 조회합니다.

**Query Parameters:**
- `metric_name` (선택): 메트릭 이름 (기본값: `request_duration_seconds`)
- `percentiles` (선택): 백분위수 리스트 (기본값: `50,95,99`)
- `time_range` (선택): 시간 범위 (기본값: `5m`)
- `model_label` (선택): 모델 레이블 이름 (기본값: `model`)
- `prometheus_url` (선택): Prometheus 서버 URL (기본값: `http://localhost:9090`)

**응답 예시:**
```json
{
  "status": "success",
  "data": [
    {
      "model": "gpt-4",
      "percentiles": {
        "p50": 120.45,
        "p95": 245.67,
        "p99": 350.89
      },
      "timestamp": 1729123456.789
    },
    {
      "model": "gpt-3.5-turbo",
      "percentiles": {
        "p50": 80.23,
        "p95": 123.45,
        "p99": 180.12
      },
      "timestamp": 1729123456.789
    }
  ],
  "count": 2,
  "metric_name": "request_duration_seconds",
  "time_range": "5m"
}
```

**사용 예시:**
```bash
# 기본 백분위수 조회 (P50, P95, P99)
curl "http://localhost:8000/api/metrics/percentiles/"

# 커스텀 백분위수 조회 (P75, P90, P95)
curl "http://localhost:8000/api/metrics/percentiles/?percentiles=75,90,95"
```

**프론트엔드 사용 예시:**
```javascript
// 모델 성능 비교 테이블
fetch('http://localhost:8000/api/metrics/percentiles/')
  .then(response => response.json())
  .then(data => {
    const table = document.getElementById('metrics-table');
    data.data.forEach(model => {
      const row = table.insertRow();
      row.insertCell().textContent = model.model;
      row.insertCell().textContent = `${model.percentiles.p50}ms`;
      row.insertCell().textContent = `${model.percentiles.p95}ms`;
      row.insertCell().textContent = `${model.percentiles.p99}ms`;
    });
  });
```

---

## 설정

### Prometheus URL 변경

`backend/settings.py` 파일에서 Prometheus 서버 URL을 변경할 수 있습니다:

```python
# Prometheus configuration
PROMETHEUS_URL = 'http://your-prometheus-server:9090'
```

또는 API 호출 시 query parameter로 지정:

```bash
curl "http://localhost:8000/api/metrics/p95/?prometheus_url=http://your-prometheus-server:9090"
```

### CORS 설정 (프론트엔드 통합 시)

다른 도메인의 프론트엔드에서 API를 호출하려면 CORS를 설정해야 합니다:

1. `django-cors-headers` 설치:
```bash
pip install django-cors-headers
```

2. `backend/settings.py` 수정:
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

# 모든 도메인 허용 (개발 환경)
CORS_ALLOW_ALL_ORIGINS = True

# 또는 특정 도메인만 허용 (프로덕션 환경)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend-domain.com",
]
```

## 에러 처리

API는 다음과 같은 HTTP 상태 코드를 반환합니다:

- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청 파라미터
- `500 Internal Server Error`: 서버 내부 오류
- `503 Service Unavailable`: Prometheus 서버 연결 실패

**에러 응답 예시:**
```json
{
  "error": "Failed to fetch metrics from Prometheus",
  "details": {...}
}
```

## 로깅

API 호출 및 에러는 Django 로그에 기록됩니다. 로그 레벨을 조정하려면 `backend/settings.py`에 다음을 추가:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

## 예제 프론트엔드 통합

### Vue.js 예시
```vue
<template>
  <div>
    <h2>모델별 P95 레이턴시</h2>
    <div v-for="metric in metrics" :key="metric.model">
      {{ metric.model }}: {{ metric.p95_latency_ms }}ms
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      metrics: []
    };
  },
  async mounted() {
    const response = await fetch('http://localhost:8000/api/metrics/p95/');
    const data = await response.json();
    this.metrics = data.data;
  }
}
</script>
```

### Angular 예시
```typescript
import { HttpClient } from '@angular/common/http';

export class MetricsComponent {
  metrics: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('http://localhost:8000/api/metrics/p95/')
      .subscribe((data: any) => {
        this.metrics = data.data;
      });
  }
}
```

## 문제 해결

### Prometheus 연결 실패
- Prometheus 서버가 실행 중인지 확인
- `PROMETHEUS_URL` 설정이 올바른지 확인
- 방화벽/네트워크 설정 확인

### CORS 에러
- `django-cors-headers` 설치 및 설정 확인
- 브라우저 개발자 도구에서 에러 메시지 확인

## 추가 정보

더 자세한 Prometheus 쿼리 정보는 `prometheus_queries.md` 파일을 참조하세요.

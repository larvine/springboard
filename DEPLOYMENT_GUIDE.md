# 배포 및 실행 가이드

## 📋 목차
1. [시스템 아키텍처](#시스템-아키텍처)
2. [설치 및 설정](#설치-및-설정)
3. [메트릭 수집 스케줄러 설정](#메트릭-수집-스케줄러-설정)
4. [API 사용법](#api-사용법)
5. [프론트엔드 연동](#프론트엔드-연동)

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                   5분마다 자동 실행                      │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Celery     │─────>│ Management   │                │
│  │   Beat       │      │   Command    │                │
│  │ (스케줄러)    │      │collect_metrics│               │
│  └──────────────┘      └──────┬───────┘                │
│                               │                         │
│                               ▼                         │
│                      ┌─────────────────┐                │
│                      │   Prometheus    │                │
│                      │ (메트릭 조회)    │                │
│                      └────────┬────────┘                │
│                               │                         │
│                               ▼                         │
│                      ┌─────────────────┐                │
│                      │  Django Model   │                │
│                      │ (DB에 저장)      │                │
│                      └────────┬────────┘                │
└───────────────────────────────┼─────────────────────────┘
                                │
                                │
                    ┌───────────▼──────────┐
                    │   Frontend API 요청   │
                    └───────────┬──────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Django REST API     │
                    │  (DB에서 조회)         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     status.js         │
                    │  (유저에게 표시)       │
                    └───────────────────────┘
```

---

## 🔧 설치 및 설정

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 데이터베이스 마이그레이션

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

### 3. Django 서버 실행

```bash
python3 manage.py runserver
```

서버가 `http://localhost:8000`에서 실행됩니다.

---

## ⏰ 메트릭 수집 스케줄러 설정

메트릭을 **5분마다 자동으로 수집**하려면 다음 중 하나를 선택하세요:

### 방법 1: Celery Beat (권장 - 프로덕션)

**장점:**
- ✅ 안정적이고 확장 가능
- ✅ 분산 처리 가능
- ✅ 작업 모니터링 용이

**설치:**

```bash
# Redis 설치 (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install redis-server

# Redis 실행
redis-server

# 또는 백그라운드 실행
sudo systemctl start redis
```

**실행:**

터미널을 3개 열어서 각각 실행:

```bash
# 터미널 1: Django 서버
python3 manage.py runserver

# 터미널 2: Celery Worker
celery -A backend worker --loglevel=info

# 터미널 3: Celery Beat (스케줄러)
celery -A backend beat --loglevel=info
```

**프로덕션 배포 (Supervisor 사용):**

`/etc/supervisor/conf.d/celery.conf`:
```ini
[program:celery_worker]
command=/path/to/venv/bin/celery -A backend worker --loglevel=info
directory=/workspace
user=www-data
autostart=true
autorestart=true

[program:celery_beat]
command=/path/to/venv/bin/celery -A backend beat --loglevel=info
directory=/workspace
user=www-data
autostart=true
autorestart=true
```

---

### 방법 2: Cron (간단 - 개발/소규모)

**장점:**
- ✅ 설정이 간단
- ✅ 추가 의존성 없음
- ✅ 리소스 적게 사용

**설정:**

```bash
# crontab 편집
crontab -e

# 다음 라인 추가 (5분마다 실행)
*/5 * * * * cd /workspace && /usr/bin/python3 manage.py collect_metrics >> /tmp/metrics_collect.log 2>&1
```

**로그 확인:**
```bash
tail -f /tmp/metrics_collect.log
```

---

### 방법 3: 수동 실행 (테스트)

테스트나 개발 중에는 수동으로 실행할 수 있습니다:

```bash
# 기본 실행
python3 manage.py collect_metrics

# 커스텀 Prometheus URL
python3 manage.py collect_metrics --prometheus-url http://prometheus:9090

# 다른 메트릭 수집
python3 manage.py collect_metrics --metric-name api_response_time_seconds
```

---

## 📡 API 사용법

### 1. P95 메트릭 조회 (status.js용)

**Endpoint:** `GET /api/metrics/p95/`

가장 간단한 API - P95 값만 반환합니다.

```bash
curl http://localhost:8000/api/metrics/p95/
```

**응답:**
```json
{
  "status": "success",
  "data": [
    {
      "model": "gpt-4",
      "p95_latency_ms": 245.67,
      "collected_at": "2025-10-17T14:30:00+09:00"
    },
    {
      "model": "gpt-3.5-turbo",
      "p95_latency_ms": 123.45,
      "collected_at": "2025-10-17T14:30:00+09:00"
    }
  ],
  "count": 2,
  "last_updated": "2025-10-17T14:30:00+09:00"
}
```

---

### 2. 전체 메트릭 조회 (P50, P95, P99)

**Endpoint:** `GET /api/metrics/`

```bash
curl http://localhost:8000/api/metrics/
```

**응답:**
```json
{
  "status": "success",
  "data": [
    {
      "model": "gpt-4",
      "p50_latency_ms": 120.45,
      "p95_latency_ms": 245.67,
      "p99_latency_ms": 350.89,
      "collected_at": "2025-10-17T14:30:00+09:00",
      "metric_name": "request_duration_seconds",
      "time_range": "5m"
    }
  ],
  "count": 1,
  "last_updated": "2025-10-17T14:30:00+09:00"
}
```

---

### 3. 메트릭 히스토리 조회 (차트용)

**Endpoint:** `GET /api/metrics/history/`

```bash
# 최근 1시간
curl http://localhost:8000/api/metrics/history/?hours=1

# 최근 24시간
curl http://localhost:8000/api/metrics/history/?hours=24

# 특정 모델만
curl http://localhost:8000/api/metrics/history/?model_name=gpt-4&hours=6
```

**응답:**
```json
{
  "status": "success",
  "data": [
    {
      "model": "gpt-4",
      "data_points": [
        {
          "timestamp": "2025-10-17T14:00:00+09:00",
          "p95_latency_ms": 240.12
        },
        {
          "timestamp": "2025-10-17T14:05:00+09:00",
          "p95_latency_ms": 245.67
        }
      ]
    }
  ],
  "count": 1,
  "time_range": {
    "start": "2025-10-17T13:00:00+09:00",
    "end": "2025-10-17T14:00:00+09:00",
    "hours": 1
  }
}
```

---

### 4. 헬스 체크

**Endpoint:** `GET /api/health/`

```bash
curl http://localhost:8000/api/health/
```

**응답:**
```json
{
  "status": "healthy",
  "last_collection": "2025-10-17T14:30:00+09:00",
  "minutes_ago": 2.5,
  "model_count": 5
}
```

---

## 🎨 프론트엔드 연동

### status.js 수정 예시

```javascript
// status.js
async function loadModelMetrics() {
  try {
    const response = await fetch('http://localhost:8000/api/metrics/p95/');
    const data = await response.json();
    
    if (data.status === 'success') {
      displayMetrics(data.data);
    }
  } catch (error) {
    console.error('메트릭 로딩 실패:', error);
  }
}

function displayMetrics(metrics) {
  const container = document.getElementById('metrics-container');
  
  metrics.forEach(metric => {
    const div = document.createElement('div');
    div.className = 'metric-item';
    
    // 성능 상태 판단
    let status = '';
    let statusClass = '';
    
    if (metric.p95_latency_ms < 100) {
      status = '✅ 양호';
      statusClass = 'status-good';
    } else if (metric.p95_latency_ms < 200) {
      status = '⚠️ 주의';
      statusClass = 'status-warning';
    } else {
      status = '🚨 위험';
      statusClass = 'status-danger';
    }
    
    div.innerHTML = `
      <div class="model-name">${metric.model}</div>
      <div class="metric-value">P95: ${metric.p95_latency_ms.toFixed(2)}ms</div>
      <div class="metric-status ${statusClass}">${status}</div>
    `;
    
    container.appendChild(div);
  });
}

// 5분마다 자동 갱신 (선택사항)
setInterval(loadModelMetrics, 5 * 60 * 1000);

// 초기 로드
loadModelMetrics();
```

### React 예시

```javascript
import { useState, useEffect } from 'react';

function ModelMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/metrics/p95/');
        const data = await response.json();
        setMetrics(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // 5분마다 갱신
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>모델 성능 모니터링</h2>
      {metrics.map(metric => (
        <div key={metric.model}>
          <strong>{metric.model}:</strong> {metric.p95_latency_ms}ms
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 모니터링 및 디버깅

### 메트릭 수집 상태 확인

```bash
# 마지막 수집 시간 확인
curl http://localhost:8000/api/health/

# DB에 저장된 메트릭 확인
python3 manage.py shell
>>> from api.models import ModelMetric
>>> ModelMetric.objects.all()
```

### Celery 작업 모니터링

```bash
# Flower 설치 (Celery 모니터링 도구)
pip install flower

# Flower 실행
celery -A backend flower

# 브라우저에서 http://localhost:5555 접속
```

### 로그 확인

```bash
# Celery Beat 로그
tail -f celery_beat.log

# Django 로그
tail -f django.log

# Cron 로그
tail -f /tmp/metrics_collect.log
```

---

## 🚀 프로덕션 체크리스트

- [ ] Redis 설치 및 실행
- [ ] Celery Worker 실행
- [ ] Celery Beat 실행
- [ ] Django 서버 실행
- [ ] Prometheus URL 설정 확인
- [ ] DB 마이그레이션 완료
- [ ] 첫 메트릭 수집 성공 확인
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드 연동 테스트
- [ ] 헬스 체크 정상 작동 확인

---

## 📞 문제 해결

### Q: 메트릭이 수집되지 않아요
**A:** 다음을 확인하세요:
1. Prometheus 서버가 실행 중인지
2. `PROMETHEUS_URL` 설정이 올바른지
3. Celery Beat/Cron이 실행 중인지
4. `python3 manage.py collect_metrics` 수동 실행 테스트

### Q: API가 빈 데이터를 반환해요
**A:** 
1. 먼저 메트릭 수집: `python3 manage.py collect_metrics`
2. DB 확인: `python3 manage.py shell` → `ModelMetric.objects.count()`

### Q: Celery가 시작되지 않아요
**A:**
1. Redis 실행 확인: `redis-cli ping` (응답: PONG)
2. Celery 설정 확인: `celery -A backend inspect active`

---

**완료!** 🎉

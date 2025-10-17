# 🚀 Quick Start Guide

5분 안에 시작하기!

## 📝 개요

이 시스템은 **5분마다** Prometheus에서 모델 메트릭을 자동으로 수집하여 DB에 저장하고, 프론트엔드(status.js)에 JSON으로 제공합니다.

```
Celery Beat (5분마다) → Prometheus 조회 → DB 저장 → API → status.js
```

---

## 🎯 빠른 시작 (개발환경)

### 1단계: 데이터베이스 준비 ✅

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

### 2단계: Django 서버 실행 ✅

```bash
python3 manage.py runserver
```

서버: `http://localhost:8000`

### 3단계: 메트릭 수집 (수동 테스트)

```bash
# 한 번 실행해서 테스트
python3 manage.py collect_metrics
```

**출력 예시:**
```
============================================================
🚀 메트릭 수집 시작
============================================================
Prometheus URL: http://localhost:9090
메트릭: request_duration_seconds
시간 범위: 5m

✨ gpt-4: P50=120.45ms, P95=245.67ms, P99=350.89ms
✨ gpt-3.5-turbo: P50=80.23ms, P95=123.45ms, P99=180.12ms

============================================================
✅ 메트릭 수집 완료: 2개 모델
============================================================
```

### 4단계: API 확인

```bash
# P95 메트릭 조회 (status.js용)
curl http://localhost:8000/api/metrics/p95/

# 전체 메트릭 조회
curl http://localhost:8000/api/metrics/

# 헬스 체크
curl http://localhost:8000/api/health/
```

### 5단계: 프론트엔드에서 확인

`status.html` 파일을 브라우저에서 열기:

```bash
# 파일 브라우저에서 직접 열거나
open status.html   # Mac
xdg-open status.html   # Linux
```

또는 http-server 사용:
```bash
npx http-server -p 8080
# http://localhost:8080/status.html 접속
```

---

## ⏰ 자동 수집 설정 (5분마다)

### 방법 A: Cron (간단, 추천)

```bash
# crontab 편집
crontab -e

# 다음 라인 추가
*/5 * * * * cd /workspace && python3 manage.py collect_metrics >> /tmp/metrics.log 2>&1
```

**로그 확인:**
```bash
tail -f /tmp/metrics.log
```

### 방법 B: Celery Beat (프로덕션)

**터미널 1: Django**
```bash
python3 manage.py runserver
```

**터미널 2: Redis**
```bash
redis-server
```

**터미널 3: Celery Worker**
```bash
celery -A backend worker --loglevel=info
```

**터미널 4: Celery Beat**
```bash
celery -A backend beat --loglevel=info
```

---

## 📡 API 사용법 (프론트엔드)

### status.js 설정

`status.js` 파일에서:

```javascript
// API 설정
const API_BASE_URL = 'http://localhost:8000';
const USE_REAL_API = true;  // true로 설정하면 실제 API 사용
```

### API 호출 예시

```javascript
// P95만 조회 (status.js용 - 가볍고 빠름)
fetch('http://localhost:8000/api/metrics/p95/')
  .then(res => res.json())
  .then(data => {
    console.log(data.data);
    // [
    //   { model: "gpt-4", p95_latency_ms: 245.67, collected_at: "..." },
    //   { model: "gpt-3.5-turbo", p95_latency_ms: 123.45, collected_at: "..." }
    // ]
  });

// 전체 메트릭 조회 (P50, P95, P99)
fetch('http://localhost:8000/api/metrics/')
  .then(res => res.json())
  .then(data => console.log(data));

// 히스토리 조회 (차트용)
fetch('http://localhost:8000/api/metrics/history/?hours=24')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🔧 문제 해결

### ❌ "No metrics found" 에러

```bash
# 메트릭을 한 번 수집하세요
python3 manage.py collect_metrics
```

### ❌ Prometheus 연결 실패

```bash
# Prometheus URL 확인
curl http://localhost:9090/-/healthy

# URL 변경 (backend/settings.py)
PROMETHEUS_URL = 'http://your-prometheus:9090'
```

### ❌ CORS 에러 (프론트엔드에서)

`backend/settings.py`에 추가:

```python
# pip install django-cors-headers
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # 개발용
```

### ❌ status.js에 데이터가 안 보임

1. API 테스트:
```bash
curl http://localhost:8000/api/metrics/p95/
```

2. 브라우저 콘솔 확인:
   - F12 → Console 탭
   - Network 탭에서 API 호출 확인

3. `status.js`의 `USE_REAL_API` 설정 확인

---

## 📊 status.js 모델 매핑

Prometheus의 모델명과 status.js의 모델명이 일치해야 합니다.

**status.js (MODELS 배열):**
```javascript
const MODELS = [
    { id: 'gpt-oss-120b', name: 'GPT-OSS-120B', ... },
    { id: 'claude-4.5', name: 'Claude 4.5', ... },
    { id: 'deepseek-v3-r1', name: 'DeepSeek V3 R1', ... }
];
```

**Prometheus 모델 레이블:**
- `model="gpt-oss-120b"` ✅
- `model="gpt-4"` ⚠️ (status.js MODELS에 추가 필요)

일치하지 않으면 "데이터 없음"으로 표시됩니다.

---

## ✅ 체크리스트

- [ ] 데이터베이스 마이그레이션 완료
- [ ] Django 서버 실행 중
- [ ] 메트릭 수집 성공 (`python3 manage.py collect_metrics`)
- [ ] API 응답 확인 (`curl http://localhost:8000/api/metrics/p95/`)
- [ ] status.js의 `USE_REAL_API = true` 설정
- [ ] status.html에서 데이터 표시 확인
- [ ] 5분마다 자동 수집 설정 (Cron 또는 Celery)

---

## 🎉 완료!

이제 다음과 같이 작동합니다:

1. **백엔드**: 5분마다 자동으로 Prometheus에서 메트릭 수집 → DB 저장
2. **프론트엔드**: status.js가 API 호출 → DB에서 저장된 최신 데이터 가져오기 → 유저에게 표시

**다음 문서:**
- 상세 가이드: `DEPLOYMENT_GUIDE.md`
- API 문서: `API_README.md`

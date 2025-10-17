# 🔄 동적 모델 로딩 가이드

`status.html`이 이제 **API에서 동적으로 모델 목록을 가져와서 자동으로 카드를 생성**합니다!

## 🎯 변경 사항

### ❌ 이전 (하드코딩)

```javascript
// 모델을 직접 지정
const MODELS = [
    { id: 'gpt-oss-120b', name: 'GPT-OSS-120B', ... },
    { id: 'claude-4.5', name: 'Claude 4.5', ... }
];
```

### ✅ 현재 (동적)

```javascript
// API에서 자동으로 가져옴
let MODELS = [];  // 초기화 시 API 데이터로 채워짐

// 초기화 시
fetchAndInitializeModels()
  → API 호출 (GET /api/metrics/p95/)
  → 모델 목록 자동 생성
  → 카드 렌더링
```

---

## 🚀 작동 방식

### 1️⃣ 페이지 로드

```
status.html 열림
    ↓
initStatusPage() 실행
    ↓
fetchAndInitializeModels() 호출
    ↓
GET /api/metrics/p95/
```

### 2️⃣ API 응답

```json
{
  "status": "success",
  "data": [
    { "model": "gpt-4", "p95_latency_ms": 245.67, ... },
    { "model": "claude-3-opus", "p95_latency_ms": 123.45, ... },
    { "model": "llama-2-70b", "p95_latency_ms": 189.23, ... }
  ]
}
```

### 3️⃣ 자동 카드 생성

API 응답에서 받은 모델마다 자동으로:
- ✅ 모델 ID: `"gpt-4"`
- ✅ 모델명: `"GPT-4"` (자동 포맷팅)
- ✅ 아이콘: `🤖` (자동 추론)
- ✅ 설명: `"AI Model: gpt-4"`
- ✅ P95 메트릭 표시

---

## 🎨 아이콘 자동 매핑

모델명에서 아이콘을 자동으로 추론합니다:

```javascript
const MODEL_ICONS = {
    'gpt': '🤖',        // gpt-4, gpt-3.5 등
    'claude': '🧠',     // claude-3-opus 등
    'deepseek': '🔍',   // deepseek-v3 등
    'llama': '🦙',      // llama-2-70b 등
    'gemini': '💎',     // gemini-pro 등
    'mistral': '🌪️',    // mistral-large 등
    'default': '🔮'     // 그 외
};
```

**예시:**
- `gpt-4` → 🤖
- `claude-3-opus` → 🧠
- `llama-2-70b` → 🦙
- `unknown-model` → 🔮 (기본)

---

## 📝 모델명 포맷팅

모델명을 자동으로 대문자로 변환합니다:

```javascript
formatModelName("gpt-4")           → "GPT-4"
formatModelName("claude-3-opus")   → "CLAUDE-3-OPUS"
formatModelName("llama-2-70b")     → "LLAMA-2-70B"
```

---

## ✨ 장점

### 1. **자동화**
- ✅ Prometheus에 새 모델 추가 → 자동으로 status.html에 표시
- ✅ 코드 수정 불필요
- ✅ 유지보수 간편

### 2. **유연성**
```bash
# 1. Prometheus에 새 모델 메트릭 추가
model="new-ai-model"

# 2. 메트릭 수집
python3 manage.py collect_metrics

# 3. status.html 새로고침
# → 자동으로 "new-ai-model" 카드 생성됨! ✅
```

### 3. **데이터 무결성**
- DB에 있는 모델만 표시
- 실제 메트릭이 있는 모델만 카드 생성
- "데이터 없음" 상태 자동 처리

---

## 🔧 커스터마이징

### 아이콘 추가

`status.js`에서 아이콘 매핑 추가:

```javascript
const MODEL_ICONS = {
    'gpt': '🤖',
    'claude': '🧠',
    'yourmodel': '🎯',  // 추가!
    'default': '🔮'
};
```

### 모델명 포맷 변경

필요시 `formatModelName()` 함수 수정:

```javascript
function formatModelName(modelName) {
    // 커스텀 포맷팅 로직
    if (modelName.startsWith('gpt-')) {
        return 'ChatGPT ' + modelName.slice(4);
    }
    return modelName.toUpperCase();
}
```

---

## 🧪 테스트

### 1. Mock 데이터로 테스트

`status.js`:
```javascript
const USE_REAL_API = false;  // Mock 데이터 사용
```

→ 자동으로 5개 샘플 모델 생성

### 2. 실제 API로 테스트

```javascript
const USE_REAL_API = true;   // Django API 사용
```

→ DB에 저장된 실제 모델 표시

### 3. 빈 데이터 처리

메트릭이 없으면:
```
┌─────────────────────────────────┐
│  ℹ️ 메트릭 데이터가 없습니다      │
│  메트릭 수집을 실행하세요:        │
│  python3 manage.py collect_metrics│
└─────────────────────────────────┘
```

---

## 📊 예시 시나리오

### 시나리오 1: 새 모델 추가

```bash
# 1. Prometheus에 메트릭 추가
# model="my-new-model" 레이블 추가

# 2. 메트릭 수집
python3 manage.py collect_metrics

# 3. status.html 새로고침
# → "MY-NEW-MODEL" 카드 자동 생성! 🎉
```

### 시나리오 2: 모델 제거

```bash
# 1. Prometheus에서 메트릭 제거
# model="old-model" 레이블 삭제

# 2. 다음 메트릭 수집 시
# → DB에서 자동으로 사라짐

# 3. status.html 새로고침
# → 카드 자동으로 사라짐
```

### 시나리오 3: 여러 환경

**개발 환경:**
- `model="gpt-4-dev"`
- `model="claude-dev"`

**프로덕션 환경:**
- `model="gpt-4-prod"`
- `model="claude-prod"`

→ 환경별로 다른 모델 자동 표시!

---

## 🔍 디버깅

### 모델이 안 보여요

**1. API 확인:**
```bash
curl http://localhost:8000/api/metrics/p95/
```

**2. 브라우저 콘솔:**
```javascript
console.log('MODELS:', MODELS);
console.log('Metrics:', metrics);
```

**3. 데이터 수집 확인:**
```bash
python3 manage.py shell
>>> from api.models import ModelMetric
>>> ModelMetric.objects.all()
```

### 아이콘이 이상해요

```javascript
// status.js에서 아이콘 매핑 확인
console.log(getModelIcon('your-model-name'));
```

---

## 🎉 완료!

이제 **모델을 자동으로 감지**하고 표시합니다!

**코드 수정 없이:**
- ✅ 새 모델 추가
- ✅ 모델 제거
- ✅ 다중 환경 지원

모든 것이 **자동**입니다! 🚀

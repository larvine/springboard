# 설정 가이드

이 가이드에서는 서비스의 다양한 설정 옵션에 대해 자세히 알아봅니다.

## 모델 설정

### 지원되는 모델

다음 표는 현재 지원되는 AI 모델 목록입니다:

| 모델명 | 제공업체 | 컨텍스트 길이 | 특징 |
|--------|----------|---------------|------|
| GPT-4 | OpenAI | 8K / 32K | 가장 강력한 성능 |
| GPT-3.5 Turbo | OpenAI | 4K / 16K | 빠른 응답 속도 |
| Claude 2 | Anthropic | 100K | 긴 문맥 처리 |
| PaLM 2 | Google | 8K | 다국어 지원 우수 |

### 모델 파라미터 설정

각 모델은 다음과 같은 파라미터를 조정할 수 있습니다:

#### Temperature (온도)

`temperature`는 응답의 창의성을 조절합니다:

- **0.0 - 0.3**: 일관성 있고 예측 가능한 응답
- **0.4 - 0.7**: 균형잡힌 응답 (권장)
- **0.8 - 1.0**: 창의적이고 다양한 응답

```javascript
{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

#### Max Tokens (최대 토큰 수)

응답의 최대 길이를 제한합니다. 비용 관리에 유용합니다.

> **참고**: 1 토큰은 대략 한글 1-2글자, 영어 0.75단어에 해당합니다.

## API 키 관리

### 키 생성

1. 대시보드의 'API 키 관리' 메뉴로 이동
2. '새 키 생성' 버튼 클릭
3. 키 이름과 권한 설정
4. 생성된 키를 안전하게 복사

### 키 권한 설정

API 키는 다음과 같은 권한을 가질 수 있습니다:

- `read`: 데이터 조회만 가능
- `write`: 데이터 생성 및 수정 가능
- `admin`: 모든 권한 (주의해서 사용)

### 환경 변수 설정

API 키는 환경 변수로 관리하는 것을 권장합니다:

**Linux/Mac:**
```bash
export API_KEY="your-api-key-here"
```

**Windows (PowerShell):**
```powershell
$env:API_KEY="your-api-key-here"
```

## 웹훅 설정

웹훅을 사용하면 특정 이벤트가 발생했을 때 알림을 받을 수 있습니다.

### 웹훅 URL 등록

1. 설정 페이지에서 '웹훅' 탭 선택
2. 웹훅 URL 입력 (예: `https://your-domain.com/webhook`)
3. 수신할 이벤트 선택:
   - `request.completed`: 요청 완료 시
   - `error.occurred`: 오류 발생 시
   - `usage.threshold`: 사용량 임계값 도달 시

### 웹훅 페이로드 예시

```json
{
  "event": "request.completed",
  "timestamp": "2025-10-15T10:30:00Z",
  "data": {
    "request_id": "req_abc123",
    "model": "gpt-4",
    "tokens_used": 150,
    "status": "success"
  }
}
```

## 사용량 제한 설정

예산 관리를 위해 사용량 제한을 설정할 수 있습니다:

1. 설정 → '사용량 제한'으로 이동
2. 일일/월간 한도 설정
3. 알림 임계값 설정 (예: 80% 도달 시 알림)

## 보안 설정

### IP 화이트리스트

특정 IP에서만 API를 사용할 수 있도록 제한:

```
192.168.1.100
10.0.0.0/24
```

### CORS 설정

웹 애플리케이션에서 사용할 경우 CORS 도메인을 등록하세요:

- `https://example.com`
- `https://app.example.com`

---

더 자세한 내용은 [API 문서](https://docs.example.com/api)를 참고하세요.

// Guide 데이터
const guideData = {
  "categories": [
    {
      "id": "getting-started",
      "name": "시작하기",
      "icon": "fas fa-rocket",
      "content": `# 시작하기

환영합니다! 이 가이드는 처음 사용하시는 분들을 위한 시작 가이드입니다.

## 설치 방법

서비스를 사용하기 위해서는 다음 단계를 따라주세요:

1. **회원 가입하기**
   - [회원가입 페이지](https://example.com/signup)로 이동합니다
   - 이메일과 비밀번호를 입력하세요
   - 이메일 인증을 완료하세요

2. **API 키 발급받기**
   - 대시보드에서 'API 키 관리' 메뉴를 선택하세요
   - '새 키 생성' 버튼을 클릭하세요
   - 생성된 키를 안전한 곳에 보관하세요

3. **첫 번째 요청 보내기**
   - 발급받은 API 키를 사용하여 첫 번째 요청을 보내보세요

## 빠른 시작 예제

다음은 간단한 사용 예제입니다:

\`\`\`python
import requests

api_key = "your-api-key-here"
headers = {"Authorization": f"Bearer {api_key}"}

response = requests.post(
    "https://api.example.com/v1/chat",
    headers=headers,
    json={
        "model": "gpt-4",
        "messages": [{"role": "user", "content": "안녕하세요!"}]
    }
)

print(response.json())
\`\`\`

> **팁**: API 키는 절대 공개 저장소에 업로드하지 마세요!

## 주요 기능

우리 서비스는 다음과 같은 기능을 제공합니다:

- ✅ 다양한 AI 모델 지원 (GPT-4, Claude, PaLM)
- ✅ 실시간 스트리밍 응답
- ✅ 멀티모달 지원 (텍스트, 이미지)
- ✅ 사용량 모니터링 대시보드

## 다음 단계

기본 설정을 마쳤다면, 다음 가이드를 참고해주세요:

- [설정 가이드](https://example.com/guide/configuration) - 상세한 설정 방법을 알아보세요
- [고급 사용법](https://example.com/guide/advanced) - 고급 기능을 활용하는 방법을 배워보세요
- [FAQ](faq.html) - 자주 묻는 질문들을 확인하세요

## 도움이 필요하신가요?

궁금한 점이 있으시면 언제든지 문의해주세요:

- 📧 이메일: support@example.com
- 💬 Discord: [커뮤니티 참여하기](https://discord.gg/example)
- 📚 문서: [전체 문서 보기](https://docs.example.com)

## 가이드 사용 팁

### 코드 블록 복사 기능

가이드의 모든 코드 예제에는 **복사 버튼**이 포함되어 있습니다:

- 각 코드 블록 우측 상단에 \`복사\` 버튼이 표시됩니다
- 버튼을 클릭하면 코드가 클립보드에 자동으로 복사됩니다
- 복사가 완료되면 \`복사됨!\` 메시지가 2초간 표시됩니다

이 기능을 사용하면 예제 코드를 빠르게 복사하여 바로 사용할 수 있습니다!

\`\`\`python
# 이 코드 블록에도 복사 버튼이 있습니다!
print("Hello, World!")
\`\`\`

---

**마지막 업데이트**: 2025-10-16`
    },
    {
      "id": "configuration",
      "name": "설정 가이드",
      "icon": "fas fa-cog",
      "content": `# 설정 가이드

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

\`temperature\`는 응답의 창의성을 조절합니다:

- **0.0 - 0.3**: 일관성 있고 예측 가능한 응답
- **0.4 - 0.7**: 균형잡힌 응답 (권장)
- **0.8 - 1.0**: 창의적이고 다양한 응답

\`\`\`javascript
{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000
}
\`\`\`

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

- \`read\`: 데이터 조회만 가능
- \`write\`: 데이터 생성 및 수정 가능
- \`admin\`: 모든 권한 (주의해서 사용)

### 환경 변수 설정

API 키는 환경 변수로 관리하는 것을 권장합니다:

**Linux/Mac:**
\`\`\`bash
export API_KEY="your-api-key-here"
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
$env:API_KEY="your-api-key-here"
\`\`\`

## 웹훅 설정

웹훅을 사용하면 특정 이벤트가 발생했을 때 알림을 받을 수 있습니다.

### 웹훅 URL 등록

1. 설정 페이지에서 '웹훅' 탭 선택
2. 웹훅 URL 입력 (예: \`https://your-domain.com/webhook\`)
3. 수신할 이벤트 선택:
   - \`request.completed\`: 요청 완료 시
   - \`error.occurred\`: 오류 발생 시
   - \`usage.threshold\`: 사용량 임계값 도달 시

### 웹훅 페이로드 예시

\`\`\`json
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
\`\`\`

## 사용량 제한 설정

예산 관리를 위해 사용량 제한을 설정할 수 있습니다:

1. 설정 → '사용량 제한'으로 이동
2. 일일/월간 한도 설정
3. 알림 임계값 설정 (예: 80% 도달 시 알림)

## 보안 설정

### IP 화이트리스트

특정 IP에서만 API를 사용할 수 있도록 제한:

\`\`\`
192.168.1.100
10.0.0.0/24
\`\`\`

### CORS 설정

웹 애플리케이션에서 사용할 경우 CORS 도메인을 등록하세요:

- \`https://example.com\`
- \`https://app.example.com\`

---

더 자세한 내용은 [API 문서](https://docs.example.com/api)를 참고하세요.`
    },
    {
      "id": "advanced",
      "name": "고급 사용법",
      "icon": "fas fa-graduation-cap",
      "content": `# 고급 사용법

이 가이드에서는 고급 기능과 최적화 방법을 다룹니다.

## 스트리밍 응답

실시간으로 응답을 받아볼 수 있는 스트리밍 기능을 사용하는 방법입니다.

### Python 예제

\`\`\`python
import requests

def stream_response(prompt):
    response = requests.post(
        "https://api.example.com/v1/chat/stream",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gpt-4",
            "messages": [{"role": "user", "content": prompt}],
            "stream": True
        },
        stream=True
    )
    
    for line in response.iter_lines():
        if line:
            print(line.decode('utf-8'))

stream_response("긴 이야기를 들려주세요")
\`\`\`

### JavaScript 예제

\`\`\`javascript
async function streamChat(prompt) {
  const response = await fetch('https://api.example.com/v1/chat/stream', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{role: 'user', content: prompt}],
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log(chunk);
  }
}
\`\`\`

## 함수 호출 (Function Calling)

AI 모델이 특정 함수를 호출할 수 있도록 설정하는 방법입니다.

### 함수 정의

\`\`\`python
functions = [
    {
        "name": "get_weather",
        "description": "특정 도시의 날씨 정보를 가져옵니다",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "도시 이름 (예: 서울, 부산)"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "온도 단위"
                }
            },
            "required": ["city"]
        }
    }
]

response = requests.post(
    "https://api.example.com/v1/chat",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-4",
        "messages": [{"role": "user", "content": "서울 날씨 어때?"}],
        "functions": functions
    }
)
\`\`\`

## 멀티모달 입력

이미지와 텍스트를 함께 처리하는 방법입니다.

### 이미지 URL 사용

\`\`\`python
response = requests.post(
    "https://api.example.com/v1/chat",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-4-vision",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": "이 이미지에 무엇이 보이나요?"},
                {"type": "image_url", "image_url": {
                    "url": "https://example.com/image.jpg"
                }}
            ]
        }]
    }
)
\`\`\`

### Base64 이미지 사용

\`\`\`python
import base64

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

base64_image = encode_image("photo.jpg")

response = requests.post(
    "https://api.example.com/v1/chat",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-4-vision",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": "이 사진 분석해줘"},
                {"type": "image_url", "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                }}
            ]
        }]
    }
)
\`\`\`

## 배치 처리

여러 요청을 한 번에 처리하여 효율성을 높이는 방법입니다.

\`\`\`python
batch_requests = [
    {"custom_id": "req-1", "prompt": "1+1은?"},
    {"custom_id": "req-2", "prompt": "파이썬이란?"},
    {"custom_id": "req-3", "prompt": "AI의 미래는?"}
]

response = requests.post(
    "https://api.example.com/v1/batch",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-4",
        "requests": batch_requests
    }
)

# 배치 작업 상태 확인
batch_id = response.json()["batch_id"]
status = requests.get(
    f"https://api.example.com/v1/batch/{batch_id}",
    headers={"Authorization": f"Bearer {API_KEY}"}
)
\`\`\`

## 성능 최적화

### 1. 캐싱 활용

동일한 요청에 대해 캐싱을 사용하여 비용과 시간을 절약:

\`\`\`python
import hashlib
import json
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_request(prompt_hash):
    # API 호출
    pass

prompt = "안녕하세요"
prompt_hash = hashlib.md5(prompt.encode()).hexdigest()
result = cached_request(prompt_hash)
\`\`\`

### 2. 비동기 처리

여러 요청을 동시에 처리:

\`\`\`python
import asyncio
import aiohttp

async def async_request(session, prompt):
    async with session.post(
        "https://api.example.com/v1/chat",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"model": "gpt-4", "messages": [{"role": "user", "content": prompt}]}
    ) as response:
        return await response.json()

async def process_multiple():
    async with aiohttp.ClientSession() as session:
        tasks = [
            async_request(session, "질문 1"),
            async_request(session, "질문 2"),
            async_request(session, "질문 3")
        ]
        results = await asyncio.gather(*tasks)
        return results

results = asyncio.run(process_multiple())
\`\`\`

### 3. 토큰 최적화

불필요한 토큰 사용을 줄이는 방법:

- 프롬프트를 간결하게 작성
- \`max_tokens\` 파라미터 적절히 설정
- 시스템 메시지를 효과적으로 활용

\`\`\`python
# 좋은 예
messages = [
    {"role": "system", "content": "간결하게 답변해주세요."},
    {"role": "user", "content": "AI란?"}
]

# 나쁜 예
messages = [
    {"role": "user", "content": "안녕하세요! 저는 AI에 대해 궁금한 것이 있어서요. AI가 정확히 무엇인지 자세하고 길게 설명해주실 수 있나요?"}
]
\`\`\`

## 오류 처리

견고한 애플리케이션을 위한 오류 처리 패턴:

\`\`\`python
import time
from requests.exceptions import RequestException

def api_call_with_retry(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://api.example.com/v1/chat",
                headers={"Authorization": f"Bearer {API_KEY}"},
                json={
                    "model": "gpt-4",
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=30
            )
            response.raise_for_status()
            return response.json()
            
        except RequestException as e:
            if attempt == max_retries - 1:
                raise
            wait_time = (2 ** attempt)  # 지수 백오프
            print(f"재시도 중... ({attempt + 1}/{max_retries})")
            time.sleep(wait_time)
\`\`\`

## 모니터링 및 로깅

### 사용량 추적

\`\`\`python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def track_usage(response):
    usage = response.get('usage', {})
    logger.info(f"토큰 사용: {usage.get('total_tokens', 0)}")
    logger.info(f"비용: {usage.get('total_tokens', 0) * 0.00002:.4f}")
    
\`\`\`

### 대시보드 활용

실시간 모니터링을 위해 대시보드를 확인하세요:

- 📊 [사용량 대시보드](https://dashboard.example.com/usage)
- 💰 [비용 분석](https://dashboard.example.com/billing)
- 🔍 [요청 로그](https://dashboard.example.com/logs)

---

**더 많은 예제와 고급 기능**은 [GitHub 저장소](https://github.com/example/api-examples)에서 확인하세요.`
    }
  ]
};

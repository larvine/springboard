# 고급 사용법

이 가이드에서는 고급 기능과 최적화 방법을 다룹니다.

## 스트리밍 응답

실시간으로 응답을 받아볼 수 있는 스트리밍 기능을 사용하는 방법입니다.

### Python 예제

```python
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
```

### JavaScript 예제

```javascript
async function streamChat(prompt) {
  const response = await fetch('https://api.example.com/v1/chat/stream', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
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
```

## 함수 호출 (Function Calling)

AI 모델이 특정 함수를 호출할 수 있도록 설정하는 방법입니다.

### 함수 정의

```python
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
```

## 멀티모달 입력

이미지와 텍스트를 함께 처리하는 방법입니다.

### 이미지 URL 사용

```python
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
```

### Base64 이미지 사용

```python
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
```

## 배치 처리

여러 요청을 한 번에 처리하여 효율성을 높이는 방법입니다.

```python
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
```

## 성능 최적화

### 1. 캐싱 활용

동일한 요청에 대해 캐싱을 사용하여 비용과 시간을 절약:

```python
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
```

### 2. 비동기 처리

여러 요청을 동시에 처리:

```python
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
```

### 3. 토큰 최적화

불필요한 토큰 사용을 줄이는 방법:

- 프롬프트를 간결하게 작성
- `max_tokens` 파라미터 적절히 설정
- 시스템 메시지를 효과적으로 활용

```python
# 좋은 예
messages = [
    {"role": "system", "content": "간결하게 답변해주세요."},
    {"role": "user", "content": "AI란?"}
]

# 나쁜 예
messages = [
    {"role": "user", "content": "안녕하세요! 저는 AI에 대해 궁금한 것이 있어서요. AI가 정확히 무엇인지 자세하고 길게 설명해주실 수 있나요?"}
]
```

## 오류 처리

견고한 애플리케이션을 위한 오류 처리 패턴:

```python
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
```

## 모니터링 및 로깅

### 사용량 추적

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def track_usage(response):
    usage = response.get('usage', {})
    logger.info(f"토큰 사용: {usage.get('total_tokens', 0)}")
    logger.info(f"비용: ${usage.get('total_tokens', 0) * 0.00002:.4f}")
```

### 대시보드 활용

실시간 모니터링을 위해 대시보드를 확인하세요:

- 📊 [사용량 대시보드](https://dashboard.example.com/usage)
- 💰 [비용 분석](https://dashboard.example.com/billing)
- 🔍 [요청 로그](https://dashboard.example.com/logs)

---

**더 많은 예제와 고급 기능**은 [GitHub 저장소](https://github.com/example/api-examples)에서 확인하세요.

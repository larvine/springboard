# 시작하기

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

```python
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
```

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

## 가이드 사용 팁

### 코드 블록 복사 기능

가이드의 모든 코드 예제에는 **복사 버튼**이 포함되어 있습니다:

- 각 코드 블록 우측 상단에 `복사` 버튼이 표시됩니다
- 버튼을 클릭하면 코드가 클립보드에 자동으로 복사됩니다
- 복사가 완료되면 `복사됨!` 메시지가 2초간 표시됩니다

이 기능을 사용하면 예제 코드를 빠르게 복사하여 바로 사용할 수 있습니다!

```python
# 이 코드 블록에도 복사 버튼이 있습니다!
print("Hello, World!")
```

## 도움이 필요하신가요?

궁금한 점이 있으시면 언제든지 문의해주세요:

- 📧 이메일: support@example.com
- 💬 Discord: [커뮤니티 참여하기](https://discord.gg/example)
- 📚 문서: [전체 문서 보기](https://docs.example.com)

---

**마지막 업데이트**: 2025-10-16

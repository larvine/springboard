# 🚀 AI 에이전트 빠른 시작

## 1분 요약

```bash
# 1. 설치
./install_agent.sh

# 2. API 키 설정
export OPENAI_API_KEY='your-api-key'

# 3. 실행!
python3 newsletter_agent.py --auto
```

끝! 🎉

---

## 📦 설치

### 필수 패키지

```bash
chmod +x install_agent.sh
./install_agent.sh
```

또는 수동으로:

```bash
pip install -r requirements_agent.txt
```

### API 키 발급

1. OpenAI: https://platform.openai.com/api-keys
2. 또는 Anthropic: https://console.anthropic.com/

### API 키 설정

```bash
# 임시 (현재 세션만)
export OPENAI_API_KEY='sk-...'

# 영구 (추천)
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.bashrc
source ~/.bashrc
```

---

## 🎮 사용법

### 완전 자동 모드

```bash
python3 newsletter_agent.py --auto
```

AI가 알아서:
- ✅ 포스트 분석 및 선택
- ✅ 요약 생성
- ✅ 제목 생성
- ✅ 파일 저장

### AI 추천 모드

```bash
python3 newsletter_agent.py --interactive
```

1. 모드 2 선택
2. AI 추천 확인
3. 원하는 것 선택
4. 완료!

### 자동 스케줄

```bash
./setup_cron.sh
```

매주 자동 생성! 🎉

---

## ⚙️ 설정

`newsletter_agent_config.yaml`:

```yaml
ai_provider: openai
ai_model: gpt-4o-mini
max_wide_items: 1
max_grid_items: 4
candidate_days: 30
```

---

## 💰 비용

**GPT-4o-mini**: 주당 약 30원 (월 120원)

엄청 저렴! ☕

---

## 🐛 문제 해결

### API 키 오류
```bash
echo $OPENAI_API_KEY
export OPENAI_API_KEY='your-key'
```

### 후보 없음
```yaml
candidate_days: 60  # 늘리기
```

### 템플릿 오류
```bash
ls templates/  # 확인
```

---

## 📚 더 알아보기

- **상세 가이드**: `README_AGENT.md`
- **한글 가이드**: `에이전트_사용법.md`
- **기본 버전**: `README_NEWSLETTER.md`

---

**이제 AI가 뉴스레터를 자동으로 만들어줍니다!** 🤖✨

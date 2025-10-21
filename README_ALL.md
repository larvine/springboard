# 📰 Jekyll Newsletter Generator Suite

Jekyll 블로그용 뉴스레터 자동 생성 도구 모음

## 📦 포함된 도구

### 1. 📝 Newsletter Generator (기본)
수동으로 뉴스레터를 생성하는 기본 도구

- ✅ 템플릿 기반 생성
- ✅ Wide/Grid Section 지원
- ✅ 대화형 모드
- ✅ 배치 모드 (JSON)

**파일**: `newsletter_generator.py`

### 2. 🤖 Newsletter Agent (AI)
AI가 자동으로 생성하는 지능형 에이전트

- ✅ AI 포스트 분석 및 선택
- ✅ AI 요약 생성
- ✅ AI 제목 생성
- ✅ 자동 스케줄링
- ✅ OpenAI/Anthropic 지원

**파일**: `newsletter_agent.py`

## 🚀 빠른 시작

### 기본 버전 (무료)

```bash
pip install pyyaml
python3 newsletter_generator.py
```

### AI 버전 (추천!)

```bash
./install_agent.sh
export OPENAI_API_KEY='your-key'
python3 newsletter_agent.py --auto
```

## 📁 파일 구조

```
.
├── 📜 기본 도구
│   ├── newsletter_generator.py       # 기본 생성기
│   ├── newsletter_config.yaml        # 기본 설정
│   └── example_newsletter.json       # 예제
│
├── 🤖 AI 에이전트
│   ├── newsletter_agent.py           # AI 에이전트
│   ├── newsletter_agent_config.yaml  # AI 설정
│   ├── scheduler.py                  # 스케줄러
│   ├── requirements_agent.txt        # AI 패키지
│   ├── install_agent.sh              # 자동 설치
│   └── setup_cron.sh                 # Cron 설정
│
├── 📋 템플릿
│   └── templates/
│       ├── post_template.md          # 포스트 템플릿
│       ├── wide_section.html         # Wide 섹션
│       ├── grid_section.html         # Grid 섹션
│       ├── grid_item.html            # Grid 아이템
│       └── newsletter_styles.css     # 스타일
│
└── 📚 문서
    ├── README_NEWSLETTER.md          # 기본 매뉴얼 (영문)
    ├── README_AGENT.md               # AI 매뉴얼 (영문)
    ├── 사용법.md                      # 기본 가이드 (한글)
    ├── 에이전트_사용법.md              # AI 가이드 (한글)
    ├── QUICKSTART_KO.md              # 빠른 시작 (한글)
    └── QUICKSTART_AGENT.md           # AI 빠른 시작
```

## 🎯 어떤 걸 사용해야 하나요?

### 기본 버전을 사용하세요 만약...

- ✅ AI API 키가 없거나 비용이 부담스러울 때
- ✅ 직접 포스트를 선택하고 싶을 때
- ✅ 간단한 기능만 필요할 때

### AI 버전을 사용하세요 만약...

- ✅ 완전 자동화를 원할 때
- ✅ AI가 포스트를 분석/선택해주길 원할 때
- ✅ 매주 자동으로 뉴스레터를 만들고 싶을 때
- ✅ 비용이 문제가 안될 때 (주당 30원 정도)

## 📖 사용 예시

### 기본 버전

```bash
# 대화형
python3 newsletter_generator.py

# JSON 배치
python3 newsletter_generator.py --batch example_newsletter.json

# 후보 확인만
python3 newsletter_generator.py --candidates
```

### AI 버전

```bash
# 완전 자동
python3 newsletter_agent.py --auto

# AI 추천 모드
python3 newsletter_agent.py --interactive

# 스케줄 실행
python3 scheduler.py
```

## 🔧 설정

### 기본 버전

`newsletter_config.yaml`:
```yaml
templates_dir: templates
posts_dir: _posts
images_dir: assets/images
candidate_days: 30
```

### AI 버전

`newsletter_agent_config.yaml`:
```yaml
ai_provider: openai
ai_model: gpt-4o-mini
auto_select: true
auto_summarize: true
max_wide_items: 1
max_grid_items: 4
```

## 💰 비용 비교

| 버전 | 비용 | 시간 | 품질 |
|-----|------|------|------|
| 기본 | 무료 | 5-10분 | 사용자 의존 |
| AI | 주당 30원 | 자동 (0분) | AI 최적화 |

## 🎓 학습 경로

1. **기본부터 시작** → `QUICKSTART_KO.md`
2. **AI 에이전트 체험** → `QUICKSTART_AGENT.md`
3. **깊이있게 이해** → `README_NEWSLETTER.md` + `README_AGENT.md`
4. **한글로 자세히** → `사용법.md` + `에이전트_사용법.md`

## 🛠️ 요구사항

### 기본 버전
- Python 3.7+
- pyyaml

### AI 버전
- Python 3.7+
- pyyaml
- openai 또는 anthropic
- schedule (스케줄러 사용시)

## 🌟 주요 기능 비교

| 기능 | 기본 | AI |
|-----|------|-----|
| 템플릿 기반 생성 | ✅ | ✅ |
| Wide/Grid Section | ✅ | ✅ |
| 대화형 모드 | ✅ | ✅ |
| 배치 모드 | ✅ | ✅ |
| 자동 포스트 분석 | ❌ | ✅ |
| 자동 포스트 선택 | ❌ | ✅ |
| AI 요약 생성 | ❌ | ✅ |
| AI 제목 생성 | ❌ | ✅ |
| 자동 스케줄링 | ❌ | ✅ |
| Slack 알림 | ❌ | ✅ |

## 📚 문서 가이드

### 빠르게 시작하고 싶다면
- `QUICKSTART_KO.md` - 기본 버전 5분 시작
- `QUICKSTART_AGENT.md` - AI 버전 1분 시작

### 자세히 알고 싶다면
- `README_NEWSLETTER.md` - 기본 버전 완전 가이드 (영문)
- `README_AGENT.md` - AI 버전 완전 가이드 (영문)

### 한글로 보고 싶다면
- `사용법.md` - 기본 버전 한글 가이드
- `에이전트_사용법.md` - AI 버전 한글 가이드

## 🎯 워크플로우 예시

### 시나리오 1: 주간 뉴스레터 (수동)

```bash
# 매주 직접 실행
python3 newsletter_generator.py
# → 포스트 선택
# → 뉴스레터 생성
```

### 시나리오 2: 주간 뉴스레터 (자동)

```bash
# 한 번만 설정
./setup_cron.sh  # 매주 월요일 9시 선택

# 이제 자동으로 생성됨! 🎉
```

### 시나리오 3: 월간 요약 (AI)

```yaml
# newsletter_agent_config.yaml
candidate_days: 30
max_wide_items: 2
max_grid_items: 8
```

```bash
# 매월 1일 실행하도록 cron 설정
0 10 1 * * cd /blog && python3 newsletter_agent.py --auto
```

## 🐛 문제 해결

### 기본 버전

```bash
# 템플릿을 찾을 수 없음
ls templates/  # 폴더 확인

# 후보 포스트가 없음
python3 newsletter_generator.py --candidates
```

### AI 버전

```bash
# API 키 오류
echo $OPENAI_API_KEY
export OPENAI_API_KEY='your-key'

# 비용이 걱정됨
# → newsletter_agent_config.yaml에서
# → ai_model: gpt-4o-mini 사용 (권장)
```

## 🔗 링크

### API 발급
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

### Jekyll 문서
- https://jekyllrb.com/
- https://jekyllrb.com/docs/front-matter/

## 🤝 기여

개선 아이디어나 버그 리포트는 언제든지 환영합니다!

## 📄 라이선스

자유롭게 사용하세요!

---

**Made with ❤️ for Jekyll Bloggers**

🔰 처음이라면 → `QUICKSTART_KO.md`  
🤖 AI 사용하려면 → `QUICKSTART_AGENT.md`  
📚 자세히 알려면 → `README_NEWSLETTER.md` & `README_AGENT.md`

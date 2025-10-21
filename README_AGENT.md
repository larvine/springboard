# 🤖 AI Newsletter Agent

AI를 활용하여 **완전 자동**으로 Jekyll 블로그 뉴스레터를 생성하는 지능형 에이전트입니다.

## ✨ 주요 기능

### 🧠 AI 기반 자동화
- **자동 포스트 분석**: AI가 각 포스트를 분석하고 0-100점으로 점수화
- **자동 포스트 선택**: 점수 기반으로 Wide/Grid Section에 최적 배치
- **자동 요약 생성**: 각 포스트를 매력적인 한 줄로 요약
- **자동 제목 생성**: 전체 내용을 고려한 뉴스레터 제목 생성

### 🎯 다양한 실행 모드
1. **완전 자동 모드**: AI가 모든 것을 처리
2. **AI 추천 모드**: AI 추천 + 사용자 최종 선택
3. **수동 모드**: 기존 방식대로 직접 선택

### ⏰ 자동 스케줄링
- Cron 기반 정기 실행
- 매주 월요일, 매일 등 자유로운 스케줄 설정
- Slack/이메일 알림 지원

### 🔌 AI 제공자 지원
- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-3.5-turbo
- **Anthropic**: Claude 3.5 Sonnet 등

## 🚀 빠른 시작

### 1단계: 패키지 설치

```bash
# 자동 설치 스크립트
chmod +x install_agent.sh
./install_agent.sh

# 또는 수동 설치
pip install -r requirements_agent.txt
```

### 2단계: API 키 설정

```bash
# OpenAI 사용시
export OPENAI_API_KEY='your-openai-api-key'

# 또는 Anthropic 사용시
export ANTHROPIC_API_KEY='your-anthropic-api-key'

# 영구 설정 (bash)
echo 'export OPENAI_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

### 3단계: 설정 파일 수정

`newsletter_agent_config.yaml` 파일을 수정:

```yaml
# AI 설정
ai_provider: openai        # 'openai' 또는 'anthropic'
ai_model: gpt-4o-mini     # 사용할 모델
ai_api_key: null          # null이면 환경변수에서 읽음

# 에이전트 동작
auto_select: true         # AI 자동 선택
auto_summarize: true      # AI 자동 요약
max_wide_items: 1         # Wide Section 개수
max_grid_items: 4         # Grid Section 개수
```

### 4단계: 실행!

```bash
# 완전 자동 모드
python3 newsletter_agent.py --auto

# AI 지원 대화형 모드
python3 newsletter_agent.py --interactive
```

## 📖 사용 방법

### 방법 1: 완전 자동 모드 (추천!)

AI가 모든 것을 자동으로 처리합니다.

```bash
python3 newsletter_agent.py --auto
```

**실행 과정:**
1. 최근 30일 포스트 검색
2. AI가 각 포스트 분석 및 점수화
3. 점수 기반으로 자동 선택
4. AI가 요약 생성
5. AI가 제목 생성
6. 뉴스레터 파일 생성

**출력 예시:**
```
🤖 AI 뉴스레터 에이전트
================================================================================

📚 15개의 후보 포스트를 찾았습니다.

🤖 AI가 포스트를 분석하고 선택하는 중...
   분석 중 (1/15): GPT-5 출시 임박...
   분석 중 (2/15): 구글 양자컴퓨터...
   ...

✅ 선택 완료:
   📌 Wide Section: 1개
      - GPT-5 출시 임박 (점수: 95)
   📊 Grid Section: 4개
      - 구글 양자컴퓨터 (점수: 88)
      - 애플 Vision Pro 2 (점수: 85)
      ...

✍️  AI가 요약을 생성하는 중...
📝 AI가 제목을 생성하는 중...
   ✅ 제목: 이번 주 AI & 테크 뉴스 - 2025년 10월 3주차

⚙️  뉴스레터를 생성하는 중...

✅ 뉴스레터가 생성되었습니다!
   📄 파일: _posts/2025-10-21-newsletter.md
   📝 제목: 이번 주 AI & 테크 뉴스 - 2025년 10월 3주차
   🎨 Wide items: 1개
   📊 Grid items: 4개
```

### 방법 2: AI 추천 모드

AI가 추천하고 사용자가 최종 선택합니다.

```bash
python3 newsletter_agent.py --interactive
```

**실행 과정:**
1. 모드 선택 → `2) AI 추천 + 수동 선택` 선택
2. AI가 포스트 분석 및 점수화
3. AI 추천 순위 표시
4. 사용자가 원하는 포스트 선택
5. AI가 요약 및 제목 생성
6. 뉴스레터 생성

**출력 예시:**
```
🎯 모드를 선택하세요:
   1) 완전 자동 (AI가 모두 선택)
   2) AI 추천 + 수동 선택
   3) 수동 선택만

> 2

🤖 AI가 포스트를 분석하는 중...

📊 AI 추천 순위:
================================================================================

[1] GPT-5 출시 임박, 새로운 AI 시대
    점수: 95/100
    중요도: high
    카테고리: ai
    이유: 최신 주요 기술 발표, 업계 파급력 큼

[2] 구글 양자컴퓨터 칩 공개
    점수: 88/100
    중요도: high
    카테고리: tech
    이유: 획기적인 기술 발전

...

📝 뉴스레터 제목을 입력하세요 (엔터: AI 자동 생성):
> 

🎨 Wide Section 번호 (쉼표 구분):
> 1

📊 Grid Section 번호 (쉼표 구분):
> 2,3,4,5

✍️  AI가 요약을 생성하는 중...
📝 AI가 제목을 생성하는 중...
   ✅ 제목: 이번 주 AI & 테크 혁신 소식

✅ 뉴스레터가 생성되었습니다!
```

### 방법 3: 자동 스케줄링

#### 옵션 A: Crontab 사용 (간편)

```bash
# 대화형 설정
chmod +x setup_cron.sh
./setup_cron.sh

# 또는 직접 설정
crontab -e

# 매주 월요일 오전 9시에 실행
0 9 * * 1 cd /path/to/blog && python3 newsletter_agent.py --auto >> newsletter_agent.log 2>&1
```

#### 옵션 B: Python 스케줄러 사용

```bash
# 설정 파일 수정
vi newsletter_agent_config.yaml
```

```yaml
schedule:
  enabled: true
  cron: "0 9 * * 1"      # 매주 월요일 오전 9시
  timezone: "Asia/Seoul"
```

```bash
# 스케줄러 실행
python3 scheduler.py

# 백그라운드 실행
nohup python3 scheduler.py &

# 또는 systemd 서비스로 등록 (권장)
```

#### Systemd 서비스 설정 (Linux)

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/newsletter-agent.service
```

```ini
[Unit]
Description=Newsletter Agent Scheduler
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/your/blog
Environment="OPENAI_API_KEY=your-api-key"
ExecStart=/usr/bin/python3 /path/to/your/blog/scheduler.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 활성화 및 시작
sudo systemctl enable newsletter-agent
sudo systemctl start newsletter-agent

# 상태 확인
sudo systemctl status newsletter-agent

# 로그 확인
sudo journalctl -u newsletter-agent -f
```

## 🎯 AI 분석 기준

AI가 포스트를 분석할 때 다음 요소를 고려합니다:

- **최신성**: 최근 포스트일수록 높은 점수
- **완성도**: 제목, 설명, 이미지가 모두 있는지
- **주제**: 트렌딩 주제인지
- **중요도**: 업계 파급력
- **가독성**: 명확하고 이해하기 쉬운지

점수는 0-100점으로 계산되며:
- **90-100**: 매우 중요, Wide Section 추천
- **70-89**: 중요, Grid Section 추천
- **50-69**: 보통, 상황에 따라 선택
- **50 미만**: 낮음, 제외 가능

## 🔧 고급 설정

### AI 모델 선택

```yaml
# GPT-4o (가장 강력, 비용 높음)
ai_provider: openai
ai_model: gpt-4o

# GPT-4o-mini (균형잡힌 선택, 권장)
ai_provider: openai
ai_model: gpt-4o-mini

# Claude 3.5 Sonnet (고품질 분석)
ai_provider: anthropic
ai_model: claude-3-5-sonnet-20241022
```

### 포스트 선택 기준 조정

```yaml
max_wide_items: 2      # Wide Section에 2개
max_grid_items: 6      # Grid Section에 6개
candidate_days: 45     # 최근 45일 이내 포스트
```

### Slack 알림 설정

```yaml
notifications:
  enabled: true
  slack_webhook: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

Webhook URL 받는 법:
1. Slack → Apps → Incoming Webhooks
2. "Add to Slack" 클릭
3. 채널 선택 후 Webhook URL 복사

## 💡 실전 워크플로우

### 시나리오 1: 주간 뉴스레터 자동화

```bash
# 1. 초기 설정 (한 번만)
./install_agent.sh
export OPENAI_API_KEY='your-key'
./setup_cron.sh  # 매주 월요일 오전 9시 선택

# 2. 테스트
python3 newsletter_agent.py --auto

# 3. 완료! 이제 매주 자동으로 생성됨
```

### 시나리오 2: 월간 뉴스레터

```yaml
# newsletter_agent_config.yaml
candidate_days: 30
max_wide_items: 2
max_grid_items: 8
```

```bash
# Crontab: 매월 1일 오전 10시
0 10 1 * * cd /path/to/blog && python3 newsletter_agent.py --auto
```

### 시나리오 3: AI 추천받아 수동 조정

```bash
# 매주 직접 확인하며 생성
python3 newsletter_agent.py --interactive

# 2번 선택 → AI 추천 확인 → 원하는 것만 선택
```

## 📊 비용 예상

### OpenAI (GPT-4o-mini)

- 포스트 15개 분석: 약 $0.01
- 요약 5개 생성: 약 $0.005
- 제목 생성: 약 $0.001
- **총 주당 비용**: 약 $0.02 (약 30원)

### Anthropic (Claude 3.5 Sonnet)

- 포스트 15개 분석: 약 $0.03
- 요약 5개 생성: 약 $0.01
- 제목 생성: 약 $0.002
- **총 주당 비용**: 약 $0.04 (약 60원)

## 🐛 문제 해결

### AI API 오류

```bash
# API 키 확인
echo $OPENAI_API_KEY

# API 키 재설정
export OPENAI_API_KEY='your-new-key'

# 또는 설정 파일에 직접 입력
vi newsletter_agent_config.yaml
```

### 스케줄러가 실행되지 않음

```bash
# Crontab 확인
crontab -l

# Cron 로그 확인
tail -f /var/log/syslog | grep CRON  # Ubuntu/Debian
tail -f /var/log/cron                # CentOS/RHEL

# 수동 실행 테스트
python3 newsletter_agent.py --auto
```

### AI가 이상한 결과 반환

```yaml
# 온도(temperature) 낮추기
# newsletter_agent.py에서 수정
temperature: 0.3  # 기본 0.7
```

## 🎁 팁 & 트릭

### 1. 비용 절감

```yaml
# GPT-4o 대신 GPT-4o-mini 사용 (10배 저렴)
ai_model: gpt-4o-mini

# 또는 AI 없이 기본 모드로
auto_select: false
auto_summarize: false
```

### 2. 품질 향상

```yaml
# 더 많은 후보에서 선택
candidate_days: 60
max_wide_items: 1    # Wide는 진짜 중요한 것만
max_grid_items: 4    # Grid도 엄선

# Claude 사용 (더 나은 분석)
ai_provider: anthropic
ai_model: claude-3-5-sonnet-20241022
```

### 3. 디버깅

```bash
# 상세 로그 출력
python3 newsletter_agent.py --auto 2>&1 | tee debug.log

# 후보 포스트만 확인
python3 newsletter_generator.py --candidates
```

## 📚 추가 문서

- **기본 사용법**: `README_NEWSLETTER.md`
- **한글 가이드**: `사용법.md`
- **빠른 시작**: `QUICKSTART_KO.md`

## 🤝 기여

개선 아이디어나 버그 리포트는 언제든지 환영합니다!

---

**Made with 🤖 AI & ❤️**

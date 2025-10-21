# 🚀 빠른 시작 - Jekyll 뉴스레터 생성기

## 5분 안에 시작하기

### 1단계: PyYAML 설치
```bash
pip install pyyaml
```

### 2단계: 설정 확인
`newsletter_config.yaml` 파일을 열어서 경로가 맞는지 확인:
```yaml
templates_dir: templates
posts_dir: _posts
images_dir: assets/images
```

### 3단계: 실행!
```bash
python3 newsletter_generator.py
```

## 📋 주요 명령어

### 대화형으로 뉴스레터 만들기
```bash
python3 newsletter_generator.py
```

### 후보 포스트만 확인
```bash
python3 newsletter_generator.py --candidates
```

### JSON 파일로 배치 생성
```bash
python3 newsletter_generator.py --batch example_newsletter.json
```

## 📁 파일 구조

```
your-blog/
├── newsletter_generator.py    ← 메인 프로그램
├── newsletter_config.yaml     ← 설정 파일
├── templates/                 ← HTML 템플릿
│   ├── post_template.md
│   ├── wide_section.html
│   ├── grid_section.html
│   └── grid_item.html
└── _posts/                    ← 생성된 뉴스레터 저장
    └── 2025-10-21-newsletter.md
```

## 💡 사용 예시

### 예시 1: 주간 뉴스레터

```bash
$ python3 newsletter_generator.py

📝 뉴스레터 제목:
> 이번 주 AI 뉴스 - 10월 3주차

🎨 Wide Section (큰 이미지):
> 1

📊 Grid Section (작은 카드):
> 2,3,4

✅ 완료!
```

### 예시 2: Python 코드로 사용

```python
from newsletter_generator import NewsletterGenerator

gen = NewsletterGenerator()

content = gen.generate_newsletter_post(
    title='주간 뉴스레터',
    wide_items=[{'title': '...', 'image': '...', 'url': '...'}],
    grid_items=[{'title': '...', 'image': '...', 'url': '...'}]
)

gen.save_newsletter_post(content)
```

## 🎯 주요 기능

- ✅ **자동 후보 추천**: 최근 30일 포스트 자동 검색
- ✅ **템플릿 기반**: HTML 템플릿 수정으로 커스터마이징
- ✅ **2가지 레이아웃**: Wide Section (큰 카드) + Grid Section (작은 카드)
- ✅ **이미지 & 링크**: 자동으로 이미지와 하이퍼링크 삽입
- ✅ **배치 모드**: JSON 파일로 한 번에 생성

## 📚 더 자세한 내용

- **한국어 가이드**: `사용법.md` 참고
- **영문 README**: `README_NEWSLETTER.md` 참고
- **예제 파일**: `example_newsletter.json` 참고

## ⚠️ 문제 해결

### Python을 찾을 수 없다?
```bash
# python 대신 python3 사용
python3 newsletter_generator.py
```

### 템플릿을 찾을 수 없다?
```bash
# templates/ 폴더가 있는지 확인
ls templates/
```

### 후보 포스트가 없다?
```bash
# _posts/ 폴더에 마크다운 파일 확인
ls _posts/

# 또는 candidate_days를 늘려보세요 (config 파일에서)
candidate_days: 60  # 30 → 60으로 변경
```

## 🎉 완성!

이제 Jekyll 블로그에 멋진 뉴스레터를 쉽게 만들 수 있습니다!

더 자세한 사용법은 `사용법.md` 또는 `README_NEWSLETTER.md`를 참고하세요.

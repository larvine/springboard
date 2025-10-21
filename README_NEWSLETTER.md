# Jekyll Newsletter Generator 🎯

Jekyll 블로그용 뉴스레터 포스트를 자동으로 생성하는 Python 도구입니다.

## 📋 기능

- ✅ 템플릿 기반 뉴스레터 포스트 자동 생성
- ✅ Wide Section과 Grid Section 지원
- ✅ 이미지와 하이퍼링크 자동 삽입
- ✅ 최근 포스팅 후보 자동 추천
- ✅ 대화형 모드와 배치 모드 지원
- ✅ 커스터마이징 가능한 템플릿

## 🚀 빠른 시작

### 1. 필수 패키지 설치

```bash
pip install pyyaml
```

### 2. 프로젝트 구조 설정

```
your-jekyll-blog/
├── _posts/                    # Jekyll 포스트 디렉토리
├── assets/
│   └── images/               # 이미지 디렉토리
├── templates/                 # 뉴스레터 템플릿
│   ├── post_template.md      # 포스트 템플릿
│   ├── wide_section.html     # Wide section 템플릿
│   ├── grid_section.html     # Grid section 템플릿
│   ├── grid_item.html        # Grid item 템플릿
│   └── newsletter_styles.css # 스타일시트 (선택사항)
├── newsletter_generator.py   # 메인 스크립트
└── newsletter_config.yaml    # 설정 파일
```

### 3. 설정 파일 수정

`newsletter_config.yaml` 파일을 열어 경로를 수정하세요:

```yaml
templates_dir: templates
posts_dir: _posts
images_dir: assets/images
candidate_days: 30
```

## 💻 사용 방법

### 방법 1: 대화형 모드 (권장)

```bash
python newsletter_generator.py
```

프로그램이 다음 단계를 안내합니다:
1. 최근 30일 이내의 포스트 목록 표시
2. 뉴스레터 제목 입력
3. Wide Section에 들어갈 포스트 선택 (예: 1,3,5)
4. Grid Section에 들어갈 포스트 선택 (예: 2,4,6,7)
5. 자동으로 `_posts/YYYY-MM-DD-newsletter.md` 파일 생성

### 방법 2: 후보 포스트만 확인

```bash
python newsletter_generator.py --candidates
```

최근 포스트 목록만 확인하고 JSON 형식으로도 출력합니다.

### 방법 3: 배치 모드

JSON 파일을 만들어 한 번에 생성:

```bash
python newsletter_generator.py --batch example_newsletter.json
```

**example_newsletter.json 형식:**

```json
{
  "title": "Weekly Newsletter - 2025년 10월 3주차",
  "date": "2025-10-21",
  "wide_items": [
    {
      "title": "메인 기사 제목",
      "image": "/assets/images/newsletter/main-image.jpg",
      "url": "https://example.com/posts/main-article",
      "description": "메인 기사 설명..."
    }
  ],
  "grid_items": [
    {
      "title": "보조 기사 1",
      "image": "/assets/images/newsletter/article1.jpg",
      "url": "https://example.com/posts/article1",
      "description": "기사 설명..."
    },
    {
      "title": "보조 기사 2",
      "image": "/assets/images/newsletter/article2.jpg",
      "url": "https://example.com/posts/article2",
      "description": "기사 설명..."
    }
  ],
  "filename": "2025-10-21-weekly-newsletter.md"
}
```

## 🎨 템플릿 커스터마이징

### 포스트 템플릿 수정

`templates/post_template.md` 파일을 수정하여 Jekyll 포스트의 기본 구조를 변경할 수 있습니다:

```markdown
---
{front_matter}---

<!-- 여기에 원하는 내용 추가 -->

{wide_sections}

{grid_section}

<!-- 푸터나 추가 섹션 -->
```

### HTML 템플릿 수정

#### Wide Section (`templates/wide_section.html`)

큰 이미지와 제목으로 강조되는 섹션입니다:

```html
<div class="newsletter-wide-section">
  <a href="{url}">
    <img src="{image}" alt="{title}" />
    <h2>{title}</h2>
    <p>{description}</p>
  </a>
</div>
```

사용 가능한 변수:
- `{title}` - 기사 제목
- `{image}` - 이미지 경로
- `{url}` - 링크 URL
- `{description}` - 기사 설명

#### Grid Section (`templates/grid_section.html`)

여러 개의 작은 카드로 표시되는 섹션입니다:

```html
<div class="newsletter-grid-section">
  <div class="newsletter-grid">
{items}
  </div>
</div>
```

#### Grid Item (`templates/grid_item.html`)

각 그리드 아이템의 구조:

```html
<div class="newsletter-grid-item">
  <a href="{url}">
    <img src="{image}" alt="{title}" />
    <h3>{title}</h3>
    <p>{description}</p>
  </a>
</div>
```

## 🎯 실제 사용 예시

### 예시 1: 주간 뉴스레터 생성

```bash
$ python newsletter_generator.py

================================================================================
🎯 Jekyll 뉴스레터 포스트 생성기
================================================================================

📚 뉴스레터 후보 포스트:
================================================================================

[1] GPT-5 출시 소식
    날짜: 2025-10-20
    설명: OpenAI가 새로운 GPT-5 모델을 발표했습니다...
    이미지: /assets/images/gpt5.jpg

[2] 양자 컴퓨터 발전
    날짜: 2025-10-19
    설명: 구글의 새로운 양자 칩 발표...

[3] AI 윤리 가이드라인
    날짜: 2025-10-18
    설명: EU의 새로운 AI 규제안...

================================================================================

📝 뉴스레터 제목을 입력하세요:
> AI Weekly - 2025년 10월 3주차

🎨 Wide Section에 들어갈 포스트를 선택하세요:
   (번호를 쉼표로 구분하여 입력, 예: 1,3,5)
> 1

📊 Grid Section에 들어갈 포스트를 선택하세요:
   (번호를 쉼표로 구분하여 입력, 예: 2,4,6)
> 2,3

⚙️  뉴스레터를 생성하는 중...

✅ 뉴스레터가 생성되었습니다!
   📄 파일: _posts/2025-10-21-newsletter.md
   📝 제목: AI Weekly - 2025년 10월 3주차
   🎨 Wide items: 1개
   📊 Grid items: 2개

================================================================================
```

### 예시 2: Python 코드로 직접 사용

```python
from newsletter_generator import NewsletterGenerator

# 생성기 초기화
generator = NewsletterGenerator('newsletter_config.yaml')

# 포스트 정보 정의
wide_items = [
    {
        'title': '메인 기사',
        'image': '/assets/images/main.jpg',
        'url': 'https://example.com/main',
        'description': '메인 기사 설명...'
    }
]

grid_items = [
    {
        'title': '보조 기사 1',
        'image': '/assets/images/sub1.jpg',
        'url': 'https://example.com/sub1',
        'description': '설명...'
    },
    {
        'title': '보조 기사 2',
        'image': '/assets/images/sub2.jpg',
        'url': 'https://example.com/sub2',
        'description': '설명...'
    }
]

# 뉴스레터 생성
content = generator.generate_newsletter_post(
    title='주간 뉴스레터',
    wide_items=wide_items,
    grid_items=grid_items
)

# 파일 저장
file_path = generator.save_newsletter_post(content)
print(f'생성됨: {file_path}')
```

## 📝 생성된 포스트 예시

```markdown
---
layout: post
title: AI Weekly - 2025년 10월 3주차
date: 2025-10-21 14:30:00 +0900
categories:
- newsletter
tags: []

---

<!-- Newsletter Post -->

<div class="newsletter-wide-section">
  <a href="https://example.com/posts/gpt5">
    <div class="newsletter-wide-image">
      <img src="/assets/images/gpt5.jpg" alt="GPT-5 출시" />
    </div>
    <div class="newsletter-wide-content">
      <h2>GPT-5 출시 소식</h2>
      <p>OpenAI가 새로운 GPT-5 모델을 발표했습니다...</p>
    </div>
  </a>
</div>

<div class="newsletter-grid-section">
  <div class="newsletter-grid">
    <div class="newsletter-grid-item">
      <a href="https://example.com/posts/quantum">
        <img src="/assets/images/quantum.jpg" alt="양자 컴퓨터" />
        <h3>양자 컴퓨터 발전</h3>
        <p>구글의 새로운 양자 칩...</p>
      </a>
    </div>
  </div>
</div>

<!-- End Newsletter -->
```

## 🎨 스타일링

`templates/newsletter_styles.css` 파일이 제공됩니다. Jekyll 블로그의 CSS 파일에 포함시키세요:

```html
<!-- _includes/head.html 또는 _layouts/default.html -->
<link rel="stylesheet" href="/assets/css/newsletter_styles.css">
```

또는 기존 스타일시트에 내용을 복사해서 사용하세요.

## 🔧 고급 설정

### 커스텀 Front Matter

```python
content = generator.generate_newsletter_post(
    title='뉴스레터',
    wide_items=wide_items,
    grid_items=grid_items,
    layout='newsletter',           # 커스텀 레이아웃
    categories=['news', 'weekly'],
    tags=['ai', 'tech'],
    author='홍길동',
    featured: True
)
```

### 템플릿에 추가 변수 사용

템플릿에 `{custom_field}` 같은 변수를 추가하고, 아이템 데이터에 포함시키세요:

```python
wide_items = [
    {
        'title': '제목',
        'image': '/path/to/image.jpg',
        'url': 'https://example.com',
        'description': '설명',
        'custom_field': '커스텀 값'  # 추가 필드
    }
]
```

## 🐛 문제 해결

### 1. 템플릿 파일을 찾을 수 없다는 오류

- `newsletter_config.yaml`의 `templates_dir` 경로가 올바른지 확인
- 템플릿 파일들이 모두 존재하는지 확인

### 2. 후보 포스트가 표시되지 않음

- `_posts` 디렉토리가 존재하는지 확인
- 포스트 파일에 Front Matter가 올바르게 작성되어 있는지 확인
- `candidate_days` 값을 늘려보세요 (예: 60, 90)

### 3. 한글이 깨짐

- 파일이 UTF-8 인코딩으로 저장되어 있는지 확인
- Jekyll의 `_config.yml`에 `encoding: utf-8` 설정 추가

## 📚 추가 자료

- [Jekyll 공식 문서](https://jekyllrb.com/)
- [Jekyll Front Matter](https://jekyllrb.com/docs/front-matter/)
- [PyYAML 문서](https://pyyaml.org/)

## 📄 라이선스

이 프로젝트는 자유롭게 사용하실 수 있습니다.

## 🤝 기여

개선 사항이나 버그 리포트는 언제든지 환영합니다!

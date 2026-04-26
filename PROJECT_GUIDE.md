# PROJECT GUIDE — Banana Black Website

> 다음 작업 전에 먼저 읽는 기준 문서입니다.
> 마지막 업데이트: 2026-04-27

## 프로젝트 목적

- 바나나블랙 포트폴리오와 문의 전환용 정적 사이트
- 기술 스택: HTML / CSS / JavaScript + Supabase (DB + Storage + Edge Functions)
- Analytics: GA4 (G-2FJCQ8LW6B)

---

## 페이지 구조

### 공개 배포 범위
| 파일 | 설명 |
|---|---|
| `index.html` | 홈 |
| `about.html` | 소개 |
| `contact.html` | 문의 |
| `works/index.html` | Works 허브 |
| `works/product.html` | Product 상세 |
| `works/food.html` | Food 상세 |
| `works/dessert.html` | Dessert 상세 |
| `works/space.html` | Space 상세 |
| `works/portrait.html` | Portrait 상세 |

### 내부 운영 범위 (URL 직접 접근 전용)
| 파일 | 설명 |
|---|---|
| `works/portrait-private.html` | Environment Portrait 비공개 페이지 |
| `works/upload.html` | 이미지 업로드 (내부 운영용) |
| `works/manage.html` | 이미지 관리 (내부 운영용) |

### 운영 원칙
- `upload / manage / portrait-private`는 공개 메뉴 / 푸터 / CTA에 노출하지 않음
- URL 직접 접근 전용으로만 유지
- `works/portrait-private.html`, `works/upload.html`, `works/manage.html`에는 `noindex, nofollow` 적용

---

## 인프라 구조

### Vercel
- 정적 사이트 배포 기준
- `vercel.json`에서 `cleanUrls: true`, `trailingSlash: false` 적용
- 공개 URL 방향은 `/works/product`처럼 `.html` 없는 URL 기준
- HTML 내부 링크도 clean URL 기준으로 유지
- 내부 운영 페이지는 HTML `noindex, nofollow`와 Vercel `X-Robots-Tag` 헤더를 함께 사용
- `.vercelignore`에서 문서 / Supabase 소스 / 로컬 환경 파일은 배포 번들에서 제외
- `mobile-preview.html`은 로컬 모바일 검수 전용이며 `.vercelignore`로 배포에서 제외

### Supabase
- 운영 URL: `https://gtuwmsynpdpixmhfytao.supabase.co`
- Edge Functions:
  - `get-works-content` — works 이미지/카테고리 조회
  - `upload-work-image` — 이미지 업로드 → Storage 저장 + works_images row 생성
  - `manage-work-images` — 정렬 / 숨김 / 삭제
  - `submit-contact-inquiry` — 문의 저장 + 관리자 메일 발송

### 인증 / 접근 방식
- 현재 `supabase/config.toml` 기준으로 4개 Edge Function 모두 `verify_jwt = false`
- 문서상 `verify_jwt 적용`으로 보지 않고, 현재는 공개 호출 전제 구조로 이해해야 함

### 이미지 전략
- Works 이미지는 **Supabase Storage** 기반으로 관리
- 로컬 `images/works/`에는 HTML에 직접 hardcode된 5개만 유지:
  - `5cced61b2b11e.jpg` (portrait hero)
  - `30e31ad2d4316.jpg`
  - `8ca1cc9bc0acb.jpg`
  - `69349b8668aad.png`
  - `product-hero-blue.jpg`

---

## Works 상세페이지 구조 (공통)

각 상세페이지는 아래 순서로 구성:

1. **Fixed 헤더** (전역)
2. **works-local-nav** — All Works + 카테고리 링크
3. **works-landing-intro** — 카테고리별 카피 1줄 + 카카오톡 문의 CTA
4. **Hero / Grid 이미지 구간** — Supabase Storage 이미지 렌더링
5. **하단 CTA 섹션**

### 모바일 UX 기준
- 헤더: `position: fixed`, 모바일에서 column 레이아웃 (~147px 높이)
- `works-local-nav` padding-top: 모바일 152px / 데스크톱 92px
- `works-landing-intro` padding-bottom: 모바일 5rem / 데스크톱 1.5rem
- 작은 모바일 검수 기준 폭: 360 / 390 / 430
- 로컬 검수 URL: `http://127.0.0.1:4173/mobile-preview.html`
- 주요 카피는 `*-line` span 블록으로 모바일 줄바꿈을 고정
- 모바일 핵심 문구는 `<br>` 의존보다 전용 line 클래스를 우선 사용
- 푸터 연락처 / 사업자 메타 문구는 모바일에서 2줄 고정
- About 메타 태그 3개 항목은 430 이하에서 세로 정렬 유지

---

## 남은 작업 우선순위

1. **Vercel 배포** — `vercel.json` 기준으로 공개 사이트 정적 배포
2. **Contact 운영 연결** — 아래 체크리스트 참고
3. **Works 운영툴 안정화** — upload / manage 안정화 후 내부 운영 개시

### Contact 운영 전 체크리스트
- [ ] Resend 도메인 인증
- [ ] `MAIL_FROM` 운영 주소 확정
- [ ] Supabase secrets 등록 (`RESEND_API_KEY` 등)
- [ ] `submit-contact-inquiry` 운영 환경 배포
- [ ] 운영 환경 실제 제출 테스트

---

## 작업 원칙

- 공개 범위와 내부 운영 범위를 섞지 않음
- 하단 CTA / 상단 카피 문구는 별도 지시 없으면 건드리지 않음
- CSS 변경은 가능하면 공통 클래스로 처리해 모든 상세페이지 일괄 적용
- 배포 전 모바일 기준으로 먼저 확인
- 비공개 포트폴리오 운영 기준은 `works/portrait-private.html` 단일 기준으로 유지

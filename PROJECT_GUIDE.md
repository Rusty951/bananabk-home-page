# PROJECT GUIDE — Banana Black Website

> 다음 작업 전에 먼저 읽는 기준 문서입니다.
> 마지막 업데이트: 2026-04-15

## 프로젝트 목적

- 바나나블랙 포트폴리오와 문의 전환용 정적 사이트
- 기술 스택: HTML / CSS / JavaScript + Supabase (DB + Storage + Edge Functions)
- Analytics: GA4 (`G-2FJCQ8LW6B`)

---

## 현재 구조 요약

### 공개 페이지
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

### 홈(`index.html`) 현재 기준
- 히어로 서브카피: `브랜드의 언어를 빛으로 번역합니다`
- Works 섹션 상단에 전체 카테고리 안내 문구 배치
- 하단 CTA는 2개 진입으로 분리:
  - `카카오톡 문의`
  - `정식 문의 남기기`
- CTA 큰 제목은 `어떤 장면이 필요한지 먼저 들려주세요` 기준으로 유지

### 비공개 / 내부 운영 페이지
| 파일 | 설명 |
|---|---|
| `works/portrait-private.html` | 비공개 Portrait 상세 |
| `works/upload.html` | 이미지 업로드 운영 페이지 |
| `works/manage.html` | 이미지 관리 운영 페이지 |

### 운영 원칙
- `works/portrait-private.html`, `works/upload.html`, `works/manage.html`에는 `noindex, nofollow` 적용
- 공개 메뉴에서 내부 운영 페이지로 연결하지 않음
- 비공개 포트폴리오 운영 기준은 `works/portrait-private.html`를 단일 기준으로 유지

---

## 인프라 구조

### Supabase
- 운영 URL: `https://gtuwmsynpdpixmhfytao.supabase.co`
- 브라우저 공개 설정은 [public-config.js](/Users/bananabk/Documents/Antigravity/bananabk-home-page/public-config.js)에 있음
- Edge Functions:
  - `get-works-content` — works 카테고리/이미지 조회
  - `upload-work-image` — 이미지 업로드 → Storage 저장 + `works_images` row 생성
  - `manage-work-images` — 목록 조회 / 순서 이동 / 숨김 / 삭제
  - `submit-contact-inquiry` — 문의 저장 + 관리자 메일 발송 시도

### 인증 / 접근 방식
- 현재 `supabase/config.toml` 기준으로 4개 Edge Function 모두 `verify_jwt = false`
- 프론트에서는 anon key를 `apikey` / `Authorization` 헤더로 전달
- 즉, 현재 문서 기준으로는 "JWT 검증 적용" 상태가 아니라 "공개 호출 + 함수 내부 처리" 구조로 봐야 함

### 이미지 전략
- Works 이미지는 Supabase Storage `works` 버킷 기준
- 로컬 `images/works/`에는 페이지 fallback 및 대표 이미지로 쓰는 파일만 유지
- 상세 Works 페이지는 `works-data.js`가 함수 응답을 우선 사용하고, 실패 시 REST 조회로 fallback

---

## Works 구조

### 공개 Works 상세페이지 공통 구조
1. Fixed 헤더
2. `works-local-nav`
3. `works-landing-intro`
4. Hero 이미지
5. Grid 이미지
6. 하단 CTA

### 비공개 Portrait 페이지
- 파일: `works/portrait-private.html`
- `data-category-slug="portrait-private"`로 동일 렌더링 파이프라인 사용
- GA 유틸리티(`analytics.js`) 포함
- 검색엔진 인덱싱 차단 메타 적용

### 모바일 UX 기준
- 헤더: `position: fixed`
- Works 상세 `works-local-nav`는 헤더 높이를 고려해 상단 여백 확보
- CTA와 첫 이미지 사이 간격은 모바일 기준으로 넉넉하게 유지
- 홈 Works 안내 문구는 가운데 정렬 기준으로 유지

---

## Contact 구조

### 현재 동작
- `contact.html` 폼 제출 시 `submit-contact-inquiry` 호출
- 저장 우선: `contact_inquiries` 테이블 저장
- 메일 후처리: Resend 설정이 있으면 관리자 메일 발송 시도
- 메일 실패 시에도 DB 저장 성공이면 사용자에게는 정상 접수 응답 가능

### 개인정보 수집 기준
- 현재 폼 기준 수집 항목:
  - 브랜드명 / 업체명
  - 담당자명
  - 이메일
  - 연락처
  - 문의내용
- 첨부파일 입력은 현재 구현되어 있지 않음

---

## Analytics 기준

- 공개 페이지에는 GA4 `gtag` 스니펫 삽입
- 커스텀 이벤트 유틸은 [analytics.js](/Users/bananabk/Documents/Antigravity/bananabk-home-page/analytics.js)
- 비공개 조회 이벤트는 `portrait-private` 경로 기준으로 추적

---

## 문서 작업 원칙

- 상태 문서는 "확인된 사실"만 적음
- 구현과 다를 수 있는 표현:
  - "배포 준비 완료"
  - "JWT 검증 적용"
  - "운영 안정화 완료"
  이런 표현은 실제 설정/테스트로 확인된 경우에만 사용

---

## 다음 작업 우선순위

1. Contact 운영 환경 secrets / Resend 도메인 인증 완료
2. 운영 배포 경로 확정 (Vercel 포함 여부)
3. Works 내부 운영툴 접근 제어 필요 시 별도 보호 방식 추가

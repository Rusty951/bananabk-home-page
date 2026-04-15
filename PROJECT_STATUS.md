# PROJECT STATUS — Banana Black Website

> 확인된 내용만 기록합니다. 마지막 업데이트: 2026-04-15

---

## 현재 확인 완료

### 저장소 / 기본 구조
- 정적 사이트 + Supabase 조합 구조 유지 중
- `.gitignore`에 `supabase/.env.local`, `.env.local` 포함
- Git 작업트리는 현재 수정 중인 문서/HTML/JS 기준으로 dirty 상태

### 공개 페이지
- 공개 페이지 파일은 홈 / 소개 / 문의 / Works 허브 / Product / Food / Dessert / Space / Portrait까지 확인
- 각 공개 Works 페이지는 `works-data.js` 기반으로 Supabase 데이터 렌더링 구조 사용
- `works/index.html`은 초기 정적 카드 마크업이 있고, 로드 후 함수 응답으로 덮어쓰는 구조
- 홈 `index.html`은 최근 수정 기준으로 다음 상태:
  - 히어로 서브카피 확대 적용
  - Works 상단 안내 문구에 Product / Food / Dessert / Space / Portrait 포함
  - Works 안내 문구 가운데 정렬 적용
  - 인스타 브릿지 링크 제거
  - 하단 CTA 버튼 문구를 `카카오톡 문의` / `정식 문의 남기기`로 통일

### Supabase
- 운영 URL은 `gtuwmsynpdpixmhfytao.supabase.co`
- 마이그레이션 파일 존재:
  - `contact_inquiries`
  - `works_categories`
  - `works_images`
- Edge Functions 4개 존재:
  - `get-works-content`
  - `upload-work-image`
  - `manage-work-images`
  - `submit-contact-inquiry`

### Contact
- 프론트는 `submit-contact-inquiry`를 직접 호출하는 구조
- 함수는 `contact_inquiries` 저장 후 Resend 메일 발송을 시도
- Resend 환경변수가 비어 있으면 저장은 하고 warning을 반환하는 구조
- 개인정보 안내 문구는 현재 폼 필드 기준으로 맞춰 수정 완료

### 비공개 / 내부 페이지
- `works/portrait-private.html` 존재
- `works/upload.html`, `works/manage.html` 존재
- 비공개/내부 페이지에는 `noindex, nofollow` 메타 반영 완료

### Analytics
- 공개 페이지에는 GA4 `gtag` 스니펫 존재
- `analytics.js` 기반 커스텀 이벤트 유틸 존재
- 비공개 조회 이벤트는 `portrait-private` 기준으로 추적

---

## 문서와 실제 구현의 차이점 정리

### 수정 완료
- 기존 문서의 `verify_jwt 적용` 표현은 실제 설정과 달라서 정정함
- 레거시 `hidden-portfolio.html` 삭제 완료
- `portrait-private` 추적 누락을 반영해 현재 상태와 문서를 맞춤
- Contact 개인정보 수집 항목에서 실제로 없는 첨부파일 항목 제거
- 홈 `index.html`의 최근 UI 수정 내용을 문서에 반영함

### 현재 실제 상태
- `supabase/config.toml` 기준 모든 함수는 `verify_jwt = false`
- "공개 사이트는 배포 준비 완료"라고 단정할 만큼 운영 배포 검증은 아직 없음
- 비공개 포트폴리오 경로는 `works/portrait-private.html` 단일 기준

---

## 진행 중 / 미확정

### 배포
- `vercel.json` 없음
- Vercel을 쓸지, 다른 정적 호스팅을 쓸지 저장소 기준으로 확정되지 않음
- 운영 URL / 도메인 기준 최종 점검 기록 없음

### Contact 운영 연결
- 운영 secrets 등록 여부는 저장소만으로 확정 불가
- Resend 도메인 인증 여부도 저장소만으로 확정 불가
- 운영 환경에서 실제 제출 테스트 완료 기록 없음

### Works 내부 운영툴
- 업로드 / 관리 UI와 함수는 존재
- 접근 제어는 별도 인증이 아니라 비노출 + 직접 접근 전제
- 운영 개시 완료라고 보기엔 보호 정책과 운영 검증 기록이 더 필요

---

## 정리 메모

### 중복 문구 / 상태 표현
- "배포 준비 완료"
- "verify_jwt 적용"
- "안정화 완료"
- 위 표현은 실제 검증 범위를 넘어서므로 지속적으로 제거 또는 보수적으로 유지하는 편이 맞음

---

## 다음 권장 순서

1. 운영 배포 경로 확정
2. Contact 운영 secrets / Resend 설정 실제 확인
3. Works 내부 운영툴 보호 수준 결정

---

## 한 줄 요약

구현은 어느 정도 갖춰져 있지만, 문서가 실제 설정보다 앞서가던 부분이 있어서 현재 코드 기준으로 다시 맞춰둔 상태입니다.

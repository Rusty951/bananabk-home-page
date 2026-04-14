# PROJECT STATUS — Banana Black Website

> 이 문서는 작업 진행 상황을 추적하는 상태 문서입니다.
> 새 작업을 시작하기 전에 먼저 읽고, 끝나면 현재 기준으로 갱신합니다.

---

## 현재 전체 상태

| 항목 | 내용 |
|---|---|
| 현재 공정 | 약 98% |
| 현재 완성도 | 약 9.8 / 10 |
| 현재 단계 | **Works 상세 구조 정리 + 업로드 구조/보안 1단계 반영 완료** |

**한 줄 요약**: Works 상세페이지는 hero 1장 중심 구조로 정리되었고, 업로드 페이지 + Edge Function + shared secret 기반 최소 보호 장치까지 붙었습니다. Contact는 로컬 기준 DB 저장과 관리자 메일 알림 검증이 완료된 상태입니다.

---

## 오늘 반영된 작업

### 1. Works 상세페이지 구조 정리
- [x] `product` 포함 상세페이지를 hero 1장 중심 구조로 정리
- [x] 기존 정적 fallback 그리드 제거
- [x] CTA / footer 유지
- [x] DB 첫 이미지 기준 hero 렌더 방식 적용
- [x] DB 이미지가 없을 때는 HTML hero fallback이 그대로 보이도록 안정화

대상 페이지:
- [x] `works/product.html`
- [x] `works/food.html`
- [x] `works/dessert.html`
- [x] `works/space.html`
- [x] `works/portrait.html`
- [x] `works/portrait-private.html`

### 2. Works 업로드 구조
- [x] `works/upload.html` 생성
- [x] `works/upload.js` 생성
- [x] `upload-work-image` Edge Function 추가
- [x] 업로드 시 Storage `works/{category}` + `works_images` row insert 구조 적용
- [x] DB insert 실패 시 Storage 업로드 cleanup 처리

### 3. 업로드 보안 1단계
- [x] `WORKS_UPLOAD_SHARED_SECRET` 도입
- [x] 업로드 페이지 비밀번호 입력 후 폼 노출
- [x] 업로드 요청 시 same secret 전송
- [x] Edge Function에서 secret 일치 시에만 업로드 허용

### 4. Contact
- [x] 로컬 기준 DB 저장 성공
- [x] 로컬 기준 관리자 메일 알림 성공

---

## 생성 / 수정 파일

### 생성
- [x] `works/upload.html`
- [x] `works/upload.js`
- [x] `supabase/functions/upload-work-image/index.ts`

### 수정
- [x] `works/product.html`
- [x] `works/food.html`
- [x] `works/dessert.html`
- [x] `works/space.html`
- [x] `works/portrait.html`
- [x] `works/portrait-private.html`
- [x] `works/works-data.js`
- [x] `style.css`
- [x] `main.js`
- [x] `supabase/config.toml`
- [x] `supabase/.env.local`

---

## 운영 전 남은 작업

- [ ] Resend 도메인 인증
- [ ] `MAIL_FROM` 운영 주소 변경
- [ ] Supabase secrets 등록
- [ ] Edge Function deploy
- [ ] 운영 환경 실테스트

---

## 주의 / 메모

- 업로드 구조는 현재 정식 로그인(Auth) 없이 shared secret 기반의 최소 보호 단계입니다.
- `verify_jwt = false`는 유지 중이며, 실제 보호는 업로드 페이지 비밀번호 입력 + 함수 내 secret 검증으로 처리합니다.
- 운영 배포 전에는 `WORKS_UPLOAD_SHARED_SECRET` 값을 실제 비밀번호로 교체하고, 배포 환경 secret에도 동일하게 등록해야 합니다.

---

## 한 줄 결론

> **Works 상세 구조 정리, 업로드 구조, 업로드 보안 1단계까지 완료. 다음 핵심은 운영 secret 등록과 Edge Function 배포 후 실테스트입니다.**

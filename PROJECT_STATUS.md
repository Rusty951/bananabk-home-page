# PROJECT STATUS — Banana Black Website

> 확인된 내용만 기록합니다. 마지막 업데이트: 2026-04-15

---

## 완료

### 저장소 / 인프라
- GitHub 저장소 운영 중: `https://github.com/Rusty951/bananabk-home-page.git`
- `main` 브랜치 최신 커밋 반영 완료
- `supabase/.env.local` — `.gitignore` 처리 완료
- Supabase 운영 프로젝트 연결 완료 (`gtuwmsynpdpixmhfytao.supabase.co`)
- Supabase 프로젝트 ID 오타 수정 완료 (bjx → pix)

### Analytics
- GA4 연결 완료 (G-2FJCQ8LW6B)
- 모든 공개 페이지에 `gtag` 삽입 완료
- `portrait-private` 비공개 포트폴리오 조회 추적 반영 완료

### Works 상세페이지
- product / food / dessert / space / portrait 5개 페이지 공개 배포 범위에 포함
- 각 페이지 상단에 카테고리별 랜딩 카피 + 카카오톡 문의 CTA 추가 완료
- Supabase Storage 이미지 기반 렌더링 구조 완료
- 로컬 미사용 이미지 39개 삭제 완료 (images/works/ 정리)

### 모바일 UX
- 플로팅 카카오톡 문의 버튼 위치 고정 (bottom-right)
- 상단 CTA ~ 첫 이미지 사이 간격 조정 완료 (모바일 5rem)
- 모바일에서 헤더 ~ works-local-nav 겹침 현상 수정 완료 (padding-top 92px → 152px)
- 푸터 네비 Contact 줄 떨어짐 수정 완료
- About / Contact 카피 모바일 줄바꿈 안정화 완료

### Supabase Edge Functions (로컬 검증 완료)
- `get-works-content` — works 이미지/카테고리 조회
- `upload-work-image` — 이미지 업로드 → Storage + DB row 생성
- `manage-work-images` — 정렬 / 숨김 / 삭제
- `submit-contact-inquiry` — 문의 저장 + 관리자 메일 발송 (로컬 기준)

### 현재 설정 기준
- `supabase/config.toml` 기준 4개 Edge Function 모두 `verify_jwt = false`

### Contact
- 로컬 기준 `contact_inquiries` DB 저장 확인
- 로컬 기준 관리자 메일 알림 확인
- `DB 우선 저장 → 메일 후발송` 구조 검증 완료

---

## 진행 중 / 보류

### Vercel 배포
- 정적 사이트 배포 미완료
- 배포 설정 파일 없음 (vercel.json 없음)

### Contact 운영 연결
- 로컬 검증만 완료, 운영 환경 미연결
- 남은 것:
  - [ ] Resend 도메인 인증
  - [ ] `MAIL_FROM` 운영 주소 확정
  - [ ] Supabase secrets 등록
  - [ ] `submit-contact-inquiry` 운영 배포
  - [ ] 운영 환경 실제 제출 테스트

### Works 내부 운영툴 (보류)
- `works/upload.html` / `works/manage.html`
- 공개 메뉴 / 푸터 / CTA 어디에도 노출하지 않음
- 로컬 테스트에서 upload → manage → render 흐름이 반복적으로 꼬인 이력 있음
- 안정화 후 내부 운영 개시 예정

### Environment Portrait
- `works/portrait-private.html` 존재 (비공개 내부 페이지)
- 공개 works 카테고리 네비에는 미노출 상태
- `works/portrait-private.html`, `works/upload.html`, `works/manage.html`에 `noindex, nofollow` 반영 완료

---

## 다음 작업 순서

1. Vercel 배포 → 공개 URL 확보
2. 운영 Supabase secrets 등록 + submit-contact-inquiry 운영 배포
3. 운영 환경에서 Contact 실제 제출 테스트
4. Works upload / manage 안정화

---

## 한 줄 요약

공개 사이트는 배포 준비 완료 상태. Vercel 배포와 Contact 운영 연결만 남음.

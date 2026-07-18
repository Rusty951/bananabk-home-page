# PROJECT STATUS — Banana Black Website

> 확인된 내용만 기록합니다. 마지막 업데이트: 2026-07-19 (푸드 촬영 광고 랜딩 광고 전 보완)

---

## 완료

### 저장소 / 인프라
- GitHub 저장소 운영 중: `https://github.com/Rusty951/bananabk-home-page.git`
- `main` 브랜치 최신 커밋 반영 완료
- `supabase/.env.local` — `.gitignore` 처리 완료
- Supabase 운영 프로젝트 연결 완료 (`gtuwmsynpdpixmhfytao.supabase.co`)
- Supabase CLI 로컬 링크 완료 (`gtuwmsynpdpixmhfytao`)
- Supabase 프로젝트 ID 오타 수정 완료 (bjx → pix)

### Analytics
- GA4 연결 완료 (G-2FJCQ8LW6B)
- 모든 공개 페이지에 `gtag` 삽입 완료
- `portrait-private` 비공개 포트폴리오 조회 추적 반영 완료
- 카카오톡 CTA 클릭에 랜딩 UTM과 버튼 위치를 함께 기록하도록 보강
- Meta Pixel은 `public-config.js`의 `metaPixelId` 설정 시 `/food-photo` 카카오톡 CTA 클릭을 표준 `Contact` 이벤트로 기록
- 실제 Meta Pixel ID 입력과 GA4 Realtime/DebugView 수신 확인은 미완료

### Works 상세페이지
- product / food / dessert / space / portrait 5개 페이지 공개 배포 범위에 포함
- 각 페이지 상단에 카테고리별 랜딩 카피 + 카카오톡 문의 CTA 추가 완료
- Supabase Storage 이미지 기반 렌더링 구조 완료
- 로컬 미사용 이미지 39개 삭제 완료 (images/works/ 정리)

### 광고용 랜딩
- `food-photo.html` 추가 완료
- Vercel clean URL 기준 `/food-photo` 공개 광고 랜딩으로 사용
- 기존 `/works/food`는 포트폴리오 페이지 역할로 유지
- 랜딩 CTA는 카카오톡 문의 중심으로 구성
- 공개 기본 패키지는 `30만 원부터`, 대표 메뉴 최대 5종, 기본 보정본 10컷 기준
- 촬영 지역과 납기는 랜딩에 공개하지 않고 상담 및 광고 타기팅에서 관리
- 히어로와 결과물 6장을 로컬 WebP로 경량화해 합계 약 0.91MB로 축소
- 결과물 다음에 실제 촬영 경험을 정리한 익명 사례 3개를 신뢰 요소로 추가

### 모바일 UX
- 플로팅 카카오톡 문의 버튼 위치 고정 (bottom-right)
- 상단 CTA ~ 첫 이미지 사이 간격 조정 완료 (모바일 5rem)
- 모바일에서 헤더 ~ works-local-nav 겹침 현상 수정 완료 (padding-top 92px → 152px)
- 푸터 네비 Contact 줄 떨어짐 수정 완료
- About / Contact 카피 모바일 줄바꿈 안정화 완료
- 360 / 390 / 430 모바일 QA 기준으로 주요 문구 줄바꿈 고정 완료
- Home / About / Contact / Works 상세 / portrait-private 하단 CTA 문구 모바일 줄바꿈 정리 완료
- About 메타 태그 3개 항목 모바일 세로 정렬 완료
- 푸터 사업자 / 연락처 메타 문구 모바일 2줄 고정 완료

### 코드 디버깅 (2026-04-15)
- 전체 HTML / JS 디버깅 완료, 중대 버그 없음 확인
- `product.html` — `<script defer>` 불일치 수정 (다른 페이지와 통일)
- `index.html` / `about.html` — `public-config.js` 로드 추가 (일관성)

### 배포 준비 설정 (2026-04-27)
- `vercel.json` 추가 완료
- Vercel `cleanUrls` 활성화 기준으로 `/works/product` 형태 URL 지원 준비
- 공개/내부 HTML 링크를 clean URL 기준으로 정리 완료
- `.vercelignore` 추가 완료 — 문서 / Supabase 소스 / 로컬 환경 파일 배포 번들 제외
- `mobile-preview.html` 추가 완료 — 360 / 390 / 430 로컬 모바일 검수 전용, 배포 제외
- `robots.txt` 추가 완료
- 내부 운영 페이지 (`upload`, `manage`, `portrait-private`) 검색 제외 규칙 추가 완료
- `main.js`의 `/works/{slug}` → `/works/{slug}.html` 주소 보정 제거 완료

### Supabase Edge Functions (로컬 검증 완료)
- `get-works-content` — works 이미지/카테고리 조회
- `upload-work-image` — 이미지 업로드 → Storage + DB row 생성
- `manage-work-images` — 정렬 / 숨김 / 삭제
- `submit-contact-inquiry` — 문의 저장 + 관리자 메일 발송 (로컬 기준)

### 현재 설정 기준
- `supabase/config.toml` 기준 4개 Edge Function 모두 `verify_jwt = false`
- `supabase/migrations/202605060001_harden_public_table_rls.sql` 추가 완료
- `supabase/migrations/202605140001_lock_public_data_api_grants.sql` 추가 완료
- `supabase/migrations/202605140002_restrict_works_storage_listing.sql` 추가 완료
- 운영 Edge Function 4개 ACTIVE 확인
- 운영 Supabase secrets 등록 확인 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`, `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`)
- 운영 DB RLS 보강 SQL 실행 완료
- 운영 DB Data API GRANT 보강 마이그레이션 적용 완료
- RLS 목표 상태:
  - `contact_inquiries` 직접 anon/authenticated 접근 차단
  - `works_categories` select만 공개 허용
  - `works_images` visible row select만 공개 허용
  - Works 쓰기/수정/삭제와 문의 저장/알림 갱신은 service role Edge Function 전용
- Supabase 2026 Data API 권한 변경 대응 기준:
  - public schema 테이블은 명시적인 GRANT를 마이그레이션에 포함
  - 공개 렌더링 테이블은 anon/authenticated `select`만 허용
  - 개인정보/내부 운영 테이블은 service_role 전용 유지

### Contact
- 로컬 기준 `contact_inquiries` DB 저장 확인
- 로컬 기준 관리자 메일 알림 확인
- `DB 우선 저장 → 메일 후발송` 구조 검증 완료
- 운영 `submit-contact-inquiry` OPTIONS/CORS 응답 정상 확인

---

## 진행 중 / 보류

### Vercel 배포
- 정적 사이트 배포 미완료
- 배포 설정 파일 추가 완료 (`vercel.json`)

### Contact 운영 연결
- 로컬 저장/메일 검증 완료
- 운영 함수와 secrets 등록 확인 완료
- 남은 것:
  - [ ] Resend 도메인 인증
  - [ ] `MAIL_FROM` 운영 주소 최종 확인
  - [ ] 운영 환경 실제 제출 테스트

### Supabase RLS 운영 적용
- Supabase 보안 메일 기준 `rls_disabled_in_public` 경고 확인
- 운영 REST API에서 anon 키로 `contact_inquiries` 조회 가능 상태 확인
- Supabase Dashboard SQL Editor로 RLS 보강 SQL 실행 완료
- anon 키로 `contact_inquiries` 조회 시 `permission denied for table contact_inquiries` 확인
- anon 키로 `works_categories`, `works_images` 공개 조회 정상 확인
- 운영 권한 조회에서 기존 기본 권한 일부(`REFERENCES`, `TRIGGER`, `TRUNCATE`)가 works 테이블 anon/authenticated에 남아 있음을 확인
- `202605140001_lock_public_data_api_grants.sql`로 `revoke all` 후 필요한 `select`만 재부여하도록 보강
- 운영 적용 후 권한 재조회 확인:
  - `contact_inquiries`: service_role만 접근
  - `works_categories`: anon/authenticated `select`만 접근
  - `works_images`: anon/authenticated `select`만 접근
- 운영 REST 재확인 완료:
  - anon 키로 `contact_inquiries` 조회 시 `permission denied for table contact_inquiries`
  - anon 키로 `works_categories`, `works_images` 공개 조회 정상
- Supabase migration history가 로컬과 원격 모두 `202605140001`까지 일치함
- Supabase Security Advisor 재실행 결과 `No issues found` 확인

### Supabase Storage 보안
- Security Advisor에서 `public_bucket_allows_listing` 경고 확인:
  - public bucket `works`에 broad `storage.objects` SELECT policy 존재
- 공개 이미지 URL 접근은 유지하되 bucket 전체 객체 목록 조회는 필요 없으므로 `Public Read  1vgtc2_0` policy 제거 마이그레이션 추가
- `202605140002_restrict_works_storage_listing.sql` 운영 DB 적용 완료
- Security Advisor 재확인 결과 `No issues found`
- 공개 이미지 URL 접근 정상 확인 (`/storage/v1/object/public/works/portrait/portrait_001.jpg` → 200)
- anon 키 기반 Storage object list 호출은 파일 목록을 반환하지 않음

### Supabase Edge Functions
- 운영 함수 목록 ACTIVE 확인:
  - `get-works-content`
  - `upload-work-image`
  - `manage-work-images`
  - `submit-contact-inquiry`
- `get-works-content`는 Supabase Function URL에 trailing slash가 있어야 쿼리 파라미터가 정상 전달되는 것을 확인함. `works/works-data.js`에서 함수 URL 생성 시 trailing slash를 보장하도록 보정 완료:
  - 정상: `/functions/v1/get-works-content/?mode=hub`
  - 400: `/functions/v1/get-works-content?mode=hub`
- 현재 공개 Works 렌더링은 `useWorksFunction: false`라 REST 경로를 사용하므로 공개 화면 영향 없음

### Works 내부 운영툴 (보류)
- `works/upload.html` / `works/manage.html`
- 공개 메뉴 / 푸터 / CTA 어디에도 노출하지 않음
- 로컬 테스트에서 upload → manage → render 흐름이 반복적으로 꼬인 이력 있음
- 안정화 후 내부 운영 개시 예정

### Environment Portrait
- `works/portrait-private.html` 존재 (비공개 내부 페이지)
- 공개 works 카테고리 네비에는 미노출 상태
- `works/portrait-private.html`, `works/upload.html`, `works/manage.html`에 `noindex, nofollow` 반영 완료
- 하단 CTA 타이틀을 `로케이션 인물 촬영에도` 기준으로 변경 완료
- 하단 CTA 문구 모바일 줄바꿈 정리 완료

---

## 다음 작업 순서

1. Vercel 배포 → 공개 URL 확보
2. Resend 도메인 / `MAIL_FROM` 운영 주소 최종 확인
3. 운영 환경에서 Contact 실제 제출 테스트
4. Works upload / manage 안정화

---

## 한 줄 요약

공개 사이트는 정적 배포 설정과 모바일 360 / 390 / 430 줄바꿈 QA까지 정리 완료 상태. Supabase 운영 함수·시크릿·RLS는 확인 완료, 실제 Vercel 배포와 Contact 운영 제출 테스트가 남음.

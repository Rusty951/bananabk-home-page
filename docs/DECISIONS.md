# Decisions

## 2026-06-18: 산출물은 Desktop 작업별 서브폴더에 둔다

결정:

- 새 산출물, 중간본, 검토 파일은 기본적으로 `~/Desktop/{작업}/` 작업별 서브폴더에 만든다.
- 정리 후보는 바로 삭제하지 않고 `~/Desktop/{작업}-cleanup/`로 빼고 manifest를 남긴다.

이유:

- 사용자가 결과물을 먼저 직접 검수한 뒤 백업 위치로 옮기는 흐름을 원한다.
- repo에는 공개 사이트 소스와 장기 운영 기준만 남기고, 검수 대기 파일은 Desktop에 모은다.

영향 문서:

- `AGENTS.md`

## 2026-05-21: 푸드 촬영 광고 랜딩 route 분리

결정:

- 음식 촬영 광고 목적지는 기존 포트폴리오 `/works/food`가 아니라 별도 공개 랜딩 `/food-photo`로 둔다.
- `/works/food`는 촬영 결과물을 보여주는 포트폴리오 페이지 역할을 유지한다.
- `/food-photo`는 카카오톡 문의 중심의 단일 판매 페이지로 운영하되, 메인 네비게이션과 푸터 카테고리 구조에는 추가하지 않는다.

이유:

- 광고 유입 방문자는 가격, 구성, 활용처, 문의 방법을 빠르게 확인해야 한다.
- 기존 홈페이지 전체 구조를 리뉴얼하지 않고 같은 도메인 안에서 캠페인 목적지만 분리한다.

영향 문서:

- `README.md`
- `PROJECT_GUIDE.md`
- `docs/PRD.md`
- `docs/DESIGN.md`
- `docs/TRD.md`

검증:

- 저장소 check 명령을 실행한다.
- 로컬 정적 서버에서 `/food-photo` 모바일/데스크톱 화면을 확인한다.

## 2026-05-14: Works Storage 객체 목록 조회 차단

결정:

- Supabase Security Advisor의 `public_bucket_allows_listing` 경고 대응을 위해 `works` bucket의 broad `storage.objects` SELECT policy를 제거한다.
- `works` bucket은 public bucket으로 유지해 공개 이미지 URL 접근은 유지한다.
- Storage 업로드/관리 작업은 기존처럼 Edge Function service_role 경로로 처리한다.

이유:

- 공개 포트폴리오 이미지는 URL로 렌더링되어야 하지만, 클라이언트가 bucket 전체 파일 목록을 조회할 필요는 없다.
- public bucket은 객체 URL 접근에 별도의 broad SELECT policy가 필요하지 않다.

영향 문서:

- `PROJECT_STATUS.md`

검증:

- Supabase Security Advisor를 다시 실행한다.
- 공개 이미지 URL 접근과 Works REST 조회가 유지되는지 확인한다.

## 2026-05-14: Supabase Data API 명시 GRANT 기준 적용

결정:

- Supabase의 2026 public schema Data API 권한 변경에 대비해 기존 public 테이블 권한을 명시적으로 재확인하는 마이그레이션을 추가한다.
- `works_categories`, `works_images`는 anon/authenticated에 `select`만 부여한다.
- `contact_inquiries`는 anon/authenticated 권한을 제거하고 service_role 전용으로 유지한다.
- 앞으로 새 public 테이블을 만들 때는 `grant` + RLS + policy를 같은 작업 단위에서 작성한다.

이유:

- Supabase가 public schema 테이블의 Data API 자동 노출 기본값을 변경한다.
- 이전 기본 권한 때문에 공개 렌더링 테이블에 `select` 외 권한이 남을 수 있으므로, 의도한 최소 권한으로 재고정한다.

영향 문서:

- `PROJECT_GUIDE.md`
- `docs/TRD.md`
- `PROJECT_STATUS.md`

검증:

- 운영 DB 권한 조회로 현재 GRANT 상태를 확인한다.
- 저장소 check 명령으로 JS/TS 문법 검사를 통과시킨다.
- 운영 DB 적용 후 anon 키로 공개 works 조회와 contact_inquiries 차단을 재확인한다.

## 2026-05-06: Supabase public table RLS 보강

결정:

- Supabase 보안 경고(`rls_disabled_in_public`) 대응을 위해 public 테이블 RLS 보강 마이그레이션을 추가한다.
- `contact_inquiries`는 anon/authenticated 직접 접근을 차단하고 service role 기반 Edge Function 전용으로 유지한다.
- `works_categories`, `works_images`는 사이트 렌더링에 필요한 공개 읽기만 허용하고, 쓰기/수정/삭제는 service role 전용으로 유지한다.

이유:

- 운영 REST API에서 anon 키로 `contact_inquiries` 조회가 가능해 문의자 개인정보 노출 위험이 확인되었다.
- 현재 프론트는 works 콘텐츠를 직접 REST로 읽을 수 있으므로, 전체 차단이 아니라 필요한 select만 정책으로 허용해야 한다.

영향 문서:

- `PROJECT_GUIDE.md`
- `docs/TRD.md`
- `PROJECT_STATUS.md`

검증:

- 저장소 check 명령으로 JS/TS 문법 검사를 통과시킨다.
- 운영 DB 적용 후 anon 키로 `contact_inquiries` 조회가 차단되는지 확인한다.

## 2026-05-04: Project Operating Guide 적용

결정:

- `AGENTS.md`를 짧은 AI 작업 라우터로 추가한다.
- 기존 `PRD.md`, `PROJECT_GUIDE.md`, `PROJECT_STATUS.md`는 운영 원본으로 유지한다.
- `docs/*`는 기존 원본을 대체하지 않고, AI가 빠르게 맥락을 찾는 지도 역할을 한다.
- 새 문서가 Vercel 배포 번들에 포함되지 않도록 `.vercelignore`를 보강한다.

이유:

- 기존 프로젝트 문서가 강하고, 특히 `PROJECT_GUIDE.md`가 다음 작업 전 기준 문서 역할을 한다.
- 이 프로젝트는 공개 정적 사이트라 운영 문서가 배포되지 않도록 해야 한다.
- 표준 문서가 원본을 덮어쓰면 현재 상태와 작업 기준이 분산될 수 있다.

검증:

- JS와 Supabase 함수 파일은 `node --check` 기반 check 명령으로 검증한다.

## 2026-05-04: Product Supabase URL 오타 수정

결정:

- `works/product-render.js`의 Supabase URL을 현재 운영 프로젝트 ID와 맞춘다.

이유:

- `PROJECT_STATUS.md`, `PROJECT_GUIDE.md`, `public-config.js`, HTML preconnect는 `gtuwmsynpdpixmhfytao`를 운영 프로젝트로 기록한다.
- `works/product-render.js`만 `gtuwmsynpdbjxmhfytao`로 다른 프로젝트 ID를 가리키고 있었다.

검증:

- check 명령으로 문법 검사를 통과시킨다.

## Decision Log Template

날짜:

결정:

이유:

영향 문서:

검증:

## 2026-06-13 - 로컬 메모리는 DECISIONS에 미러링해 영속화한다

- 결정: 로컬 메모리에 새 운영·findings·피드백 항목을 남기면 같은 요지를 이 문서에 날짜 항목(결정/이유/영향)으로 함께 기록한다. 순수 사용자 신원 사실은 제외한다.
- 이유: 클로드 로컬 메모리는 기기/설치에 묶여 다른 컴퓨터에서 참조 불가, 포맷 시 소실. git DECISIONS는 clone/pull로 어느 기기에서나 따라온다.
- 영향: 메모리는 복기용, 영속 원본은 DECISIONS. 참조는 /decisions. 미러 항목은 3줄로 짧게.

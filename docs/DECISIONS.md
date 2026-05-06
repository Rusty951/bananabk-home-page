# Decisions

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

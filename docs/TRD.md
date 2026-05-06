# TRD

## 기술 스택

- Frontend: HTML, CSS, vanilla JavaScript
- Hosting: Vercel static deployment
- Backend services: Supabase DB, Storage, Edge Functions
- Analytics: GA4
- Local preview: Python static server

## 실행 구조

- 정적 HTML 페이지가 공개 사이트를 구성한다.
- `main.js`, `works/*.js`, `analytics.js`, `public-config.js`가 브라우저 동작을 담당한다.
- Works 이미지는 Supabase Storage와 Edge Function/REST 호출로 렌더링한다.
- Contact 제출은 Supabase Edge Function을 통해 저장과 메일 발송을 처리한다.
- `vercel.json`은 clean URL과 내부 페이지 검색 제외 헤더를 관리한다.

## 운영 원본

- `PROJECT_GUIDE.md`: 다음 작업 전에 읽는 기준 문서
- `PROJECT_STATUS.md`: 확인된 현재 상태와 남은 작업
- `PRD.md`: 상세 제품/브랜드/UX 원본
- `vercel.json`: 배포 라우팅과 검색 제외 헤더
- `.vercelignore`: 배포 번들 제외 규칙
- `supabase/config.toml`: Supabase 함수 JWT 설정

## AI 운영 원칙

- 컨텍스트 원칙: 반복 설명은 문서로 고정하고, 새 작업은 `README.md`, `docs/*`, `PROJECT_GUIDE.md`를 먼저 읽고 시작한다.
- 토큰 원칙: 긴 배경 설명 대신 Context Map의 원본 문서를 참조한다.
- 하네스 원칙: 변경은 작게 쪼개고, 커밋 전 단일 check 명령을 통과시킨다.
- 공개/내부 분리 원칙: 내부 운영 페이지는 공개 메뉴, 푸터, CTA에 노출하지 않는다.
- 운영 원본 원칙: `PROJECT_GUIDE.md`, `PROJECT_STATUS.md`, `PRD.md`는 표준 문서로 대체하지 않는다.
- 배포 안전 원칙: 운영 문서와 Supabase 소스는 Vercel 배포 번들에서 제외한다.
- 안전 원칙: 데이터 삭제, 대량 이미지 변경, 배포/보안 설정 변경은 명시 승인 전 실행하지 않는다.

## 위험 작업 규칙

- 즉시 가능: 문서 보강, 작은 CSS/JS 수정, 오탈자 수정, 링크 불일치 수정.
- 보고 후 진행: 페이지 구조 변경, 공통 CSS 리듬 변경, Supabase 함수의 작은 수정, Vercel 설정 보강.
- 승인 전 금지: Supabase 데이터/Storage 삭제, 마이그레이션 실행, 공개/내부 페이지 노출 정책 변경, GA/Supabase 키 변경, 대량 이미지 삭제.

## Supabase RLS 기준

- `contact_inquiries`: 개인정보/문의 내용 저장 테이블이므로 anon/authenticated 직접 접근을 허용하지 않는다. 저장과 알림 상태 갱신은 `submit-contact-inquiry` Edge Function의 service role로만 수행한다.
- `works_categories`: 공개 페이지와 직접 링크 기반 비공개 포트폴리오 렌더링을 위해 anon/authenticated `select`만 허용한다.
- `works_images`: `is_visible = true`인 row만 anon/authenticated `select`를 허용한다.
- Works 업로드, 정렬, 숨김, 삭제는 `upload-work-image`, `manage-work-images` Edge Function의 service role로만 수행한다.
- 운영 DB에 Supabase 보안 경고가 뜨면 `supabase/migrations/*harden_public_table_rls.sql` 기준으로 RLS와 권한을 먼저 확인한다.

## Definition of Done

- 요청 범위 안에서만 변경했다.
- 공개 페이지와 내부 운영 페이지의 경계를 유지했다.
- 제품 범위, 구조, check 명령, 배포 제외 규칙이 바뀌면 문서를 함께 갱신했다.
- 커밋 전 check 명령을 통과시켰다.
- 실패한 검증, 남은 위험, 미해결 TODO를 보고했다.

## 검증 루틴

커밋 전 아래 명령을 통과시킨다.

```bash
rg --files -g '*.js' -g 'supabase/functions/*/index.ts' -g '!node_modules' -g '!dist' -g '!build' -g '!coverage' -g '!.next' -g '!out' -g '!output' -g '!preview' -g '!.cache' | xargs -n1 node --check
```

추가로 UI 변경은 로컬 서버에서 주요 페이지와 `mobile-preview.html`을 확인한다.

## check 명령 탐색 기록

- `package.json` 없음
- Deno CLI 없음
- Node.js는 사용 가능
- 현재 기본 check는 JS와 Supabase Edge Function 파일의 문법 검사다.

## 문서 유지 규칙

- 제품 범위 변경: `docs/PRD.md`, `PRD.md`, `README.md`
- 기술 구조/check 변경: `docs/TRD.md`, `README.md`, `PROJECT_GUIDE.md`
- 작업 루틴 변경: `docs/WORKFLOWS.md`
- 브랜드/디자인 규칙 변경: `docs/DESIGN.md`, `PRD.md`
- 운영 상태 변경: `PROJECT_STATUS.md`
- 배포 제외 규칙 변경: `.vercelignore`, `docs/TRD.md`, `docs/DECISIONS.md`

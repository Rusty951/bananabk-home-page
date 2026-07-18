# Banana Black Website

## 개요

Banana Black의 포트폴리오와 문의 전환을 위한 정적 웹사이트다. 공개 페이지는 브랜드, 작업물, 소개, 문의 흐름을 담당하고, 내부 운영 페이지는 URL 직접 접근 전용으로 유지한다.

## 대상 사용자

- 브랜드/제품/푸드/공간/인물 촬영이 필요한 잠재 고객
- Banana Black 작업물을 검토하는 클라이언트
- 내부 운영자

## 실행

정적 사이트라 별도 빌드 없이 HTML 파일을 브라우저에서 열거나 로컬 정적 서버로 확인한다.

```bash
python3 -m http.server 4173
```

모바일 검수 전용 페이지:

```text
http://127.0.0.1:4173/mobile-preview.html
```

## 검증

커밋 전 아래 명령을 통과시킨다.

```bash
rg --files -g '*.js' -g 'supabase/functions/*/index.ts' -g '!node_modules' -g '!dist' -g '!build' -g '!coverage' -g '!.next' -g '!out' -g '!output' -g '!preview' -g '!.cache' | xargs -n1 node --check
```

## Context Map

- 제품 의도: `docs/PRD.md`, 원본 `PRD.md`
- 디자인/브랜드 규칙: `docs/DESIGN.md`, 원본 `PRD.md`
- 기술 구조와 위험 규칙: `docs/TRD.md`
- 작업 루틴과 리뷰/디버깅: `docs/WORKFLOWS.md`
- 주요 결정 기록: `docs/DECISIONS.md`
- AI 작업 규칙: `AGENTS.md`
- 운영 원본: `PROJECT_GUIDE.md`, `PROJECT_STATUS.md`, `PRD.md`
- 배포 설정: `vercel.json`, `.vercelignore`
- 광고용 랜딩: `food-photo.html` (`/food-photo`)
- Supabase 설정과 함수: `supabase/config.toml`, `supabase/functions/`

## 유지 규칙

기술 스택, 구조, 검증 명령, 제품 범위가 바뀌면 관련 문서를 함께 갱신한다.

공개 페이지와 내부 운영 페이지를 섞지 않는다. `works/upload.html`, `works/manage.html`, `works/portrait-private.html`는 공개 메뉴, 푸터, CTA에 노출하지 않는다.

`food-photo.html`은 광고 직접 유입용 공개 랜딩이며, `/works/food`는 포트폴리오 페이지 역할로 유지한다.

`/food-photo`의 기본 공개 구성은 30만 원부터, 대표 메뉴 최대 5종, 기본 보정본 10컷 기준이다. Meta Pixel은 `public-config.js`에 실제 ID가 설정된 경우에만 로드한다.

문서와 Supabase 소스는 Vercel 배포 번들에서 제외한다.

## 현재 상태

현재 운영 상태와 남은 작업은 `PROJECT_STATUS.md`를 기준으로 확인한다.

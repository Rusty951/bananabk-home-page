# Workflows

## Existing Project Mode

이 프로젝트는 기존 운영 문서가 강하다. 새 표준 문서는 기존 원본을 대체하지 않고, AI가 원본을 빠르게 찾는 지도 역할을 한다.

작업 전 확인 순서:

1. `README.md`
2. `AGENTS.md`
3. `PROJECT_GUIDE.md`
4. `PROJECT_STATUS.md`
5. 관련 `docs/*`
6. 실제 수정 대상 파일

## Feature Workflow

1. `docs/PRD.md`와 `PRD.md`에서 제품 의도와 비목표를 확인한다.
2. `PROJECT_GUIDE.md`에서 공개/내부 페이지 경계를 확인한다.
3. `docs/TRD.md`에서 배포, Supabase, check 규칙을 확인한다.
4. 변경 범위를 작게 잡는다.
5. 공개 메뉴, 푸터, CTA가 내부 페이지를 노출하지 않는지 확인한다.
6. 필요한 문서를 갱신한다.
7. check 명령을 실행한다.

## UI Workflow

1. 브랜드 톤은 `docs/DESIGN.md`와 `PRD.md`를 확인한다.
2. 모바일 360/390/430 기준에서 줄바꿈과 CTA 위치를 고려한다.
3. CSS 변경은 가능하면 공통 클래스로 처리한다.
4. Works 상세페이지는 같은 구조를 공유하므로 한 페이지 수정이 다른 카테고리에 미치는 영향을 확인한다.
5. 로컬 서버로 주요 페이지를 확인한다.

## Bugfix Workflow

1. 재현 조건과 기대 동작을 고정한다.
2. 공개 페이지 문제인지 내부 운영 페이지 문제인지 분리한다.
3. Supabase 문제라면 URL, anon key, Edge Function, Storage, DB row를 분리해서 본다.
4. 한 번에 하나의 가설만 검증한다.
5. 최소 수정 후 같은 조건으로 재검증한다.
6. 관련 문서나 상태 파일이 바뀌면 갱신한다.
7. check 명령을 실행한다.

## Analytics Workflow

1. GA4와 Meta Pixel 초기화는 `analytics.js` 한 곳에서 관리한다.
2. `bananabk2425.com`, `www.bananabk2425.com` 외 호스트에서는 추적 스크립트를 로드하지 않는다.
3. 카카오 CTA 이벤트명과 UTM·버튼 위치 매개변수를 보존한다.
4. `analytics.js`를 수정하면 모든 HTML의 캐시 버스팅 버전을 함께 확인한다.
5. 로컬에서는 Google·Meta 네트워크 요청이 없고 운영 도메인 조건에서는 초기화 코드가 준비되는지 검증한다.

## Refactor Workflow

1. 리팩터링 의도와 보존해야 할 동작을 한 문장으로 고정한다.
2. 공개 URL, clean URL, 내부 페이지 noindex 정책을 보존한다.
3. 공통 CSS/JS 변경은 Works 전체에 미치는 영향을 확인한다.
4. 작은 단위로 변경한다.
5. 문서와 check 명령을 확인한다.

## Code Review Workflow

리뷰는 스타일보다 위험을 먼저 본다.

1. 공개/내부 범위가 섞였는지 확인한다.
2. Supabase URL, anon key, 함수 경로 불일치를 확인한다.
3. Contact 저장/메일 발송 흐름의 회귀를 확인한다.
4. 모바일 레이아웃 회귀 가능성을 확인한다.
5. Vercel 배포 제외 규칙이 깨졌는지 확인한다.
6. 테스트/check 누락을 확인한다.
7. 문서와 실제 코드 상태가 어긋나는지 확인한다.

## Debugging Workflow

1. 문제를 한 문장으로 정의한다.
2. 실제 결과, 기대 결과, 발생 페이지를 분리한다.
3. 브라우저 콘솔, 네트워크 요청, Supabase 응답, DOM 상태를 순서대로 본다.
4. URL 불일치와 clean URL 영향을 먼저 확인한다.
5. 한 번에 하나의 원인만 수정한다.
6. 같은 조건으로 재검증한다.
7. 반복될 문제는 `PROJECT_GUIDE.md`나 관련 문서에 반영한다.

## Commit Safety Review

1. 변경된 파일과 의도를 요약한다.
2. 범위 밖 수정이 없는지 확인한다.
3. 내부 운영 페이지 노출 여부를 확인한다.
4. 문서 갱신 필요 여부를 확인한다.
5. check 명령을 실행한다.
6. 실패한 검증이나 남은 위험을 보고한다.

## Documentation Freshness Review

- 제품 목표, MVP, 비목표 변경: `docs/PRD.md`, `PRD.md`
- 브랜드/디자인 변경: `docs/DESIGN.md`, `PRD.md`
- 기술 구조, Supabase, Vercel 변경: `docs/TRD.md`, `PROJECT_GUIDE.md`
- 운영 상태 변경: `PROJECT_STATUS.md`
- check 명령 변경: `docs/TRD.md`, `README.md`
- 주요 결정 변경: `docs/DECISIONS.md`

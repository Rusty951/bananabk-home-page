# PRD

## Source of Truth

상세 제품 원본은 루트의 `PRD.md`다.

이 문서는 AI 작업자가 제품 의도를 빠르게 잡기 위한 운영용 PRD 지도다. 제품 범위, 사용자, 성공 기준이 바뀌면 `PRD.md`, `README.md`, 이 문서를 함께 갱신한다.

## 문제

기존 Banana Black 웹사이트는 작업물을 보여주지만, 사진의 프리미엄함과 브랜드 인상을 충분히 끌어올리지 못했다.

포트폴리오가 단순 이미지 그리드처럼 보이면 문의 전환과 브랜드 신뢰가 약해진다.

## 사용자

- 촬영 의뢰를 검토하는 잠재 고객
- Product, Food, Dessert, Space, Portrait 작업물을 보고 싶은 방문자
- 비공개 포트폴리오를 직접 링크로 확인하는 클라이언트
- 업로드/관리 도구를 쓰는 내부 운영자

## 목표

- 같은 사진 자산을 더 프리미엄하고 의도적으로 보이게 한다.
- Works 카테고리 구조를 명확히 한다.
- 문의 전환 흐름을 자연스럽게 만든다.
- 공개 포트폴리오와 내부 운영 페이지를 분리한다.
- 모바일 360/390/430 기준에서도 핵심 문구와 CTA가 안정적으로 보이게 한다.

## MVP 범위

- Home, About, Contact
- Works 허브와 Product/Food/Dessert/Space/Portrait 상세
- Environment Portrait 비공개 페이지
- Supabase Storage 기반 Works 이미지 렌더링
- Contact 문의 저장과 관리자 메일 발송
- Vercel 정적 배포 설정

## 비목표

- 복잡한 CMS 구축
- 전체 프레임워크 도입
- 내부 운영 페이지의 공개 네비게이션 노출
- Supabase 데이터나 Storage 삭제성 대량 작업
- 브랜드 방향과 무관한 대규모 디자인 변경

## 성공 기준

- 첫 화면에서 브랜드와 사진의 프리미엄 인상이 강하다.
- Works 카테고리를 쉽게 탐색할 수 있다.
- Contact 제출이 운영 환경에서 저장되고 알림된다.
- 내부 운영 페이지는 검색과 공개 동선에서 제외된다.
- 모바일 검수 기준 폭에서 주요 문구와 CTA가 깨지지 않는다.

## Product Context Map

- 상세 제품 원본: `../PRD.md`
- 작업 기준 원본: `../PROJECT_GUIDE.md`
- 현재 상태 원본: `../PROJECT_STATUS.md`
- 공개 페이지: `../index.html`, `../about.html`, `../contact.html`, `../works/`
- 내부 운영 페이지: `../works/upload.html`, `../works/manage.html`, `../works/portrait-private.html`

# PROJECT STATUS — Banana Black Website

> 이 문서는 현재 상태를 잠그는 문서입니다.
> 추측은 적지 않고, 확인된 내용만 기록합니다.

## 완료

### Git / 배포 준비
- GitHub 저장소 생성 및 푸시 완료
- 저장소: `https://github.com/Rusty951/bananabk-home-page.git`
- 현재 `main` 브랜치 기준 최신 커밋 반영 완료
- `supabase/.env.local`은 `.gitignore` 처리 후 커밋에서 제외 완료

### 공개 배포 범위
- 공개 배포 대상으로 정리된 페이지
- `index.html`
- `about.html`
- `works/index.html`
- `works/product.html`
- `works/food.html`
- `works/dessert.html`
- `works/space.html`
- `works/portrait.html`
- `contact.html`

### Contact
- 로컬 기준 `contact_inquiries` DB 저장 성공 확인
- 로컬 기준 관리자 메일 알림 성공 확인
- `DB 우선 저장 -> 메일 후발송` 구조 검증 완료

## 진행 중

### Works 공개 상세
- Works 상세페이지는 hero 중심 구조로 정리 진행
- `product`는 하드코딩 hero 제거 후 DB 이미지 기반 구조로 변경
- 공개 상세페이지는 배포 범위에 포함 가능하도록 유지 중

### Works 내부 운영 구조
- 업로드 페이지와 관리 페이지를 내부 운영용으로 분리
- 이미지 업로드 -> Storage 저장 -> `works_images` row 생성까지는 로컬에서 확인된 시점이 있었음
- 여러 장 업로드 지원 방향으로 수정 진행
- `manage`는 썸네일 / 정렬 / 숨김 / 삭제 구조로 개편 진행

## 보류

### 내부 운영 페이지
- `/works/upload.html`
- `/works/manage.html`

### 보류 원칙
- `upload/manage`는 공개 메뉴 / 푸터 / CTA 어디에도 노출하지 않음
- URL 직접 접근용 내부 운영 페이지로만 유지
- Works 업로드 / 관리 / 상세 반영 흐름은 구현 및 수정 진행 중
- 로컬 테스트에서 반복적으로 꼬인 이력이 있어 아직 안정화 필요
- 특히 `upload / manage / render`가 서로 엮이며 불안정했던 이력이 있음

## 다음 작업

### 공개 배포 우선순위
1. Vercel 배포 완료
2. 공개 페이지 실배포 점검
3. Contact 운영 연결 점검
4. Works 업로드 / 관리 툴은 별도 안정화 작업으로 재정리

### Contact 운영 전 남은 것
- Resend 도메인 인증
- `MAIL_FROM` 운영 주소 확정
- Supabase secrets 등록
- `submit-contact-inquiry` 함수 운영 배포
- 운영 환경 실제 제출 테스트

## 현재 판단

- 지금은 로컬에서 모든 기능을 끝내려 하기보다, 공개 사이트와 Contact를 먼저 배포/검증하는 쪽이 우선
- Works 업로드/관리 툴은 공개 운영 대상이 아니라 내부 운영용 보류 항목으로 둠

## 한 줄 요약

- 공개 사이트와 Contact는 배포 준비 단계까지 도달했고, Works 내부 운영툴은 아직 안정화가 더 필요함

# PROJECT GUIDE — Banana Black Website

> 다음 작업 전에 먼저 읽는 기준 문서입니다.
> 현재는 공개 배포 범위와 내부 운영 범위를 분리해서 보는 것이 핵심입니다.

## 프로젝트 목적

- 바나나블랙 포트폴리오와 문의 전환용 정적 사이트
- 기술 스택: HTML / CSS / JavaScript + Supabase Edge Functions

## 현재 작업 기준

### 공개 배포 범위
- `index.html`
- `about.html`
- `works/index.html`
- `works/product.html`
- `works/food.html`
- `works/dessert.html`
- `works/space.html`
- `works/portrait.html`
- `contact.html`

### 내부 운영 범위
- `/works/upload.html`
- `/works/manage.html`

### 운영 원칙
- `upload/manage`는 공개 메뉴 / 푸터 / CTA에 노출하지 않음
- 내부에서 URL 직접 접근용으로만 유지

## 현재 확인된 상태

### Git / 저장소
- GitHub 저장소 생성 및 푸시 완료
- 저장소: `https://github.com/Rusty951/bananabk-home-page.git`
- 현재 `main` 브랜치 기준 최신 커밋 반영 완료
- 민감 파일 `supabase/.env.local`은 `.gitignore` 처리 후 커밋에서 제외 완료

### Contact
- 로컬 기준 DB 저장 성공
- 로컬 기준 관리자 메일 알림 성공
- 구조는 `DB 우선 저장 -> 메일 후발송`

### Works
- 공개 상세페이지는 hero 중심 구조로 정리 진행
- `product`는 DB 이미지 기반 hero 구조로 전환
- 업로드 / 관리 / 상세 반영 흐름은 구현 및 수정 진행 중
- 내부 운영툴은 아직 안정화가 필요하므로 완료로 간주하지 않음

## 지금 완료로 보면 안 되는 것

### Works 내부 운영툴
- 업로드 / 관리 / 상세 반영 흐름은 아직 불안정 이력이 있음
- 로컬 테스트에서 반복적으로 꼬였던 구간이 있어 추가 안정화 필요
- 따라서 `upload/manage`는 배포 대상이 아니라 내부 보류 항목으로 봄

## 다음 작업 우선순위

1. Vercel 배포 완료
2. 공개 페이지 실배포 점검
3. Contact 운영 연결 점검
4. Works 업로드 / 관리 툴은 별도 안정화 작업으로 재정리

## Contact 운영 전 체크리스트

- Resend 도메인 인증
- `MAIL_FROM` 운영 주소 확정
- Supabase secrets 등록
- `submit-contact-inquiry` 함수 운영 배포
- 운영 환경 실제 제출 테스트

## 실무 판단

- 당장은 공개 사이트와 Contact를 먼저 운영 가능한 상태로 잠그는 것이 우선
- Works 업로드/관리 툴은 내부 운영용으로 분리 유지
- 다음 작업에서 공개 범위와 내부 운영 범위를 섞지 않는 것이 중요

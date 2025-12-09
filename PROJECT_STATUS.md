# 프로젝트 상태 및 인계 가이드 (PROJECT_STATUS.md)

## 1. 프로젝트 개요
**심리테스트 플랫폼 (Psychological Test Platform)**
Next.js 15와 Supabase를 기반으로 한 심리테스트(MBTI 및 점수형) 제작 및 플레이 웹 애플리케이션입니다.
프리미엄 UI, 관리자 대시보드, 바이럴 공유 기능, 익명 댓글 시스템을 갖추고 있습니다.

## 2. 현재 개발 상태 (2025년 12월 7일 기준)
- **메인 페이지**: 검색, 정렬, 프리미엄 애니메이션이 적용되어 정상 작동합니다.
- **테스트 플레이**: 전체 흐름(인트로 -> 질문 -> 로딩 -> 결과) 완성.
- **관리자 대시보드 (Creator Studio)**:
    - **UI 개편**: "Creator Studio" 컨셉의 직관적이고 전문적인 UI.
    - **결과 매핑**: 16가지 MBTI 결과를 그리드 형태로 한눈에 관리.
    - **이미지 지원**: 질문별 이미지 및 결과별 이미지 업로드 기능 추가.
    - **보안**: 관리자 로그인 기능 구현 완료.
- **바이럴 기능**: 카카오톡 공유, 링크 복사, 추천 테스트 섹션 구현 완료.
- **댓글 시스템**: 결과 페이지 내 익명 댓글 기능 구현 완료.

## 3. 기술 스택 (Tech Stack)
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4, Shadcn/UI, Framer Motion
- **데이터베이스**: Supabase (PostgreSQL)
- **아이콘**: Lucide React

## 4. 새 컴퓨터 설치 및 실행 가이드

### 1단계: Node.js 설치
Node.js (v18 이상)가 설치되어 있어야 합니다.

### 2단계: 의존성 패키지 설치
프로젝트 폴더(`web`)에서 터미널을 열고 다음 명령어를 입력하세요:
```bash
npm install
```

### 3단계: 환경 변수 설정
`web` 폴더 최상위 경로에 `.env.local` 파일을 만들고, Supabase 키를 입력해야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=당신의_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=당신의_supabase_anon_key
```
*(참고: 이 키값들은 Supabase 프로젝트 설정 -> API 메뉴에서 확인할 수 있습니다)*

### 4단계: 개발 서버 실행
```bash
npm run dev
```
실행 후 `http://localhost:3000`으로 접속하여 확인하세요.

## 5. 최근 중요 수정 사항
- **이미지 크래시 해결**: 메인 페이지에서 외부 이미지(placehold.co, 카카오 등) 로딩 시 발생하던 보안 에러를 해결했습니다.
    - **해결책**: `next.config.ts` 파일에 해당 도메인들을 허용 목록(whitelist)에 추가했습니다.
- **하이드레이션(Hydration) 이슈**: `layout.tsx`에 `suppressHydrationWarning`을 추가하고, 렌더링 안정성을 확보했습니다.

## 6. 다음 단계 (Roadmap)

### Phase 4: 성장 및 수익화 (Growth & Monetization)
- [ ] **SEO 최적화**:
    - [ ] `next-sitemap` 도입하여 사이트맵 자동 생성.
    - [ ] Open Graph (OG) 태그 동적 생성 (테스트 결과별 썸네일/제목).
    - [ ] `robots.txt` 설정.
- [ ] **데이터 분석 (Analytics)**:
    - [ ] Google Analytics 4 (GA4) 연동.
    - [ ] Meta Pixel (페이스북 광고용) 설치.
- [ ] **수익화 (Monetization)**:
    - [ ] Google AdSense 승인 신청 및 광고 단위 배치.
    - [ ] 로딩 페이지 내 디스플레이 광고 영역 최적화.

### Phase 5: 런칭 및 운영 (Launch & Ops)
- [ ] **배포 (Deployment)**:
    - [ ] Vercel 프로덕션 배포.
    - [ ] 커스텀 도메인 연결.
- [ ] **콘텐츠 채우기**:
    - [ ] 실제 16가지 MBTI 결과 데이터 작성 (현재 테스트용 데이터만 있음).
    - [ ] 썸네일 및 질문 이미지 제작.

## 7. 데이터베이스 스키마 (참고용)
Supabase에 다음 테이블들이 존재해야 합니다:
- `tests` (테스트 정보)
- `questions` (질문)
- `options` (선택지)
- `results` (결과)
- `comments` (댓글)

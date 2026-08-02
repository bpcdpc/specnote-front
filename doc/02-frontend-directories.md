# 프론트엔드 폴더 구조

| 버전 | 일시           | 변경 내용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1 | 2026.07.16 THU | 최초 작성. 폴더 트리와 배치 원칙 분리.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| v0.2 | 2026.07.17 FRI | 구조 전면 개편 — 도메인 단위(`features/`) 폐기, **화면 단위(`pages/`) + 역할 단위(`components/`, `lib/api/`)** 로 재편. 레이아웃을 `layouts/`로 분리.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| v0.3 | 2026.07.17 FRI | 헤더 조립 주체를 페이지 → **레이아웃**으로 변경.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v0.4 | 2026.07.19 SUN | `project-form/` 내부 재편 — `ProjectFormPage`(공용) 폐기, **`ProjectCreatePage` + `ProjectSettingsPage`로 분리**(폴더는 유지). `login`, `signup`을 **`auth/`로 병합**. 묶음 기준을 "조각 공유" → **"같은 도메인"** 으로 재정의. `SpecJsonUrlField` 개명. `PageHeading` 신설. `lib/types.ts`, `constants.ts` 생성. **코드 규약은 `05-code-conventions`로, 조각 책임과 헤더 조립은 `03-frontend-layouts`로 이관.**                                                                                                                                                                        |
| v0.5 | 2026.07.20 MON | 11단계 구현 결과 반영. 신규 파일 9종 추가, `HeaderBreadcrumb` → `Breadcrumb` 개명, `BackButton` 미사용 표시. **`hooks/` 폴더를 만들지 않는 근거** 절 신설. `lib/mock.ts`는 데이터 단계에서 삭제할 파일이라 트리에 올리지 않는다.                                                                                                                                                                                                                                                                                                                                                        |
| v0.6 | 2026.07.29 WED | 배관 1~4단계 결과 반영. 신규 파일 11종 추가(`client`, `queryClient`, `auth`, `projects`, `endpoints`, `routeParams`, `LoadingState`, `ErrorState`, `IconButton`, `SpecError`, `CommentContext`). 누락분 `panelMetrics` 추가. **`MoveThreadPopover` → `MoveCommentsPopover` 개명**(FR-12가 엔드포인트 단위 이동으로 바뀜). `queryClient` 위치 정정(`lib/` → `lib/api/`), `lib/api/auth.ts` 설명에서 존재하지 않는 `logout` 삭제. 배치 판단 기준에 **`lib/api/` 도메인 기준 분할** 추가. **헤더 조각의 위치 → `03-frontend-layouts`, `IconButton` 공용화 근거 → `07-components`로 이관.** |
| v0.7 | 2026.08.02 SUN | 13단계(알림) 결과 반영. `NotificationDropdown`의 "미구현" 표시 해소, `UserMenu`와 `lib/api/notifications.ts` 설명을 구현 결과로 갱신. 배치 판단 기준 예시에 `NotificationDropdown` 추가(소비처가 사는 곳을 따라간다). 누락분 `lib/formatTime.ts` 추가. `comments/` 트리 기호 순서 정정. **배관 완료로 `lib/mock.ts` 절을 과거형으로 정리.**                                                                                                                                                                                                                                             |

---

## 디렉토리 설계 원칙

폴더 구조의 기준은 "무슨 화면인지" 와 "무슨 종류인지" 의 두 축을 쓴다.

한 화면 전용이면 `pages/`, 둘 이상 화면이 쓰면 `components/`(또는 `lib/`).

**한 폴더 = 한 라우트**가 원칙이다.

다만 같은 도메인에 속하는 화면들은 한 폴더에 묶는다.
여기서 도메인은 다루는 리소스 또는 하나의 사용자 흐름을 말한다.

- `auth/` — 로그인과 회원가입. 리소스는 다르지만 인증이라는 한 흐름이고,
  `AuthLayout`을 이 둘만 쓰며 서로를 링크로 오간다.
- `project-form/` — 프로젝트 생성과 설정. 같은 프로젝트 리소스를 만들고 고치는 한 세트이고
  URL도 `/projects/` 아래로 묶인다.

Child Components를 반드시 공유하지 않더라도 관계가 드러나도록 묶는다.

**묶는 것은 예외**이다. 근거 없이 묶지 않으며, 묶을 때는 위처럼 이유를 문서에 남긴다.

---

## 전체 트리

```
src/
├── main.tsx                          # 엔트리. Provider 조립
│
├── app/                              # 앱 부팅 — 라우팅, 전역 provider
│   ├── router.tsx                    # createBrowserRouter 라우트 정의
│   ├── ThemeContext.tsx              # light/dark, .dark 토글, localStorage
│   ├── AuthContext.tsx               # 로그인 유저 + JWT
│   └── RequireAuth.tsx               # 미로그인 리다이렉트
│
├── layouts/                          # 레이아웃 3종
│   ├── AuthLayout.tsx                # Login, Signup — 헤더 없음, 중앙 정렬
│   ├── AppLayout.tsx                 # Dashboard, ProjectCreate, ProjectSettings
│   └── SpecLayout.tsx                # SpecDetail — h-dvh flex 세로 스택
│                                     #   프로젝트 조회 게이트, Outlet context 로 projectView 전달
│
├── pages/                            # 화면 + 그 화면 전용 조각
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectCard.tsx
│   │   └── NewProjectCard.tsx
│   │
│   ├── project-form/                 # 프로젝트 생성, 설정 (같은 리소스)
│   │   ├── ProjectCreatePage.tsx     # /projects/new — 스펙 URL 하나만
│   │   ├── ProjectSettingsPage.tsx   # /projects/:id/settings — 1컬럼
│   │   ├── SpecJsonUrlField.tsx      # 스펙 업데이트 (설정 전용)
│   │   ├── TryItBaseUrlField.tsx     # API Base URL
│   │   ├── MemberList.tsx            # 멤버 초대 + 목록
│   │   └── SpecError.ts              # 스펙 로드 실패 code → 문구
│   │
│   ├── spec-detail/
│   │   ├── SpecDetailPage.tsx        # 3컬럼 본문. projectView 는 Outlet context 로 받는다
│   │   ├── SpecColumns.tsx           # 3컬럼 셸 — 리사이즈, 접기, 오버레이
│   │   ├── panelMetrics.ts           # 컬럼 폭, 여백, sticky 클래스
│   │   ├── SpecPanelsContext.tsx     # 양쪽 패널 열림/접힘, isWide 공유
│   │   ├── BearerTokenContext.tsx    # 헤더 입력값을 TryItPanel까지 전달
│   │   ├── BearerTokenInput.tsx      # 헤더 Bearer 입력
│   │   ├── ProjectOverview.tsx       # 엔드포인트 미선택 시 중앙 (FR-3.5)
│   │   ├── EndpointSidebar.tsx       # 검색 + 삭제된 엔드포인트 보기
│   │   ├── EndpointListItem.tsx      # 메서드 뱃지 + path
│   │   ├── EndpointDetail.tsx        # parameters / requestBody / responses
│   │   ├── SchemaTree.tsx            # 스키마 재귀 노드
│   │   ├── ExampleBlock.tsx          # example 값 표시
│   │   ├── buildExample.ts           # 스키마 → 요청 바디 초기값 조립
│   │   ├── useTryIt.ts               # 요청 조립, 전송, 응답 상태
│   │   ├── TryItPanel.tsx            # 입력 → HTTP 요청 → 응답
│   │   ├── SpecUpdateBanner.tsx      # snapshotId 불일치 배너
│   │   ├── useSpecCache.ts           # components 캐시 + $ref 지연 해석
│   │   └── comments/                 # 댓글 패널 (spec-detail 전용)
│   │       ├── CommentPanel.tsx      # 쿼리·mutation 소유. ?comment= 딥링크 수신
│   │       ├── CommentContext.tsx    # me, isOwner, 멤버·엔드포인트 후보, 편집 상태, 하이라이트
│   │       ├── CommentThread.tsx
│   │       ├── CommentItem.tsx
│   │       ├── CommentEditor.tsx     # 평문 textarea + @ / # 자동완성
│   │       ├── MentionPopover.tsx
│   │       ├── CommentContent.tsx    # react-markdown 렌더
│   │       ├── ReactionBar.tsx
│   │       ├── MoveCommentsPopover.tsx  # [Owner] 엔드포인트 단위 댓글 이동
│   │       ├── mentions.ts              # 멘션 토큰 ↔ 표시 ↔ ID 변환
│   │       └── reactions.ts             # 리액션 이모지, 라벨, 순서
│   │
│   └── NotFoundPage.tsx              # 404
│
├── components/                       # 여러 화면이 공유하는 UI
│   ├── ui/                           # shadcn 생성물
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── field.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   ├── avatar.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...                       # 필요할 때 `npx shadcn add <name>`
│   │
│   ├── Header.tsx                    # 뼈대. props: left, right, wide
│   ├── Footer.tsx                    # props: align = left | center | right
│   ├── Breadcrumb.tsx                # Dashboard / 프로젝트명 / 설정
│   ├── BackButton.tsx                # ← 뒤로가기 (미사용 — 데모 후 정리)
│   ├── PageHeading.tsx               # 아이콘 + 제목(h2)
│   ├── MethodBadge.tsx               # GET/POST/PUT/PATCH/DELETE
│   ├── IconButton.tsx                # 아이콘 전용 정사각 버튼 + aria-label
│   ├── Logo.tsx                      # props: short, as(h1|span)
│   ├── EmptyState.tsx                # PageHeading + action
│   ├── LoadingState.tsx              # 조회 대기 한 줄
│   ├── ErrorState.tsx                # 조회 실패 + 선택적 재시도
│   ├── UserMenu.tsx                  # 아바타 + 드롭다운. 알림 쿼리와 읽음·이동을 소유
│   ├── TimeAgo.tsx                   # ISO 문자열 → "3분 전"
│   └── NotificationDropdown.tsx      # 알림 목록 (표시 전용, UserMenu 안)
│
├── lib/                              # 배관 — 도메인 무관 인프라
│   ├── api/                          # API 호출
│   │   ├── client.ts                 # fetch 래퍼: JWT 첨부, ApiError 통일
│   │   ├── queryClient.ts            # TanStack Query 전역 설정
│   │   ├── auth.ts                   # login, signup, getMe
│   │   ├── projects.ts               # 프로젝트 CRUD, 멤버, 스펙 커밋
│   │   ├── endpoints.ts              # 엔드포인트 상세
│   │   ├── comments.ts               # 댓글, 리액션, 이동, AI 요약
│   │   └── notifications.ts          # 알림 목록, 읽음 처리
│   │
│   ├── constants.ts                  # ROLE, REACTION_TYPE, NOTIFICATION_TYPE, HTTP_METHOD
│   ├── types.ts                      # 백엔드 응답 타입
│   ├── routeParams.ts                # path param → 양의 정수 (parseId)
│   ├── formatTime.ts                 # timeAgo, fullTime
│   ├── useMediaQuery.ts              # 도메인 무관 훅
│   └── utils.ts                      # cn() 헬퍼
│
└── styles/
    └── index.css                     # 디자인 토큰 + shadcn 매핑 + 다크
```

---

## 배치 판단 기준

| 무엇을?                 | 어디에?               |
| ----------------------- | --------------------- |
| 라우팅되는 화면         | `pages/<화면>/`       |
| 그 화면에서만 쓰는 조각 | `pages/<화면>/`       |
| 여러 화면이 쓰는 UI     | `components/`         |
| shadcn 컴포넌트         | `components/ui/`      |
| 레이아웃 3종            | `layouts/`            |
| API 호출                | `lib/api/<도메인>.ts` |
| fetch 래퍼, 유틸, 설정  | `lib/`                |
| 도메인 무관 훅          | `lib/`                |
| 한 화면 전용 훅         | `pages/<화면>/`       |
| 라우터, Provider, 테마  | `app/`                |

**애매할 때**: "이 파일을 다른 화면에서도 쓰나?"
아니오 → `pages/`, 예 → `components/`(순수 UI) 또는 `lib/`(로직, 배관).

**예시**

- `ProjectCard` — 대시보드에서만 씀 → `pages/dashboard/`
- `PageHeading` — 대시보드, 생성, 설정, 404가 공유 → `components/`
- `CommentPanel` — SpecDetail에서만 씀 → `pages/spec-detail/comments/`
- `NotificationDropdown` — `UserMenu` 안에서만 쓰지만 그 `UserMenu`가
  `components/`에 산다 → `components/`. 소비처가 사는 곳을 따라간다

**`lib/api/` 분할은 URL이 아니라 도메인 기준이다.**

`GET /api/endpoints/:id/comments`, `PATCH /api/endpoints/:id/comments/move`,
`POST /api/endpoints/:id/ai-summary`는 경로가 `/endpoints`로 시작하지만 `comments.ts`에 둔다.
백엔드가 이 라우트들을 `EndpointsController`에 둔 것은 `@ProjectScope('endpoint')`로
projectId를 역참조해야 해서이고, 구현은 `comments.service.ts`가 그대로 갖는다
(`09-backend-functions` 4절). 서버의 가드 사정을 따라 프론트 파일을 나눌 이유가 없다.

`endpoints.ts`에는 스펙 상세(`GET /api/endpoints/:id`)만 남는다.

---

## `hooks/` 폴더를 만들지 않는다

**배치 기준은 "소비처가 하나인가 여럿인가"이지 파일의 형태가 아니다.**
훅이라는 이유로 따로 모으면, 같은 화면에서만 쓰는 훅이 그 화면 폴더를 떠나
컴포넌트와 멀어진다. 그러면 화면 하나를 지울 때 지울 것이 두 군데로 갈린다.

| 훅              | 어디에               | 이유                          |
| --------------- | -------------------- | ----------------------------- |
| `useMediaQuery` | `lib/`               | 도메인을 모르고 어디서든 쓴다 |
| `useSpecCache`  | `pages/spec-detail/` | SpecDetail 전용               |
| `useTryIt`      | `pages/spec-detail/` | SpecDetail 전용               |

같은 기준이 Context에도 적용된다. `ThemeContext`, `AuthContext`는 앱 전체가 읽으므로 `app/`,
`SpecPanelsContext`, `BearerTokenContext`, `CommentContext`는 그 화면 트리 안에서만 사는
값이라 화면 폴더에 둔다. Context라는 형태가 `app/` 배치의 근거가 되지 않는다.

**목 데이터도 같은 기준을 따랐다.** 여러 화면이 먹어 `lib/mock.ts`에 뒀고,
배관 5와 함께 제거했다. 트리에 올리지 않은 것도 같은 이유다 —
지울 파일을 문서에 올리면 지울 때 문서를 또 고쳐야 한다.

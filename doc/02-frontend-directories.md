# 프론트엔드 폴더 구조

| 버전 | 일시           | 변경 내용                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1 | 2026.07.16 THU | 최초 작성. 폴더 트리 · 배치 원칙 분리.                                                                                                                                                                                                                                                                                                                                                                                                             |
| v0.2 | 2026.07.17 FRI | 구조 전면 개편 — 도메인 단위(`features/`) 폐기, **화면 단위(`pages/`) + 역할 단위(`components/`, `lib/api/`)** 로 재편. 레이아웃을 `layouts/`로 분리.                                                                                                                                                                                                                                                                                              |
| v0.3 | 2026.07.17 FRI | 헤더 조립 주체를 페이지 → **레이아웃**으로 변경.                                                                                                                                                                                                                                                                                                                                                                                                   |
| v0.4 | 2026.07.19 SUN | `project-form/` 내부 재편 — `ProjectFormPage`(공용) 폐기, **`ProjectCreatePage` + `ProjectSettingsPage`로 분리**(폴더는 유지). `login`·`signup`을 **`auth/`로 병합**. 묶음 기준을 "조각 공유" → **"같은 도메인"** 으로 재정의. `SpecJsonUrlField` 개명. `PageHeading` 신설. `lib/types.ts` · `constants.ts` 생성. **코드 규약은 `05-code-conventions`로, 조각 책임·헤더 조립은 `03-frontend-layouts`로 이관.**                                     |
| v0.5 | 2026.07.20 MON | 11단계 구현 결과 반영. 신규 파일 9종 추가(`Breadcrumb`, `useMediaQuery`, `SpecPanelsContext`, `BearerTokenContext`, `ProjectOverview`, `SchemaTree`, `ExampleBlock`, `buildExample`, `useTryIt`), `HeaderBreadcrumb` → `Breadcrumb` 개명, `BackButton` 미사용 표시. **`hooks/` 폴더를 만들지 않는 근거** 절 신설. `lib/mock.ts`는 데이터 단계에서 삭제할 파일이라 트리에 올리지 않는다.                                                            |
| v0.6 | 2026.07.27 MON | **12단계 구현 결과 반영.** `comments/` 트리를 실제와 일치시킴 — `MoveThreadPopover` → **`MoveCommentsPopover`**(이동 단위가 스레드에서 엔드포인트로 바뀜), **`AiSummaryButton` 폐기**(패널 헤더의 `IconButton`으로 흡수), `CommentContext.tsx` `mentions.ts` `reactions.ts` 신설. 누락돼 있던 `components/IconButton.tsx`, `components/TimeAgo.tsx`, `pages/spec-detail/panelMetrics.ts` 추가. `components/ui/` 목록에 12단계에서 설치한 4종 반영. |

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
├── app/                              # 앱 부팅 — 라우팅 · 전역 provider
│   ├── router.tsx                    # createBrowserRouter 라우트 정의
│   ├── ThemeContext.tsx              # light/dark, .dark 토글, localStorage
│   ├── AuthContext.tsx               # 로그인 유저·JWT (데이터 단계)
│   └── RequireAuth.tsx               # 미로그인 리다이렉트 (데이터 단계)
│
├── layouts/                          # 레이아웃 3종
│   ├── AuthLayout.tsx                # Login · Signup — 헤더 없음, 중앙 정렬
│   ├── AppLayout.tsx                 # Dashboard · ProjectCreate · ProjectSettings
│   └── SpecLayout.tsx                # SpecDetail — h-dvh flex 세로 스택
│
├── pages/                            # 화면 + 그 화면 전용 조각
│   ├── auth/                         # 로그인 · 회원가입 (인증 흐름)
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectCard.tsx
│   │   └── NewProjectCard.tsx
│   │
│   ├── project-form/                 # 프로젝트 생성 · 설정 (같은 리소스)
│   │   ├── ProjectCreatePage.tsx     # /projects/new — 스펙 URL 하나만
│   │   ├── ProjectSettingsPage.tsx   # /projects/:id/settings — 1컬럼
│   │   ├── SpecJsonUrlField.tsx      # 스펙 업데이트 (설정 전용)
│   │   ├── TryItBaseUrlField.tsx     # API Base URL
│   │   └── MemberList.tsx            # 멤버 초대 + 칩 목록
│   │
│   ├── spec-detail/
│   │   ├── SpecDetailPage.tsx        # 3컬럼 본문, endpointId 읽기
│   │   ├── SpecColumns.tsx           # 3컬럼 셸 — 리사이즈 + 접기 + 오버레이
│   │   ├── panelMetrics.ts           # 컬럼 폭·임계값·sticky 클래스 상수
│   │   ├── SpecPanelsContext.tsx     # 양쪽 패널 열림/접힘 · isWide 공유
│   │   ├── BearerTokenContext.tsx    # 헤더 입력값을 TryItPanel까지 전달
│   │   ├── BearerTokenInput.tsx      # 헤더 Bearer 입력
│   │   ├── ProjectOverview.tsx       # 엔드포인트 미선택 시 중앙 (FR-3.5)
│   │   ├── EndpointSidebar.tsx       # 검색 + 삭제된 엔드포인트 보기
│   │   ├── EndpointListItem.tsx      # 메서드 뱃지 + path
│   │   ├── EndpointDetail.tsx        # parameters / requestBody / responses
│   │   ├── SchemaTree.tsx            # 스키마 재귀 노드
│   │   ├── ExampleBlock.tsx          # example 값 표시
│   │   ├── buildExample.ts           # 스키마 → 요청 바디 초기값 조립
│   │   ├── useTryIt.ts               # 요청 조립 · 전송 · 응답 상태
│   │   ├── TryItPanel.tsx            # 입력 → HTTP 요청 → 응답
│   │   ├── SpecUpdateBanner.tsx      # snapshotId 불일치 배너
│   │   ├── useSpecCache.ts           # components 캐시 + $ref 지연 해석
│   │   └── comments/                 # 댓글 패널 (spec-detail 전용)
│   │       ├── CommentPanel.tsx      # 패널 골격 + 헤더 + 최상위 에디터
│   │       ├── CommentContext.tsx    # 편집 상태, me/members/endpoints 배포
│   │       ├── CommentThread.tsx     # 댓글 + 답글 묶음 (2뎁스 고정)
│   │       ├── CommentItem.tsx       # 댓글/답글 한 건 (공용)
│   │       ├── CommentEditor.tsx     # 평문 textarea + @ / # 자동완성
│   │       ├── CommentContent.tsx    # react-markdown 렌더
│   │       ├── MentionPopover.tsx    # @ / # 후보 목록
│   │       ├── mentions.ts           # 저장↔표시↔ID 변환
│   │       ├── ReactionBar.tsx       # 칩 + 추가/해제 팝오버
│   │       ├── reactions.ts          # 이모지·라벨 표시 정의
│   │       └── MoveCommentsPopover.tsx  # [Owner] 엔드포인트 단위 댓글 이동
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
│   │   ├── alert-dialog.tsx          # 12단계 — 댓글 이동 확인
│   │   ├── command.tsx               # 12단계 — 이동 대상 검색(cmdk)
│   │   ├── toast.tsx                 # 12단계 — 이동 완료 알림
│   │   └── ...                       # 필요할 때 `npx shadcn add <name>`
│   │
│   ├── Header.tsx                    # 뼈대. props: left, right, wide
│   ├── Footer.tsx                    # props: align = left | center | right
│   ├── Breadcrumb.tsx                # Dashboard / 프로젝트명 / 설정
│   ├── BackButton.tsx                # ← 뒤로가기 (미사용 — 데모 후 정리)
│   ├── PageHeading.tsx               # 아이콘 + 제목(h2)
│   ├── IconButton.tsx                # 아이콘 버튼 + Tooltip 내장
│   ├── TimeAgo.tsx                   # ISO 문자열 → 상대 시간 표시
│   ├── MethodBadge.tsx               # GET/POST/PUT/PATCH/DELETE
│   ├── Logo.tsx                      # props: short, as(h1|span)
│   ├── EmptyState.tsx                # PageHeading + action
│   ├── UserMenu.tsx                  # 아바타 + 드롭다운
│   └── NotificationDropdown.tsx      # 알림 목록 (미구현)
│
├── lib/                              # 배관 — 도메인 무관 인프라
│   ├── api/                          # API 호출 (데이터 단계에서 생성)
│   │   ├── client.ts                 # fetch 래퍼: JWT 첨부, 에러 통일, tokenStorage
│   │   ├── queryClient.ts            # TanStack Query 전역 설정
│   │   ├── auth.ts                   # login · signup · logout
│   │   ├── projects.ts               # 프로젝트 CRUD · 멤버 · 스펙 커밋
│   │   ├── comments.ts               # 댓글 · 리액션 · 이동 · AI 요약
│   │   └── notifications.ts          # 알림 목록 · 읽음
│   │
│   ├── constants.ts                  # ROLE, REACTION_TYPE, NOTIFICATION_TYPE, HTTP_METHOD, isHttpMethod
│   ├── types.ts                      # 백엔드 응답 타입
│   ├── useMediaQuery.ts              # 도메인 무관 훅
│   └── utils.ts                      # cn() 헬퍼
│
└── styles/
    └── index.css                     # 디자인 토큰 + shadcn 매핑 + 다크
```

---

## 배치 판단 기준

| 무엇을?                  | 어디에?               |
| ------------------------ | --------------------- |
| 라우팅되는 화면          | `pages/<화면>/`       |
| 그 화면에서만 쓰는 조각  | `pages/<화면>/`       |
| 여러 화면이 쓰는 UI      | `components/`         |
| shadcn 컴포넌트          | `components/ui/`      |
| 레이아웃 3종             | `layouts/`            |
| API 호출                 | `lib/api/<도메인>.ts` |
| API 배관 설정            | `lib/api/`            |
| fetch 래퍼 · 유틸 · 설정 | `lib/`                |
| 도메인 무관 훅           | `lib/`                |
| 한 화면 전용 훅          | `pages/<화면>/`       |
| 라우터 · Provider · 테마 | `app/`                |

**`queryClient`는 `lib/api/` 안이다.** `lib/` 루트가 아니다. 재시도 조건이
`client.ts`의 `ApiError`를 읽으므로 둘이 같이 움직인다. 떼어 놓으면 `lib/` 루트에서
`lib/api/`를 import하는 역방향 의존이 생긴다.

**애매할 때**: "이 파일을 다른 화면에서도 쓰나?"
아니오 → `pages/`, 예 → `components/`(순수 UI) 또는 `lib/`(로직·배관).

**예시**

- `ProjectCard` — 대시보드에서만 씀 → `pages/dashboard/`
- `PageHeading` — 대시보드·생성·설정·404가 공유 → `components/`
- `CommentPanel` — SpecDetail에서만 씀 → `pages/spec-detail/comments/`

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

**목 데이터도 같은 기준을 따른다.** 여러 화면이 먹으면 `lib/mock.ts`,
한 화면만 쓰면 그 화면 폴더에 둔다. 현재는 전자라 `lib/`에 있다.

`lib/mock.ts`는 **트리에 올리지 않는다.** 데이터 단계에서 삭제할 파일이라
문서에 올리면 지울 때 문서를 또 고쳐야 한다.

---

## `IconButton`을 공용으로 올린 이유

`components/`에 있다. SpecLayout 헤더, 댓글 패널, 사이드바가 모두 쓴다.

**Tooltip을 내장한다.** 아이콘만 있는 버튼은 라벨이 없어 무슨 버튼인지 알 수 없다.
호출부마다 Tooltip을 감싸면 빠뜨리는 곳이 생긴다.

다만 그 때문에 **`PopoverTrigger`와는 직접 조합할 수 없다.** 두 트리거가 같은
`<button>`을 두고 다퉈 팝오버가 안 열린다. 그런 자리는 `Button` + `ICON_BUTTON_OVERRIDE`로
스타일만 맞춘다(`ReactionBar`, `MoveCommentsPopover`가 이 패턴). 툴팁이 없어도
팝오버가 열리면서 무엇을 하는 자리인지 바로 보여줘 정보 손실이 없다.

---

## 헤더 조각의 위치

`Header`는 뼈대만 갖고 내용은 슬롯으로 받는다. 그 조각들이 어디에 있는지만 여기서 정의한다.
누가 슬롯을 채우는지는 `03-frontend-layouts`을 참고한다.

| 조각                      | 위치                 | 이유                           |
| ------------------------- | -------------------- | ------------------------------ |
| 헤더 뼈대 (`Header`)      | `components/`        | 슬롯 받아 배치만 함            |
| 브레드크럼 (`Breadcrumb`) | `components/`        | 여러 레이아웃이 공유           |
| 뒤로가기 (`BackButton`)   | `components/`        | 미사용 — 브레드크럼으로 대체됨 |
| 유저 메뉴 (`UserMenu`)    | `components/`        | 여러 레이아웃이 공유           |
| 알림 드롭다운             | `components/`        | UserMenu 안에서 사용           |
| Bearer 입력               | `pages/spec-detail/` | SpecDetail 전용                |
| 패널 토글 버튼            | `layouts/SpecLayout` | 헤더 조립 주체가 직접 렌더     |
| `⚙` 설정 버튼             | `layouts/SpecLayout` | 헤더 조립 주체가 직접 렌더     |

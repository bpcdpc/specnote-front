# 프론트엔드 폴더 구조

| 버전 | 일시           | 변경 내용                                                                      |
| ---- | -------------- | ------------------------------------------------------------------------------ |
| v0.1 | 2026.07.16 THU | 최초 작성. `프론트엔드 아키텍처 v0.5` 통합본에서 폴더 트리 · 배치 원칙을 분리. |

관련 문서

- `01-frontend-stack` — 기술 스택 · 구현 순서
- `03-frontend-layouts` — 라우트 · 레이아웃 · 반응형
- `04-design-tokens` — 색 · 폰트 · Tailwind 유틸

---

## 전체 트리

```
src/
├── main.tsx                      # 엔트리. Provider 조립 (현재 Theme → Router,
│                                 #   Query·Auth는 9단계에서 안쪽에 추가)
│
├── app/                          # 앱 전역 뼈대
│   ├── router.tsx                # createBrowserRouter 라우트 정의
│   ├── AuthLayout.tsx            # Login·Signup — 헤더X, 중앙정렬, 푸터 중앙
│   ├── ProjectLayout.tsx         # Dashboard·ProjectForm — <Outlet> + 푸터 왼쪽
│   │                             #   (헤더는 각 페이지가 Header로 직접 렌더)
│   ├── SpecLayout.tsx            # SpecDetail — h-dvh flex 세로 스택
│   ├── StubPages.tsx             # 임시 페이지 (각 단계에서 실제 화면으로 교체·제거)
│   ├── ThemeContext.tsx          # light/dark 상태, .dark 클래스 토글, localStorage
│   ├── AuthContext.tsx           # 로그인 유저·JWT 보관, 로그인/로그아웃 액션
│   └── RequireAuth.tsx           # 미로그인 시 /login 으로 리다이렉트
│
├── features/                     # 도메인별 기능 (백엔드 모듈명과 정렬)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── UserBadge.tsx         # 헤더 우측 유저 뱃지 + 드롭다운 트리거
│   │   ├── api.ts                # login / signup / logout
│   │   └── types.ts              # LoginDto, CreateUserDto, PublicUser
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx     # 프로젝트 카드 목록 + 빈 상태
│   │   ├── ProjectCard.tsx       # 카드 1개 (Owner/Member 뱃지)
│   │   ├── NewProjectCard.tsx    # 점선 "+ 새 프로젝트" 카드 버튼
│   │   ├── api.ts                # 내 프로젝트 목록 조회
│   │   └── types.ts              # ProjectSummary
│   │
│   ├── project/
│   │   ├── ProjectFormPage.tsx   # 생성·설정 공용 페이지(모달 아님)
│   │   ├── SpecUrlField.tsx      # specJsonUrl + [스펙 갱신]
│   │   ├── TryItBaseUrlField.tsx # tryItBaseUrl + [저장]
│   │   ├── MemberList.tsx        # 멤버 목록 + 초대/제외 (역할 수정 없음)
│   │   ├── api.ts                # createProject / updateProject /
│   │   │                         #   commitSpec / 멤버 초대·제외
│   │   └── types.ts              # CreateProjectDto, UpdateProjectDto,
│   │                             #   CommitSpecDto, CreateMembershipDto
│   │
│   ├── spec/                     # SpecDetail (3컬럼)
│   │   ├── SpecDetailPage.tsx    # Header(Bearer Input · 프로젝트 설정 버튼 포함) + 3컬럼 조립
│   │   ├── SpecColumns.tsx       # 왼쪽 고정 / 가운데 flex / 오른쪽 resizable
│   │   ├── BearerTokenInput.tsx  # 헤더 Bearer 토큰 입력 (Try it 전역 인증)
│   │   ├── EndpointSidebar.tsx   # 검색창 + "삭제된 엔드포인트 보기" 토글
│   │   ├── EndpointListItem.tsx  # 메서드 뱃지 + path (삭제 시 취소선)
│   │   ├── EndpointDetail.tsx    # 중앙: parameters / requestBody / responses
│   │   ├── TryItPanel.tsx        # 입력 폼 → 실제 HTTP 요청 → 응답 표시
│   │   ├── SpecUpdateBanner.tsx  # snapshotId 불일치 시 "스펙 업데이트됨"
│   │   ├── useSpecCache.ts       # components 캐시 + $ref 지연 해석
│   │   ├── api.ts                # ProjectView / EndpointDetail 조회
│   │   └── types.ts              # ProjectView, EndpointSummary, EndpointDetail
│   │
│   ├── comments/                 # 오른쪽 댓글 패널
│   │   ├── CommentPanel.tsx      # 헤더(AI 요약 · 이동) + 목록 + 하단 입력
│   │   ├── CommentThread.tsx     # 2뎁스 트리 (댓글 + replies)
│   │   ├── CommentItem.tsx       # 아바타·작성자·시각·본문·리액션
│   │   ├── CommentEditor.tsx     # 평문 textarea + @ / # 자동완성
│   │   ├── MentionPopover.tsx    # @멤버 / #엔드포인트 선택 목록
│   │   ├── CommentContent.tsx    # react-markdown 렌더 (코드블록 표시)
│   │   ├── ReactionBar.tsx       # 리액션 4종 토글
│   │   ├── MoveThreadPopover.tsx # [Owner] 스레드 이동 대상 선택
│   │   ├── AiSummaryButton.tsx   # 요약 → AI 계정 댓글로 시간순 삽입
│   │   ├── api.ts                # 댓글 CRUD / 리액션 / 이동 / AI 요약
│   │   └── types.ts              # CommentTree, CommentView,
│   │                             #   ReactionSummary, CreateCommentDto
│   │
│   └── notifications/
│       ├── NotificationDropdown.tsx  # 이름·이메일 → 알림 → 테마 → 로그아웃
│       ├── NotificationItem.tsx      # 멘션 / 초대 구분, 미확인 표시
│       ├── useNotificationLink.ts    # 알림 클릭 → 딥링크 이동
│       ├── api.ts                    # 알림 목록 / 읽음 처리
│       └── types.ts                  # NotificationView
│
├── components/                   # 도메인 모르는 순수 UI
│   ├── ui/                       # shadcn 생성물
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   ├── avatar.tsx
│   │   └── ...                   # 필요할 때 `npx shadcn add <name>`
│   ├── Header.tsx                # 헤더 뼈대. props: left, right, wide
│   ├── Footer.tsx                # props: align = "center" | "left"
│   ├── BackButton.tsx            # ← 뒤로가기 (ProjectForm·SpecDetail)
│   ├── MethodBadge.tsx           # GET/POST/PUT/PATCH/DELETE 솔리드 뱃지
│   ├── Logo.tsx                  # 로고 마크 + "SpecNote"
│   ├── EmptyState.tsx            # 빈 상태 공통 (문구 + 액션 버튼)
│   └── ThemeToggle.tsx           # 라이트/다크 전환 (유저 드롭다운 안)
│
├── lib/                          # 배관 (도메인 무관 인프라)
│   ├── api.ts                    # fetch 래퍼: JWT 자동 첨부, 에러 통일
│   ├── queryClient.ts            # TanStack Query 설정
│   ├── constants.ts              # REACTION_TYPE, NOTIFICATION_TYPE, ROLE
│   └── utils.ts                  # shadcn `cn()` 헬퍼
│
└── styles/
    └── index.css                 # 디자인 토큰 + shadcn 매핑 + 다크(.dark)
```

---

## 배치 원칙

### `components/` vs `features/`

> 이 조각이 서버 데이터를 fetch하거나 SpecNote 도메인을 아는가?
>
> - **예** → `features/<도메인>/`
> - **아니오** (props 받아 그리기만) → `components/`

- `MethodBadge`는 `method` 문자열만 받아 색을 칠한다 → `components/`
- `NotificationDropdown`은 알림을 fetch하고 읽음 처리를 한다 → `features/notifications/`

판단이 애매하면: **"이 파일을 다른 프로젝트에 그대로 복붙할 수 있는가?"**
가능하면 `components/`, SpecNote를 알아야 하면 `features/`.

### 헤더는 한 덩어리가 아니다

`Header`는 **뼈대**(높이 · 보더 · sticky · 좌우 배치)만 갖고,
안에 들어갈 조각은 각 페이지가 `left` · `right` · `wide` props로 넘긴다.
조각들은 도메인을 아는지 여부로 위치가 갈린다.

| 조각                                  | 위치                      | 이유                 |
| ------------------------------------- | ------------------------- | -------------------- |
| 헤더 뼈대 (`Header`)                  | `components/`             | props 받아 배치만 함 |
| 뒤로가기 (`BackButton`)               | `components/`             | 도메인 모름          |
| 테마 토글 (`ThemeToggle`)             | `components/`             | 도메인 모름          |
| 유저 뱃지                             | `features/auth/`          | 로그인 유저를 앎     |
| 알림 드롭다운                         | `features/notifications/` | 알림을 fetch함       |
| Bearer 토큰 입력 · 프로젝트 설정 버튼 | `features/spec/`          | SpecDetail 전용      |

**Footer**는 순수 UI → `components/Footer.tsx` (`align` prop만 받음)

### `features/`를 쓰는 이유

프론트는 1인 작업이라 "병렬 작업 충돌 방지"라는 이점은 해당되지 않는다.
그럼에도 `features/`를 쓰는 이유는 **백엔드 도메인 모듈명과 이름이 1:1로 맞아서**,
"댓글 고치려면 프론트 `comments/` + 백엔드 `comments/`"로 탐색이 단순해지기 때문이다.

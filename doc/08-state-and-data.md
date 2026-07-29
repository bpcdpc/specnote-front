# 상태와 데이터

| 버전 | 일시           | 변경 내용                                                                                                                                                                |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v0.1 | 2026.07.29 WED | 최초 작성. 상태 관리 원칙을 `01-frontend-stack`에서 옮기고, 배관 1~4단계에서 굳은 규약을 모음 — queryKey, `parseId`, 전역 쿼리 설정, 무효화, 인증 상태, API 함수 레이어. |

> 어느 폴더에 두는가는 `02-frontend-directories`, 문법 규약은 `05-code-conventions`,
> 대기와 실패 표시는 `07-components`.

---

## 상태 3분류

| 종류                 | 어디서                       | 예                                           |
| -------------------- | ---------------------------- | -------------------------------------------- |
| 서버 데이터          | **TanStack Query**           | 프로젝트 목록과 정보, 엔드포인트, 댓글, 알림 |
| 전역 클라이언트 상태 | **Context** (`app/`)         | 테마, 로그인 유저 + JWT                      |
| 화면 스코프 상태     | `useState` 또는 화면 Context | Bearer 토큰, 패널 열림/접힘, 댓글 편집 상태  |

**"현재 프로젝트"를 전역 상태로 들지 않는다.** URL의 `:projectId`가 그 역할을 하고,
여러 컴포넌트가 같은 queryKey를 부르면 Query가 같은 캐시를 돌려준다.

**선택된 엔드포인트도 상태가 아니다.** 소유자는 URL이다. 새로고침과 뒤로가기가 살아야 하고,
13단계 딥링크가 같은 경로를 그대로 쓴다.

**전역 Context는 테마와 로그인 유저 둘뿐이다.** `ProjectContext` 같은 건 만들지 않는다.

**화면 스코프 Context는 다르다.** `SpecPanelsContext`, `BearerTokenContext`,
`CommentContext`는 전역이 아니라 그 화면 트리 안에서만 산다. 소유자가 갈리는 값
(헤더 토글과 3컬럼이 같은 열림 상태를 봐야 하는 경우)을 잇는 용도고, 화면을 떠나면 사라진다.
Context라는 형태가 `app/` 배치의 근거가 되지 않는다.

---

## queryKey

| 대상             | 키                                   |
| ---------------- | ------------------------------------ |
| 내 프로젝트 목록 | `["projects"]`                       |
| 프로젝트 진입    | `["projects", projectId]`            |
| 멤버 목록        | `["projects", projectId, "members"]` |
| 엔드포인트 상세  | `["endpoints", endpointId]`          |
| 댓글 목록        | `["comments", endpointId]`           |
| 로그인 유저      | `["me"]`                             |

**id는 반드시 `number`다.** `useParams()`가 주는 것은 문자열이라 그대로 넣으면
`["projects", "1"]`이 되어 `["projects", 1]`과 다른 캐시가 된다. 조회는 두 번 나가고
무효화는 한쪽만 잡는다. 에러가 안 나고 조용히 어긋나는 형태라 더 나쁘다.

**여러 곳이 같은 데이터를 보면 같은 키를 부른다.** 프롭으로 내리지 않는다.
`AppLayout`과 `ProjectSettingsPage`가 둘 다 `["projects", id]`를 부르지만 요청은 한 번이다.

예외는 `SpecLayout`이다. 자식 라우트 둘이 같은 페이지 컴포넌트이고 둘 다 `ProjectView`를
요구해서, 레이아웃이 조회하고 `<Outlet context>`로 내린다. 근거는 `03-frontend-layouts`.

---

## path param은 `parseId`로 정규화한다

```tsx
import { parseId } from "@/lib/routeParams";

const id = parseId(projectId); // number | null
```

`Number()`나 `Number.isFinite`를 직접 쓰지 않는다. 백엔드 `MembershipGuard`가
`Number.isInteger(id) && id > 0`을 요구하고 벗어나면 `400 유효하지 않은 id입니다.`를 낸다.
`isFinite`는 `0`과 `1.5`를 통과시켜 서버와 어긋난다. `parseId`가 그 조건을 그대로 갖는다.

이 400은 멤버십 검증보다 앞에서 나오고 계층 2, 3의 모든 라우트에 공통 적용된다.
문구를 화면에 띄울 수 없으니 **요청을 보내기 전에 프론트가 막는다.**

**`null`이면 쿼리를 걸지 말고 그 앞에서 분기한다.**

```tsx
// ❌ enabled 로만 막으면 isPending 이 true 로 남아 로딩 화면이 영원히 뜬다
if (isPending) return <LoadingState />;

// ✅ 유효성 분기가 먼저다
if (id === null)
  return <ErrorState error={null} fallback="찾을 수 없습니다." />;
if (isPending) return <LoadingState />;
```

`enabled: id !== null`은 요청을 막을 뿐 `isPending`을 풀어주지 않는다.
`enabled`가 거짓인 쿼리는 영원히 대기 상태다.

---

## 전역 쿼리 설정 — `lib/api/queryClient.ts`

| 옵션                   | 값                     | 이유                                    |
| ---------------------- | ---------------------- | --------------------------------------- |
| `retry`                | 4xx는 안 함, 그 외 1회 | 4xx는 다시 물어도 같은 답이다           |
| `staleTime`            | 30초                   | 화면을 오갈 때마다 재조회하지 않는다    |
| `refetchOnWindowFocus` | `false`                | 목록이 흔들려 시연 중 예측이 어렵다     |
| `mutations.retry`      | `false`                | 쓰기를 자동 재시도하면 중복 생성이 난다 |

**화면에서 `retry`를 다시 지정하지 않는다.** 전역이 이미 맞다.

`refetchOnWindowFocus`는 협업 도구라 켤 여지가 있다. 켜면 팀원의 새 댓글을 자동으로
물어오지만 지금은 끈다. 켜면 스펙 갱신 배너의 전제(프로젝트 캐시가 낡은 채로 있다)도
같이 흔들리므로 함께 재검토해야 한다.

---

## mutation 후에는 재조회한다

로컬 패치하지 않는다. write 계열 응답이 Prisma 원형이라 화면이 필요한 것
(`author`, `reactions`, `memberMentions`)이 없다. 억지로 조립하면 서버가 실제로 저장한 값과
다른 것을 그리게 된다.

```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["comments", endpointId] });
};
```

### `exact`를 언제 쓰나

`invalidateQueries`는 **접두 매칭**이다. `["projects", 1]`로 무효화하면
`["projects", 1, "members"]`까지 딸려온다.

- 하위까지 같이 갱신돼야 하면 그대로 둔다.
- 무관한 하위가 붙어 있으면 `exact: true`로 끊는다.

스펙 커밋이 그 예다. 엔드포인트 목록과 `snapshotId`, 목록 카드의 title, 그리고 모든
엔드포인트의 `operationJson`이 갈리지만 **멤버십은 무관하다.**

```tsx
queryClient.invalidateQueries({ queryKey: ["projects"], exact: true });
queryClient.invalidateQueries({
  queryKey: ["projects", projectId],
  exact: true,
});
queryClient.invalidateQueries({ queryKey: ["endpoints"] });
```

`["endpoints"]`에 `exact`가 없는 것은 의도다. 커밋은 모든 엔드포인트에 영향을 준다.

---

## 인증 상태 — `app/AuthContext.tsx`

토큰은 `localStorage`가 진짜 저장소지만 **state로도 든다.** `localStorage` 변경은
리렌더를 일으키지 않기 때문이다. 첫 렌더에 한 번만 읽고(lazy initializer),
이후로는 `login`과 `logout`이 저장소와 state를 항상 같이 갱신한다.

`me`는 서버 데이터라 state로 들지 않는다. `["me"]` 쿼리가 캐시한다.

```tsx
const { data, isPending, isError } = useQuery({
  queryKey: ["me"],
  queryFn: getMe,
  enabled: Boolean(token),
});

const me = token ? (data ?? null) : null;
const isLoading = Boolean(token) && isPending;
```

- **`enabled`로 토큰이 있을 때만 요청한다.** 없는데 부르면 무의미한 401이 쌓인다.
- **`me`를 토큰 기준으로 판단한다.** 세션 중간에 토큰이 만료되면 refetch가 실패해도
  `data`에는 직전 성공값이 남아, 그것만 보면 로그아웃이 안 된 것처럼 보인다.
- **`isLoading`도 토큰으로 한 번 막는다.** `enabled`가 거짓이면 `isPending`은 참으로 남는다.
- **토큰이 죽으면 `isError`에서 한 번만 정리한다.** 전역 4xx 규칙이 재시도를 막아준다.
  안 비우면 "토큰은 있는데 me는 없음" 상태에 갇힌다.
- **로그아웃은 `queryClient.clear()`를 부른다.** 다른 계정으로 다시 로그인했을 때
  앞 사람의 프로젝트 목록이 캐시에서 잠깐 비치는 것을 막는다.
- **백엔드 로그아웃 호출은 없다.** JWT라 서버가 할 일이 없다.

`AuthProvider`는 `RouterProvider` 바깥이라 `useNavigate`를 못 쓴다.
**화면 이동을 하지 않는다** — 로그인 후 이동은 `LoginPage`가, 미인증 리다이렉트는
`RequireAuth`가 맡는다. `login`은 `ApiError`를 그대로 통과시키고, 문구를 띄우는 것은 호출부다.

---

## API 함수 레이어 — `lib/api/`

**함수는 fetch만 한다.** React를 모르고 훅을 쓰지 않는다. `useQuery`는 화면이 부른다.

```tsx
// GET  /api/endpoints/:id
// →  EndpointDetail  (operationJson + 비교용 snapshotId)
export function getEndpointDetail(endpointId: number) {
  return api.get<EndpointDetail>(`/endpoints/${endpointId}`);
}
```

- **주석은 메서드, 경로, 응답 타입 3줄이 기본**이다. 특기할 에러가 있으면 덧붙인다.
- **경로에 `/api`를 붙이지 않는다.** `client.ts`의 `BASE`가 붙인다.
- **요청 DTO 타입을 `types.ts`에 두지 않는다.** 함수 시그니처가 그 역할을 한다
  (`05-code-conventions`).
- 파일 분할은 URL이 아니라 **도메인 기준**이다(`02-frontend-directories`).

### `client.ts`

- **경로는 항상 상대경로 `/api`다.** 배포는 NestJS 한 대가 프론트 정적 파일까지 서빙해
  오리진이 같고, 개발에서는 Vite 프록시가 넘긴다. 환경변수 분기가 없다.
- **토큰은 요청할 때마다 읽는다.** 모듈 로드 시점에 읽으면 로그인 직후 갱신이 반영되지 않는다.
- **에러는 `ApiError` 하나로 통일한다.** 백엔드가 `HttpException` 서브클래스만 던져
  실패 응답이 `{ statusCode, code?, message, error }`로 일정하다.
- `class-validator`는 `message`를 배열로 준다. 줄바꿈으로 잇는다.
- 네트워크 단절과 서버 다운은 status가 없어 **`0`으로 표시**한다.
- 본문 없는 응답(204 등)은 `undefined`를 돌려준다.

### `ApiError` 좁히기

```tsx
error instanceof ApiError ? error.message : "불러오지 못했습니다.";
```

경계에서 좁히는 세 곳 중 하나다. 나머지 둘(`isHttpMethod`, `parseId`)은
`05-code-conventions`의 좁히기 절에 표로 있다.

`status`로 분기할 때는 404를 특별 취급한다 — 서버 문구를 화면에 그대로 띄우지 않는다.
근거와 패턴은 `07-components`의 `ErrorState` 절.

---

## 조회 실패 표시

`LoadingState`와 `ErrorState`를 쓴다. 사용 범위와 재시도 버튼 규칙은 `07-components`.

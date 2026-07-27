# 프론트엔드 기술 스택

| 버전 | 일시           | 변경 내용                                                                                                                                                                                                                                                                                                       |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1 | 2026.07.16 THU | 최초 작성. 스택·구현 순서·미결 항목 분리. 라틴 폰트 Inter → Geist.                                                                                                                                                                                                                                              |
| v0.2 | 2026.07.17 FRI | 폴더 구조 개편 반영. 구현 일정을 주 단위로 정리.                                                                                                                                                                                                                                                                |
| v0.3 | 2026.07.17 FRI | 상태 관리 원칙 명시 — 서버 데이터는 TanStack Query, 전역 Context는 테마·로그인 유저뿐.                                                                                                                                                                                                                          |
| v0.4 | 2026.07.19 SUN | 구현 순서 갱신(project 화면 목 완료, `lib/types.ts`·`constants.ts` 생성). **Base UI 문법·폼 작성 규칙을 `02-frontend-directories`로, shadcn 컴포넌트 커스텀 내역을 `04-design-tokens`로 이관.** 미결 항목 정리.                                                                                                 |
| v0.5 | 2026.07.20 MON | 11단계 완료 반영. `react-resizable-panels`를 **v4 기준**으로 갱신(API가 v3에서 전부 바뀜), 리사이즈 대상을 양쪽 패널로 정정. 미결에서 **로그아웃 API 줄 삭제**(문서 어디에도 없던 항목), `GET /api/users/me` 부재 추가. 확정된 제약에 **멘션 저장 형식**(markdown 링크 문법) 추가, 와이어프레임 차이 항목 갱신. |
| v0.6 | 2026.07.27 MON | **12단계(댓글) UI 완료 반영.** **멘션 저장 형식을 전면 정정** — markdown 링크를 저장하는 게 아니라 `@userId                                                                                                                                                                                                     | `/`#endpointId | `토큰으로 저장하고 렌더 시점에 링크로 바꾼다(이름 변경 추종이 근거). 마크다운 렌더 스택에`remark-gfm`, `remark-breaks`추가. 구현 순서표 12단계 상태 갱신. 미결에 **Cmd+Enter 제출 미도입**(한글 IME 충돌)과 **파일 첨부 보류** 추가. 12단계 세부 계획은`08-comments-plan`으로 분리. |

---

## 기술 스택

| 항목            | 선택                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| 빌드            | Vite + React + TypeScript                                               |
| 스타일          | Tailwind CSS v4 (`@tailwindcss/vite`)                                   |
| 컴포넌트        | shadcn/ui (Base UI 프리미티브, Nova 프리셋, Lucide 아이콘)              |
| 라우팅          | React Router (`createBrowserRouter`)                                    |
| 서버 상태       | TanStack Query                                                          |
| 클라이언트 상태 | `useState` / Context                                                    |
| 리사이즈        | `react-resizable-panels` **v4** (좌우 패널 모두)                        |
| 마크다운 렌더   | `react-markdown` + `remark-gfm` + `remark-breaks` (표시용, 저장은 평문) |
| 폰트            | Geist(라틴) + Pretendard(한글), CDN                                     |
| 다크모드        | `<html>`에 `.dark` 클래스 토글                                          |

> Base UI는 Radix와 문법이 다르다(`asChild` 없음 등). 컴포넌트 작성 규칙은 `05-code-conventions` 참조.

### `react-resizable-panels` v4 주의

v3 예제를 그대로 가져오면 전부 깨진다. 이름이 바뀌었다.

| v3                  | v4            |
| ------------------- | ------------- |
| `PanelGroup`        | `Group`       |
| `PanelResizeHandle` | `Separator`   |
| `direction` prop    | `orientation` |
| `tagName` prop      | 삭제됨        |

- v4는 **px 단위를 지원한다.** v3의 백분율 환산이 필요 없어 `minSize`, `maxSize`를
  디자인 값 그대로 적을 수 있다.
- 접기는 `collapsible` + `collapsedSize`가 아니라 패널 `ref`의 명령형 API로 다룬다.

---

## 상태 관리 원칙

**서버에서 온 데이터는 Context에 담지 않는다. TanStack Query가 캐시한다.**

| 종류                 | 어디서                   | 예                                               |
| -------------------- | ------------------------ | ------------------------------------------------ |
| 서버 데이터          | **TanStack Query**       | 프로젝트 목록·정보, 엔드포인트, components, 알림 |
| 전역 클라이언트 상태 | **Context**              | 테마, 로그인 유저+JWT                            |
| 화면 스코프 상태     | `useState` (화면 최상단) | Bearer 토큰, 선택된 엔드포인트                   |

- **"현재 프로젝트"를 전역 상태로 들고 있지 않는다.** URL의 `:id`가 그 역할을 하고,
  여러 컴포넌트가 `useProject(id)`를 부르면 Query가 같은 캐시를 돌려준다.
- 전역 Context는 **테마 + 로그인 유저 둘뿐**이다. `ProjectContext` 같은 건 만들지 않는다.

---

## 프로젝트 세팅 순서

**1. Vite 프로젝트 생성**

```bash
npm create vite@latest -- --template react-ts
```

`App.tsx` · `App.css`는 삭제한다. `main.tsx`가 `RouterProvider`를 직접 렌더한다.

**2. 라우터**

```bash
npm install react-router-dom
```

**3. Tailwind CSS v4**

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

v4에는 `tailwind.config.js`가 없다. `postcss.config.js`도, content glob 설정도 불필요하다.

**4. 경로 별칭 `@/*`**

```bash
npm install -D @types/node
```

`tsconfig.json`과 `tsconfig.app.json` 양쪽에 `"paths": { "@/*": ["./src/*"] }`를 넣고,
`vite.config.ts`에 `resolve.alias: { "@": path.resolve(__dirname, "./src") }`를 추가한다.
`baseUrl`은 넣지 않는다(최신 TS에서 deprecated).

**5. shadcn/ui**

```bash
npx shadcn@latest init
```

- Component library → **Base** (Recommended)
- Preset → **Nova** (Lucide / Geist)

경로 별칭(4)이 먼저 잡혀 있어야 한다. init이 `components.json` · `lib/utils.ts` ·
`index.css` 색 변수 블록을 생성하고, Base UI 프리미티브 등을 설치한다.

> `@fontsource-variable/geist`는 쓰지 않는다. 폰트는 CDN으로 불러온다.

**6. 디자인 토큰 — `src/styles/index.css`**

shadcn이 넣은 색 변수를 우리 토큰에 매핑하고 다크 방식·폰트를 정리한다.
`components/ui/`의 버튼·인풋 스타일 값도 이 단계에서 함께 맞춘다 — 값과 대상 파일은 `04-design-tokens` 참조.

`main.tsx`에서 `import "@/styles/index.css";`.

**7. 이후 단계에서 설치**

```bash
npm install @tanstack/react-query     # 9단계  — 데이터 배관
npm install react-resizable-panels    # 11단계 — 3컬럼 리사이즈 (v4)
npm install react-markdown remark-gfm remark-breaks   # 12단계 — 댓글 렌더
```

`remark-breaks`는 홑 줄바꿈을 `<br>`로 만든다. 없으면 댓글에서 Enter 한 번은 무시되고
두 번 쳐야 문단이 갈린다 — 채팅형 입력에서는 어긋난 동작이다.
`remark-gfm`은 취소선(`~~`)과 자동 링크용이다. 표는 `allowedElements`에서 막는다.

---

## 구현 순서

**원칙**: 뼈대 → 레이아웃 → UI → 데이터. 화면은 먼저 목 데이터로 만들고 배관이 준비되면 교체한다.

| 단계 | 내용                                                                         | 상태 |
| ---- | ---------------------------------------------------------------------------- | ---- |
| 0    | 디자인 토큰 · 폰트 · 다크 — `styles/index.css`                               | ✅   |
| 1    | shadcn 세팅 · 토큰 매핑 · 경로 별칭                                          | ✅   |
| 2    | 뼈대 배선 — `ThemeProvider` + `RouterProvider`                               | ✅   |
| 3    | 라우터 + stub 페이지                                                         | ✅   |
| 4    | 레이아웃 — `Header` · `Footer` · `BackButton`, 레이아웃 3종                  | ✅   |
| 5    | 공용 UI — `MethodBadge` · `Logo` · `EmptyState` · `PageHeading` · `UserMenu` | ✅   |
| 6    | auth 화면 — 로그인 · 회원가입 (Field 폼, 제출은 목)                          | ✅   |
| 7    | dashboard — 프로젝트 카드 · 빈 상태 (목)                                     | ✅   |
| 8    | header — UserMenu 완료 / 알림 드롭다운 미구현                                | 🔶   |
| 8.5  | 타입 — `lib/constants.ts` · `lib/types.ts`                                   | ✅   |
| 9    | 데이터 배관 — `lib/api/` · QueryProvider · AuthContext → 목을 API로 교체     | ☐    |
| 10   | project — 생성 · 설정 · 멤버 (화면 목 완료, API 연결 대기)                   | 🔶   |
| 11   | spec — 3컬럼 · 사이드바 · 상세 · $ref 캐시 · Try it · 갱신 배너              | ✅   |
| 12   | comments — 2뎁스 트리, 멘션, 리액션, AI 요약, 댓글 이동 (UI 완료, 배관 대기) | 🔶   |
| 13   | 알림 딥링크 · 댓글 하이라이트                                                | ☐    |
| 14   | 404 페이지 · 파비콘 (404 완료, 파비콘 대기)                                  | 🔶   |

---

## 미결 / 대기

- **`GET /api/users/me`** — 백엔드에 아직 없다. API 명세서 v0.3에 추가했고 구현 대기 중이다.
  로그인 응답이 `{ access_token }`뿐이고 `JwtPayload`에 `userName`이 없어
  프론트가 유저 이름을 얻을 경로가 이것뿐이다. 새로고침 시 토큰 유효성 검증도 겸한다.
  (백엔드 반영이 끝나면 이 줄을 지운다.)
- **알림 드롭다운** — `UserMenu`에 자리표시만 있다. 백엔드 알림 API + 딥링크(13단계)와 함께 붙인다.
- **파비콘** — `{S}` SVG는 폰트가 없는 환경에서 fallback 렌더된다. 정확한 자형이 필요하면
  Geist 글리프를 path로 변환해야 한다(수동 작업).
- **Cmd/Ctrl+Enter 제출 단축키 미도입** — 한글 IME 조합 확정과 React controlled
  `textarea`의 충돌로 12단계에서 제외했다. 증상은 두 갈래로, 조합 중 제출하면 마지막
  글자가 잘려 등록되고(state 미반영), 강제 `blur()`로 확정을 유도하면 반대로 확정 글자가
  한 번 더 붙는다. 우회 3종(blur + rAF + 버튼 click 위임 / DOM `value` 직독 /
  `compositionend` 대기)을 전부 시도했으나 한쪽 증상을 다른 증상으로 바꿀 뿐이었다.
  **등록 버튼 경로는 정상이다** — mousedown → blur → IME 확정 → onChange 순서라
  click 시점에는 state가 이미 최신이다. 재도입하려면 uncontrolled `textarea` 전환을
  먼저 검토한다.
- **파일 첨부 보류** — 백엔드에는 있으나 `CommentView`에 `attachments` 필드가 없고
  `onSubmit` 시그니처에 `files`가 없다. 에디터에 버튼만 두고 배선하지 않았다.
  01의 "이미지 첨부는 스코프 밖"과는 별개 항목이다(그쪽은 본문 인라인 이미지).

---

## 확정된 제약

**댓글은 평문 저장** (`content: string`). 리치 에디터를 쓰지 않는다.
백엔드 `Comment.content`가 평문 한 필드이고 FR-5.4가 "순수 텍스트 댓글 구조만 유지"로 못 박았다.

- 코드블록은 렌더 시 `react-markdown`으로 표시만 한다. 저장 형식은 안 바뀐다.
- 이미지 · 동영상 첨부는 스코프 밖.

**멘션 저장 형식 — ID 토큰**

v0.5의 "markdown 링크를 그대로 저장한다"는 **틀렸다.** 구현하며 뒤집혔다.

| 층         | 형태                          | 예                      |
| ---------- | ----------------------------- | ----------------------- |
| 저장       | `@userId\|` / `#endpointId\|` | `@12\| 확인 부탁드려요` |
| 표시(렌더) | markdown 링크                 | `[@희경](mention:12)`   |
| 표시(편집) | 사람이 읽는 이름              | `@희경 확인 부탁드려요` |

**이름을 본문에 박지 않는다.** 렌더 시점에 해석하므로 멤버가 이름을 바꾸면
옛 댓글의 멘션도 새 이름으로 따라간다. 링크를 저장하면 개명 시점 이전 댓글이
전부 옛 이름으로 굳는다.

**`|`로 끝을 막는다.** `@2` 뒤에 숫자가 이어지면 `@23`인지 `@2` 다음 `3`인지
갈리지 않는다.

**백엔드는 `content`를 파싱하지 않는다.** 멘션 대상은 `CreateCommentDto`의
`mentionedUserIds` / `mentionedEndpointIds`로 따로 간다. 즉 이 토큰 형식은
순수한 프론트 규약이고 백엔드는 문자열을 그대로 저장할 뿐이다.

렌더 파이프라인은 `mentions.ts`의 `mentionsToMarkdown()`이 담당한다.

- 토큰을 markdown 링크로 바꾼 **뒤에** `react-markdown`에 넘긴다. 파싱 후에는
  이미 React 엘리먼트라 문자열 치환이 안 된다.
- 이름과 경로는 댓글이 들고 온 `memberMentions` / `endpointMentions`에서 꺼낸다.
  프로젝트 멤버 목록을 따로 조회할 필요가 없다.
- **배열에 없는 id면 칩으로 만들지 않고 원문 토큰을 그대로 둔다.** 사용자가 손으로
  쳐 넣은 가짜 멘션이 살아나지 않는다.
- `components.a`를 갈아끼워 `href` 스킴으로 칩과 일반 링크를 가른다.
- `urlTransform`으로 `mention:` `endpoint:` 두 스킴만 통과시키고 나머지는
  **기본 동작에 넘긴다.** 기본을 안 거치면 `javascript:` 차단이 풀린다.
- 링크 텍스트의 대괄호와 역슬래시는 이스케이프한다. 한글 이름에는 없지만
  path에는 들어갈 수 있다.

에디터는 표시 형식으로 들고 있다가 제출할 때만 저장 형식을 만든다
(`toStorage` / `toDisplay` / `extractIds`).

**알려진 한계 3가지.** 데모 규모에서 마주칠 확률이 낮아 감수한다.

1. 문자열 전체를 훑으므로 **코드블록 안이나 URL 경로**에 토큰 모양이 있으면 거기도
   치환된다. remark 플러그인으로 AST 단계에서 하면 피할 수 있다.
2. 같은 이름의 멤버가 둘이면 먼저 찾은 쪽으로 붙는다(이름으로 되짚는 방식이라).
3. 팝오버로 고르지 않고 손으로 `@이름`을 쳐도 멘션 대상으로 파싱된다.

- **raw HTML(`<span data-id>`)을 쓰지 않는 이유**: `rehype-raw`로 raw HTML을 켜야 하고
  그러면 사용자 입력 HTML이 DOM에 그대로 들어간다. 막으려면 `rehype-sanitize`와
  allowlist 관리가 붙는다. 의존성 2개와 보안 표면을 늘리는 값이 없다.
  현재 구조는 raw HTML을 켜지 않으므로 sanitize 자체가 불필요하다.
- **식별자는 `userId`다.** 이메일은 PII고 DOM에 노출된다.

**와이어프레임 v0.1과의 차이**

- 와이어프레임은 양쪽 사이드바 리사이즈 → **구현이 그쪽으로 돌아왔다.** 차이가 아니다.
  남은 차이는 접기와 `lg` 오버레이로, 와이어프레임에는 둘 다 없다.
- 와이어프레임은 프로젝트 생성/설정이 한 화면(2컬럼) → 실제는 **두 화면, 각 1컬럼**.
- 와이어프레임은 헤더 좌측이 `←` 뒤로가기 → 실제는 **브레드크럼**.
- 와이어프레임은 댓글 이동이 패널 헤더의 엔드포인트 단위 액션 → **이쪽이 맞다.**
  백엔드가 댓글 단위로 만들었던 것을 엔드포인트 단위로 되돌린다(FR-12 v0.7).

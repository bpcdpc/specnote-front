# 프론트엔드 기술 스택

| 버전 | 일시           | 변경 내용                                                                                                                                                                                                       |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1 | 2026.07.16 THU | 최초 작성. 스택·구현 순서·미결 항목 분리. 라틴 폰트 Inter → Geist.                                                                                                                                              |
| v0.2 | 2026.07.17 FRI | 폴더 구조 개편 반영. 구현 일정을 주 단위로 정리.                                                                                                                                                                |
| v0.3 | 2026.07.17 FRI | 상태 관리 원칙 명시 — 서버 데이터는 TanStack Query, 전역 Context는 테마·로그인 유저뿐.                                                                                                                          |
| v0.4 | 2026.07.19 SUN | 구현 순서 갱신(project 화면 목 완료, `lib/types.ts`·`constants.ts` 생성). **Base UI 문법·폼 작성 규칙을 `02-frontend-directories`로, shadcn 컴포넌트 커스텀 내역을 `04-design-tokens`로 이관.** 미결 항목 정리. |

---

## 기술 스택

| 항목            | 선택                                                       |
| --------------- | ---------------------------------------------------------- |
| 빌드            | Vite + React + TypeScript                                  |
| 스타일          | Tailwind CSS v4 (`@tailwindcss/vite`)                      |
| 컴포넌트        | shadcn/ui (Base UI 프리미티브, Nova 프리셋, Lucide 아이콘) |
| 라우팅          | React Router (`createBrowserRouter`)                       |
| 서버 상태       | TanStack Query                                             |
| 클라이언트 상태 | `useState` / Context                                       |
| 리사이즈        | `react-resizable-panels` (오른쪽 댓글 패널만)              |
| 마크다운 렌더   | `react-markdown` (댓글 코드블록 표시용, 저장은 평문)       |
| 폰트            | Geist(라틴) + Pretendard(한글), CDN                        |
| 다크모드        | `<html>`에 `.dark` 클래스 토글                             |

> Base UI는 Radix와 문법이 다르다(`asChild` 없음 등). 컴포넌트 작성 규칙은 `02-frontend-directories` 참조.

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
npm install react-resizable-panels    # 11단계 — 3컬럼 리사이즈
npm install react-markdown            # 12단계 — 댓글 코드블록 렌더
```

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
| 11   | spec — 사이드바 · 중앙 상세 · Try it · 갱신 배너 (3컬럼 셸만)                | 🔶   |
| 12   | comments — 2뎁스 트리 · 멘션 · 리액션 · AI 요약 · 스레드 이동                | ☐    |
| 13   | 알림 딥링크 · 댓글 하이라이트                                                | ☐    |
| 14   | 404 페이지 · 파비콘 (404 완료, 파비콘 대기)                                  | 🔶   |

---

## 미결 / 대기

- **로그아웃 API** — 백엔드에 없다. 기능정의서 · API명세서에 추가 필요.
- **알림 드롭다운** — `UserMenu`에 자리표시만 있다. 백엔드 알림 API + 딥링크(13단계)와 함께 붙인다.
- **파비콘** — `{S}` SVG는 폰트가 없는 환경에서 fallback 렌더된다. 정확한 자형이 필요하면
  Geist 글리프를 path로 변환해야 한다(수동 작업).

---

## 확정된 제약

**댓글은 평문 저장** (`content: string`). 리치 에디터를 쓰지 않는다.
백엔드 `Comment.content`가 평문 한 필드이고 FR-5.4가 "순수 텍스트 댓글 구조만 유지"로 못 박았다.

- `@`/`#` 멘션은 본문 인라인이 아니라 `mentionedUserIds[]` / `mentionedEndpointIds[]` 별도 배열.
- 코드블록은 렌더 시 `react-markdown`으로 표시만 한다. 저장 형식은 안 바뀐다.
- 이미지 · 동영상 첨부는 스코프 밖.

**와이어프레임 v0.1과의 차이**

- 와이어프레임은 양쪽 사이드바 리사이즈 → 실제는 **왼쪽 고정 + 오른쪽만 리사이즈**.
- 와이어프레임은 프로젝트 생성/설정이 한 화면(2컬럼) → 실제는 **두 화면, 각 1컬럼**.

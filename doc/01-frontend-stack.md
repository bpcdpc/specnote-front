# 프론트엔드 기술 스택

| 버전 | 일시           | 변경 내용                                                                                                                                                                                                                                                                                                                                                                |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v0.1 | 2026.07.16 THU | 최초 작성. 스택, 구현 순서, 미결 항목 분리. 라틴 폰트 Inter → Geist.                                                                                                                                                                                                                                                                                                     |
| v0.2 | 2026.07.17 FRI | 폴더 구조 개편 반영. 구현 일정을 주 단위로 정리.                                                                                                                                                                                                                                                                                                                         |
| v0.3 | 2026.07.17 FRI | 상태 관리 원칙 명시 — 서버 데이터는 TanStack Query, 전역 Context는 테마와 로그인 유저뿐.                                                                                                                                                                                                                                                                                 |
| v0.4 | 2026.07.19 SUN | 구현 순서 갱신(project 화면 목 완료, `lib/types.ts`, `constants.ts` 생성). **Base UI 문법과 폼 작성 규칙을 `02-frontend-directories`로, shadcn 컴포넌트 커스텀 내역을 `04-design-tokens`로 이관.** 미결 항목 정리.                                                                                                                                                       |
| v0.5 | 2026.07.20 MON | 11단계 완료 반영. `react-resizable-panels`를 **v4 기준**으로 갱신(API가 v3에서 전부 바뀜), 리사이즈 대상을 양쪽 패널로 정정. 미결에서 로그아웃 API 줄 삭제, `GET /api/users/me` 부재 추가. 확정된 제약에 멘션 저장 형식 추가.                                                                                                                                            |
| v0.6 | 2026.07.29 WED | **문서 분할.** 이 문서는 스택, 세팅, 진행 상황만 갖는다. 상태 관리 원칙 → `08-state-and-data`, `react-resizable-panels` v4 주의 → `06-spec-detail-plan`, 확정된 제약(댓글 평문, 멘션 형식) → `09-comments-plan`. 미결 항목은 문서로 관리하지 않는다. 기술 스택에 HTTP 클라이언트와 개발 프록시 추가. 구현 순서에 배관 세부 표 신설.                                      |
| v0.7 | 2026.08.02 SUN | **배관 5(댓글)와 13단계(알림) 완료 반영.** 9단계 배관 표 전체 완료. 8단계의 "알림 드롭다운 미구현" 해소, 13단계 내용을 구현 결과(드롭다운·읽음·딥링크)로 갱신. 남은 미완은 14단계 파비콘뿐이다.                                                                                                                                                                          |
| v0.8 | 2026.08.17 MON | 7절의 **배포 구조 서술 정정** — "NestJS 한 대가 정적 파일까지 서빙"은 폐기된 원안이다(`10-deploy-plan`). 프론트 별도 App Service + Express 프록시로 바꾸되 "환경변수 분기를 두지 않는다"는 결론은 유지된다. 9단계 배관 4 설명을 스펙 조회 재설계 결과로 갱신, 배관 표 아래에 재설계로 다시 바뀐 부분 안내 추가. **14단계 파비콘 완료로 구현 순서 표 전체가 ✅ 가 됐다.** |

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
| HTTP            | `fetch` 래퍼 자체 구현 (`lib/api/client.ts`). axios 없음   |
| 인증            | JWT, `localStorage` 보관, 유효기간 15일                    |
| 리사이즈        | `react-resizable-panels` **v4** (좌우 패널 모두)           |
| 마크다운 렌더   | `react-markdown` (댓글 표시용, 저장은 평문)                |
| 폰트            | Geist(라틴) + Pretendard(한글), CDN                        |
| 다크모드        | `<html>`에 `.dark` 클래스 토글                             |

**HTTP 라이브러리를 넣지 않은 이유.** 필요한 것이 JWT 헤더 자동 첨부와 에러 형태 통일 둘뿐이다.
백엔드가 `HttpException` 서브클래스만 던져 실패 응답이 `{ statusCode, code?, message, error }`로
일정하므로, 응답을 `ApiError` 하나로 좁히는 데 30줄이면 된다. 인터셉터 체인이나 취소 토큰을
쓸 일이 없어 의존성 값이 안 나온다.

---

## 프로젝트 세팅 순서

**1. Vite 프로젝트 생성**

```bash
npm create vite@latest -- --template react-ts
```

`App.tsx`와 `App.css`는 삭제한다. `main.tsx`가 `RouterProvider`를 직접 렌더한다.

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

경로 별칭(4)이 먼저 잡혀 있어야 한다. init이 `components.json`, `lib/utils.ts`,
`index.css` 색 변수 블록을 생성하고 Base UI 프리미티브를 설치한다.

> `@fontsource-variable/geist`는 쓰지 않는다. 폰트는 CDN으로 불러온다.

**6. 디자인 토큰 — `src/styles/index.css`**

shadcn이 넣은 색 변수를 우리 토큰에 매핑하고 다크 방식과 폰트를 정리한다.
`components/ui/`의 버튼, 인풋 스타일 값도 이 단계에서 함께 맞춘다.
값과 대상 파일은 `04-design-tokens` 참조.

`main.tsx`에서 `import "@/styles/index.css";`.

**7. 개발 서버 프록시**

```ts
// vite.config.ts
server: {
  proxy: { "/api": "http://localhost:3000" },
}
```

API 경로는 항상 상대경로 `/api`다. 개발에서는 이 프록시가, 배포에서는 프론트 App Service의
Express가 백엔드로 넘긴다(`10-deploy-plan`). 브라우저가 보는 오리진은 어느 쪽이든 하나라
**환경변수 분기가 없다.** `VITE_API_URL` 같은 것을 두지 않는다.

> 원안은 NestJS 한 대가 프론트 정적 파일까지 서빙하는 것이었으나 폐기했다.
> 프록시 안으로 바뀌어도 `client.ts`의 상대경로와 이 절의 결론은 그대로다 —
> 바뀐 것은 `/api`를 넘겨주는 주체뿐이다.

**8. 단계별 추가 설치**

```bash
npm install @tanstack/react-query     # 9단계  — 데이터 배관
npm install react-resizable-panels    # 11단계 — 3컬럼 리사이즈 (v4)
npm install react-markdown            # 12단계 — 댓글 본문 렌더
```

셋 다 설치 완료.

---

## 구현 순서

| 단계 | 내용                                                                     | 상태 |
| ---- | ------------------------------------------------------------------------ | ---- |
| 0    | 디자인 토큰, 폰트, 다크 — `styles/index.css`                             | ✅   |
| 1    | shadcn 세팅, 토큰 매핑, 경로 별칭                                        | ✅   |
| 2    | 뼈대 배선 — `ThemeProvider` + `RouterProvider`                           | ✅   |
| 3    | 라우터 + stub 페이지                                                     | ✅   |
| 4    | 레이아웃 — `Header`, `Footer`, `BackButton`, 레이아웃 3종                | ✅   |
| 5    | 공용 UI — `MethodBadge`, `Logo`, `EmptyState`, `PageHeading`, `UserMenu` | ✅   |
| 6    | auth 화면 — 로그인, 회원가입                                             | ✅   |
| 7    | dashboard — 프로젝트 카드, 빈 상태                                       | ✅   |
| 8    | header — `UserMenu`, 알림 드롭다운                                       | ✅   |
| 8.5  | 타입 — `lib/constants.ts`, `lib/types.ts`                                | ✅   |
| 9    | 데이터 배관 — 목을 API로 교체 (아래 표)                                  | ✅   |
| 10   | project — 생성, 설정, 멤버                                               | ✅   |
| 11   | spec — 3컬럼, 사이드바, 상세, $ref 캐시, Try it, 갱신 배너               | ✅   |
| 12   | comments — 2뎁스 트리, 멘션, 리액션, AI 요약, 엔드포인트 단위 이동       | ✅   |
| 13   | 알림 — 드롭다운, 미확인 뱃지, 읽음 처리, 멘션 딥링크와 댓글 하이라이트   | ✅   |
| 14   | 404 페이지, 파비콘                                                       | ✅   |

6~12단계는 목 데이터 기준으로 화면을 먼저 세운 것이다. 실 API 연결은 9단계가 따로 맡는다.

13단계는 목 단계를 거치지 않았다. 알림은 8단계에서 자리만 비워둔 채 넘어갔고,
백엔드가 다 끝난 뒤라 처음부터 실 API로 붙였다.

### 9단계 세부 — 배관

목 데이터를 실 API로 갈아끼우는 작업. 화면 단위가 아니라 **도메인 단위**로 끊는다.
한 화면을 통째로 교체하면 그 화면이 쓰는 도메인 전부가 한 커밋에 들어와 되돌리기 어렵다.

| 배관 | 내용                                                                       | 상태 |
| ---- | -------------------------------------------------------------------------- | ---- |
| 0    | 타입 정리 — `UserRef`/`EndpointRef`, `MemberView`, `ReactionSummary.users` | ✅   |
| 1    | `lib/api/client.ts`, `queryClient.ts`, `QueryClientProvider`, Vite 프록시  | ✅   |
| 2    | auth — `AuthContext`, `RequireAuth`, 로그인, 회원가입, 로그아웃            | ✅   |
| 3    | projects — 대시보드, 생성, 설정, 멤버                                      | ✅   |
| 4    | spec — `SpecLayout` 게이트, 스펙 조회, 갱신 배너                           | ✅   |
| 5    | comments — 목록, 작성, 수정, 삭제, 리액션, AI 요약, 이동                   | ✅   |

`lib/mock.ts`는 배관 5와 함께 제거했다. 알림(13단계)에는 목 데이터가 없었다.

배관 4의 산출물은 이후 **스펙 조회 재설계**로 다시 바뀌었다. `GET /api/endpoints/:id`가
폐기되고 스펙 전량이 한 응답으로 오며, 배너 새로고침이 무효화가 아니라 앵커 이동이 됐다.
전제와 규약은 `08-state-and-data`의 스펙 앵커 절, 달라진 목록은 `06-spec-detail-plan`의
재설계 이후 절.

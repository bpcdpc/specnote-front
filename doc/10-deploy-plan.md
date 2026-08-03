# 프론트엔드 배포

> **프론트를 백엔드와 분리해 별도 Azure App Service에 올린다.**
> 백엔드가 정적 파일까지 서빙하던 원안(NFR-3)을 대체한다.

| 버전 | 일시           | 변경 내용                                                                                                      |
| ---- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| v0.1 | 2026.08.03 MON | 최초 작성. 배포 방식을 백엔드 동봉에서 별도 App Service + `/api` 프록시로 전환. 원안 및 CORS 안과의 비교 포함. |

> 스택과 구현 순서는 `01-frontend-stack`, API 함수 레이어는 `08-state-and-data`,
> 라우트 정의는 `02-frontend-directories`.

---

## 결정

**프론트 전용 App Service를 만들고, 그 안의 Express가 `/api`를 백엔드로 프록시한다.**

브라우저 입장에서 오리진은 여전히 하나다. `client.ts`의 상대경로 `/api`가 그대로 살아 있고,
환경변수 분기도 생기지 않는다(`08-state-and-data`의 `client.ts` 절).

```
브라우저 ──/api/*──▶ 프론트 App Service ──프록시──▶ 백엔드 App Service
         └─그 외──▶ dist 정적 파일 / index.html
```

### 왜 원안을 버렸나

원안은 NestJS가 `dist`를 함께 서빙하는 것이었다. 백엔드 코드를 실측한 결과
**필요한 것이 하나도 붙어 있지 않았다.**

- `package.json`에 `@nestjs/serve-static` 없음
- `app.module.ts`에 해당 모듈 없음
- `main.ts`에 `useStaticAssets` 없음

즉 원안은 "이미 되어 있는 것"이 아니라 지금부터 만들어야 하는 것이고,
그 작업(의존성 추가, 모듈 등록, `exclude` 설정, `dist` 반입 경로)이 전부 백엔드 변경이다.
**추가 백엔드 PR이 불가한 현재 제약과 부딪힌다.**

레포가 둘로 갈려 있어 프론트 빌드 산출물을 백엔드 레포로 옮기는 경로도 따로 필요하고,
프론트 문구 하나를 고쳐도 API 서버가 재시작된다.

### 왜 CORS 안이 아닌가

`main.ts`에 `enableCors`가 이미 있고 `origin`이 배열이라,
프론트 URL 한 줄만 추가하면 되는 안도 있었다.

```ts
origin: ['http://localhost:5173'],
```

**백엔드 변경이 한 줄로 끝나는 대신 프론트가 더 바뀐다.** `client.ts`의 `BASE`를
환경변수로 빼야 하고, "환경변수 분기를 두지 않는다"는 규약(`01-frontend-stack` 7절,
`08-state-and-data`)이 뒤집힌다.

프록시 안은 서버-투-서버 호출이라 **CORS 검사 자체가 일어나지 않는다.**
백엔드는 손대지 않고 `src/` 아래 애플리케이션 코드도 그대로다.

### 감수하는 것

- **홉이 하나 늘고 프록시가 단일 장애점이 된다.** 프록시가 죽으면 API 전체가 죽는다.
- **프록시 규칙이 두 군데에 산다.** 개발은 `vite.config.ts`의 `server.proxy`,
  배포는 `server/index.js`. 백엔드 라우트 prefix가 바뀌면 양쪽을 고쳐야 한다.
- **신규 인프라를 데모 직전에 도입한다.** 로컬 검증(3단계)을 건너뛰면 안 되는 이유다.

---

## `vite.config.ts`는 건드리지 않는다

`server.proxy`는 **`vite dev`가 띄우는 개발 서버 전용**이다. `vite build`는 이 설정을
읽지 않고 `dist/`에 프록시가 들어가지도 않는다. 배포된 App Service에는 Vite가 실행되지 않는다.

target을 프로덕션 주소로 바꾸면 로컬 개발이 프로덕션 백엔드를 때릴 뿐이고,
배포 환경은 아무것도 달라지지 않는다. **`localhost:3000` 유지가 맞다.**

`vite preview`도 `server.proxy`를 보지 않는다(`preview.proxy`가 별도로 있다).
`npm run preview`로는 프록시 검증이 안 된다.

---

## `server/index.js`

ESM 기준. `package.json`에 `"type": "module"`이 없으면 파일명을 `index.mjs`로.

```js
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");
const ASSETS = path.join(DIST, "assets");
const INDEX = path.join(DIST, "index.html");

const API_ORIGIN = process.env.API_ORIGIN;
if (!API_ORIGIN) {
  console.error("API_ORIGIN 환경변수가 없습니다.");
  process.exit(1);
}

const app = express();

// 1. /api → 백엔드
app.use(
  createProxyMiddleware({
    pathFilter: "/api",
    target: API_ORIGIN,
    changeOrigin: true,
    xfwd: true,
  }),
);

// 2. dist 정적 파일
app.use(
  express.static(DIST, {
    index: false,
    setHeaders(res, filePath) {
      res.setHeader(
        "Cache-Control",
        filePath.startsWith(ASSETS)
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      );
    },
  }),
);

// 3. SPA fallback
app.use((req, res) => {
  if (req.method !== "GET") {
    res.status(404).json({ message: "Not Found" });
    return;
  }
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(INDEX);
});

const port = process.env.PORT ?? 8080;
app.listen(port, () => {
  console.log(`specnote-front :${port} → ${API_ORIGIN}`);
});
```

```json
"dependencies": {
  "express": "^5.1.0",
  "http-proxy-middleware": "^3.0.5"
}
```

**`devDependencies`가 아니다.** App Service는 프로덕션 설치를 한다.

### 설계 근거

**순서가 규칙의 전부다.** 프록시 → 정적 → fallback.
fallback이 앞으로 가면 `/assets/index-a3f2b1.js`에도 HTML이 돌아와 앱이 뜨지 않는다.
프록시가 fallback 뒤로 가면 API 응답이 HTML이 된다.

**`pathFilter`를 쓰고 `app.use("/api", ...)`를 쓰지 않는다.** Express는 마운트 경로를
`req.url`에서 잘라낸다. `app.use("/api", proxy)`면 백엔드에 `/projects`가 도착하는데
백엔드는 `setGlobalPrefix('api')`라 전부 404다. `pathFilter`는 루트에 마운트하고
필터만 걸어 경로가 온전히 간다.

**`changeOrigin: true`** — Azure App Service는 Host 헤더로 사이트를 라우팅한다.
없으면 프론트 호스트명이 실려가 백엔드에 도달하지 못한다.

**`API_ORIGIN` 없으면 부팅을 막는다.** 없는 채로 뜨면 정적 파일만 뿌리고 API는 전부
`index.html`을 돌려주는 최악의 형태가 된다. 화면은 뜨는데 전부 실패하는 상태라
원인을 찾기 어렵다.

**`index: false`** — `express.static`이 `/`에서 `index.html`을 자동으로 주면
캐시 헤더 분기가 두 군데로 갈린다. fallback 한 곳에서만 처리한다.

**`assets/*`만 영구 캐시한다.** 파일명에 해시가 있어 안전하다.
파비콘 등은 이름이 고정이라 캐시하면 교체가 안 먹는다.

---

## 단계

| 순  | 내용                                                                                          |
| --- | --------------------------------------------------------------------------------------------- |
| 1   | 백엔드 App Service 기본 도메인 확인 (`https://<이름>.azurewebsites.net`)                      |
| 2   | 프론트 레포에 `server/index.js` + 의존성 2개 추가                                             |
| 3   | **로컬 검증** — 빌드 후 직접 실행                                                             |
| 4   | 배포 패키지 zip — `dist/`, `server/`, `package.json`, `node_modules/`                         |
| 5   | App Service 생성 — Linux / Node 20 LTS / 백엔드와 같은 리전                                   |
| 6   | 설정 — 시작 명령, `API_ORIGIN`, `SCM_DO_BUILD_DURING_DEPLOYMENT=false`, HTTPS Only, Always On |
| 7   | `az webapp deploy --type zip` + 로그 스트림으로 부팅 확인                                     |
| 8   | 배포 후 검증 (아래 체크리스트)                                                                |

### 3단계 — 로컬 검증

```bash
npm run build
API_ORIGIN=https://<백엔드>.azurewebsites.net PORT=8080 node server/index.js
```

**이 단계를 건너뛰지 않는다.** 여기서 프록시와 fallback이 모두 검증되면
배포는 옮기는 일만 남는다. App Service에서 처음 돌리면 실패 원인이
코드인지 인프라 설정인지 갈리지 않는다.

### 4단계 — `node_modules`를 함께 넣는 이유

Oryx(App Service 빌드)를 켜면 `npm install` 후 `npm run build`(= `vite build`)를
실행하려 드는데, 프로덕션 설치라 devDependencies가 없어 Vite가 없고 실패한다.
빌드를 껐는데 `node_modules`도 없으면 `express`를 못 찾아 부팅이 안 된다.
의존성이 2개뿐이라 통째로 넣는 편이 확실하다.

### 6단계 — 설정 값

| 항목                             | 값                                   |
| -------------------------------- | ------------------------------------ |
| 시작 명령                        | `node server/index.js`               |
| `API_ORIGIN`                     | 백엔드 App Service URL               |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false`                              |
| HTTPS Only                       | 켬                                   |
| Always On                        | 켬 (콜드 스타트가 데모에서 체감된다) |

---

## 검증 체크리스트

**주소창에 직접 입력해서 확인한다.** 앱 안에서 링크를 클릭한 것은 서버 요청이
나가지 않아 fallback 통과 여부를 알 수 없다.

| 항목                                       | 확인하는 것                                                           |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `/projects/:id/spec/:endpointId` 직접 진입 | fallback + `SpecLayout` 게이트 재조회                                 |
| 로그인 → 대시보드                          | 프록시 + `Authorization` 헤더 통과                                    |
| 알림 멘션 딥링크 (새 탭)                   | 13단계 경로. 새 탭 진입이 정상 흐름이라 fallback 없으면 기능이 죽는다 |
| 미인증 딥링크 진입                         | `RequireAuth` 리다이렉트, 로그인 후 복귀                              |
| 스펙 커밋 → 갱신 배너                      | 스냅샷 비교                                                           |
| AI 요약                                    | 백엔드 Azure AI 환경변수 3종                                          |
| 오타 경로 (`/prjects/3`)                   | React Router `path="*"` (14단계)                                      |

`curl -I <URL>/projects/1/spec`로 200이 오는지 보면 더 확실하다.

### fallback의 부작용

서버는 **어떤 경로든 200 + HTML**을 반환한다. 진짜 404 판정은 서버가 아니라
React Router의 `path="*"`가 한다. 14단계에서 404 페이지가 이미 완료라 충족되어 있다.

---

## 함정

**Express 5** — `npm i express`는 v5를 깐다. v5에서 `app.get("*", ...)`는
부팅 시점에 예외를 던진다(path-to-regexp v8이 이름 없는 와일드카드를 거부).
검색으로 나오는 예제 대부분이 v4 기준이다. `app.use((req, res) => ...)`로 쓴다.

**http-proxy-middleware v3** — v2와 옵션 이름이 다르다. 옛 예제 복붙이 안 먹는다.

**Oryx 자동 빌드** — 4단계. 가장 자주 터지는 지점이다.

**PM2 방식은 안 된다** — Linux Node 16 이상에서 PM2가 빠져
`pm2 serve --spa`를 쓰는 옛 절차는 막힌다. 시작 명령에 `npx serve`를 쓰는 것도
부팅 때 네트워크를 타서 위험하다.

---

## 이 문서가 다루지 않는 것

| 항목                  | 이유                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| 백엔드 배포           | 이미 완료. `AZURE_AI_*` 3종은 없으면 부팅 자체가 실패한다(`09-backend-functions` 6절)     |
| Try it out의 CORS     | 브라우저가 대상 API로 직접 쏘는 구조라 이 결정과 무관하다(NFR-7). 대상 서버 설정에 달렸다 |
| 백엔드 `enableCors`   | 프록시는 서버-투-서버라 검사가 없다. `origin: ['http://localhost:5173']` 그대로 둔다      |
| GitHub Actions        | zip 배포가 한 번 성공한 뒤에 붙인다                                                       |
| 커스텀 도메인, 인증서 | 스코프 밖                                                                                 |

---

## 문서 충돌

이 결정으로 다음 서술이 사실과 어긋난다. **수정은 별도 판단으로 남긴다.**

| 문서                         | 위치           | 내용                                              |
| ---------------------------- | -------------- | ------------------------------------------------- |
| `01-overview`                | 10절, 12절     | "빌드 후 NestJS 프로젝트 내부에 정적 파일로 포함" |
| `03-functional-requirements` | NFR-3, NFR-4   | "단일 서버(단일 URL)로 서빙"                      |
| `01-frontend-stack`          | 7절            | "배포는 NestJS 한 대가 프론트 정적 파일까지 서빙" |
| `08-state-and-data`          | `client.ts` 절 | 같은 문장                                         |

**NFR-4("그 외 경로는 `index.html` 반환")는 그대로 유효하다.** 주체가
NestJS에서 프론트 App Service의 Express로 바뀌었을 뿐, 요구사항 자체는 충족된다.

`10-api-specifications` 0-1절의 같은 문장도 백엔드 관점에서는 여전히 맞다 —
`/api` prefix는 바뀌지 않았다.

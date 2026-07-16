# SpecNote — Frontend

OpenAPI 스펙을 팀이 함께 보며 엔드포인트 단위로 리뷰하는 협업 도구.
왼쪽에서 엔드포인트를 고르고, 가운데에서 스펙을 읽고 Try it으로 실제 요청을 보내고,
오른쪽에서 댓글·멘션·리액션으로 논의한다.

> 백엔드는 별도 레포에서 관리한다. 배포 시 이 프론트의 빌드 산출물을 백엔드가 정적 파일로 서빙한다.

---

## 기술 스택

- **빌드** Vite + React + TypeScript
- **스타일** Tailwind CSS v4
- **컴포넌트** shadcn/ui (Base UI · Nova 프리셋 · Lucide)
- **라우팅** React Router (`createBrowserRouter`)
- **서버 상태** TanStack Query · **클라이언트 상태** Context
- **폰트** Geist(라틴) + Pretendard(한글)

---

## 시작하기

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173` 에서 실행된다.

### 백엔드 연동

API 요청은 `/api` 프리픽스를 사용한다.
개발 중에는 Vite proxy 또는 백엔드 서버를 함께 띄워 `/api` 요청을 백엔드로 넘긴다.

---

## 스크립트

| 명령              | 설명                    |
| ----------------- | ----------------------- |
| `npm run dev`     | 개발 서버               |
| `npm run build`   | 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run lint`    | ESLint                  |

---

## 폴더 구조

```
src/
├── app/          라우터 · 레이아웃 · 전역 Provider(테마 등)
├── features/     도메인별 기능 (auth · dashboard · project · spec · comments · notifications)
├── components/   도메인 모르는 순수 UI (shadcn ui 포함)
├── lib/          배관 (api client · query client · 유틸)
└── styles/       디자인 토큰 (index.css)
```

배치 기준: 서버 데이터를 다루거나 도메인을 알면 `features/`, 그렇지 않으면 `components/`.
자세한 내용은 [`docs/02-frontend-directories`](./docs/02-frontend-directories-v0_1.md).

---

## 문서

설계 문서는 [`/docs`](./docs) 에 있다.

| 문서                      | 내용                                       |
| ------------------------- | ------------------------------------------ |
| `01-frontend-stack`       | 기술 스택 · 프로젝트 세팅 순서 · 구현 순서 |
| `02-frontend-directories` | 폴더 구조 · 배치 원칙                      |
| `03-frontend-layouts`     | 라우트 · 레이아웃 · 헤더/푸터 · 반응형     |
| `04-design-tokens`        | 색 · 폰트 · Tailwind 유틸                  |

프로젝트 전반(개요 · 기능 요구사항 · API 명세 · ERD)은 백엔드 레포의 `/doc` 참조.

---

## 컨벤션

- 커밋 · PR 병합은 **squash and merge**.
- 문서는 한국어로 작성하고 버전(v0.x)으로 관리한다.
- 디자인 토큰(`--sn-*`)을 통해 색을 다루고, 컴포넌트에 색을 직접 박지 않는다.
- 다크 모드는 `<html>`의 `.dark` 클래스로 토글한다.

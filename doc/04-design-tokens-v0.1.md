# 디자인 토큰

| 버전 | 일시 | 변경 내용 |
| --- | --- | --- |
| v0.1 | 2026.07.16 THU | 최초 작성. `프론트엔드 아키텍처 v0.5` 통합본에서 디자인 토큰을 분리. |

관련 문서
- `01-frontend-stack` — 기술 스택 · 구현 순서
- `02-frontend-directories` — 폴더 구조 · 배치 원칙
- `03-frontend-layouts` — 라우트 · 레이아웃 · 반응형

정의 위치: `src/styles/index.css`

---

## 색

| 용도 | 라이트 | 다크 |
| --- | --- | --- |
| 표면 1 (카드 · 헤더) | `#ffffff` | `#11131e` |
| 표면 2 (페이지 배경) | `#f6f6f6` | `#1c2132` |
| 표면 3 (강조 배경) | `#e7e7e7` | `#2f354a` |
| 텍스트 1 (본문) | `#2a2f45` | `#ffffff` |
| 텍스트 2 (보조) | `#757575` | `#b2bac2` |
| 텍스트 3 (흐림) | `#8e8e8e` | `#6e748b` |
| 강조 (로열블루) | `#4571f5` | `#4571f5` |
| 강조 hover | `#3560e0` | `#6a8bfa` |
| 강조 틴트 배경 | `#e9eefe` | `rgba(69,113,245,.18)` |
| 강조 틴트 텍스트 | `#2f52c9` | `#aec2fe` |
| 보더 | `rgba(0,0,0,.1)` | `rgba(255,255,255,.1)` |

**배경 팔레트는 Scalar의 값을 그대로 쓴다.** 밀도 높은 개발자 툴에 검증된 중립 3단계다.

**강조색이 로열블루인 이유** — 메서드 색과 충돌하지 않아야 한다.
Scalar의 강조색은 크림슨(`#e0234d`)인데, DELETE 레드와 시각적으로 싸운다.
로열블루(`#4571f5`)는 POST 블루(`#378add`)와 톤이 충분히 달라 구분된다.

---

## HTTP 메서드 색

라이트 · 다크 **공통**. 솔리드 뱃지(배경 채움 + 흰 글자).

| 메서드 | 색 |
| --- | --- |
| GET | `#639922` |
| POST | `#378add` |
| PUT | `#ba7517` |
| PATCH | `#1d9e75` |
| DELETE | `#e24b4a` |

이 색 매핑(GET 초록 · POST 파랑 · DELETE 빨강)은 Swagger UI · Postman · Stoplight 등이
공유하는 **업계 관례**다. 차별화를 위해 바꾸면 사용자 학습 비용만 늘어난다.

---

## 폰트

```
Inter (라틴) → Pretendard (한글) → system-ui
```

둘 다 CDN. Inter는 Google Fonts, Pretendard는 jsDelivr.
`@import`는 CSS 파일 **최상단**에 있어야 적용된다.

---

## 다크 모드

`<html>`에 **`.dark` 클래스**를 붙였다 뗀다 (shadcn 생태계 표준).
`ThemeContext`가 토글하고 `localStorage`에 저장한다.
저장값이 없으면 OS 설정(`prefers-color-scheme`)을 따른다.

```css
@custom-variant dark (&:where(.dark, .dark *));

:root { --sn-surface-1: #ffffff; ... }
.dark { --sn-surface-1: #11131e; ... }
```

색은 전부 `--sn-*` 변수로 두고, `.dark`에서 **값만 교체**한다.
컴포넌트는 `bg-surface-1` 하나만 쓰면 되고 다크 대응을 따로 하지 않는다.

---

## Tailwind 유틸

### SpecNote 자체

| 유틸 | 값 |
| --- | --- |
| `bg-surface-1` `bg-surface-2` `bg-surface-3` | 표면 3단계 |
| `text-fg-1` `text-fg-2` `text-fg-3` | 텍스트 3단계 |
| `bg-get` `bg-post` `bg-put` `bg-patch` `bg-delete` | 메서드 색 |
| `bg-avatar` | 아바타 배경 (로열블루) |
| `rounded-card` | 12px |
| `rounded-ctl` | 7px |

### shadcn 매핑

shadcn 컴포넌트가 쓰는 색 이름을 우리 토큰에 연결해 둔다.
그래서 `<Button>` 등이 컴포넌트 코드를 고치지 않아도 우리 색으로 나온다.

| shadcn 유틸 | 연결된 값 |
| --- | --- |
| `bg-primary` | 로열블루 `#4571f5` — **강조색 채움** |
| `bg-accent` | 옅은 로열블루 틴트 — **은은한 배경** |
| `bg-background` `bg-card` `bg-popover` | 표면 1 |
| `bg-muted` `bg-secondary` | 표면 2 |
| `text-muted-foreground` | 텍스트 2 |
| `border-border` `border-input` | 보더 |
| `ring` (포커스 링) | 로열블루 |
| `bg-destructive` | `#e24b4a` (DELETE 레드와 통일) |

> **혼동 주의**: shadcn 관례에서 `accent`는 "강조색"이 아니라 **"은은한 hover 배경"**이다.
> 강조색 채움 버튼은 `bg-primary`. `bg-accent`를 쓰면 옅은 틴트가 나온다.

---

## 밀도 · 모서리

- 카드 radius **12px** (`rounded-card`)
- 컨트롤(버튼 · 입력) radius **7px** (`rounded-ctl`)
- 헤더 높이 **52px** (모바일 2행 시 약 96px)
- 푸터 높이 **32px** (`h-8`)

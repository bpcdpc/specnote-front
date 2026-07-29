# 디자인 토큰

| 버전 | 일시           | 변경 내용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1 | 2026.07.16 THU | 최초 작성. 라틴 폰트 Inter → Geist. 한글 타이포그래피 규칙 추가.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v0.2 | 2026.07.17 FRI | 팔레트 전면 교체 — Scalar 남색 → Vercel 블랙 계열, 강조색 로열블루 → Vercel Blue. radius 3px 통일. 메서드 뱃지를 라이트=솔리드 / 다크=아웃라인으로 분리.                                                                                                                                                                                                                                                                                                                                                                                |
| v0.3 | 2026.07.17 FRI | 버튼 역할 3분할 — primary(파랑 채움), ghost(hover 시 글씨 파랑), 아이콘 버튼(outline). hover 배경 2단계 분리. 로고 확정.                                                                                                                                                                                                                                                                                                                                                                                                                |
| v0.4 | 2026.07.19 SUN | **Vercel Docs 톤으로 전면 재조정.** 표면을 순검정/순백 단색 통일(구분은 보더만). 인풋 전용 토큰 신설. 강조색 3단계 유틸 신설. **CTA를 무채색 채움으로 전환**(파랑 폐기). 버튼 기본을 outline으로, 높이 `h-10` 통일. 아이콘 버튼 보더 제거. radius 컨트롤 6px / 카드 12px. 헤더 보더는 스크롤 시에만.                                                                                                                                                                                                                                    |
| v0.5 | 2026.07.20 MON | **메서드 뱃지 전면 개정** — 색 5종 교체, 라이트=솔리드 / 다크=색 글자 + 같은 색 반투명 배경. v0.4의 "박스 없음" 방침 폐기. 가운데 정렬, 표시용 `uppercase` 명시(저장값은 소문자). `FallbackBadge` 신설. 좌측 사이드바 리사이즈 구분선 항목 추가, 우측 댓글 패널 `border-l` 폐기.                                                                                                                                                                                                                                                        |
| v0.6 | 2026.07.29 WED | **`index.css` 실측과 동기화** — 보더, 인풋 보더, 호버 2단계 값이 v0.5 이후 조정된 것을 반영. 문서에 없던 토큰 4종 추가(`--sn-input-border-focus`, `--radius-card`/`--radius-ctl`, `comment-highlight`, 전역 `overscroll-none`). `destructive`가 DELETE 색과 다른 별도 값임을 명시. 다크 메서드 배경 알파를 10% → **15%(`26`)** 로 정정. **인풋 에러 상태 규칙 신설.** radius 표에서 `--radius-lg` 공란을 채우고 `rounded-full` 예시에서 "멤버 칩" 삭제(구현이 `rounded-lg` 두 줄 카드로 바뀜). 표기 규칙에 따라 가운뎃점을 쉼표로 정리. |

정의 위치: `src/styles/index.css`

---

## 원칙

- **색을 아낀다.** 위계는 보더 + 텍스트 3단계 + 여백으로 만든다.
- **면을 나누지 않는다.** 페이지와 카드가 같은 색이고, 구분은 **보더**가 전담한다.
- **CTA는 파랑이 아니라 무채색 채움**이다.

| 파랑을 쓴다           | 파랑을 쓰지 않는다 |
| --------------------- | ------------------ |
| 입력 포커스 링        | CTA, primary 버튼  |
| 링크                  | 아바타             |
| 선택된 항목 표시      | 보조, 아이콘 버튼  |
| OWNER 뱃지, 본인 뱃지 | 카드 강조          |

화면당 파란 요소 몇 개(카드 목록의 OWNER 뱃지 등)는 허용한다. 금지가 아니라 남발 금지다.

---

## 표면과 텍스트

| 용도                         | 토큰                      | 라이트    | 다크      |
| ---------------------------- | ------------------------- | --------- | --------- |
| 표면 1 (카드, 헤더, 패널)    | `--sn-surface-1`          | `#ffffff` | `#000000` |
| 표면 2 (페이지 배경)         | `--sn-surface-2`          | `#ffffff` | `#000000` |
| 표면 3 (선택된 항목)         | `--sn-surface-3`          | `#f2f2f2` | `#242424` |
| 호버 (ghost, 카드, 드롭다운) | `--sn-hover-ghost`        | `#f4f4f4` | `#1c1c1c` |
| 호버 (아이콘 버튼, 목록 행)  | `--sn-hover-icon`         | `#ebebeb` | `#212121` |
| 텍스트 1 (본문)              | `--sn-fg-1`               | `#171717` | `#ededed` |
| 텍스트 2 (보조)              | `--sn-fg-2`               | `#666666` | `#a1a1a1` |
| 텍스트 3 (흐림, 캡션)        | `--sn-fg-3`               | `#8f8f8f` | `#737373` |
| 보더                         | `--sn-border`             | `#cbcbcb` | `#313131` |
| 보더 (인풋)                  | `--sn-input-border`       | `#d4d4d4` | `#303030` |
| 보더 (인풋 포커스)           | `--sn-input-border-focus` | `#8f8f8f` | `#737373` |
| 배경 (인풋)                  | `--sn-input-bg`           | `#fafafa` | `#000000` |

- **표면 1 = 표면 2다.** 토큰을 둘로 유지하는 건 나중에 다시 갈라야 할 때 컴포넌트를 안 고치기 위해서다.
- 다크 본문은 순백이 아닌 `#ededed`. 순수 블랙 위의 순백은 대비가 과하다.
- **인풋 보더는 일반 보더보다 한 단 옅다.** 라이트는 더 밝게(`#d4d4d4` > `#cbcbcb`),
  다크는 더 어둡게(`#303030` < `#313131`). 방향은 반대지만 "덜 드러난다"는 뜻은 같다.
  다크 인풋 배경이 표면과 같은 순검정이라 구분은 보더가 전담한다.
- **"보더는 접근성상 반드시 있어야 한다"는 근거로 쓰지 않는다.**
  WCAG 1.4.11은 UI 컴포넌트 경계에 3:1을 요구하는데, 순검정 대비로 현재 다크 보더 값은
  거기에 못 미친다. 통과시키려면 눈에 띄게 밝은 회색까지 올려야 하고 그러면 Vercel Docs 톤이
  깨진다. 지금은 시각적 톤을 우선해 미달을 감수하고 있다. 올릴지 말지는 별도 판단으로 남긴다.
  포커스 링(파랑)은 이 대비와 무관하게 별도로 작동한다.

---

## 강조 — Vercel Blue 3단계

| 단계         | 유틸                                        | 라이트    | 다크      | 쓰는 곳                             |
| ------------ | ------------------------------------------- | --------- | --------- | ----------------------------------- |
| subtle(흐림) | `bg-accent-subtle`                          | `#e8f0fe` | `#10243f` | 뱃지, 태그 배경, 댓글 하이라이트    |
| muted(중간)  | `text-accent-muted` `bg-accent-muted`       | `#7aa7f0` | `#2d5a9e` | 보조 강조                           |
| strong(원색) | `text-accent-strong` `border-accent-strong` | `#0070f3` | `#0070f3` | 글자, 아이콘, 보더, 링크, 포커스 링 |
| hover        | `text-accent-hover`                         | `#0060d9` | `#3291ff` | 강조 요소 hover                     |

원색은 라이트와 다크가 같고 hover만 방향이 반대다(밝은 배경에선 어둡게, 어두운 배경에선 밝게).

**뱃지 패턴** — OWNER 뱃지, 본인 뱃지가 공유한다.

```
rounded-full bg-accent-subtle text-accent-strong
px-2.5 py-0.5 text-[10px] font-semibold tracking-wide
```

**댓글 하이라이트** — 13단계 딥링크가 쓴다. `subtle`에서 투명으로 빠지는 키프레임이
`index.css` 하단에 정의돼 있다.

```css
@keyframes comment-highlight {
  from {
    background-color: var(--color-accent-subtle);
  }
  to {
    background-color: transparent;
  }
}
```

---

## 메서드 뱃지

**라이트는 솔리드(색 배경 + 흰 글자), 다크는 색 글자 + 같은 색 반투명 배경.**
v0.4의 "박스 없음, 컬러 텍스트만" 방침은 폐기했다. 목록에서 메서드가 세로로 늘어설 때
컬러 텍스트만으로는 스캔이 안 되고, 짧은 이름(GET)과 긴 이름(DELETE)의 무게가 어긋난다.

| 메서드 | 라이트(배경) | 다크(글자) |
| ------ | ------------ | ---------- |
| GET    | `#067a2e`    | `#00cf39`  |
| POST   | `#0066cc`    | `#00a4ff`  |
| PUT    | `#007a78`    | `#00f1f0`  |
| PATCH  | `#9a3beb`    | `#d16eff`  |
| DELETE | `#d6006a`    | `#ff358d`  |

- 라이트 = 위 색을 배경(`--sn-*-bg`)으로 깔고 글자(`--sn-*-fg`)는 흰색.
- 다크 = 위 색을 글자로 쓰고 배경은 **같은 색 + 알파 `26`(약 15%)**.
  순검정 위에서 솔리드는 너무 튄다.
- `--sn-*-border`는 전부 `transparent`다. 배경이 있으면 보더가 이중선이 된다.
  토큰 자체는 남겨 두되 값은 투명이다.
- **가운데 정렬**한다. 솔리드 박스에서 왼쪽 정렬이면 GET처럼 짧은 메서드가 왼쪽에 쏠려 보인다.
- 뱃지 폭은 `min-w-[52px]`로 맞춰 목록에서 경로가 세로 정렬되게 한다.
- `MethodBadge`에 분기가 없다. CSS 변수만 참조하고 `.dark`에서 값만 바뀐다.

### 대소문자

**저장값은 소문자, 표시만 대문자다.**
OAS Path Item Object의 키가 소문자이고 `spec-extractor`가 그대로 저장한다.
뱃지가 `uppercase` 클래스로 표시할 때만 올린다. 호출부에서 `toUpperCase()`를 부르지 않는다.

### `FallbackBadge`

`head`, `options`, `trace` 등 5종 밖의 메서드는 **무채색**으로 렌더한다.

```
bg-surface-3 text-fg-2
```

관례가 없는 메서드에 임의로 색을 주면 5종의 색 규칙이 흐려진다.
"이 색은 무슨 뜻인가"에 답할 수 없는 색은 넣지 않는다.
좁히기 규칙(`isHttpMethod` 가드로 갈라 폴백)은 `05-code-conventions`.

### 업계 관례와 어긋나는 두 곳

- **PUT 시안** — Swagger UI는 주황이다.
- **PATCH 보라** — Swagger UI는 민트다.

색상환에서 5종이 고르게 벌어지는 배치를 우선했다. GET 초록, POST 파랑, DELETE 빨강은
관례를 따르므로 오독 위험이 큰 세 개는 지켜진다. 관례를 어긴 것은 의도이며,
다르게 보인다는 지적이 들어오면 이 항목을 근거로 재논의한다.

---

## 버튼

**기본은 outline이고, CTA만 채운다. 채움은 파랑이 아니라 무채색이다.**

| 종류        | variant      | 스타일                                                        | 쓰는 곳                  |
| ----------- | ------------ | ------------------------------------------------------------- | ------------------------ |
| CTA         | `default`    | 다크=흰 채움/검은 글자, 라이트=검은 채움/흰 글자. hover `/80` | 화면의 주 액션, 보통 1개 |
| 보조        | `outline`    | 보더만. 배경 없음. hover 시 배경 옅게                         | 그 외 텍스트 버튼        |
| 아이콘 버튼 | `IconButton` | 보더와 배경 없음. hover 시 `--sn-hover-icon` 배경             | `⚙` `✕` 패널 토글 등     |

- CTA hover는 별도 색이 아니라 **불투명도**(`bg-primary/80`)다. 배경이 비쳐 톤이 뜨고,
  라이트/다크에 hover 색을 따로 정의할 필요가 없다.
- 컨트롤 높이는 **`h-10`(40px)** 통일. 버튼과 인풋이 같아야 나란히 놓았을 때 안 어긋난다.
  화면의 주인공이 되는 입력(프로젝트 생성의 스펙 URL)만 그 화면에서 `h-12`.
- 아이콘 버튼은 보더를 두지 않는다(v0.3의 outline 방침을 뒤집음). 포커스 링만 유지.
  공용 `components/IconButton.tsx`를 쓴다. 사용 규칙은 `07-components`.
- 버튼에 `cursor: pointer`를 넣지 않는다 — 네이티브 커서를 따른다(Base UI, shadcn 기본).

> **구현**: `components/ui/button.tsx` — `size.default`를 `h-10 px-3`으로,
> 공통 radius `rounded-md`, `outline` variant의 기본 배경 제거(`bg-transparent`,
> 다크 `bg-input/30` 삭제).

**hover 배경 2단계**

| 토큰               | 용도                       | 라이트    | 다크      |
| ------------------ | -------------------------- | --------- | --------- |
| `--sn-hover-ghost` | ghost 버튼, 카드, 드롭다운 | `#f4f4f4` | `#1c1c1c` |
| `--sn-hover-icon`  | 아이콘 버튼, 목록 행       | `#ebebeb` | `#212121` |

**링크로 이동하는 버튼**

`Button`을 쓰지 말고 `<Link>`에 버튼 스타일을 직접 입힌다. 의미상 `<a>`가 맞고,
Base UI는 `render`에 `<a>`를 넘기면 `nativeButton` 경고를 낸다(`05-code-conventions`).

```tsx
<Link
  to="/projects/new"
  className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-3
             text-sm font-medium text-primary-foreground hover:bg-primary/80"
>
  새 프로젝트
</Link>
```

---

## 인풋

| 항목    | 값                                                        |
| ------- | --------------------------------------------------------- |
| 높이    | `h-10` (버튼과 동일)                                      |
| radius  | `rounded-md` (6px)                                        |
| 보더    | `border-input-border` — 버튼 보더보다 옅게, **항상 표시** |
| 배경    | `bg-input-bg` — 아주 옅게                                 |
| 포커스  | **링 없음.** 보더만 `--sn-input-border-focus`로 진해진다  |
| invalid | 보더만 `--destructive`. 링 없음                           |

링(ring)은 요소 바깥으로 번져 촘촘한 폼에서 서로 간섭한다. 보더 색만 바꾸면
레이아웃이 흔들리지 않고 변화도 충분히 읽힌다.

포커스에 일반 `--border`가 아니라 **전용 토큰**을 쓴다. 일반 보더를 재사용하면
평상시 인풋 보더(`#d4d4d4`)와 차이가 한 단뿐이라 포커스가 들어왔는지 안 읽힌다.

### 에러 상태 — 인풋 보더와 문구까지만

붉게 물드는 범위는 **인풋 보더**와 **그 아래 에러 문구** 둘뿐이다. 라벨은 그대로 둔다.

- `aria-invalid`는 **인풋에만** 준다.
- `Field`에 `data-invalid`를 주지 않는다. 주면 `FieldLabel`까지 destructive로 물든다.
- 에러 문구는 `role="alert"` + `text-sm text-destructive`. 인풋 바로 아래에 둔다.
- 문구가 없어졌다 생기며 아래 요소를 밀어내는 것은 허용한다. 자리를 미리 비워 두면
  정상 상태에서 빈 줄이 남는다.

**라벨을 안 물들이는 이유**: 잘못된 것은 입력한 값이지 항목명이 아니다. 라벨까지 붉어지면
"이 값이 틀렸다"가 아니라 "이 필드 전체가 문제다"로 읽힌다. 설정 화면처럼 필드가 여럿
쌓인 곳에서는 붉은 면적이 과해져 정작 어디를 고쳐야 하는지가 흐려진다.

```tsx
<Field>
  <FieldLabel htmlFor="specUrl">OpenAPI Spec URL</FieldLabel>
  <Input id="specUrl" aria-invalid={Boolean(error)} … />
  {error && (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  )}
</Field>
```

> **구현**: `components/ui/input.tsx` — `h-10`, `rounded-md`,
> 전용 토큰(`border-input-border` `bg-input-bg`), 포커스 링 제거 후
> `focus-visible:border-input-border-focus`. 에러 문구는 화면이 직접 그린다.
> `Field` 계열에 에러 슬롯을 두지 않는다(`pages/project-form/SpecJsonUrlField.tsx`가 기준).

---

## 로고

| 종류   | 형태         | 쓰는 곳                    |
| ------ | ------------ | -------------------------- |
| 가로형 | `{SpecNote}` | 로그인/회원가입 화면, 푸터 |
| 축약형 | `{S}`        | 파비콘, 좁은 자리          |

- 폰트는 **Geist** 통일(중괄호 포함). 색은 **무채색**(`--sn-fg-1`), 파랑을 쓰지 않는다.
- 기본 `text-4xl`, 축약형 `text-lg`. 푸터에서는 `className`으로 `text-xs`를 덮어쓴다.
- `components/Logo.tsx`. `short`로 축약형, `as`로 렌더 태그(`h1` | `span`) 전환.
- **파비콘**은 검정 배경 + 흰 `{S}` 정방형 SVG(수동 제작).

---

## radius

| 토큰            | 값   | 적용                                |
| --------------- | ---- | ----------------------------------- |
| `--radius-sm`   | 6px  | 버튼, 인풋, 목록 행                 |
| `--radius-md`   | 6px  | 위와 같음                           |
| `--radius-lg`   | 8px  | 멤버 목록 행처럼 카드보다 작은 묶음 |
| `--radius-xl`   | 12px | 카드                                |
| `--radius-ctl`  | 6px  | 컨트롤 별칭                         |
| `--radius-card` | 12px | 카드 별칭                           |
| `rounded-full`  | 원형 | 아바타, 뱃지, 칩 안의 아이콘 버튼   |

shadcn이 참조하는 `--radius`는 `8px`이다.

v0.2의 "전부 3px"을 폐기했다. 컨트롤과 카드의 곡률이 같으면 위계가 안 생긴다.

---

## 폰트

```
Geist (라틴) → Pretendard (한글) → system-ui
```

둘 다 CDN(Geist는 Google Fonts, Pretendard는 jsDelivr). `@import`는 CSS **최상단**에 둔다.
Geist에 한글 글리프가 없어 한글은 Pretendard가 렌더한다.

```css
--font-sans: "Geist", "Pretendard", system-ui, sans-serif;
--font-heading: var(--font-sans);
```

---

## 한글 타이포그래피 규칙

한글은 같은 px에서 라틴보다 작아 보인다.

| 규칙   | 내용                                                           |
| ------ | -------------------------------------------------------------- |
| 크기   | 본문은 `text-sm`(14px) 기본, `text-xs`(12px)는 라벨과 캡션에만 |
| 줄간격 | 라틴보다 넉넉하게. `leading-relaxed` 계열                      |
| 예외   | 엔드포인트 경로, 코드, 숫자 등 라틴 전용 영역은 작게 써도 된다 |

표기 규칙(가운뎃점 최소화 등)은 `05-code-conventions`.
한글 입력 조합(IME) 처리는 `07-components`.

---

## 다크 모드

`<html>`에 `.dark` 클래스를 붙였다 뗀다(shadcn 표준). `ThemeContext`가 토글하고
`localStorage`에 저장한다. 저장값이 없으면 OS 설정을 따른다.

```css
@custom-variant dark (&:where(.dark, .dark *));

:root { --sn-surface-1: #ffffff; ... }
.dark { --sn-surface-1: #000000; ... }
```

색은 전부 `--sn-*`로 두고 `.dark`에서 **값만 교체**한다. 컴포넌트는 `bg-surface-1` 하나만 쓰고
다크 대응을 따로 하지 않는다.

**라이트 모드를 빼지 않는다.** 컴포넌트에 `dark:` 분기가 없는 현 구조에서 라이트 유지 비용은
거의 0이다. 값 튜닝이 번거로우면 튜닝을 미루되 구조는 건드리지 않는다.

---

## 전역 base

```css
html,
body {
  @apply overscroll-none;
}
body {
  @apply bg-surface-2 text-fg-1;
}
* {
  @apply border-border outline-ring/50;
}
```

`overscroll-none`을 문서 루트에도 건다. 컬럼 단위 `overscroll-none`(`03-frontend-layouts`)과
별개로, 페이지 자체의 바운스와 당겨서 새로고침을 막는다.

---

## Tailwind 유틸

### SpecNote 자체

| 유틸                                                            | 값                          |
| --------------------------------------------------------------- | --------------------------- |
| `bg-surface-1` `bg-surface-2` `bg-surface-3`                    | 표면 3단계                  |
| `bg-hover-ghost` `bg-hover-icon`                                | 호버 배경 2단계             |
| `text-fg-1` `text-fg-2` `text-fg-3`                             | 텍스트 3단계                |
| `bg-accent-subtle` `*-accent-muted` `*-accent-strong`           | 강조 3단계                  |
| `text-accent-hover`                                             | 강조 hover                  |
| `border-input-border` `border-input-border-focus` `bg-input-bg` | 인풋 전용                   |
| `text-get-fg` `bg-get-bg` `border-get-border`                   | 메서드 뱃지 (5종 동일 패턴) |

### shadcn 매핑

| shadcn 유틸                    | 연결된 값                                 |
| ------------------------------ | ----------------------------------------- |
| `bg-primary`                   | **무채색 채움** (다크 흰색 / 라이트 검정) |
| `text-primary-foreground`      | 반전색                                    |
| `bg-accent`                    | 호버 ghost — **강조색이 아니다**          |
| `bg-background`                | 표면 2                                    |
| `bg-card` `bg-popover`         | 표면 1                                    |
| `bg-muted` `bg-secondary`      | 표면 3                                    |
| `text-muted-foreground`        | 텍스트 2                                  |
| `border-border` `border-input` | 보더                                      |
| `ring`                         | Vercel Blue                               |
| `bg-destructive`               | 라이트 `#d83b3a` / 다크 `#e24b4a`         |

> **혼동 주의 1**: shadcn의 `accent`는 강조색이 아니라 "은은한 hover 배경"이다.
> 파란 강조는 `accent-subtle/muted/strong`을 쓴다. `primary`도 더 이상 파랑이 아니다.
>
> **혼동 주의 2**: `destructive`는 **DELETE 메서드 색과 다르다.** DELETE는 마젠타 계열
> (`#d6006a` / `#ff358d`)이고 `destructive`는 붉은색이다. 에러 문구와 파괴적 액션에만 쓴다.

---

## 크기

- 헤더 **52px** (`px-4 py-2.5` + 32px 콘텐츠. 좁은 화면 2행 시 약 96px)
- 푸터 **32px** (`h-8`)
- 컨트롤(버튼, 인풋) **40px** (`h-10`)
- 아이콘 버튼 **32px** (`size-8`)
- 아바타 **32px**, 원형

---

## 보더를 두는 곳 / 안 두는 곳

| 위치                     | 보더                               |
| ------------------------ | ---------------------------------- |
| 헤더                     | **스크롤 시에만** (`scrollY > 60`) |
| 좌측 엔드포인트 사이드바 | 없음 (리사이즈 구분선이 대신)      |
| 우측 댓글 패널           | 없음 (리사이즈 구분선이 대신)      |
| 카드, 멤버 목록 행       | 있음                               |
| 스펙 갱신 배너           | 아래쪽만 (`border-b`)              |

`SpecLayout`은 `h-dvh` 고정이라 window 스크롤이 없어 헤더 보더가 뜨지 않는다(의도된 동작).

**리사이즈 구분선이 보더 역할을 한다.** 3컬럼 사이의 `Separator`는 평소에는 보이지 않고
호버할 때만 드러난다. 항상 보이는 선을 그으면 화면에 세로선이 두 줄 생기고,
드래그 가능한 지점인지도 알 수 없다. v0.4의 댓글 패널 `border-l`은 이 때문에 폐기했다 —
구분선과 겹쳐 이중선이 됐다.

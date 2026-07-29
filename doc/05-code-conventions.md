# 프론트엔드 코드 규약

| 버전 | 일시           | 변경 내용                                                                                                                                                                                                                                                                                                                                                                 |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1 | 2026.07.19 SUN | 최초 작성. 흩어져 있던 코드 규약을 모음 — Base UI 문법(`01`에서), 폼 작성 규칙(`01`에서), `cn()` 병합, enum과 타입 표기(`02`에서), heading 계층(`03`에서).                                                                                                                                                                                                                |
| v0.2 | 2026.07.20 MON | 11단계 구현 결과 반영. `HTTP_METHODS`를 소문자로 변경(OAS Path Item Object의 키가 소문자이고 `spec-extractor`가 그대로 저장한다), `isHttpMethod` 위치를 `types.ts` → `constants.ts`로 정정, 좁히기 예제에서 `toUpperCase()` 정규화 제거, heading 계층표에 `h3`의 화면 내 구획 제목 용도 추가, TS 좁히기 함정 절 신설.                                                     |
| v0.3 | 2026.07.29 WED | **문서 분할** — heading 계층과 한글 입력 조합(IME)을 `07-components`로 이관. 좁히기 절에 **경계 좁히기 3종 표**(`isHttpMethod`, `ApiError`, `parseId`) 추가. 폼 절에 에러 문구를 화면이 그린다는 규칙 추가. 주석의 `TODO` 형식을 배관 단계 기준으로 정정. **표기 절에 가운뎃점 최소화 규칙 추가**(`04-design-tokens`가 이미 이 문서를 가리키고 있었으나 실제로는 없었다). |

> 이 문서는 **"어떻게 쓰는가"** 를 다룬다.
> 무엇을 어디에 두는가는 `02-frontend-directories`, 화면 구조는 `03-frontend-layouts`,
> 색과 크기 값은 `04-design-tokens`, 공용 컴포넌트 사용 규칙은 `07-components`,
> 상태 소유권과 쿼리 규약은 `08-state-and-data`.

---

## Base UI 문법 (Radix 아님)

shadcn을 **Base UI** 프리미티브로 쓴다. Radix 예제를 그대로 가져오면 타입 에러가 난다.

| 하고 싶은 것                | Radix (❌)                             | Base UI (✅)                                                        |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| 컴포넌트를 다른 요소로 렌더 | `<Button asChild><Link/></Button>`     | `<Button render={<Link to="..." />}>내용</Button>`                  |
| 드롭다운 트리거             | `<Trigger asChild><button/></Trigger>` | `<DropdownMenuTrigger className="...">` (Trigger 자체가 `<button>`) |
| 메뉴 항목 클릭해도 안 닫기  | `onSelect` + `preventDefault()`        | `<DropdownMenuItem closeOnClick={false}>`                           |
| 드롭다운 라벨               | `<DropdownMenuLabel>` 단독             | `<DropdownMenuGroup>` 안에서만. 단순 표시는 `<div>`                 |

- **Trigger 안에 `<button>`을 또 넣지 않는다**(중첩 button 에러).
- `DropdownMenuLabel`을 `<Group>` 밖에서 쓰면 `MenuGroupContext is missing` 에러가 난다.
- **`render`에 `<a>`(Link)를 넘기면 `nativeButton` 경고가 뜬다.** 링크는 `Button`을 쓰지 말고
  `<Link>`에 버튼 스타일 클래스를 직접 입힌다(클래스는 `04-design-tokens`). 의미상으로도 `<a>`가 맞다.

---

## 폼은 `Field` 계열로 짠다

`<label>` + `<input>`을 수동 배치하지 않는다.

```tsx
<FieldSet>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" type="email" />
    </Field>
    <Field>
      <Button onClick={handleSubmit}>로그인</Button>
    </Field>
  </FieldGroup>
</FieldSet>
```

`Field`가 label↔input 간격을, `FieldGroup`이 필드 사이 간격을 잡는다. `space-y-*` 수동 조정이 불필요하다.

**입력 + 버튼을 나란히 둘 때**는 `Field` 안에서 `<div className="flex items-center gap-2">`로 감싸고
버튼에 `shrink-0`을 준다(설정 화면의 스펙 URL, Base URL, 멤버 초대가 이 패턴).

**에러 문구는 `Field`가 아니라 화면이 그린다.** `Field`에 `data-invalid`를 주면 라벨까지
물들어서 쓰지 않는다. `aria-invalid`는 인풋에만 주고 문구는 `role="alert"` 단락으로
직접 붙인다. 근거와 예제는 `04-design-tokens`의 인풋 에러 상태 절.

---

## 클래스 병합은 `cn()`

기본 클래스와 `className` prop을 합칠 때 문자열 연결(`join(" ")`)을 쓰지 않는다.
Tailwind는 클래스 나열 순서가 아니라 **CSS 순서**로 승부가 갈리므로 충돌 시 결과가 불확실하다.
`cn()`(tailwind-merge)을 쓰면 뒤에 온 클래스가 확실히 이긴다.

```tsx
className={cn("text-fg-1 text-4xl", className)}
```

---

## enum 표기 — `lib/constants.ts`

기준은 하나다 — **런타임에 목록을 순회하거나 값으로 참조하는가.**

| 형태                     | 쓰는 경우            | 예                               |
| ------------------------ | -------------------- | -------------------------------- |
| 배열 + `as const` + 타입 | 순회나 검증이 필요함 | `REACTION_TYPES`, `HTTP_METHODS` |
| 유니온 타입만            | 비교만 함            | `ROLE`, `NOTIFICATION_TYPE`      |

```ts
export type ROLE = "OWNER" | "MEMBER";

export const REACTION_TYPES = ["DONE", "CHECKING", "BEST", "ACK"] as const;
export type REACTION_TYPE = (typeof REACTION_TYPES)[number];

export type NOTIFICATION_TYPE = "INVITED" | "MENTIONED";

export const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
export type HTTP_METHOD = (typeof HTTP_METHODS)[number];

export function isHttpMethod(m: string): m is HTTP_METHOD {
  return (HTTP_METHODS as readonly string[]).includes(m);
}
```

- **`HTTP_METHODS`는 소문자다.** OAS Path Item Object의 키가 소문자이고
  `spec-extractor`가 그걸 그대로 저장한다. 대문자로 두면 저장값과 상수가 어긋나
  비교할 때마다 정규화를 끼워야 한다. 대문자는 **표시할 때만** 쓴다(`uppercase` 유틸).
- **`isHttpMethod`는 `types.ts`가 아니라 `constants.ts`에 둔다.**
  가드가 `HTTP_METHODS` 배열에서 파생되므로 배열과 같은 파일에 있어야 한다.
- `as const`는 리터럴 타입으로 좁히고 읽기 전용으로 고정한다.
- `(typeof X)[number]`는 배열 요소 타입들을 유니온으로 뽑는다.
- 타입만 필요하면 이 구문을 쓰지 않는다 — 런타임에 죽은 배열만 남는다.
- **TS `enum`은 쓰지 않는다.** 런타임 객체가 번들에 남고 tree-shaking이 어렵다.

---

## 백엔드 응답 타입 — `lib/types.ts`

**API 응답 body에 등장하는 타입만 옮긴다.** 서버 내부 DTO, Prisma 모델, Guard 타입은 제외한다.

1. **날짜는 `string`이다.** 백엔드가 `Date`로 선언했어도 JSON 직렬화되면 ISO 문자열이다.
2. **enum은 `constants.ts`에서 import한다.** `types.ts`에서 중복 정의하지 않는다.
3. **넓은 타입은 그대로 받는다.** `EndpointSummary.method`는 백엔드가 주는 대로 `string`이다.
4. **요청 DTO는 두지 않는다.** `lib/api/*.ts`의 함수 시그니처가 그 역할을 한다.
   응답 타입만 공유 자산이고, 요청 형태는 호출 지점 하나에만 필요하다.

### 좁히기는 경계에서 한다

백엔드가 `string`을 주는데 프론트에서 좁은 유니온으로 선언하면, 그건 **검증이 아니라 약속**이다.
백엔드가 약속을 어기면(OAS는 HEAD, OPTIONS도 허용) 컴파일은 통과하고 런타임에 깨진다.

타입 가드로 렌더 직전에 좁히고, 벗어난 값은 폴백한다.

```tsx
if (isHttpMethod(method)) return <MethodBadge method={method} />;
return <FallbackBadge>{method}</FallbackBadge>;
```

**경계가 셋이고 패턴이 같다.**

| 경계           | 넓은 값               | 좁히는 것             | 벗어나면             |
| -------------- | --------------------- | --------------------- | -------------------- |
| 스펙 데이터    | `method: string`      | `isHttpMethod`        | `FallbackBadge`      |
| API 에러       | `error: unknown`      | `instanceof ApiError` | 기본 문구            |
| URL path param | `string \| undefined` | `parseId`             | 요청을 보내지 않는다 |

셋 다 "넓게 받고, 쓰는 지점에서 좁히고, 벗어난 값에 갈 곳을 준다"는 같은 규칙이다.
`parseId`의 조건이 왜 그 값인지는 `08-state-and-data`.

컴포넌트는 좁은 타입만 받는다. 좁히는 책임은 **호출부**에 둔다 — 그래야 컴포넌트가 단순해지고
"모르는 값일 때 뭘 보여줄지"를 화면마다 다르게 정할 수 있다.

---

## TS 좁히기 함정

**옵셔널 체이닝 결과를 가드에 넘겨도 원본은 좁혀지지 않는다.**

```ts
// ❌ a는 여전히 unknown이다
if (isObject(a?.b)) {
  doSomething(a.b); // a가 unknown이라 에러
}

// ✅ 결과를 변수로 받아 그 변수를 좁힌다
const b = isObject(a) ? a.b : undefined;
if (isObject(b)) {
  doSomething(b);
}
```

타입 가드는 **인자로 넘긴 표현식 하나**만 좁힌다. `a?.b`를 넘기면 `a?.b`가 좁혀질 뿐
`a`는 그대로다. `$ref` 해석이나 스키마 순회처럼 `unknown`을 여러 단계 파고드는 코드에서
반복해 걸린다. 단계마다 변수로 받아 내려간다.

---

## 주석

- 파일 상단에 **컴포넌트명 — 한 줄 설명**, 그 아래 필요한 만큼 배경과 판단 근거.
- 주석은 한국어. 번호를 매길 때는 `// 1. …` 형식.
- **미구현 지점은 `// TODO(배관 N):` 형태로** 무엇을 무엇으로 교체할지 적는다.
  단계 번호를 넣어야 "언제 사라질 주석인가"가 드러난다.

```tsx
// TODO(배관 5): useComments(endpointId) 로 교체하고 이 state 를 버린다.
//   실제로는 작성 후 목록을 재조회한다 — mutation 응답이 Comment 원형이라
//   author, reactions, memberMentions 가 없어 로컬 패치가 불가능하다.
```

- **왜 그렇게 했는지를 적고, 무엇을 하는지는 적지 않는다.** 코드가 이미 말하는 것을
  다시 쓰면 코드가 바뀔 때 주석만 남아 거짓말이 된다.

---

## 표기

- 상수는 `SCREAMING_SNAKE`, 타입은 백엔드 enum명을 미러링할 때만 대문자
  (`ROLE`, `HTTP_METHOD`), 그 외 프론트 자체 타입은 `PascalCase`.
- **가운뎃점(`·`)을 쓰지 않는다.** 나열은 쉼표(`,`)나 슬래시(`/`)로 한다.
  키보드로 바로 칠 수 없는 기호라 사람이 이어 쓰지 않고, 문서마다 표기가 갈린다.
  문서, 코드 주석, 커밋 메시지 전부에 적용한다. 대체가 어색한 자리에만 예외로 남긴다.

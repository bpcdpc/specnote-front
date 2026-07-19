# spec-detail 구현 순서 (11단계 내부)

| 버전 | 일시           | 변경 내용                                                            |
| ---- | -------------- | -------------------------------------------------------------------- |
| v0.1 | 2026.07.19 SUN | 최초 작성. 11단계를 9개 하위 단계로 분할, 전제/산출물/완료조건 정의. |

> 상위 구현 순서표는 `01-frontend-stack`, 파일 배치는 `02-frontend-directories`,
> 화면 구조는 `03-frontend-layouts`, 색/크기는 `04-design-tokens`,
> 작성 규칙은 `05-code-conventions`.

---

## 전제

### 데이터 흐름

| 시점            | 호출                     | 받는 것                                                          |
| --------------- | ------------------------ | ---------------------------------------------------------------- |
| 프로젝트 진입   | `GET /api/projects/:id`  | `ProjectView` — components 통째, endpoints 경량 목록, snapshotId |
| 엔드포인트 클릭 | `GET /api/endpoints/:id` | `EndpointDetail` — operationJson fragment, snapshotId            |

- `components`는 진입 시 1회만 받아 클라이언트가 캐시한다. 엔드포인트마다 다시 받지 않는다.
- `$ref`는 dereference된 상태로 오지 않는다. 렌더 시점에 캐시에서 lazy resolve한다.
- `endpoints[]`는 소프트 삭제된 것을 **포함**한다. 필터링은 프론트 책임이다.
- 두 응답의 `snapshotId`가 어긋나면 스펙이 갱신된 것이다. 조용히 교체하지 않고 배너로 알린다.

### 라우트

프론트 URL은 중첩, 백엔드 라우트는 플랫이다. 서로 독립이며 충돌하지 않는다.

```
/projects/:projectId                          엔드포인트 미선택
/projects/:projectId/endpoints/:endpointId    선택됨
/projects/:projectId/endpoints/:endpointId?comment=:commentId   딥링크 (13단계)
```

- 선택 상태의 소유자는 URL이다. 컴포넌트 state로 들지 않는다. 새로고침과 뒤로가기가 살아야 하고,
  13단계 딥링크가 같은 경로를 그대로 쓴다.
- **자식 라우트로 쪼개지 않는다.** 두 경로에 `SpecDetailPage` 같은 엘리먼트를 매달고
  페이지가 `useParams().endpointId`를 직접 읽는다. 3컬럼 셸이 통째로 유지돼야 하는데
  자식 라우트로 나누면 중앙 컬럼만 `<Outlet>`이 되어 좌/우 컬럼과 셸의 소유권이 흐려진다.
- `?comment=`는 11단계에서 읽지 않는다.

### 컬럼

| 컬럼   | 폭              | 스크롤 | 보더       |
| ------ | --------------- | ------ | ---------- |
| 왼쪽   | 240px 고정      | 세로   | 없음       |
| 중앙   | 남는 폭         | 세로   | —          |
| 오른쪽 | 300px, 리사이즈 | 세로   | `border-l` |

`h-dvh` 고정, 페이지 스크롤 없음. 좁은 화면은 `min-w-[900px]`으로 가로 스크롤을 허용한다.
차단 화면은 만들지 않는다.

---

## 파일

`02-frontend-directories`의 목록에 재귀 렌더 2종을 추가한다.

```
pages/spec-detail/
├── SpecDetailPage.tsx        # 3컬럼 본문, endpointId 읽기
├── SpecColumns.tsx           # 왼쪽 고정 / 가운데 flex / 오른쪽 resizable
├── BearerTokenInput.tsx      # 헤더 Bearer 입력
├── EndpointSidebar.tsx       # 검색 + 태그 그룹 + 삭제된 엔드포인트 보기
├── EndpointListItem.tsx      # 메서드 뱃지 + path
├── EndpointDetail.tsx        # parameters / requestBody / responses 조립
├── SchemaTree.tsx            # 스키마 재귀 노드          ← 신설
├── ExampleBlock.tsx          # example 값 표시           ← 신설
├── TryItPanel.tsx            # 입력 → HTTP 요청 → 응답
├── SpecUpdateBanner.tsx      # snapshotId 불일치 배너
├── useSpecCache.ts           # components 캐시 + $ref 지연 해석
├── mock.ts                   # 목 데이터 (데이터 단계에서 제거)
└── comments/                 # 12단계
```

**`SchemaTree`를 가르는 이유**: FR-4.3이 중첩 객체/배열의 재귀 전개를 요구한다.
재귀 노드는 자기 자신을 부르는 단일 책임 컴포넌트라야 하고,
`EndpointDetail`은 parameters/requestBody/responses 세 구획을 배치하는 조립 책임만 진다.
한 파일에 두면 재귀 깊이 제어, 펼침 상태, 구획 배치가 뒤엉킨다.

---

## 순서

| 단계 | 대상                                         | 산출물                                        |
| ---- | -------------------------------------------- | --------------------------------------------- |
| 11-1 | `mock.ts`                                    | `ProjectView` + `EndpointDetail` 목 데이터    |
| 11-2 | `SpecColumns`                                | 3컬럼 골격, 리사이즈, 독립 스크롤             |
| 11-3 | `EndpointSidebar` `EndpointListItem`         | 태그 그룹, 검색, 삭제됨 토글, 선택 하이라이트 |
| 11-4 | 라우트 배선                                  | URL ↔ 선택 상태 연결                          |
| 11-5 | `useSpecCache`                               | components 캐시, `$ref` 지연 해석             |
| 11-6 | `SchemaTree` `ExampleBlock` `EndpointDetail` | 상세 본문                                     |
| 11-7 | `BearerTokenInput`                           | 헤더 슬롯 입력                                |
| 11-8 | `TryItPanel`                                 | 실제 요청 전송, 응답 표시                     |
| 11-9 | `SpecUpdateBanner`                           | snapshotId 불일치 알림                        |

우측 댓글 컬럼은 11-2에서 빈 패널 자리표시만 둔다. 내용은 12단계.

---

### 11-1. 목 데이터

**근거**: 이후 전 단계가 이 데이터를 먹는다. 형태가 흔들리면 전부 다시 고친다.

- `ProjectView` 1건, `EndpointDetail` 여러 건.
- 실제 OAS 조각이어야 한다. `$ref`, 배열 안 중첩 객체, enum, 여러 응답 코드를 포함시킨다.
  단순한 flat 객체만 넣으면 11-5, 11-6이 검증되지 않는다.
- `tryItBaseUrl`이 `null`인 경우도 만든다. FR-4.6(비활성) 확인용.
- 소프트 삭제된 엔드포인트 최소 1건.

**완료 조건**: `lib/types.ts`의 타입에 캐스팅 없이 들어맞는다.

---

### 11-2. 3컬럼 골격

**근거**: 컬럼 안이 비어 있어도 폭, 스크롤 경계, 가로 스크롤을 먼저 고정해야
이후 컴포넌트가 자기 폭을 잘못 가정하지 않는다.

- `react-resizable-panels` 설치. 오른쪽 패널만 `PanelResizeHandle`을 갖는다. 왼쪽은 고정폭.
- 스크롤 주체는 각 컬럼이다. 페이지 스크롤이 생기면 잘못된 것이다.
- `min-w-[900px]`으로 가로 스크롤.

**완료 조건**: 창을 400px까지 줄여도 3컬럼이 유지되고 가로 스크롤로 접근된다.
세 컬럼이 각각 독립적으로 스크롤된다.

---

### 11-3. 엔드포인트 사이드바

- 태그별 그룹핑. 태그가 없는 엔드포인트의 그룹명을 정해야 한다.
- 검색은 실시간 필터(FR-3.4). 대상은 path와 summary.
- 삭제된 엔드포인트는 기본 숨김, 토글로 노출하며 "삭제됨" 표시를 단다(FR-8.1).
  클릭하면 상세와 댓글은 그대로 열린다(FR-8.2).
- 메서드 뱃지는 `min-w-[52px]`로 path가 세로 정렬되게 한다.
- `method`는 백엔드가 `string`으로 준다. `isHttpMethod` 가드로 좁히고 벗어나면 폴백한다.

**완료 조건**: 검색어 입력 시 목록이 즉시 좁혀지고, 삭제됨 토글이 동작한다.

---

### 11-4. 라우트 배선

- 라우터에 `/projects/:projectId/endpoints/:endpointId`를 추가한다.
- 사이드바 항목은 버튼이 아니라 `<Link>`다. 새 탭 열기가 동작해야 한다.
- `endpointId`가 없으면 중앙 컬럼은 빈 상태를 렌더한다.
- 존재하지 않는 `endpointId`의 처리 방식을 정한다.

**완료 조건**: 항목 클릭 시 URL이 바뀌고, 새로고침해도 같은 엔드포인트가 열린다.
뒤로가기로 이전 선택으로 돌아간다.

---

### 11-5. 스펙 캐시

- `components`를 받아 `$ref` 문자열을 실제 스키마로 해석한다.
- **순환 참조 가드가 필수**다. 자기 자신을 참조하는 스키마에서 무한 재귀로 죽는다.
- 해석 실패(없는 `$ref`)를 예외로 던지지 않는다. 화면 한 칸만 깨지게 하고 나머지는 렌더한다.
- 3.0과 3.1의 `$ref` 형태 차이를 확인한다.

**완료 조건**: 중첩 `$ref`가 두 단계 이상 걸린 목 데이터에서 최종 스키마가 나온다.
순환 참조 목 데이터에서 멈추지 않는다.

---

### 11-6. 엔드포인트 상세

가장 크다. 세 구획으로 나눈다.

| 구획        | 내용                                                     |
| ----------- | -------------------------------------------------------- |
| parameters  | path / query / header, 이름, 타입, required, description |
| requestBody | content type별 스키마, example                           |
| responses   | 상태 코드별 스키마, example                              |

- `SchemaTree`는 자기 자신을 부른다. 객체는 properties로, 배열은 items로 내려간다.
- 깊이가 깊어지면 기본 접힘 처리를 할지 정한다.
- `ExampleBlock`은 스펙의 example, 없으면 스키마에서 생성할지 정한다.

**완료 조건**: 배열 안 중첩 객체가 재귀적으로 펼쳐진다(FR-4.3).

---

### 11-7. Bearer 토큰 입력

- `SpecLayout`이 헤더 `right` 슬롯에 조립한다. 페이지가 헤더를 건드리지 않는다.
- 모바일에서 `wide` 슬롯으로 2행. `order` + `flex-wrap`으로 처리하고 DOM을 두 벌 렌더하지 않는다.
- 로그인 상태와 무관하게 항상 표시한다.
- 값의 보관 위치를 정한다. 새로고침 시 유지 여부, 저장한다면 위험을 감수하는 근거를 남긴다.

**완료 조건**: 데스크탑 1행, 768px 미만 2행으로 전환되며 입력값이 유지된다.

---

### 11-8. Try it out

유일하게 실제 네트워크를 쓴다. 마지막에 둔다.

- `tryItBaseUrl`이 없으면 비활성. 이때도 열람과 댓글은 정상 동작한다(FR-4.6).
- POST/PUT/PATCH/DELETE는 전송 전 "실제 서버 데이터가 변경될 수 있음" 확인을 받는다.
  GET에는 표시하지 않는다(FR-4.5).
- 요청 폼의 초기값은 example이며 수정 가능하다(FR-4.4).
- 인증은 http bearer만 지원한다. 그 외(oauth2 등)는 미지원 안내.
- 실패 시 CORS 원인을 구분해 안내한다(FR-4.7). 브라우저는 CORS 실패를 일반 네트워크 오류와
  구분해 알려주지 않으므로, 상태 코드 없는 실패에 한해 가능성으로 안내한다.
- 응답은 상태 코드와 바디를 그대로 보여준다.

**완료 조건**: baseUrl 없는 프로젝트에서 비활성이고, 변경 계열 메서드에 경고가 뜬다.

---

### 11-9. 스펙 갱신 배너

- `EndpointDetail.snapshotId` ≠ 캐시된 `ProjectView.snapshotId`면 표시한다.
- 조용히 교체하지 않는다. 사용자가 새로고침을 눌러야 반영된다.
- WebSocket 실시간 푸시는 스코프 밖이다.

**완료 조건**: 두 snapshotId가 다른 목 데이터에서 배너가 뜬다.

---

## 이 단계에서 하지 않는 것

| 항목                           | 어디로                |
| ------------------------------ | --------------------- |
| 댓글 패널 내용                 | 12단계                |
| `?comment=` 딥링크, 하이라이트 | 13단계                |
| 실제 API 연결                  | 9단계 완료 후 목 교체 |
| 알림 드롭다운                  | 13단계                |

---

## 결정 대기

11-1 이후 각 단계 착수 시점에 정한다.

| 단계 | 결정할 것                                        |
| ---- | ------------------------------------------------ |
| 11-3 | 태그 없는 엔드포인트의 그룹명                    |
| 11-4 | 존재하지 않는 `endpointId` 처리                  |
| 11-6 | 재귀 깊이 기본 접힘 여부, example 자동 생성 여부 |
| 11-7 | Bearer 토큰 보관 위치와 지속성                   |

# 문서 반영 체크리스트 (11단계 완료 시점)

작성: 2026.07.20 MON
범위: 백엔드 문서 4종 + 프론트 문서 5종 + 자체 문서 1종

> 한 파일씩 열어 반영하고 체크한다.
> **순서 추천**: 백엔드(2, 3) → 백엔드(9, 10, 11) → 프론트(05 → 02 → 04 → 03 → 01) → 06
> 작은 것부터 가고, 참조가 많은 `03-frontend-layouts`를 뒤에 둔다.

---

## 정정 사항 (먼저 읽을 것)

**변경 계열 경고는 v0.5에서 삭제된 요구사항이었다.**
`03-functional-requirements-v0_6.md` 변경 이력 v0.5 — "FR-4.5(변경 계열 메서드 데이터 변경 경고) 삭제 후 FR-4 재번호"
`02-use-cases-v0_4.md` 변경 이력 v0.4 — "UC-4 Try it out 변경 계열 메서드 데이터 변경 경고 제거"

11단계에서 이를 구현했으므로 **되살리는 방향으로 반영**한다. 삭제 사유가 일정이었고 구현이 끝났으므로 근거가 소멸했다.

**로그아웃은 문서 어디에도 없다.** FR, UC, 기능정의서, API명세서 전부 확인했다.
지울 곳은 `01-frontend-stack`의 "미결 / 대기" 절 한 줄뿐이다.

---

# 백엔드 문서

## 1. `02-use-cases` (v0.4 → v0.5)

- [ ] **UC-4 대안 흐름에 변경 경고 복원**
      변경 계열 메서드(POST/PUT/PATCH/DELETE) 전송 전 "실제 서버 데이터가 변경될 수 있음"을
      표시하고 사용자가 확인해야 전송된다. GET/HEAD에는 표시하지 않는다.
- [ ] **UC-4 비고에 확인 방식 명시**
      체크박스. 확인 상태는 해당 엔드포인트에 머무는 동안 유지되고 엔드포인트를 옮기면 초기화된다.
      모달이 아닌 이유 — 파라미터를 바꿔가며 반복 전송하는 도구라 매번 뜨면 마찰이 크다.
- [ ] **UC-4 비고에 Bearer 토큰 비영속 추가**
      저장소에 두지 않아 새로고침하면 사라진다. Swagger UI 기본 동작과 같다.
      근거 — SpecNote는 대상 API와 무관한 제3 서비스라 타 시스템의 API 토큰을 보관할 이유가 약하다.
- [ ] **UC-4 예외 흐름에 미지원 범위 추가**
  - `multipart/form-data` 요청 바디 미지원 (파일 업로드는 범위 밖)
  - `cookie` 파라미터 미지원 (브라우저가 스크립트로 설정할 수 없음)
  - 응답 헤더는 CORS가 노출을 허용한 것만 표시됨
- [ ] **UC-3에 프로젝트 개요 화면 흡수**
      프로젝트 진입 직후(엔드포인트 미선택) 중앙에 프로젝트 메타를 보여준다.
      제목, 설명, 스펙 버전, OAS 버전, 엔드포인트 수, 메서드별 분포, 태그 수, Try it Base URL.
      Base URL이 없으면 Owner에게 설정 링크를 안내한다.
- [ ] **UC-4 비고에 example 정책**
      요청 바디는 스키마의 속성별 example을 모아 조립하고, 응답은 스펙에 example이 있을 때만 표시한다.
      근거 — 만들어낸 응답 값이 실제처럼 보이면 오해를 부른다.

## 2. `03-functional-requirements` (v0.6 → v0.7)

- [ ] **FR-4.9 신설 — 변경 계열 경고**

  > 시스템은 변경 계열 메서드(POST/PUT/PATCH/DELETE)의 Try it out 전송 전
  > "실제 서버 데이터가 변경될 수 있음" 확인을 받아야 하며, 확인 전에는 전송 버튼을
  > 비활성화해야 한다. GET/HEAD에는 표시하지 않는다. | P1

  **번호는 4.9로 뒤에 붙인다.** 4.5로 끼워 넣으면 4.5~4.8이 밀려 다른 문서의 참조가 깨진다.

- [ ] **FR-4.2 수정 — example 표시 범위**
      응답은 스펙에 example이 있을 때만 표시하고 스키마에서 조립하지 않는다는 단서 추가.
- [ ] **FR-4.4 수정 — 요청 바디 초기값**
      요청 바디의 초기값은 스키마의 속성별 example을 조립해 채운다.
      요청 바디 입력은 JSON textarea, 파라미터는 개별 입력(enum은 select, boolean은 true/false).
- [ ] **FR-4.10 신설 — 미지원 범위**
  > 시스템은 `multipart/form-data` 요청 바디와 `cookie` 파라미터를 Try it out에서
  > 지원하지 않으며, 해당 엔드포인트에는 미지원임을 안내해야 한다. | 제외
- [ ] **변경 이력에 v0.5의 FR-4.5 삭제를 되돌린다는 기록**
      일정 사유로 뺐다가 구현 완료로 복원한다는 경위를 남긴다.

## 3. `09-backend-functions` (v0.4 → v0.5)

- [ ] **`users/` 컨트롤러 표에 `findMe` 추가**

  | 라우트              | 함수           | 입력       | 출력                  |
  | ------------------- | -------------- | ---------- | --------------------- |
  | `GET /api/users/me` | `findMe(user)` | `AuthUser` | `Promise<PublicUser>` |

- [ ] 서비스는 기존 `findUser(id)` 재사용. 새 로직 없음을 명시

## 4. `10-api-specifications` (v0.2 → v0.3)

- [ ] **`## 2. users` 절에 `GET /api/users/me` 추가**

  ```
  ### `GET /api/users/me` — 내 정보 조회

  - 권한: `Auth` (계층 1)
  - Response `200`: `PublicUser`
  - Errors: `401` 토큰 없음 또는 만료
  - 참고: 로그인 응답이 `{ access_token }`뿐이고 `JwtPayload`에 `userName`이 없어
    프론트가 유저 이름을 얻을 경로가 이것뿐이다. 새로고침 시 토큰 유효성 검증도 겸한다
  ```

- [ ] **라우트 요약표에 한 줄**

  ```
  | GET | `/api/users/me` | findMe | — | — | — | Auth | 1 | — | — |
  ```

- [ ] **인증 흐름 설명 추가** (`0-` 공통 절)
      로그인 → 토큰 저장 → `/users/me` 호출로 유저 정보 확보.
      새로고침도 같은 경로를 탄다. 로그인 응답에 유저를 끼워넣지 않는 이유 —
      그러면 로그인과 새로고침의 경로가 둘로 갈린다.

## 5. `11-api-wbs` (v0.2 → v0.3)

- [ ] `findMe` 항목 추가, 담당자와 상태 지정

## 6. 배포 문서 (없으면 신설)

- [ ] **Azure App Service SPA 폴백**
  ```ts
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, "..", "client"),
    exclude: ["/api/{*path}"], // Nest 11(path-to-regexp v8) 문법
  });
  ```
  없으면 `/projects/1/endpoints/5`에서 새로고침 시 NestJS가 404를 낸다.
  프론트 라우트가 중첩 경로를 쓰게 되면서 생긴 요구다.
  → **현재 프로젝트에 배포 문서가 없다.** `08-backend-directories`에 절을 추가할지
  별도 문서를 만들지 결정 필요

---

# 프론트엔드 문서

## 7. `05-code-conventions` (v0.1 → v0.2)

- [ ] `HTTP_METHODS`를 **소문자**로 변경
      근거 — OAS Path Item Object의 키가 소문자이고 `spec-extractor`가 그대로 저장한다
- [ ] `isHttpMethod` 위치를 `types.ts` → **`constants.ts`**로 정정
      가드가 `HTTP_METHODS` 배열에서 파생되므로 배열과 붙어 있어야 한다
- [ ] 좁히기 예제에서 `toUpperCase()` 정규화 제거 (불필요해짐)
- [ ] heading 계층표에 `h3` 용도 추가 — 목록 아이템 제목 외에
      **화면 내 구획 제목**(Parameters / Request Body / Responses)
- [ ] **TS 좁히기 함정 추가** — `isObject(a?.b)`는 `a`를 좁혀주지 않는다.
      옵셔널 체이닝 결과를 변수로 받아 가드에 넘긴다

## 8. `02-frontend-directories` (v? → 다음 버전)

### 추가된 파일

- [ ] `components/Breadcrumb.tsx`
- [ ] `lib/useMediaQuery.ts`
- [ ] `pages/spec-detail/SpecPanelsContext.tsx`
- [ ] `pages/spec-detail/BearerTokenContext.tsx`
- [ ] `pages/spec-detail/ProjectOverview.tsx`
- [ ] `pages/spec-detail/SchemaTree.tsx`
- [ ] `pages/spec-detail/ExampleBlock.tsx`
- [ ] `pages/spec-detail/buildExample.ts`
- [ ] `pages/spec-detail/useTryIt.ts`

`lib/mock.ts`는 **추가하지 않는다.** 데이터 단계에서 삭제할 파일이라
문서에 올리면 지울 때 문서를 또 고쳐야 한다.

### 제거 / 개명

- [ ] `components/BackButton.tsx` — 미사용 표시 (데모 후 정리)
- [ ] `HeaderBreadcrumb.tsx` → `Breadcrumb.tsx` 개명 반영

### 원칙 보강

- [ ] **`hooks/` 폴더를 만들지 않는 근거**
      배치 기준은 "소비처가 하나인가 여럿인가"이지 파일 형태가 아니다.
      도메인 무관 훅은 `lib/`, 화면 전용 훅은 `pages/<화면>/`
- [ ] 목 데이터도 같은 기준을 따른다는 한 줄

## 9. `04-design-tokens` (v0.4 → v0.5)

### 메서드 뱃지 (전면 개정)

- [ ] 색 5종 교체

  | 메서드 | 라이트(배경) | 다크(글자) |
  | ------ | ------------ | ---------- |
  | GET    | `#067a2e`    | `#00cf39`  |
  | POST   | `#0066cc`    | `#00a4ff`  |
  | PUT    | `#007a78`    | `#00f1f0`  |
  | PATCH  | `#9a3beb`    | `#d16eff`  |
  | DELETE | `#d6006a`    | `#ff358d`  |

- [ ] **라이트 = 솔리드**(색 배경 + 흰 글자) / **다크 = 색 글자 + 같은 색 10% 배경**
- [ ] "박스 없음, 컬러 텍스트만" 방침 폐기. `bg-*` 토큰 부활, `border-*` 제거
- [ ] 표시용 `uppercase` 명시 — 저장값은 소문자
- [ ] 가운데 정렬. 솔리드 박스에서 짧은 메서드가 왼쪽에 쏠려 보이지 않게
- [ ] **PUT 시안 / PATCH 보라가 업계 관례와 어긋난다**는 근거
      (Swagger UI는 PUT 주황, PATCH 민트)
- [ ] `FallbackBadge` 신설 — 5종 밖(head/options/trace)은 무채색.
      관례 없는 메서드에 임의 색을 주면 5종의 색 규칙이 흐려진다

### 인풋

- [ ] 다크 값 — `--sn-input-border: #212121`, `--sn-input-bg: #000000`
- [ ] **"보더는 반드시 있어야 한다(접근성)" 근거 재검토**
      현재 값이 WCAG 1.4.11의 3:1에 미달이라 문장이 실제를 반영하지 못한다.
      순검정 대비 — `#212121` 1.6:1, `#2b2b2b` 2.1:1, 통과하려면 `#3a3a3a`(3.0:1)

### 보더

- [ ] 좌측 사이드바 "보더 없음" 유지. **리사이즈 구분선**이 호버 시에만 드러난다는 항목 추가
- [ ] 댓글 패널 `border-l` 폐기 — 구분선이 그 역할을 한다

## 10. `03-frontend-layouts` (v0.4 → v0.5) — 가장 큰 개정

### 라우트

- [ ] SpecDetail을 둘로 분리
      `/projects/:projectId` (개요) / `/projects/:projectId/endpoints/:endpointId` (상세)
- [ ] 파라미터명 `:id` → `:projectId` 전면 개명. 설정 화면 경로 포함
- [ ] **라우터 구조 주의사항** — 파라미터를 쓰는 레이아웃은 `path`를 부모 라우트에 둬야 한다.
      자식에만 두면 레이아웃의 `useParams()`가 비어 링크가 `/projects/undefined`로 나간다

### 3컬럼 (전면 교체)

- [ ] 왼쪽 고정폭 → **리사이즈 + 접기**. 기본 300px, min 240, max 400
- [ ] 오른쪽 **접기 추가**. 기본 300px, min 240, max 560
- [ ] 중앙 min 320px
- [ ] **`min-w-[900px]` 가로 스크롤 폐기**
- [ ] `lg`(1024px) 분기 신설
  - `≥ lg` 밀어내기 — 접으면 중앙이 넓어진다
  - `< lg` 덮기 — 양쪽 오버레이(`w-full max-w-2xl`), 기본 닫힘, 하나만 열림, 백드롭/Esc
- [ ] **1024 근거** — 기본폭 합계 `240 + 320 + 300 + 구분선 2 = 862px`이라
      `md`(768)로는 768~862 구간이 깨진다
- [ ] 와이어프레임 v0.1 차이 항목 갱신 — 양쪽 리사이즈가 **오히려 맞게 됐다**

### 브레드크럼 (신규)

- [ ] `←` 뒤로가기 → **브레드크럼** 전면 교체. 헤더 슬롯 표 4행 갱신

  | 화면             | 브레드크럼                      |
  | ---------------- | ------------------------------- |
  | dashboard        | `Dashboard`                     |
  | project-create   | `Dashboard / 새 프로젝트`       |
  | project-settings | `Dashboard / 프로젝트명 / 설정` |
  | SpecDetail       | `Dashboard / 프로젝트명`        |

- [ ] 마지막 조각이 `h1`, `to`가 있으면 링크로 감싼다
- [ ] SpecLayout 좌측 — **목록 토글 → 브레드크럼 → ⚙(Owner)**
- [ ] 우측 — **Bearer 입력 → 댓글 토글 → UserMenu**

### 반응형 / 푸터 / 스크롤

- [ ] 브레이크포인트가 `md` 하나 → **`md`(개념) + `lg`(실제 분기)**
      Bearer 2행도 `lg` 기준이다(`SpecPanelsContext.isWide` 공유).
      768~1024는 3컬럼도 오버레이라 헤더에 여유가 없어 같은 값이 맞다
- [ ] 푸터 "배경 없음" → 텍스트 폭만큼 배경. `pointer-events-none` 유지
- [ ] 스크롤 구조 절에 `overscroll-none` 명시
- [ ] 모바일 원칙 — "안 들어가면 가로 스크롤" → **"좁으면 덮기 모드"**.
      차단 화면 금지는 유지

## 11. `01-frontend-stack`

- [ ] 구현 순서표 11단계 → ✅
- [ ] **"미결 / 대기"에서 로그아웃 API 줄 삭제**
- [ ] 미결에 `GET /api/users/me` 부재 추가 (백엔드 반영 후 제거)
- [ ] `react-resizable-panels` **v4 기준 갱신**
      `PanelGroup`→`Group`, `PanelResizeHandle`→`Separator`,
      `direction`→`orientation`, `tagName` 삭제, px 단위 지원
- [ ] `react-markdown`은 12단계 그대로
- [ ] "확정된 제약"의 와이어프레임 차이 항목 갱신 (10번과 동일 내용)

## 12. `06-spec-detail-plan` (v0.1 → v0.2)

- [ ] 전제의 3컬럼 표 갱신, `min-w-[900px]` 폐기, `lg` 분기
- [ ] 파일 목록 갱신 — `mock.ts`가 `lib/`으로, 신규 6종 추가
- [ ] 11-1 ~ 11-9 완료 표시
- [ ] "결정 대기" 4건의 결론 기록

  | 결정                        | 결론                                      |
  | --------------------------- | ----------------------------------------- |
  | 태그 없는 엔드포인트 그룹명 | `Tag 없음`, 맨 아래                       |
  | 없는 `endpointId` 처리      | 중앙만 "찾을 수 없음", 사이드바 유지      |
  | 재귀 깊이 기본 접힘         | 2단계까지 펼침 (`OPEN_DEPTH = 2`)         |
  | example 자동 생성           | 요청 바디만 조립, 응답은 스펙에 있을 때만 |
  | Bearer 토큰 보관            | `useState`. 저장소 없음                   |

- [ ] 구현하며 확정된 설계 근거 추가
  - 순환 감지 책임 분리 — `$ref` 체인은 `useSpecCache`, 구조적 순환은 `SchemaTree`
  - Try it 입력을 본문에 통합(Swagger의 모드 토글 없음) → `SchemaTree`를 두 벌로 안 만든다
  - 파라미터는 `SchemaTree`를 쓰지 않는다. 거의 항상 스칼라라 재귀가 불필요
  - 엔드포인트 전환 시 `key={detail.id}` 리마운트 — `useEffect` 동기화보다 안전
  - `getMockEndpointDetail` 참조 안정성 — 매번 새 객체면 재귀 트리 memo가 무의미

---

# 후순위 (이번 반영에서 제외)

- **배포 문서** — 아직 만들지 않았다. 시스템을 다 만든 뒤 배포 문서를 새로 쓸 때
  SPA 폴백(`exclude: ['/api/{*path}']`)을 함께 넣는다. 위 6번 항목은 그때 참고한다.
- **와이어프레임** — `12-wireframe.html`(백), `00-wireframe.html`(프론트)은 그대로 둔다.
  구버전임은 `01-frontend-stack`과 `03-frontend-layouts`의 차이 항목에 이미 기록된다.
- **헤더 밀집도** — 좌측 아이콘 2개 + 우측 입력창 + 아이콘 2개 + 아바타.
  1024 미만에서 2행으로 갈라져 당장은 무너지지 않는다. 12~14단계 후 재검토.

---

# 반영 후

- [ ] 백엔드 문서 커밋 — `docs: users/me 추가, Try it out 제약 반영`
- [ ] 프론트 문서 커밋 — `docs: 11단계 완료분 반영`
- [ ] PR 본문의 "문서 미반영" 항목 제거
- [ ] `findMe` 구현을 팀에 요청 (담당 배정은 하지 않는다)

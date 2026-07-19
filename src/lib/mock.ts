// mock.ts — 목 데이터
//
// 스펙 원본: course-mgmt.json (수강신청 시스템, OpenAPI 3.0.0)
// 전체 19건 중 대표 2건만 남기고 검증용 픽스처 4건(id 90~)을 더했다.
// id는 원본 순번을 유지해 나중에 대조하기 쉽게 뒀다.
//
// method는 소문자다 — OAS Path Item Object의 키가 소문자이고 백엔드가 그대로 저장한다.
//
// 원본 스펙은 responses에 스키마가 하나도 없다(NestJS Swagger가 @ApiResponse 없이 생성).
// id 12가 그 상태를 대표하고, 응답 스키마 렌더는 픽스처 90/91로만 검증한다.
//
// TODO(데이터 단계): 이 파일 전체를 lib/api 호출로 교체하고 삭제한다.

import type {
  EndpointDetail,
  EndpointSummary,
  ProjectSummary,
  ProjectView,
  PublicUser,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// 1. 현재 로그인 유저 — UserMenu
//
// TODO(데이터 단계): AuthContext 가 대체한다.
// 아바타 이니셜은 백엔드에 없다. userName 에서 소비처가 파생시킨다.
// ---------------------------------------------------------------------------

export const MOCK_CURRENT_USER: PublicUser = {
  id: 1,
  userName: "빈영",
  email: "binyoung@example.com",
};

// ---------------------------------------------------------------------------
// 2. 프로젝트 단건 — AppLayout(설정) 헤더, SpecLayout 헤더
//
// TODO(데이터 단계): useProject(id) 응답의 .project 로 교체.
// role 은 그 프로젝트에서의 내 역할이다. Owner 판별에 useAuth 비교가 필요 없다.
// ---------------------------------------------------------------------------

export const MOCK_PROJECT: ProjectSummary = {
  id: 1,
  title: "수강신청 시스템",
  description: "학교 회원 아이디 발급 / 수업 개설 / 수강 신청",
  version: "1.0",
  oasVersion: "3.0.0",
  role: "OWNER",
  isDeleted: false,
};

// ---------------------------------------------------------------------------
// 3. 스펙 — components, 엔드포인트 목록, operation fragment
// ---------------------------------------------------------------------------

export const MOCK_SNAPSHOT_ID = 12;

// 프로젝트 진입 시 1회 통째로 받아 캐시한다. $ref 는 렌더 시점에 여기서 해석한다.
export const MOCK_COMPONENTS = {
  securitySchemes: {
    bearer: { scheme: "bearer", bearerFormat: "JWT", type: "http" },
  },
  schemas: {
    // 원본
    CreateEnrollmentDto: {
      type: "object",
      properties: { courseId: { type: "number", example: 1 } },
      required: ["courseId"],
    },
    // 원본
    UpdateUserDto: {
      type: "object",
      properties: {
        name: { type: "string", example: "홍길동" },
        email: { type: "string", example: "user@univ.ac.kr" },
        phone: { type: "string", example: "01012345678" },
      },
    },

    // [픽스처] 2단계 $ref: TimeTableBulkDto → items $ref → TimeTableDto
    TimeTableBulkDto: {
      type: "object",
      properties: {
        overwrite: { type: "boolean", example: true },
        timeTables: {
          type: "array",
          items: { $ref: "#/components/schemas/TimeTableDto" },
        },
      },
      required: ["timeTables"],
    },
    // [픽스처] 배열 안 중첩 객체 — FR-4.3 재귀 전개 대상
    TimeTableDto: {
      type: "object",
      properties: {
        dayOfWeek: {
          type: "string",
          enum: ["MON", "TUE", "WED", "THU", "FRI"],
          example: "MON",
        },
        hour: { type: "number", example: 1, description: "1교시부터 9교시" },
        room: {
          type: "object",
          properties: {
            building: { type: "string", example: "공학관" },
            number: { type: "string", example: "401" },
          },
        },
      },
      required: ["dayOfWeek", "hour"],
    },
    // [픽스처] 응답 스키마
    CourseDetailDto: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        title: { type: "string", example: "소프트웨어개발 방법론" },
        professor: {
          type: "object",
          properties: {
            id: { type: "number", example: 7 },
            name: { type: "string", example: "김교수" },
          },
        },
        timeTables: {
          type: "array",
          items: { $ref: "#/components/schemas/TimeTableDto" },
        },
      },
    },
    // [픽스처] 순환 참조 — children 이 자기 자신이다. 가드 없이 재귀하면 스택이 터진다.
    CategoryNodeDto: {
      type: "object",
      properties: {
        code: { type: "string", example: "MAJOR" },
        label: { type: "string", example: "전공" },
        children: {
          type: "array",
          items: { $ref: "#/components/schemas/CategoryNodeDto" },
        },
      },
    },
  },
};

// 경량 목록 — 삭제된 것을 포함해 전부 내려온다. 필터링은 프론트 책임.
export const MOCK_ENDPOINTS: EndpointSummary[] = [
  {
    id: 6,
    path: "/users/me",
    method: "patch",
    summary: "[회원] 내 정보 수정",
    tags: ["users"],
    isDeleted: false,
  },
  {
    id: 12,
    path: "/courses",
    method: "get",
    summary: "[회원] 강의 목록 조회",
    tags: ["courses"],
    isDeleted: false,
  },
  {
    id: 16,
    path: "/enrollments",
    method: "post",
    summary: "[학생] 수강 신청",
    tags: ["enrollments"],
    isDeleted: false,
  },
  {
    id: 19,
    path: "/enrollments/{id}",
    method: "delete",
    summary: "[학생|관리자] 수강 신청 취소",
    tags: ["enrollments"],
    isDeleted: false,
  },

  // --- [픽스처] 원본에 없음 ---
  {
    id: 90,
    path: "/courses/{id}/timetables",
    method: "put",
    summary: "[교수] 강의 시간표 일괄 등록",
    tags: ["courses"],
    isDeleted: false,
  },
  {
    id: 91,
    path: "/courses/categories",
    method: "get",
    summary: "[회원] 강의 분류 트리",
    tags: ["courses"],
    isDeleted: false,
  },
  {
    id: 92,
    path: "/courses/{id}/syllabus",
    method: "get",
    summary: "[회원] 강의계획서 조회",
    tags: ["courses"],
    isDeleted: true,
  },
  {
    id: 93,
    path: "/health",
    method: "get",
    summary: null,
    tags: [],
    isDeleted: false,
  },
  {
    id: 94,
    path: "/courses",
    method: "head",
    summary: "[회원] 강의 목록 헤더",
    tags: ["courses"],
    isDeleted: false,
  },
];

// operation fragment — 엔드포인트 클릭 시 1건씩 받는다.
// 이 객체가 EndpointDetail.operationJson 이다. 백엔드는 operation 을 통째로 저장한다.
// (mock 전용 저장소. 백엔드 응답 타입이 아니다.)
const BEARER = [{ bearer: [] }];

const OPERATIONS: Record<number, Record<string, unknown>> = {
  6: {
    operationId: "UsersController_updateMe",
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/UpdateUserDto" },
        },
      },
    },
    responses: { "200": { description: "" } },
    security: BEARER,
    summary: "[회원] 내 정보 수정",
    tags: ["users"],
  },
  12: {
    operationId: "CoursesController_findAll",
    parameters: [
      {
        name: "title",
        required: false,
        in: "query",
        schema: { example: "소프트웨어 공학", type: "string" },
      },
      {
        name: "courseType",
        required: false,
        in: "query",
        schema: {
          type: "string",
          enum: [
            "MAJOR_FOUNDATION",
            "MAJOR_REQUIRED",
            "MAJOR_ELECTIVE",
            "GENERAL_REQUIRED",
            "GENERAL_ELECTIVE",
            "FREE_ELECTIVE",
            "TEACHING_PROFESSION",
          ],
        },
      },
      {
        name: "year",
        required: false,
        in: "query",
        schema: { example: 2026, type: "number" },
      },
    ],
    responses: { "200": { description: "" } }, // 원본의 기본형 — 표시할 스키마가 없다
    security: BEARER,
    summary: "[회원] 강의 목록 조회",
    tags: ["courses"],
  },

  16: {
    operationId: "EnrollmentsController_create",
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/CreateEnrollmentDto" },
        },
      },
    },
    responses: { "201": { description: "" } },
    security: BEARER,
    summary: "[학생] 수강 신청",
    tags: ["enrollments"],
  },
  19: {
    operationId: "EnrollmentsController_remove",
    parameters: [
      { name: "id", required: true, in: "path", schema: { type: "number" } },
    ],
    responses: { "200": { description: "" } },
    security: BEARER,
    summary: "[학생|관리자] 수강 신청 취소",
    tags: ["enrollments"],
  },

  // [픽스처] 2단계 $ref + 중첩 객체 배열 + 응답 스키마/example
  90: {
    operationId: "CoursesController_replaceTimeTables",
    parameters: [
      { name: "id", required: true, in: "path", schema: { type: "number" } },
      {
        name: "X-Request-Id",
        required: false,
        in: "header",
        schema: { type: "string" },
        description: "요청 추적용",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/TimeTableBulkDto" },
        },
      },
    },
    responses: {
      "200": {
        description: "갱신된 강의",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CourseDetailDto" },
            example: {
              id: 1,
              title: "소프트웨어개발 방법론",
              professor: { id: 7, name: "김교수" },
              timeTables: [
                {
                  dayOfWeek: "MON",
                  hour: 1,
                  room: { building: "공학관", number: "401" },
                },
              ],
            },
          },
        },
      },
      "409": { description: "시간표 충돌" },
    },
    security: BEARER,
    summary: "[교수] 강의 시간표 일괄 등록",
    tags: ["courses"],
  },

  // [픽스처] 200 은 순환 $ref, 500 은 존재하지 않는 $ref.
  // 500 칸만 깨지고 200 칸은 정상 렌더돼야 한다.
  91: {
    operationId: "CoursesController_findCategories",
    parameters: [],
    responses: {
      "200": {
        description: "분류 트리",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: { $ref: "#/components/schemas/CategoryNodeDto" },
            },
          },
        },
      },
      "500": {
        description: "",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorDto" },
          },
        },
      },
    },
    security: BEARER,
    summary: "[회원] 강의 분류 트리",
    tags: ["courses"],
  },

  // [픽스처] 소프트 삭제. 상세와 댓글은 정상 열람돼야 한다(FR-8.2).
  92: {
    operationId: "CoursesController_findSyllabus",
    parameters: [
      { name: "id", required: true, in: "path", schema: { type: "number" } },
    ],
    responses: { "200": { description: "" } },
    security: BEARER,
    summary: "[회원] 강의계획서 조회",
    tags: ["courses"],
  },

  // [픽스처] 태그 없음, summary 없음, security 없음
  93: {
    operationId: null,
    parameters: [],
    responses: { "200": { description: "" } },
  },

  // [픽스처] 5종 밖 메서드. isHttpMethod 가드가 걸러 폴백 뱃지로 떨어져야 한다.
  94: {
    operationId: "CoursesController_headAll",
    parameters: [],
    responses: { "200": { description: "" } },
    security: BEARER,
    summary: "[회원] 강의 목록 헤더",
    tags: ["courses"],
  },
};

// ---------------------------------------------------------------------------
// 4. 프로젝트 진입 응답 — GET /api/projects/:id
// ---------------------------------------------------------------------------

export const MOCK_PROJECT_VIEW: ProjectView = {
  project: MOCK_PROJECT,
  // 원본 스펙의 servers 가 빈 배열이라 자동 추출이 불가능하다.
  // 프로젝트 생성 시 Owner 가 직접 입력한 값이다.
  // tryItBaseUrl: "https://course-mgmt.example.com/api",
  tryItBaseUrl: "https://jsonplaceholder.typicode.com",
  components: MOCK_COMPONENTS,
  snapshotId: MOCK_SNAPSHOT_ID,
  endpoints: MOCK_ENDPOINTS,
};

// FR-4.6 — baseUrl 이 없으면 Try it out 만 비활성, 나머지는 정상 동작해야 한다.
export const MOCK_PROJECT_VIEW_NO_BASE_URL: ProjectView = {
  ...MOCK_PROJECT_VIEW,
  tryItBaseUrl: null,
};

// Member 시점 — ⚙ 설정 버튼과 Owner 전용 액션이 숨어야 한다.
export const MOCK_PROJECT_VIEW_AS_MEMBER: ProjectView = {
  ...MOCK_PROJECT_VIEW,
  project: { ...MOCK_PROJECT, role: "MEMBER" },
};

// ---------------------------------------------------------------------------
// 5. 조회 헬퍼
// ---------------------------------------------------------------------------

const ENDPOINT_BY_ID = new Map(MOCK_ENDPOINTS.map((e) => [e.id, e]));

/**
 * GET /api/endpoints/:id 대응. 없는 id 는 null 을 반환한다.
 * "없음"이 정상 케이스이므로 throw 하지 않는다. 404 처리 여부는 호출부가 정한다.
 */
// export function getMockEndpointDetail(id: number): EndpointDetail | null {
//   const summary = ENDPOINT_BY_ID.get(id);
//   const operation = OPERATIONS[id];
//   if (!summary || !operation) return null;

//   return {
//     id: summary.id,
//     path: summary.path,
//     method: summary.method,
//     operationId: (operation.operationId as string | null) ?? null,
//     summary: summary.summary,
//     tags: summary.tags,
//     operationJson: operation,
//     isDeleted: summary.isDeleted,
//     snapshotId: MOCK_SNAPSHOT_ID,
//   };
// }

// 같은 id 에 항상 같은 객체를 돌려준다. 렌더마다 새 객체를 만들면
// SchemaTree 의 memo 가 무의미해진다(실제 API 는 TanStack Query 가 이 역할을 한다).
const DETAIL_CACHE = new Map<number, EndpointDetail>();

// [검증용] 이 id 의 상세 응답만 스냅샷을 올려 배너를 띄운다.
//
// 실제로는 스펙이 커밋되면 모든 엔드포인트가 새 snapshotId 를 돌려주므로
// 엔드포인트별로 갈리는 건 현실적이지 않다. 배너 동작만 보려는 임시 장치다.
// 확인 후 이 상수와 아래 참조를 지운다.
const MOCK_STALE_ENDPOINT_IDS = new Set<number>([91]);

export function getMockEndpointDetail(id: number): EndpointDetail | null {
  const cached = DETAIL_CACHE.get(id);
  if (cached) return cached;

  const summary = ENDPOINT_BY_ID.get(id);
  const operation = OPERATIONS[id];
  if (!summary || !operation) return null;

  const detail: EndpointDetail = {
    id: summary.id,
    path: summary.path,
    method: summary.method,
    operationId: (operation.operationId as string | null) ?? null,
    summary: summary.summary,
    tags: summary.tags,
    operationJson: operation,
    isDeleted: summary.isDeleted,
    snapshotId: MOCK_STALE_ENDPOINT_IDS.has(id)
      ? MOCK_SNAPSHOT_ID + 1
      : MOCK_SNAPSHOT_ID,
  };

  DETAIL_CACHE.set(id, detail);
  return detail;
}

// 11-9 — 응답 snapshotId 가 캐시보다 높다. "스펙 업데이트됨" 배너가 떠야 한다.
// export const MOCK_STALE_ENDPOINT_DETAIL: EndpointDetail = {
//   ...getMockEndpointDetail(12)!,
//   snapshotId: MOCK_SNAPSHOT_ID + 1,
// };

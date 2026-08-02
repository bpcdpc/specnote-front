import type { ROLE, REACTION_TYPE, NOTIFICATION_TYPE } from "./constants";

// 백엔드 응답 타입
//
// API 응답 body 에 등장하는 것만 둔다. 요청 DTO 는 lib/api/*.ts 의
// 함수 시그니처가 대신한다(05-code-conventions).
// 날짜는 전부 string 이다 — 백엔드가 Date 로 선언했어도 JSON 이면 ISO 문자열이다.

// ── 공통 ────────────────────────────────────────────────

// POST /api/users, GET /api/users/me, GET /api/users/search 응답.
// CommentView.author, MemberView.user 로도 쓰인다. 전역 신원 타입이다 —
// role 을 넣지 않는다. role 은 프로젝트마다 다르다.
export type PublicUser = { id: number; userName: string; email: string };

// 경량 참조. 이름만 필요한 자리에 쓴다.
// PublicUser 와 키가 다르다 — id 가 아니라 userId 다.
export type UserRef = { userId: number; userName: string };
export type EndpointRef = {
  endpointId: number;
  path: string;
  method: string;
};

// ── projects ────────────────────────────────────────────

// GET /api/projects (목록), PATCH /api/projects/:id 응답.
// ProjectView.project 로도 온다.
// isDeleted 는 실질적으로 항상 false 다 — 서버가 삭제된 것을 목록에서 제외하고,
// 직접 진입하면 MembershipGuard 가 404 를 낸다. 이 필드로 분기하지 않는다.
export type ProjectSummary = {
  id: number;
  title: string;
  description: string | null;
  version: string;
  oasVersion: string;
  role: ROLE;
  isDeleted: boolean;
};

// GET /api/projects/:id (진입), POST /api/projects (생성) 응답.
// 사이드바 목록과 components 를 한 번에 준다.
export type ProjectView = {
  project: ProjectSummary;
  specJsonUrl: string;
  tryItBaseUrl: string | null;
  components: unknown; // components JSON, 프론트가 캐싱·파싱
  snapshotId: number; // 프론트 캐시 기준 스냅샷 id
  endpoints: EndpointSummary[]; // 삭제 포함 전체 경량 목록
};

// ProjectView.endpoints 의 원소. operationJson 을 뺀 사이드바용이다.
// 여기의 isDeleted 는 프론트가 직접 쓴다 — 사이드바 토글, 멘션 후보 제외(FR-8.3),
// 댓글 이동 대상 제외(FR-12.3). 프로젝트 쪽과 달리 실제로 true 가 온다.
export type EndpointSummary = {
  id: number;
  path: string;
  method: string;
  summary: string | null;
  tags: string[];
  isDeleted: boolean;
};

// POST /api/projects/:id/spec-commits 응답
export type EndpointDiff = {
  added: number;
  removed: number;
  updated: number;
  revived: number;
};
export type SpecCommitResult = { snapshotId: number; diff: EndpointDiff };

// GET /api/projects/:id/members 응답. isDeleted=false 만 온다.
// Prisma Membership 원형이 아니다 — 화면이 쓰는 것은 이름과 역할뿐이고
// projectId 는 URL 이 이미 갖고 있다.
export type MemberView = {
  user: PublicUser;
  role: ROLE;
};

// POST /api/projects/:id/members (초대), DELETE .../:userId (제거) 응답.
// Prisma 원형 그대로다. 화면은 이 값을 쓰지 않는다 — 변경 후 멤버 목록을 재조회한다.
export type Membership = {
  id: number;
  projectId: number;
  userId: number;
  role: ROLE;
  isDeleted: boolean;
  createdAt: string;
};

// ── endpoints ───────────────────────────────────────────

// GET /api/endpoints/:id 응답
export type EndpointDetail = {
  id: number;
  path: string;
  method: string;
  operationId: string | null;
  summary: string | null;
  tags: string[];
  operationJson: unknown; // operation JSON, 프론트가 파싱 (서버 pass-through)
  isDeleted: boolean;
  // ProjectView.snapshotId 와 비교해 스펙 갱신을 감지한다(FR-10.6).
  snapshotId: number;
};

// ── comments ────────────────────────────────────────────

// 프리즈마 댓글/리액션 원형.
// 실제로 읽는 값은 Comment.id 하나다(highlightedId — 방금 등록한 항목으로 스크롤).
// Reaction 은 어느 필드도 읽지 않는다. api 함수 시그니처를 위해서만 둔다.
export type Comment = {
  id: number;
  endpointId: number;
  userId: number;
  content: string;
  isDeleted: boolean;
  parentId: number | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
};

export type Reaction = {
  id: number;
  commentId: number;
  userId: number;
  type: REACTION_TYPE;
  projectId: number;
  createdAt: string;
};

// GET /api/endpoints/:id/comments 응답. 최상위 배열이 CommentTree[] 다.
// 삭제 댓글도 자리를 지킨다(FR-5.3) — content 는 서버가 마스킹해서 보낸다.
export type CommentView = {
  id: number;
  endpointId: number;
  parentId: number | null;
  content: string;
  isDeleted: boolean;
  author: PublicUser;
  isAiGenerated: boolean; // 작성자가 전역 AI 계정이면 true
  createdAt: string;
  updatedAt: string;
  reactions: ReactionSummary[];
  memberMentions: UserRef[];
  endpointMentions: EndpointRef[];
};

// 2뎁스 고정. 대댓글에는 replies 가 없다.
export type CommentTree = CommentView & { replies: CommentView[] };

// CommentView.reactions 의 원소. 타입별 집계라 users 에 여러 명이 들어간다.
// count 와 users.length 는 항상 같다.
export type ReactionSummary = {
  type: REACTION_TYPE;
  count: number;
  reactedByMe: boolean;
  users: UserRef[];
};

// ── notifications ───────────────────────────────────────

// GET /api/notifications 응답.
// projectId, endpointId 는 mentionedCommentId 조인으로 파생된 값이다 —
// 13단계 딥링크가 이 둘로 경로를 만든다.
export type NotificationView = {
  id: number;
  type: NOTIFICATION_TYPE;
  isRead: boolean;
  createdAt: string;
  invitedProjectId: number | null; // INVITED
  mentionedCommentId: number | null; // MENTIONED
  projectId: number | null; // MENTIONED
  endpointId: number | null; // MENTIONED
};

// PATCH /api/notifications/:id/read 응답. Prisma 원형 그대로다.
// 화면은 이 값을 쓰지 않는다 — 읽음 처리 후 목록을 재조회한다.
// api 함수 시그니처를 위해서만 둔다.
export type Notification = {
  id: number;
  type: NOTIFICATION_TYPE;
  recipientId: number;
  senderId: number;
  isRead: boolean;
  mentionedCommentId: number | null;
  invitedProjectId: number | null;
  createdAt: string;
};

// ── 프론트 내부 ─────────────────────────────────────────

// 백엔드 응답이 아니다. 에디터가 본문에서 뽑아 CreateCommentDto 로 보낼 ID 묶음.
// 키 이름이 DTO(mentionedUserIds)와 다르다 — API 함수가 그 자리에서 맞춘다.
export type MentionIds = { userIds: number[]; endpointIds: number[] };

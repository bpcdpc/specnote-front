import type { ROLE, REACTION_TYPE, NOTIFICATION_TYPE } from "./constants";

export type EndpointSummary = {
  id: number;
  path: string;
  method: string;
  summary: string | null;
  tags: string[];
  isDeleted: boolean;
};

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
  snapshotId: number; // 정합성 비교용 최신 스냅샷 id
};

export type ProjectSummary = {
  id: number;
  title: string;
  description: string | null;
  version: string;
  oasVersion: string;
  role: ROLE;
  isDeleted: boolean;
};

export type ProjectView = {
  project: ProjectSummary;
  tryItBaseUrl: string | null;
  components: unknown; // components JSON, 프론트가 캐싱·파싱
  snapshotId: number; // 프론트 캐시 기준 스냅샷 id
  endpoints: EndpointSummary[]; // 삭제 포함 전체 경량 목록
};

// 멤버 목록 응답
export type MemberView = {
  user: PublicUser;
  role: ROLE;
};

export type PublicUser = { id: number; userName: string; email: string };

// 댓글 입력/수정 시 함께 보내는 멘션 대상 ID type.
export type MentionIds = { userIds: number[]; endpointIds: number[] };

// 경량 참조 타입
export type UserRef = { userId: number; userName: string };
export type EndpointRef = {
  endpointId: number;
  path: string;
  method: string;
};

export type NotificationView = {
  id: number;
  type: NOTIFICATION_TYPE;
  isRead: boolean;
  createdAt: string;
  invitedProjectId: number | null; // INVITED
  mentionedCommentId: number | null; // MENTIONED
  projectId: number | null; // MENTIONED: mentionedCommentId 조인 파생
  endpointId: number | null; // MENTIONED: mentionedCommentId 조인 파생
};

export type ReactionSummary = {
  type: REACTION_TYPE;
  count: number;
  reactedByMe: boolean;
  users: UserRef[];
};

// 댓글 조회 뷰(findComments 전용). 삭제 댓글의 content 는 서버에서 마스킹.
export type CommentView = {
  id: number;
  endpointId: number;
  parentId: number | null;
  content: string;
  isDeleted: boolean;
  author: PublicUser;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  reactions: ReactionSummary[];
  memberMentions: UserRef[];
  endpointMentions: EndpointRef[];
};

// 댓글 + 대댓글 한 세트 (2뎁스 고정)
export type CommentTree = CommentView & { replies: CommentView[] };

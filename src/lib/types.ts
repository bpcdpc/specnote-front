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

export type PublicUser = { id: number; userName: string; email: string };

// 댓글 입력/수정 시 함께 보내는 멘션 대상 ID type.
export type MentionIds = { userIds: number[]; endpointIds: number[] };

// 댓글 조회할 때 받는 멘션 정보 type.
export type MemberMention = { userId: number; userName: string };
export type EndpointMention = {
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
  // 누가 눌렀는지. 백엔드 미반영 상태라 옵셔널이다 —
  // 없으면 팝오버가 이름 없이 개수만 보여준다.
  users?: MemberMention[];
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
  memberMentions: MemberMention[];
  endpointMentions: EndpointMention[];
};

// 댓글 + 대댓글 한 세트 (2뎁스 고정)
export type CommentTree = CommentView & { replies: CommentView[] };

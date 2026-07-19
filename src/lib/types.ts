import type { ROLE, REACTION_TYPE, NOTIFICATION_TYPE } from "./constants";

export type EndpointSummary = {
  id: number;
  path: string;
  method: string;
  summary: string | null;
  tags: string[];
  isDeleted: boolean;
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
};

export type PublicUser = { id: number; userName: string; email: string };

// 조회 뷰(findComments 전용). 삭제 댓글의 content 는 서버에서 마스킹.
export type CommentView = {
  id: number;
  endpointId: number | null;
  parentId: number | null;
  content: string;
  isDeleted: boolean;
  author: PublicUser;
  createdAt: string;
  updatedAt: string;
  reactions: ReactionSummary[];
  memberMentions: { userId: number; userName: string }[];
  endpointMentions: { endpointId: number; path: string; method: string }[];
};

// 댓글 + 대댓글 한 세트 (2뎁스 고정)
export type CommentTree = CommentView & { replies: CommentView[] };

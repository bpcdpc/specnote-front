import type { REACTION_TYPE } from "../constants";
import type { Reaction, Comment, CommentTree, MentionIds } from "../types";
import { api } from "./client";

// 로컬 타입이다. types.ts 로 올리지 않는다 — 소비처가 이 파일 셋뿐이다
// (05-code-conventions: 요청 DTO는 두지 않는다).
// 이름을 붙인 이유는 MentionIds → DTO 키 변환이 세 곳에서 반복되고,
// 키를 틀려도 백엔드가 @IsOptional 로 통과시켜 멘션만 조용히 사라지기 때문이다.
type CommentBody = {
  content: string;
  mentionedUserIds: number[];
  mentionedEndpointIds: number[];
};

// 작성, 대댓글, 수정 세 곳이 같은 body 를 쓴다.
// MentionIds 의 키(userIds)와 DTO 의 키(mentionedUserIds)가 달라 여기서 맞춘다.
function toCommentBody(content: string, mentions: MentionIds): CommentBody {
  return {
    content,
    mentionedUserIds: mentions.userIds,
    mentionedEndpointIds: mentions.endpointIds,
  };
}

// GET  /api/endpoints/:id/comments
// →  CommentTree[]  (2뎁스 고정. 최상위와 replies 모두 시간순 asc 로 온다)
//
// 삭제된 댓글도 자리를 지킨다 — content 는 서버가 마스킹한다(FR-5.3).
// 단건 조회 API 와 페이지네이션은 없다. 전량 로드로 해결한다.
// 404 — 없는 엔드포인트, 또는 남의 프로젝트 것(리소스 은닉).
//       getEndpointDetail 과 같아서 호출부는 고정 문구를 쓴다.
export function getComments(endpointId: number) {
  return api.get<CommentTree[]>(`/endpoints/${endpointId}/comments`);
}

// POST /api/endpoints/:id/comments
// →  Comment  (원형. 목록 재조회로 화면을 갱신한다)
//
// 400 — content 공백(trim 후 빈 문자열)
// 400 — 멘션 대상이 프로젝트 멤버 아님 / 없거나 삭제된 엔드포인트(리소스 은닉)
// 404 — 없는 엔드포인트. 가드가 서비스 앞에서 막는다
export function createComment(
  endpointId: number,
  content: string,
  mentions: MentionIds,
) {
  return api.post<Comment>(
    `/endpoints/${endpointId}/comments`,
    toCommentBody(content, mentions),
  );
}

// POST /api/comments/:id/replies
// →  Comment  (원형. 목록 재조회로 화면을 갱신한다)
//
// :id 는 endpointId 가 아니라 부모 commentId 다. endpointId 는 서버가 부모에서 상속시킨다.
// 그래서 무효화 키(["comments", endpointId])는 이 함수가 모른다 — 호출부가 갖고 있다.
//
// 대댓글에 답글을 달아도 최상위의 자식으로 승격된다(normalizeReply, 2뎁스 고정).
// 프론트는 최상위에만 답글 버튼을 두므로 정상 경로에서 이 승격은 일어나지 않는다.
//
// 400 — content 공백(trim 후 빈 문자열)
// 400 — AI 요약 댓글에 답글. 화면이 canReply 로 이미 막는다
// 400 — 멘션 대상이 프로젝트 멤버 아님 / 없거나 삭제된 엔드포인트(리소스 은닉)
// 404 — 없는 부모 댓글
export function createReply(
  parentId: number,
  content: string,
  mentions: MentionIds,
) {
  return api.post<Comment>(
    `/comments/${parentId}/replies`,
    toCommentBody(content, mentions),
  );
}

// PATCH /api/comments/:id
// →  Comment  (원형. 목록 재조회로 화면을 갱신한다)
//
// content 와 멘션을 함께 교체한다. 멘션은 전량 삭제 후 재생성되고 신규 추가분에만 알림이 간다.
//
// 400 — content 공백
// 400 — 이미 삭제된 댓글
// 400 — 멘션 대상이 프로젝트 멤버 아님 / 없거나 삭제된 엔드포인트
//       옛 댓글의 토큰을 그대로 재전송하면 여기서 걸린다. 멘션했던 엔드포인트가 그 사이
//       삭제되거나 멤버가 제외되면 수정 자체가 막힌다 — extractIds 가 걸러 보낸다
// 403 — 작성자 아님(assertAuthor). 이 문구는 화면에 그대로 띄워도 된다
// 404 — 없는 댓글. 가드(@ProjectScope('comment'))가 서비스 앞에서 막는다.
//       문구가 두 갈래(댓글 없음 / 비멤버)이고 후자는 댓글 패널에서 뜬금없으므로 화면은 고정 문구를 쓴다.
export function updateComment(
  commentId: number,
  content: string,
  mentions: MentionIds,
) {
  return api.patch<Comment>(
    `/comments/${commentId}`,
    toCommentBody(content, mentions),
  );
}

// DELETE /api/comments/:id
// →  Comment  (content 가 마스킹 문구로 갈아끼워진 원형)
//
// 소프트 삭제다. 목록에서 빠지지 않고 자리를 지킨다(FR-5.3) —
// 빼면 답글이 고아가 되고 누가 뭘 지웠는지의 맥락이 사라진다. 개수 집계에도 포함된다.
// DB 의 content 는 원문 그대로 남고 응답 객체만 갈아끼워진다.
//
// 400 — 이미 삭제된 댓글
// 403 — 작성자 아님(assertAuthor)
// 404 — 없는 댓글. 가드(@ProjectScope('comment'))가 서비스 앞에서 막는다.
//       문구가 두 갈래(댓글 없음 / 비멤버)이고 후자는 댓글 패널에서 뜬금없으므로 화면은 고정 문구를 쓴다
export function deleteComment(commentId: number) {
  return api.delete<Comment>(`/comments/${commentId}`);
}

// POST /api/comments/:id/reactions
// →  Reaction | null  (제거하면 null. 어느 쪽도 읽지 않고 재조회한다)
//
// 토글이다. 같은 (commentId, userId, type) 이 있으면 지우고 없으면 만든다.
// 서버가 댓글의 isDeleted 를 보지 않으므로 삭제된 댓글에도 달린다(FR-5.3).
//
// 400 — REACTION_TYPE 밖의 값(class-validator)
// 404 — 없는 댓글(가드)
export function toggleReaction(commentId: number, type: REACTION_TYPE) {
  return api.post<Reaction | null>(`/comments/${commentId}/reactions`, {
    type,
  });
}

// POST /api/endpoints/:id/ai-summary
// →  Comment  (AI 계정 명의로 새로 만들어진 최상위 댓글. 원형)
//
// 요청 body 가 없다.
//
// 수집 대상에서 삭제된 댓글과 이전 AI 요약을 뺀다. 후자를 안 빼면 요약의 요약이 되어
// 회차마다 원문에서 멀어진다. parentId 조건은 없다 — 대댓글도 수집된다.
// 그래서 버튼 활성 조건을 화면 개수로 잡으면 어긋난다. 미삭제이고 AI 작성이 아닌 댓글이
// 하나라도 있어야 한다.
//
// 매번 새 댓글이 쌓인다. 기존 요약을 갱신하지 않는다(UC-14).
// 삭제된 엔드포인트에서도 동작한다(FR-11.2).
//
// Azure 호출이 끼어 다른 mutation 보다 눈에 띄게 느리다. isPending 동안 버튼을 잠그고
// 표시를 준다 — 아무 반응이 없으면 사용자가 다시 누른다.
//
// 400 — 요약할 댓글이 0건
// 500 — AI 계정 미시드(서버 구성 문제)
// 500 — Azure 호출 실패 또는 빈 응답. 400 으로 바꾸지 않는다. 사용자가 고칠 것이 없다
export function createSummary(endpointId: number) {
  return api.post<Comment>(`/endpoints/${endpointId}/ai-summary`);
}

// [Owner]
// PATCH /api/endpoints/:id/comments/move
// →  void  (본문 없음)
//
// :id 는 옮길 댓글들이 붙어 있는 원본 엔드포인트다. 단위는 스레드가 아니라 엔드포인트다 —
// 그 엔드포인트의 댓글 전량이 한 번에 옮겨간다(최상위, 대댓글, 삭제된 것 모두).
// 라우트를 CommentsController 가 아니라 EndpointsController 가 받는다.
//
// 성공 후 무효화가 둘이다 — 원본 ["comments", endpointId] 와 대상 ["comments", targetId].
// 대상 쪽을 빼먹으면 옮겨간 곳을 열었을 때 옛 목록이 보인다.
//
// 옮길 댓글이 0건이어도 에러가 아니다.
//
// 400 — 대상 엔드포인트가 없음 / 삭제됨 / 다른 프로젝트 소속 (셋을 하나로 통일, 리소스 은닉).
//       404 가 아닌 이유는 요청 body 의 값 문제라 리소스 은닉 대상이 아니기 때문이다
export function moveComments(endpointId: number, targetEndpointId: number) {
  return api.patch<void>(`/endpoints/${endpointId}/comments/move`, {
    targetEndpointId,
  });
}

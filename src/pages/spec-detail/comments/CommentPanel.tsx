import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { parseId } from "@/lib/routeParams";
import { useSpecPanels } from "../SpecPanelsContext";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { PANEL } from "../panelMetrics";
import { IconButton } from "@/components/IconButton";
import { CommentThread } from "./CommentThread";
import { CommentEditor } from "./CommentEditor";
import { MoveCommentsPopover } from "./MoveCommentsPopover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  CommentProvider,
  useCommentContext,
  type CommentData,
} from "./CommentContext";
import type { MentionIds, SpecOperation } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  createReply,
  createSummary,
  deleteComment,
  getComments,
  moveComments,
  toggleReaction,
  updateComment,
} from "@/lib/api/comments";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ApiError } from "@/lib/api/client";
import type { REACTION_TYPE } from "@/lib/constants";

// CommentPanel — 오른쪽 컬럼 골격
//
// 3단 구조다. 헤더와 입력창은 고정, 가운데 목록만 스크롤한다.
// 스크롤 주체는 이 패널이 아니라 컬럼(SpecColumns)이다. 왼쪽 날개와 같은 방식으로
// 고정 영역을 sticky 로 만든다 — 패널이 자기 안에서 따로 스크롤하면
// 좁은 폭 오버레이에서 스크롤 컨테이너가 이중으로 겹친다.
//
// Provider 와 본문을 나눈 이유 — 헤더가 isOwner 를 컨텍스트에서 읽어야 하는데
// Provider 와 같은 컴포넌트에 있으면 자기가 만든 값을 못 읽는다.
//
// key 를 Inner 가 아니라 Provider 에 건다.
// 엔드포인트를 바꿨을 때 초기화돼야 하는 상태가 Provider 쪽에도 있다 — (editing, highlightedId)
// Inner 에 걸면 답글 에디터가 열린 채로 다른 엔드포인트에 남는다.
// 목록 자체는 쿼리 키가 갈려 알아서 바뀐다.
export function CommentPanel({
  me,
  isOwner,
  outdated,
  members,
  endpoints,
  endpointId,
}: CommentData & { endpointId: number | null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setCommentsOpen } = useSpecPanels();

  // 알림 딥링크 — /projects/:id/endpoints/:id?comment=:commentId (03-frontend-layouts).
  // parseId 로 거른다. 남이 준 URL 이라 값을 신뢰하지 않는다.
  const deepLinkId = parseId(searchParams.get("comment") ?? undefined);

  // 소비 후 파라미터를 뗀다.
  //
  // 안 떼면 세 가지가 남는다 —
  // 1. 주소창에 죽은 값
  // 2. 이 엔드포인트를 떠났다 돌아올 때마다 되살아나는 하이라이트
  // 3. 사용자가 URL 을 복사했을 때 남에게 전달되는 남의 알림 흔적.
  //
  // replace 로 히스토리를 늘리지 않는다. 뒤로가기가 같은 화면을 두 번 거치면 안 된다.
  useEffect(() => {
    if (deepLinkId === null) return;

    // 좁은 폭에서는 댓글 패널이 닫힌 채로 도착한다.
    // 하이라이트는 화면 밖에서 뜨고 스스로 꺼져 흔적이 남지 않는다.
    setCommentsOpen(true);

    const next = new URLSearchParams(searchParams);
    next.delete("comment");
    setSearchParams(next, { replace: true });
  }, [deepLinkId, searchParams, setSearchParams, setCommentsOpen]);

  return (
    <CommentProvider
      key={endpointId}
      me={me}
      isOwner={isOwner}
      outdated={outdated}
      members={members}
      endpoints={endpoints}
      // 첫 렌더에만 쓰인다. 파라미터를 떼면 이 값은 null 이 되지만
      // Provider 는 이미 만들어진 뒤라 상태가 유지된다.
      initialHighlightedId={deepLinkId}
    >
      <CommentPanelInner endpointId={endpointId} />
    </CommentProvider>
  );
}

function CommentPanelInner({ endpointId }: { endpointId: number | null }) {
  const { editing, setEditing, setHighlightedId } = useCommentContext();

  const queryClient = useQueryClient();

  const {
    data: threads,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", endpointId],
    // enabled 가 endpointId !== null 을 보장한다.
    queryFn: () => getComments(endpointId!),
    enabled: endpointId !== null,
  });

  // 댓글 이동 대상. null 이면 다이얼로그 안 뜸. 팝오버에서 고르면 세팅된다.
  // 이동 후 total 이 0 이 되므로, 다이얼로그 문구에 쓸 개수를 함께 담는다.
  const [moveTarget, setMoveTarget] = useState<{
    endpoint: SpecOperation;
    count: number;
  } | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const createCommentMutation = useMutation({
    // mutationFn 은 인자를 하나만 받기 때문에, 둘 이상은 객체로 묶어서 줘야한다.
    // endpointId 는 여기서 아직 number | null 이다 —
    // 실행 시점에는 조기 return 을 통과한 뒤라 null 이 아니지만, 타입 통과를 위해 이렇게 써야한다.
    mutationFn: (vars: { content: string; mentions: MentionIds }) =>
      createComment(endpointId!, vars.content, vars.mentions),
    onSuccess: async (comment) => {
      // 재조회가 끝난 뒤에 세팅해야 해서 async로 선언한다.
      // 그 전에 하면 스크롤할 DOM 노드가 아직 없어 CommentItem 의 scrollIntoView 가 빈 동작이 된다.
      await queryClient.invalidateQueries({
        queryKey: ["comments", endpointId],
      });
      setHighlightedId(comment.id);
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: (vars: {
      parentId: number;
      content: string;
      mentions: MentionIds;
    }) => createReply(vars.parentId, vars.content, vars.mentions),
    onSuccess: async (comment) => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", endpointId],
      });
      setHighlightedId(comment.id);
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (vars: {
      commentId: number;
      content: string;
      mentions: MentionIds;
    }) => updateComment(vars.commentId, vars.content, vars.mentions),
    onSuccess: async (comment) => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", endpointId],
      });
      setHighlightedId(comment.id);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", endpointId],
      });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: (vars: { commentId: number; type: REACTION_TYPE }) =>
      toggleReaction(vars.commentId, vars.type),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", endpointId],
      });
    },
  });

  const summarizeCommentMutation = useMutation({
    mutationFn: (endpointId: number) => createSummary(endpointId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", endpointId],
      });
    },
  });

  const moveCommentsMutation = useMutation({
    mutationFn: (vars: { endpointId: number; targetEndpointId: number }) =>
      moveComments(vars.endpointId, vars.targetEndpointId),
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", endpointId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["comments", vars.targetEndpointId],
      });
    },
  });

  if (endpointId === null) {
    return (
      <>
        <PanelHeader />
        <div className={PANEL.comments.body}>
          <p className="px-2 pt-16 text-center text-sm text-fg-3">
            엔드포인트를 선택하면 댓글이 표시됩니다
          </p>
        </div>
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <PanelHeader />
        <div className={PANEL.comments.body}>
          <LoadingState label="댓글을 불러오는 중…" />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PanelHeader />
        <div className={PANEL.comments.body}>
          <ErrorState
            error={error}
            fallback="댓글을 불러오지 못했습니다."
            onRetry={refetch}
          />
        </div>
      </>
    );
  }

  // 삭제된 댓글도 자리를 지키므로(FR-5.3) 세는 대상에 포함한다.
  const total = threads.reduce((sum, t) => sum + 1 + t.replies.length, 0);
  const isEmpty = total === 0;

  // AI 요약 버튼의 활성 조건.
  // 서버는 수집에서 삭제분과 이전 AI 요약을 빼므로, total > 0 이어도 남는 게 없으면 400 이 온다.
  // 개수가 아니라 1건 이상 있는지만 본다.
  // 답글도 수집 대상이다 — 서버 조건에 parentId 가 없다.
  const canSummarize = threads.some(
    (t) =>
      (!t.isDeleted && !t.isAiGenerated) ||
      t.replies.some((r) => !r.isDeleted && !r.isAiGenerated),
  );

  const pickMoveTarget = (endpoint: SpecOperation) => {
    setMoveTarget({ endpoint, count: total });
  };

  // 이동 다이얼로그의 확인 버튼.
  // 이름을 moveComments 로 두지 않는다 —
  // lib/api/comments 의 moveComments 와 같은 스코프에서 충돌한다.
  //
  // 무효화가 둘이다 — 원본과 대상. 대상을 빼먹으면 옮겨간 곳을 열었을 때 옛 목록이 보인다.
  //
  // 이동하면 이 엔드포인트의 댓글이 전량 사라진다.
  // 열려 있던 에디터를 닫지 않으면 대상이 없어진 채 남고, 거기서 제출하면 404 다.
  // 전량이라 조건 비교가 필요 없다.
  //
  // 성공도 toast 다.
  // 삭제/리액션과 달리 결과가 "댓글이 사라짐"뿐이라 어디로 갔는지 화면에서 알 수 없기 때문에
  // toast로 알린다.
  const confirmMove = async () => {
    if (!moveTarget) return;
    const { endpoint } = moveTarget;

    try {
      await moveCommentsMutation.mutateAsync({
        endpointId,
        targetEndpointId: endpoint.id,
      });
      setEditing(null);
      toast.add({
        title: "댓글을 옮겼습니다",
        description: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
        type: "success",
      });
    } catch (e) {
      toast.add({
        title:
          e instanceof ApiError ? e.message : "댓글을 옮기는데 실패했습니다",
        type: "error",
      });
    } finally {
      setMoveTarget(null);
    }
  };

  // 삭제 다이얼로그의 확인 버튼.
  // 성공 토스트를 띄우지 않는다 — 본문이 마스킹 문구로 바뀌어 결과가 이미 보인다.
  // 실패는 toast 다. 아이콘 버튼이라 인라인으로 붙일 자리가 없다.
  const confirmDelete = async () => {
    if (deleteTargetId === null) return;

    try {
      await deleteCommentMutation.mutateAsync(deleteTargetId);

      // 지운 댓글을 대상으로 열려 있던 에디터를 닫는다.
      // 안 닫으면 답글 에디터가 남고, 거기서 제출하면 백엔드 normalizeReply 가
      // isDeleted 를 보지 않아 삭제된 댓글에 답글이 달린다.
      // 무조건 비우지 않는 이유는 다른 댓글을 편집 중일 수 있어서다.
      const openTargetId =
        editing?.mode === "reply" ? editing.threadId : editing?.commentId;

      if (openTargetId === deleteTargetId) setEditing(null);
    } catch (e) {
      toast.add({
        title: e instanceof ApiError ? e.message : "댓글을 삭제하지 못했습니다",
        type: "error",
      });
    } finally {
      setDeleteTargetId(null);
    }
  };

  // mutate 말고 mutateAsync 를 쓴다.
  // mutate 는 실패를 throw 하지 않으므로 CommentEditor 의 try/catch 를 안 타고,
  // catch 대신 그 아래 setValue("") 가 실행되어 서버가 거절한 입력이 사라진다.
  // 실패했을 때 남아있어야 하는 값을 CommentEditor에서 가지고 있기 때문에
  // 여기에서는 값을 stale 처리만 해주고 실제 catch는 CommentEditor에서 처리한다.
  // addComment, addReply, editComment 모두 마찬가지
  const addComment = async (content: string, mentions: MentionIds) => {
    await createCommentMutation.mutateAsync({ content, mentions });
  };

  const addReply = async (
    parentId: number,
    content: string,
    mentions: MentionIds,
  ) => {
    await createReplyMutation.mutateAsync({
      parentId,
      content,
      mentions,
    });
  };

  const editComment = async (
    commentId: number,
    content: string,
    mentions: MentionIds,
  ) => {
    await updateCommentMutation.mutateAsync({
      commentId,
      content,
      mentions,
    });
  };

  // 리액션 토글.
  // 응답이 Reaction 한 행(또는 null)이라
  // 화면이 쓰는 값 (count, reactedByMe, users)를 만들 수 없다. 재조회가 유일한 경로다.
  // 성공 토스트는 없다 — 칩의 숫자와 배경이 결과를 그대로 보여준다.
  // 실패만 toast 다. ReactionBar 에는 문구를 붙일 자리가 없다(패널 최소폭 240px).
  //
  // 실패후 처리에 필요한 값들이 자식 컴포넌트에 남아있을 필요가 없어서 여기에서 catch 할 수 있다.
  const toggleCommentReaction = async (
    commentId: number,
    type: REACTION_TYPE,
  ) => {
    try {
      await toggleReactionMutation.mutateAsync({ commentId, type });
    } catch (e) {
      toast.add({
        title: e instanceof ApiError ? e.message : "반응을 남기지 못했습니다",
        type: "error",
      });
    }
  };

  const summarizeComment = async () => {
    try {
      const comment = await summarizeCommentMutation.mutateAsync(endpointId);
      setHighlightedId(comment.id);
    } catch (e) {
      // 에러 메세지 분기 :
      // 400 요약할 댓글이 없습니다. — 그대로 사용.
      // 500 AI 계정이 없습니다. npx prisma db seed 를 먼저 실행하세요. — 사용자에게 띄울 수 없음.
      // 500 Azure 실패 — 문구가 정해져 있지 않다
      toast.add({
        title:
          e instanceof ApiError && e.status < 500
            ? e.message
            : "AI 댓글 요약에 실패했습니다",
        type: "error",
      });
    }
  };

  return (
    <>
      <PanelHeader
        actions={{
          total,
          endpointId,
          onSummarize: summarizeComment,
          canSummarize,
          isSummarizing: summarizeCommentMutation.isPending,
          onPick: pickMoveTarget,
        }}
      />

      <div className={PANEL.comments.body}>
        {isEmpty ? (
          <p className="px-2 pt-16 text-center text-sm text-fg-3">
            첫 댓글을 남겨보세요
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {/* 서버가 asc로 준다. 논의 흐름이 위에서 아래로 읽힌다. */}
            {threads.map((thread) => (
              <li key={thread.id}>
                <CommentThread
                  thread={thread}
                  onReply={addReply}
                  onEdit={editComment}
                  onDelete={setDeleteTargetId}
                  onToggleReaction={toggleCommentReaction}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={PANEL.comments.stickyBottom}>
        <div className="pt-3">
          <CommentEditor onSubmit={addComment} submitLabel="등록" />
        </div>
      </div>
      {/* 이동 다이얼로그 */}
      <AlertDialog
        open={moveTarget !== null}
        onOpenChange={(o) => {
          if (!o) setMoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글을 이동할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {moveTarget && (
                <>
                  이 엔드포인트의 댓글 {moveTarget.count}개가{" "}
                  <span className="font-mono text-fg-1">
                    {moveTarget.endpoint.method.toUpperCase()}{" "}
                    {moveTarget.endpoint.path}
                  </span>{" "}
                  (으)로 옮겨집니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={moveCommentsMutation.isPending}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmMove}
              disabled={moveCommentsMutation.isPending}
            >
              {moveCommentsMutation.isPending ? `이동중...` : `이동`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* 삭제 다이얼로그 */}
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>글을 삭제할까요?</AlertDialogTitle>
            {/* 답글 , 댓글 모두 소프트 삭제이므로 해당 내용을 사용자에게 알린다. */}
            <AlertDialogDescription>
              내용이 "삭제된 글입니다"로 바뀌며 되돌릴 수 없습니다. 답글과
              리액션은 남습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommentMutation.isPending}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? `삭제중...` : `삭제`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// 헤더 — 제목 + 개수 + 액션 2개.
// actions 를 생략하면 미선택, 대기, 실패 중 하나다.
// 개수를 모르고 두 액션도 성립하지 않아 제목만 그린다.
type PanelHeaderProps = {
  actions?: {
    total: number;
    endpointId: number;
    onSummarize: () => void;
    canSummarize: boolean;
    isSummarizing: boolean;
    onPick: (target: SpecOperation) => void;
  };
};

function PanelHeader({ actions }: PanelHeaderProps) {
  const { isOwner } = useCommentContext();

  return (
    <div className={PANEL.comments.stickyTop}>
      {/* 버튼이 없을 경우 댓글 패널 헤더 높이가 달라질 수 있으므로, 최소 높이를 정해준다. */}
      <div className="flex min-h-10 items-center gap-2 pb-2">
        <h3 className="text-md min-w-0 flex-1 truncate font-medium text-fg-2">
          댓글
          {actions?.total ? (
            <span className="ml-1.5 font-normal tabular-nums text-fg-3">
              {actions.total}
            </span>
          ) : null}
        </h3>

        {actions && (
          <>
            <IconButton
              label={actions.isSummarizing ? "요약 중" : "AI 요약"}
              disabled={!actions.canSummarize || actions.isSummarizing}
              onClick={actions.onSummarize}
            >
              {actions.isSummarizing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
            </IconButton>

            {isOwner && (
              <MoveCommentsPopover
                currentEndpointId={actions.endpointId}
                disabled={actions.total === 0}
                count={actions.total}
                onPick={actions.onPick}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Sparkles } from "lucide-react";
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
import type { MentionIds, EndpointSummary } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  createReply,
  getComments,
  updateComment,
} from "@/lib/api/comments";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

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
  members,
  endpoints,
  endpointId,
}: CommentData & { endpointId: number | null }) {
  return (
    <CommentProvider
      key={endpointId}
      me={me}
      isOwner={isOwner}
      members={members}
      endpoints={endpoints}
    >
      <CommentPanelInner endpointId={endpointId} />
    </CommentProvider>
  );
}

function CommentPanelInner({ endpointId }: { endpointId: number | null }) {
  const { setHighlightedId } = useCommentContext();

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
    endpoint: EndpointSummary;
    count: number;
  } | null>(null);

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

  const pickMoveTarget = (endpoint: EndpointSummary) => {
    setMoveTarget({ endpoint, count: total });
  };

  // 다이얼로그의 확인 버튼. 이름을 moveComments 로 두지 않는다 —
  // 5-7 에서 lib/api/comments 의 moveComments 를 import 하면 같은 스코프에서 충돌한다.
  //
  // TODO(5-7): moveComments(endpointId, endpoint.id) 호출 후 양쪽 무효화.
  //   원본 ["comments", endpointId] 와 대상 ["comments", endpoint.id] 둘 다 —
  //   대상을 빼먹으면 옮겨간 곳을 열었을 때 옛 목록이 보인다.
  const confirmMove = () => {
    if (!moveTarget) return;
    const { endpoint } = moveTarget;
    setMoveTarget(null);
    toast.add({
      title: "댓글을 옮겼습니다",
      description: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
      type: "success",
    });
  };

  // mutateAsync 를 쓴다.
  // mutate 는 Promise 를 반환하지 않아 CommentEditor 가 완료를 기다릴 수 없고,
  // 실패해도 입력이 지워진다.
  const addThread = async (content: string, mentions: MentionIds) => {
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

  return (
    <>
      <PanelHeader actions={{ total, endpointId, onPick: pickMoveTarget }} />

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
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={PANEL.comments.stickyBottom}>
        <div className="pt-3">
          <CommentEditor onSubmit={addThread} submitLabel="등록" />
        </div>
      </div>
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
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMove}>이동</AlertDialogAction>
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
    onPick: (target: EndpointSummary) => void;
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
              label="AI 요약"
              // TODO(5-6): 조건이 서버와 어긋난다. 서버는 삭제분과 이전 AI 요약을
              //   수집에서 빼므로, 전부 삭제됐거나 전부 요약이면 total > 0 인데 400 이 온다.
              //   "미삭제 && !isAiGenerated 인 댓글 1건 이상"으로 바꿔야 한다.
              disabled={actions.total === 0}
              onClick={() => {
                /* TODO(5-6) */
              }}
            >
              <Sparkles className="size-4" aria-hidden="true" />
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

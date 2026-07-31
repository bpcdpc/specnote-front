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
import { useQuery } from "@tanstack/react-query";
import { getComments } from "@/lib/api/comments";
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
// 엔드포인트를 바꿨을 때 초기화돼야 하는 상태가 Provider 쪽에도 있다 — (editing, justAddedId)
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
  // const { me, members, endpoints, setJustAddedId } = useCommentContext();

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

  // TODO(5-7): moveComments(endpointId, endpoint.id) 호출 후 양쪽 무효화.
  //   원본 ["comments", endpointId] 와 대상 ["comments", endpoint.id] 둘 다 —
  //   대상을 빼먹으면 옮겨간 곳을 열었을 때 옛 목록이 보인다.
  const moveComments = () => {
    if (!moveTarget || !endpointId) return;
    const { endpoint } = moveTarget;

    setMoveTarget(null);
    toast.add({
      title: "댓글을 옮겼습니다",
      description: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
      type: "success",
    });
  };

  // TODO(5-3): useMutation(createComment). 성공 후 ["comments", endpointId] 무효화,
  //   재조회가 끝난 뒤 응답의 id 를 setJustAddedId 에 넣는다(그 전에 넣으면 DOM 에 없다).
  const addThread = (content: string, mentions: MentionIds) => {};

  // TODO(5-3): useMutation(createReply). threadId 가 곧 parentId 다.
  const addReply = (
    threadId: number,
    content: string,
    mentions: MentionIds,
  ) => {};

  // TODO(5-4): useMutation(updateComment).
  const editComment = (
    commentId: number,
    content: string,
    mentions: MentionIds,
  ) => {};

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
            {/* 댓글 정렬은 시간 순 asc. 제출 후 스크롤 + 하이라이트가 거기로 이동시켜 안 보이는 문제를 해결한다. */}
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
            <AlertDialogAction onClick={moveComments}>이동</AlertDialogAction>
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

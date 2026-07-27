import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { PANEL } from "../panelMetrics";
import { getMockComments } from "@/lib/mock";
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
import type {
  CommentTree,
  MentionIds,
  UserRef,
  EndpointRef,
  EndpointSummary,
} from "@/lib/types";

// CommentPanel — 오른쪽 컬럼 골격
//
// 3단 구조다. 헤더와 입력창은 고정, 가운데 목록만 스크롤한다.
// 스크롤 주체는 이 패널이 아니라 컬럼(SpecColumns)이다. 왼쪽 날개와 같은 방식으로
// 고정 영역을 sticky 로 만든다 — 패널이 자기 안에서 따로 스크롤하면
// 좁은 폭 오버레이에서 스크롤 컨테이너가 이중으로 겹친다.
//
// Provider 와 본문을 나눈 이유 — 헤더가 isOwner 를 컨텍스트에서 읽어야 하는데
// Provider 와 같은 컴포넌트에 있으면 자기가 만든 값을 못 읽는다.
export function CommentPanel({ me, isOwner, members, endpoints }: CommentData) {
  const { endpointId } = useParams();

  return (
    <CommentProvider
      me={me}
      isOwner={isOwner}
      members={members}
      endpoints={endpoints}
    >
      {/* key 로 리마운트한다. 엔드포인트를 바꾸면 로컬에 쌓인 댓글이 초기화돼야 한다. */}
      <CommentPanelInner key={endpointId} />
    </CommentProvider>
  );
}

function CommentPanelInner() {
  const { endpointId } = useParams();
  const { me, members, endpoints, setJustAddedId } = useCommentContext();

  // TODO(데이터 단계): useComments(endpointId) 로 교체하고 이 state 를 버린다.
  //   실제로는 작성 후 목록을 재조회한다 — mutation 응답이 Comment 원형이라
  //   author, reactions, memberMentions 가 없어 로컬 패치가 불가능하다.
  const [threads, setThreads] = useState<CommentTree[]>(() =>
    endpointId ? getMockComments(Number(endpointId)) : [],
  );

  // 이동 대상. null 이면 다이얼로그 안 뜸. 팝오버에서 고르면 세팅된다.
  // 이동 후 total 이 0 이 되므로, 다이얼로그 문구에 쓸 개수를 함께 담는다.
  const [moveTarget, setMoveTarget] = useState<{
    endpoint: EndpointSummary;
    count: number;
  } | null>(null);

  // 삭제된 댓글도 자리를 지키므로(FR-5.3) 세는 대상에 포함한다.
  const total = threads.reduce((sum, t) => sum + 1 + t.replies.length, 0);
  const isEmpty = total === 0;

  const pickMoveTarget = (endpoint: EndpointSummary) => {
    setMoveTarget({ endpoint, count: total });
  };

  const moveComments = () => {
    if (!moveTarget || !endpointId) return;
    const { endpoint } = moveTarget;

    // TODO(데이터 단계): PATCH /api/endpoints/:id/comments/move
    //   body { targetEndpointId: endpoint.id } 호출 후 재조회.
    //   지금은 목이라 현재 패널만 비운다.
    setThreads([]);
    setMoveTarget(null);
    toast.add({
      title: "댓글을 옮겼습니다",
      description: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
      type: "success",
    });
  };

  // 정렬은 asc(오래된 게 위). 댓글·답글 모두 시간순이라 논의 흐름이 위에서
  // 아래로 읽힌다(Slack, GitHub 관례). 새 항목은 맨 아래에 붙고,
  // 제출 후 스크롤+하이라이트가 거기로 이동시켜 안 보이는 문제를 해결한다.

  // 멘션 ID 를 이름·경로로 되살린다. 배관 단계에선 재조회가 대신한다.
  const resolveMentions = (
    mentions: MentionIds,
  ): {
    memberMentions: UserRef[];
    endpointMentions: EndpointRef[];
  } => ({
    memberMentions: members
      .filter((m) => mentions.userIds.includes(m.id))
      .map((m) => ({ userId: m.id, userName: m.userName })),
    endpointMentions: endpoints
      .filter((e) => mentions.endpointIds.includes(e.id))
      .map((e) => ({ endpointId: e.id, path: e.path, method: e.method })),
  });

  const addThread = (content: string, mentions: MentionIds) => {
    if (!endpointId) return;
    const id = -Date.now();
    setThreads((prev) => [
      ...prev,
      {
        id,
        endpointId: Number(endpointId),
        parentId: null,
        content,
        isDeleted: false,
        author: me,
        isAiGenerated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: [],
        ...resolveMentions(mentions),
        replies: [],
      },
    ]);
    setJustAddedId(id);
  };

  const addReply = (
    threadId: number,
    content: string,
    mentions: MentionIds,
  ) => {
    if (!endpointId) return;
    const id = -Date.now();
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== threadId
          ? t
          : {
              ...t,
              replies: [
                ...t.replies,
                {
                  id,
                  endpointId: Number(endpointId),
                  parentId: threadId,
                  content,
                  isDeleted: false,
                  author: me,
                  isAiGenerated: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  reactions: [],
                  ...resolveMentions(mentions),
                },
              ],
            },
      ),
    );
    setJustAddedId(id);
  };

  // 댓글·답글 어느 쪽이든 id 로 찾아 교체한다. content 와 멘션, updatedAt 만 바뀐다.
  const editComment = (
    commentId: number,
    content: string,
    mentions: MentionIds,
  ) => {
    const patch = <T extends CommentTree | CommentTree["replies"][number]>(
      c: T,
    ): T =>
      c.id !== commentId
        ? c
        : {
            ...c,
            content,
            updatedAt: new Date().toISOString(),
            ...resolveMentions(mentions),
          };

    setThreads((prev) =>
      prev.map((t) => ({
        ...patch(t),
        replies: t.replies.map(patch),
      })),
    );
  };

  if (!endpointId) {
    return (
      <>
        <PanelHeader
          total={null}
          disabled
          endpointId={0}
          onPick={pickMoveTarget}
        />
        <p className="flex-1 px-2 pt-10 text-center text-sm text-fg-3">
          엔드포인트를 선택하면 댓글이 표시됩니다
        </p>
      </>
    );
  }

  return (
    <>
      <PanelHeader
        total={total}
        disabled={isEmpty}
        endpointId={Number(endpointId)}
        onPick={pickMoveTarget}
      />

      <div className="min-h-0 flex-1 py-2">
        {isEmpty ? (
          <p className="px-2 pt-10 text-center text-sm text-fg-3">
            첫 댓글을 남겨보세요
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
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
// total 이 null 이면 엔드포인트 미선택 상태라 개수를 감춘다.
function PanelHeader({
  total,
  disabled,
  endpointId,
  onPick,
}: {
  total: number | null;
  disabled: boolean;
  endpointId: number;
  onPick: (target: EndpointSummary) => void;
}) {
  const { isOwner } = useCommentContext();

  return (
    <div className={PANEL.comments.stickyTop}>
      <div className="flex items-center gap-2 pb-2">
        <h3 className="text-md min-w-0 flex-1 truncate font-medium text-fg-2">
          댓글
          {total !== null && total > 0 && (
            <span className="ml-1.5 font-normal tabular-nums text-fg-3">
              {total}
            </span>
          )}
        </h3>

        <IconButton
          label="AI 요약"
          disabled={disabled}
          onClick={() => {
            /* TODO(12-8) */
          }}
        >
          <Sparkles className="size-4" aria-hidden="true" />
        </IconButton>

        {isOwner && (
          <MoveCommentsPopover
            currentEndpointId={endpointId}
            disabled={disabled}
            count={total ?? 0}
            onPick={onPick}
          />
        )}
      </div>
    </div>
  );
}

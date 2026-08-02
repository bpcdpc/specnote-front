import { TimeAgo } from "@/components/TimeAgo";
import { PencilLine, Trash2, CornerDownRight } from "lucide-react";
import { ReactionBar } from "./ReactionBar";
import { CommentContent } from "./CommentContent";
import { CommentEditor } from "./CommentEditor";
import { useCommentContext } from "./CommentContext";
import { IconButton } from "@/components/IconButton";
import { cn } from "@/lib/utils";
import type { CommentView, MentionIds } from "@/lib/types";
import { useEffect, useRef } from "react";

type CommentItemProps = {
  comment: CommentView;
  // 최상위 댓글만 답글을 받는다(2뎁스 고정). 대댓글에는 답글 버튼이 없다.
  isRoot?: boolean;
  onEdit: (
    commentId: number,
    content: string,
    mentions: MentionIds,
  ) => Promise<void>;
  onDelete: (commentId: number) => void;
};

// CommentItem — 댓글/답글 한 건 (공용)
//
// 삭제된 댓글은 서버가 마스킹한 평문이라 markdown 을 태우지 않는다.
// 리액션은 유지되고 수정/삭제 액션만 사라진다(FR-5.3).
//
// 답글 버튼은 최상위 && 사람 작성 && 미삭제일 때만. AI 요약에는 답글을 못 단다(FR-13.5).
// 수정/삭제는 내 글 && 미삭제일 때만. AI 는 로그인 못 해 author.id 가 절대 안 맞는다.
//
// 방금 등록되거나 수정된 항목이면 스크롤+하이라이트 대상이다.
// useEffect 콜백이 scrollIntoView 를 부른다 —
// 스크롤 주체(Panel/aside)가 어디든 브라우저가 가장 가까운 스크롤 조상을 찾는다. 하이라이트는 CSS 애니메이션이 스스로 끝낸다.
export function CommentItem({
  comment,
  isRoot = false,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const { me, editing, setEditing, highlightedId, setHighlightedId } =
    useCommentContext();

  const {
    id,
    content,
    createdAt,
    updatedAt,
    author,
    reactions,
    isDeleted,
    isAiGenerated,
  } = comment;

  const isMine = author.id === me.id;
  const isEdited = updatedAt !== createdAt;
  const isEditing = editing?.mode === "edit" && editing.commentId === id;
  const isHighlighted = id === highlightedId;

  const canReply = isRoot && !isAiGenerated && !isDeleted;
  const canModify = isMine && !isDeleted;

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isHighlighted) {
      // behavior:smooth 를 주지 않는다.
      // 애니메이션이 2초가 넘으면, 사용자가 도착했을 때에는 하이라이트가 이미 끝나있다.
      // 에디터 열림 스크롤(CommentEditor)은 경쟁하는 애니메이션이 없어 smooth 를 쓴다.
      ref.current?.scrollIntoView({ block: "center" });
    }
  }, [isHighlighted]);

  return (
    <article
      ref={ref}
      onAnimationEnd={() => {
        if (isHighlighted) setHighlightedId(null);
      }}
      className={cn(
        "group/comment flex flex-col gap-1.5 rounded-md",
        isHighlighted && "animate-[comment-highlight_2s_ease-out]",
      )}
    >
      <header className="flex items-center gap-2">
        <span className="min-w-0 truncate text-sm font-semibold text-fg-1">
          {author.userName}
        </span>

        {isAiGenerated && (
          <span className="shrink-0 rounded-sm bg-accent-subtle px-1 py-px text-[10px] font-medium text-accent-strong">
            AI 요약
          </span>
        )}

        <TimeAgo iso={createdAt} className="shrink-0 text-xs text-fg-3" />

        {isEdited && !isDeleted && (
          <span className="shrink-0 text-xs text-fg-3">(편집됨)</span>
        )}
      </header>

      {/* 수정 모드 — 본문과 액션 바 전체를 에디터로 교체. 헤더만 남는다. */}
      {isEditing ? (
        <CommentEditor
          autoFocus
          submitLabel="저장"
          initialContent={content}
          onSubmit={async (next, mentions) => {
            await onEdit?.(id, next, mentions);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          {isDeleted ? (
            <p className="text-sm leading-relaxed text-fg-3 italic">
              {content}
            </p>
          ) : (
            <CommentContent comment={comment} />
          )}

          <footer className="flex flex-wrap items-center gap-1">
            <ReactionBar
              reactions={reactions}
              onToggle={() => {
                // TODO(5-5): POST /api/comments/:id/reactions 후 재조회.
              }}
            />

            {canReply && (
              <IconButton
                size="icon-xs"
                label="답글"
                className="text-fg-3"
                onClick={() => setEditing({ mode: "reply", threadId: id })}
              >
                <CornerDownRight className="size-3.5" aria-hidden="true" />
              </IconButton>
            )}

            {canModify && (
              <>
                <IconButton
                  size="icon-xs"
                  label="수정"
                  className="text-fg-3"
                  onClick={() => setEditing({ mode: "edit", commentId: id })}
                >
                  <PencilLine className="size-3.5" aria-hidden="true" />
                </IconButton>
                <IconButton
                  size="icon-xs"
                  label="삭제"
                  className="text-fg-3"
                  onClick={() => onDelete(id)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </IconButton>
              </>
            )}
          </footer>
        </>
      )}
    </article>
  );
}

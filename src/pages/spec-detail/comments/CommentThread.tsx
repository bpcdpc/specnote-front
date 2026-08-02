import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { CommentEditor } from "./CommentEditor";
import { useCommentContext } from "./CommentContext";
import { cn } from "@/lib/utils";
import type { CommentTree, MentionIds } from "@/lib/types";
import type { REACTION_TYPE } from "@/lib/constants";

type CommentThreadProps = {
  thread: CommentTree;
  onReply: (
    threadId: number,
    content: string,
    mentions: MentionIds,
  ) => Promise<void>;
  onEdit: (
    commentId: number,
    content: string,
    mentions: MentionIds,
  ) => Promise<void>;
  onDelete: (commentId: number) => void;
  onToggleReaction: (commentId: number, type: REACTION_TYPE) => void;
};

// CommentThread — 댓글 + 답글 묶음 (2뎁스 고정)
//
// 답글은 시간순(asc, 오래된 게 위)이다. 논의 흐름이라 위에서 아래로 읽힌다.
// 새 답글은 맨 아래에 붙고, 제출 후 스크롤+하이라이트가 거기로 이동시킨다.
//
// 답글 에디터는 답글 버튼 바로 아래, 대댓글 목록 위에 열린다. 입력 위치와
// 결과 위치(맨 아래)는 다르지만, 제출 시 스크롤이 결과로 이동하며 하이라이트가
// 떠서 "어디 달렸는지"가 보인다.
//
// 접기 — DOM 에서 빼지 않고 높이만 줄인다(grid 0fr↔1fr). 답글 작성 중에는
// 접혀 있어도 강제로 편다. 안 그러면 에디터가 접힌 영역 안에 열려 안 보인다.
export function CommentThread({
  thread,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}: CommentThreadProps) {
  const { replies, ...parent } = thread;
  const { editing, setEditing } = useCommentContext();
  const [collapsed, setCollapsed] = useState(false);

  const regionId = `thread-${thread.id}-replies`;
  const replying = editing?.mode === "reply" && editing.threadId === thread.id;

  // 답글 작성 버튼을 누르면 펼친다.
  const open = replying || !collapsed;

  return (
    <div className="flex flex-col gap-3 pl-0.5">
      <CommentItem
        comment={parent}
        isRoot
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleReaction={onToggleReaction}
      />

      {(replies.length > 0 || replying) && (
        <div>
          {replies.length > 0 && (
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-expanded={open}
              aria-controls={regionId}
              className={cn(
                "flex items-center gap-1 rounded-md py-0.5 text-xs text-fg-3",
                "transition-colors hover:text-fg-1",
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 transition-transform",
                  !open && "-rotate-90",
                )}
                aria-hidden="true"
              />
              답글 {replies.length}개
            </button>
          )}

          {/* 세로선을 여기 한 번만 둔다. 접기 컨테이너와 에디터에 각각 주면 둘 사이에서 선이 끊긴다. */}
          <div className="mt-2 flex flex-col gap-3 border-l-3 border-border pl-3">
            {/* 접기 대상은 대댓글 목록뿐이다. */}
            {replies.length > 0 && (
              <div
                id={regionId}
                aria-hidden={!open}
                className={cn(
                  "grid transition-[grid-template-rows] duration-200",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                {/* 접기에 필요한 overflow-hidden. 에디터를 이 안에 두면
                    멘션 팝오버가 위 경계에서 잘린다 — 그래서 밖으로 뺐다. */}
                <div className="overflow-hidden">
                  <ul className="flex flex-col gap-3">
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem
                          comment={reply}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onToggleReaction={onToggleReaction}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 답글 에디터 — 대댓글 목록 맨 아래 */}
            {replying && (
              <CommentEditor
                autoFocus
                submitLabel="답글"
                placeholder="답글을 입력하세요"
                onSubmit={async (content, mentions) => {
                  await onReply(thread.id, content, mentions);
                  setCollapsed(false);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

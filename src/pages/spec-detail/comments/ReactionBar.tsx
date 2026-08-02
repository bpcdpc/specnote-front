import { SmilePlus } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { REACTION_META, REACTION_ORDER, sortReactions } from "./reactions";
import type { REACTION_TYPE } from "@/lib/constants";
import type { ReactionSummary } from "@/lib/types";
import { ICON_BUTTON_OVERRIDE } from "@/components/IconButton";
import { Button } from "@/components/ui/button";

type ReactionBarProps = {
  reactions: ReactionSummary[];
  onToggle: (type: REACTION_TYPE) => void;
};

// ReactionBar — 달린 리액션 칩 + 팝오버
//
// 4종을 항상 다 그리지 않는다. 패널 최소폭이 240px 이라 좌우 여백을 빼면
// 176px 밖에 안 남고, 칩 4개가 늘 자리를 차지하면 목록이 시끄럽다.
//
// 팝오버 하나가 두 일을 맡는다 — 위쪽에서 추가/해제하고, 아래쪽에서 누가 남겼는지 본다.
// 이름을 툴팁으로 빼지 않은 이유는 툴팁이 터치 기기에서 안 열리기 때문이다.
// SpecNote 는 좁은 폭에서도 오버레이로 동작하므로 툴팁에만 있는 정보는 모바일에서 통째로 사라진다.
//
// 칩 클릭은 토글이다. 거기에 "누가 남겼나 보기"를 얹으면 한 요소에 동작이 둘이 되어, 목록을 보려다 내 리액션이 달린다.
//
// 삭제된 댓글에도 그대로 붙는다(FR-5.3). 호출부가 판단하지 않는다.
export function ReactionBar({ reactions, onToggle }: ReactionBarProps) {
  const [open, setOpen] = useState(false);

  const sortedReactions = sortReactions(reactions);

  const summaryOf = (type: REACTION_TYPE) =>
    sortedReactions.find((r) => r.type === type);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {sortedReactions.map((reaction) => {
        const meta = REACTION_META[reaction.type];

        return (
          <button
            key={reaction.type}
            type="button"
            onClick={() => onToggle(reaction.type)}
            aria-label={`${meta.label} ${reaction.count}`}
            aria-pressed={reaction.reactedByMe}
            title={meta.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
              "text-[11px] leading-none tabular-nums transition-colors",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              reaction.reactedByMe
                ? "border-accent-strong/40 bg-accent-subtle text-accent-strong"
                : "border-border text-fg-2 hover:bg-hover-icon",
            )}
          >
            <span aria-hidden="true" className="text-xs">
              {meta.emoji}
            </span>
            {reaction.count}
          </button>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="리액션"
              title="리액션"
              className={cn(ICON_BUTTON_OVERRIDE, "text-fg-3")}
            >
              <SmilePlus className="size-3.5" aria-hidden="true" />
            </Button>
          }
        />

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto min-w-48 max-w-64 gap-2 p-2"
        >
          {/* 위 — 추가/해제. 이미 단 것은 배경으로 표시되고 다시 누르면 풀린다. */}
          <div className="flex items-center gap-0.5">
            {REACTION_ORDER.map((type) => {
              const meta = REACTION_META[type];
              const mine = summaryOf(type)?.reactedByMe ?? false;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onToggle(type);
                    setOpen(false);
                  }}
                  aria-label={meta.label}
                  aria-pressed={mine}
                  title={meta.label}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md text-base",
                    "transition-colors hover:bg-hover-icon",
                    "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    mine && "bg-accent-subtle",
                  )}
                >
                  <span aria-hidden="true">{meta.emoji}</span>
                </button>
              );
            })}
          </div>

          {/* 아래 — 누가 남겼는지 */}
          {sortedReactions.length > 0 && (
            <ul className="flex flex-col gap-1.5 border-t border-border pt-2">
              {sortedReactions.map((reaction) => (
                <li key={reaction.type} className="flex gap-2 text-xs">
                  <span aria-hidden="true" className="shrink-0">
                    {REACTION_META[reaction.type].emoji}
                  </span>
                  <span className="min-w-0 break-words text-fg-2">
                    {reaction.users.map((u) => u.userName).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

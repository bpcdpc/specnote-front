import { useState } from "react";
import { CornerUpRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ICON_BUTTON_OVERRIDE } from "@/components/IconButton";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { isHttpMethod } from "@/lib/constants";
import { useCommentContext } from "./CommentContext";
import type { EndpointSummary } from "@/lib/types";

type MoveCommentsPopoverProps = {
  // 현재 엔드포인트 — 이동 대상에서 제외한다. 같은 곳으로 옮기는 건 무의미하다.
  currentEndpointId: number;
  disabled: boolean;
  // 안내 문구에 쓸 이동 대상 댓글 수.
  count: number;
  // 대상을 고르면 부모가 확인 다이얼로그를 연다.
  onPick: (target: EndpointSummary) => void;
};

// MoveCommentsPopover — 댓글 전체 이동 (Owner 전용, FR-12)
//
// 헤더 아이콘을 누르면 대상 엔드포인트 목록(cmdk 검색)이 뜬다. 하나 고르면
// 팝오버가 닫히고 부모가 확인 다이얼로그를 연다 — 이동은 되돌리기 어려워
// 한 번 더 확인한다(FR-12.5).
//
// 트리거에 IconButton 을 쓰지 않는다. IconButton 은 Tooltip 을 내장하는데
// PopoverTrigger 와 겹치면 두 트리거가 같은 Button 을 두고 다퉈 팝오버가 안 열린다.
// ReactionBar 와 같은 회피 — Button + ICON_BUTTON_OVERRIDE 로 스타일만 맞춘다.
// 툴팁이 없어도 팝오버가 "옮길 곳 선택"을 바로 보여줘 정보 손실이 없다.
//
// activeEndpoints 를 쓴다. 삭제된 엔드포인트로는 옮기지 않는다(FR-12.3) —
// 백엔드도 대상이 삭제됐으면 400 을 낸다. 여기서 현재 엔드포인트만 추가로 뺀다.
export function MoveCommentsPopover({
  currentEndpointId,
  disabled,
  count,
  onPick,
}: MoveCommentsPopoverProps) {
  const { activeEndpoints } = useCommentContext();
  const [open, setOpen] = useState(false);

  const targets = activeEndpoints.filter((e) => e.id !== currentEndpointId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="댓글 전체 이동"
            disabled={disabled}
            className={ICON_BUTTON_OVERRIDE}
          >
            <CornerUpRight className="size-4" aria-hidden="true" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        {/* 안내 — 무엇을 하는 상황인지. 검색창만 있으면 맥락이 없다. */}
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-sm font-medium text-fg-1">댓글 전체 이동</p>
          <p className="mt-0.5 text-sm text-fg-3">
            이 엔드포인트의 댓글 {count}개를 아래에서 고른 곳으로 옮깁니다
          </p>
        </div>

        <Command>
          <CommandInput placeholder="엔드포인트 검색" />
          <CommandList>
            <CommandEmpty>옮길 엔드포인트가 없습니다</CommandEmpty>
            {targets.map((endpoint) => (
              <CommandItem
                key={endpoint.id}
                // method + path 로 검색되게 한다. path 만 쓰면 /courses 계열이
                // 겹쳐 걸러지지 않고, method 로도 못 찾는다.
                value={`${endpoint.method} ${endpoint.path}`}
                onSelect={() => {
                  setOpen(false);
                  onPick(endpoint);
                }}
                className="gap-2"
              >
                {isHttpMethod(endpoint.method) ? (
                  <MethodBadge
                    method={endpoint.method}
                    className="min-w-0 shrink-0 px-1 py-0 text-[10px]"
                  />
                ) : (
                  <FallbackBadge className="min-w-0 shrink-0 px-1 py-0 text-[10px]">
                    {endpoint.method}
                  </FallbackBadge>
                )}
                <span className="min-w-0 truncate font-mono text-xs text-fg-2">
                  {endpoint.path}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { isHttpMethod } from "@/lib/constants";
import type { EndpointSummary, PublicUser } from "@/lib/types";

export type MentionCandidate =
  | { kind: "member"; member: PublicUser }
  | { kind: "endpoint"; endpoint: EndpointSummary };

type MentionPopoverProps = {
  candidates: MentionCandidate[];
  activeIndex: number;
  onSelect: (candidate: MentionCandidate) => void;
  onHover: (index: number) => void;
};

// MentionPopover — @ / # 자동완성 후보
//
// textarea 바로 위에 고정한다. 커서 위치를 따라가지 않는다 — textarea 의 캐럿
// 좌표를 얻으려면 같은 스타일의 미러 엘리먼트를 만들어 재야 하는데, 패널이 좁아
// 어차피 뜰 자리가 제한적이라 값이 없다.
//
// Popover 컴포넌트를 쓰지 않는다. Base UI Popover 는 열릴 때 포커스를 팝업으로
// 가져가는데, 여기서는 타이핑을 계속해야 하므로 포커스가 textarea 에 남아야 한다.
// 위치도 트리거 기준이 아니라 입력창 기준이라 Positioner 가 할 일이 없다.
//
// 그래서 키보드 조작도 textarea 의 onKeyDown 이 처리한다. 이 컴포넌트는
// 목록을 그리고 activeIndex 를 표시할 뿐이다. 마우스는 클릭으로 고른다.
//
// role="listbox" 를 붙였지만 aria-activedescendant 연결은 하지 않았다.
// textarea 와 listbox 를 잇는 combobox 패턴은 구조가 커지고, 목록이 보이는 상태에서
// 키보드로 고르는 동작 자체는 이미 된다.
export function MentionPopover({
  candidates,
  activeIndex,
  onSelect,
  onHover,
}: MentionPopoverProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // 키보드로 이동할 때 선택 항목이 보이게 스크롤한다.
  useEffect(() => {
    const el = listRef.current?.children[activeIndex];
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (candidates.length === 0) return null;

  return (
    <ul
      ref={listRef}
      role="listbox"
      className={cn(
        "max-h-48 overflow-y-auto overscroll-none rounded-md",
        "bg-popover p-1 shadow-md ring-1 ring-border",
      )}
    >
      {candidates.map((candidate, index) => {
        const active = index === activeIndex;

        return (
          <li key={keyOf(candidate)}>
            <button
              type="button"
              role="option"
              aria-selected={active}
              // onMouseDown 이다. onClick 은 blur 가 먼저 일어나 팝오버가 닫힌 뒤 실행된다.
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(candidate);
              }}
              onMouseEnter={() => onHover(index)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
                active && "bg-hover-icon",
              )}
            >
              {candidate.kind === "member" ? (
                <span className="min-w-0 truncate text-xs text-fg-1">
                  {candidate.member.userName}
                </span>
              ) : (
                <>
                  {isHttpMethod(candidate.endpoint.method) ? (
                    <MethodBadge
                      method={candidate.endpoint.method}
                      className="min-w-0 shrink-0 px-1 py-0 text-[10px]"
                    />
                  ) : (
                    <FallbackBadge className="min-w-0 shrink-0 px-1 py-0 text-[10px]">
                      {candidate.endpoint.method}
                    </FallbackBadge>
                  )}
                  <span className="min-w-0 truncate font-mono text-xs text-fg-2">
                    {candidate.endpoint.path}
                  </span>
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function keyOf(candidate: MentionCandidate): string {
  return candidate.kind === "member"
    ? `m-${candidate.member.id}`
    : `e-${candidate.endpoint.id}`;
}

// 검색어로 후보를 좁힌다. 검색어가 비면 전체를 준다 —
// @ 만 쳤을 때 아무것도 안 뜨면 무엇을 칠 수 있는지 알 수 없다.
//
// 엔드포인트는 path 와 summary 를 본다. 사이드바 검색과 같은 기준이다(FR-3.4).
// method 는 검색어에 포함하지 않는다 — "#GET" 을 치면 표시 텍스트와 겹쳐
// 사용자가 이미 고른 것을 다시 검색하는 꼴이 된다.
const MAX_CANDIDATES = 8;

export function findCandidates(
  trigger: "@" | "#",
  query: string,
  members: PublicUser[],
  endpoints: EndpointSummary[],
): MentionCandidate[] {
  const keyword = query.trim().toLowerCase();

  if (trigger === "@") {
    return members
      .filter((m) => m.userName.toLowerCase().includes(keyword))
      .slice(0, MAX_CANDIDATES)
      .map((member) => ({ kind: "member", member }));
  }

  return endpoints
    .filter(
      (e) =>
        e.path.toLowerCase().includes(keyword) ||
        (e.summary?.toLowerCase().includes(keyword) ?? false),
    )
    .slice(0, MAX_CANDIDATES)
    .map((endpoint) => ({ kind: "endpoint", endpoint }));
}

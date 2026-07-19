import { useEffect } from "react";
import type { ReactNode } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import { useSpecPanels } from "./SpecPanelsContext";

type SpecColumnsProps = {
  sidebar: ReactNode; // 왼쪽 — 엔드포인트 목록
  detail: ReactNode; // 중앙 — 스펙 상세, Try it
  comments: ReactNode; // 오른쪽 — 댓글 패널
};

// 구분선 — 평소 투명. 호버·드래그·포커스에서 드러난다.
// 커서가 col-resize 로 바뀌는 것과 함께 잡을 위치를 알려주고,
// 드래그 중에도 유지돼 지금 조작 중인 경계가 어디인지 보인다.
const SEPARATOR =
  "w-px bg-transparent transition-colors " +
  "data-[separator=hover]:bg-border " +
  "data-[separator=active]:bg-border " +
  "data-[separator=focus]:bg-border " +
  "focus-visible:outline-none";

// 왼쪽 컬럼 안쪽 여백. 두 분기가 같은 값을 써야 폭을 오갈 때 목록이 안 흔들린다.
// py-2 대신 pt/pb 를 나눠 쓴다 — 생 문자열이라 tailwind-merge 가 안 돌고,
// py-2 와 pb-8 이 같이 있으면 CSS 순서로 승부가 갈려 결과가 불확실하다.
const SIDEBAR_PADDING = "pl-4 pr-2 pt-2 pb-8";

// SpecColumns — SpecDetail 3컬럼 골격
//
// 슬롯만 받아 배치한다. 내용은 모른다 (Header 와 같은 방식).
//
// 1. 폭에 따라 배치가 갈린다.
//      >= lg  밀어내기. 양쪽 리사이즈 + 접기. 접으면 중앙이 넓어진다.
//      <  lg  덮기. 양쪽 오버레이. 3컬럼이 물리적으로 안 들어가는 구간이다.
//    슬롯은 어느 쪽이든 한 번만 렌더한다. DOM 을 두 벌 만들지 않는다.
// 2. v4 는 px 단위를 지원한다. 백분율 환산이 필요 없다.
//    양쪽에 preserve-pixel-size 를 주고 중앙만 preserve-relative-size 로 둔다
//    (Group 은 relative 패널을 최소 하나 요구한다).
// 3. Panel 안쪽 div 에 overflow:auto 가 인라인으로 이미 있고 className 도 그 div 로 간다.
//    즉 스크롤 주체가 그 div 라 overscroll-none 은 Panel 의 className 에 붙인다.
// 4. expand() 는 "가장 최근 크기"로 되돌린다. 접었다 펴도 드래그한 폭이 유지된다.
// 5. 하단 pb-8 은 푸터(h-8) 높이만큼의 여백이다. 푸터가 pointer-events-none 이라
//    콘텐츠가 그 아래로 흐르면 읽히지 않는다.
export function SpecColumns({ sidebar, detail, comments }: SpecColumnsProps) {
  const {
    isWide,
    sidebarOpen,
    commentsOpen,
    setSidebarOpen,
    setCommentsOpen,
    closeAll,
  } = useSpecPanels();

  const sidebarRef = usePanelRef();
  const commentsRef = usePanelRef();

  // 상태 → 패널. isCollapsed() 로 막아 두 방향 동기화가 서로를 되부르지 않는다.
  useEffect(() => {
    const panel = sidebarRef.current;
    if (!panel) return;
    if (sidebarOpen && panel.isCollapsed()) panel.expand();
    if (!sidebarOpen && !panel.isCollapsed()) panel.collapse();
  }, [sidebarOpen, sidebarRef]);

  useEffect(() => {
    const panel = commentsRef.current;
    if (!panel) return;
    if (commentsOpen && panel.isCollapsed()) panel.expand();
    if (!commentsOpen && !panel.isCollapsed()) panel.collapse();
  }, [commentsOpen, commentsRef]);

  // 덮기 모드에서 Esc 로 닫는다.
  useEffect(() => {
    if (isWide) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isWide, closeAll]);

  // ── 좁은 폭 — 덮기 ──
  //
  // 바깥 컨테이너에 패딩을 주지 않는다. absolute 자식이 패딩 박스를 기준으로 잡혀
  // 드로어가 화면 가장자리에서 떠버린다. 여백은 각 패널 안쪽에서 준다.
  if (!isWide) {
    const anyOpen = sidebarOpen || commentsOpen;

    return (
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <main className="h-full overflow-auto overscroll-none bg-surface-2 px-4 pt-4 pb-10">
          {detail}
        </main>

        {anyOpen && (
          <div
            className="absolute inset-0 z-30 bg-black/50"
            onClick={closeAll}
            aria-hidden="true"
          />
        )}

        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-40 w-[85vw] max-w-60",
            "overflow-auto overscroll-none bg-surface-1 transition-transform",
            SIDEBAR_PADDING,
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-hidden={!sidebarOpen}
        >
          {sidebar}
        </aside>

        <aside
          className={cn(
            "absolute inset-y-0 right-0 z-40 flex w-[85vw] max-w-[300px] flex-col",
            "bg-surface-1 transition-transform",
            commentsOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!commentsOpen}
        >
          {comments}
        </aside>
      </div>
    );
  }

  // ── 넓은 폭 — 밀어내기 ──
  return (
    <div className="min-h-0 flex-1">
      <Group orientation="horizontal" className="h-full">
        {/* 왼쪽 — 엔드포인트 목록. 보더 없음(04-design-tokens) */}
        <Panel
          panelRef={sidebarRef}
          collapsible
          collapsedSize="0px"
          defaultSize="300px"
          minSize="240px"
          maxSize="400px"
          groupResizeBehavior="preserve-pixel-size"
          className="overscroll-none bg-surface-1"
          onResize={(size) => setSidebarOpen(size.inPixels > 0)}
        >
          <div className={SIDEBAR_PADDING}>{sidebar}</div>
        </Panel>

        <Separator className={SEPARATOR} aria-label="엔드포인트 목록 폭 조절" />

        {/* 중앙 — 남는 폭 */}
        <Panel minSize="320px" className="overscroll-none bg-surface-2">
          <main className="px-14 pt-2 pb-10">{detail}</main>
        </Panel>

        {/* 오른쪽 구분선 */}
        <Separator className={SEPARATOR} aria-label="댓글 패널 폭 조절" />

        {/* 오른쪽 — 댓글 패널 */}
        <Panel
          panelRef={commentsRef}
          collapsible
          collapsedSize="0px"
          defaultSize="300px"
          minSize="240px"
          maxSize="600px"
          groupResizeBehavior="preserve-pixel-size"
          className="overscroll-none bg-surface-1"
          onResize={(size) => setCommentsOpen(size.inPixels > 0)}
        >
          <div className="flex h-full flex-col">{comments}</div>
        </Panel>
      </Group>
    </div>
  );
}

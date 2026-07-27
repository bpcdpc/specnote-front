import { useEffect } from "react";
import type { ReactNode } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import { useSpecPanels } from "./SpecPanelsContext";
import { COLUMN, PANEL, px } from "./panelMetrics";

type SpecColumnsProps = {
  sidebar: ReactNode; // 왼쪽 — 엔드포인트 목록
  detail: ReactNode; // 중앙 — 스펙 상세, Try it
  comments: ReactNode; // 오른쪽 — 댓글 패널
};

// 구분선 — 평소 투명. 호버, 드래그, 포커스에서 드러난다.
// 커서가 col-resize 로 바뀌는 것과 함께 잡을 위치를 알려주고,
// 드래그 중에도 유지돼 지금 조작 중인 경계가 어디인지 보인다.
const SEPARATOR =
  "w-px bg-transparent transition-colors " +
  "data-[separator=hover]:bg-border " +
  "data-[separator=active]:bg-border " +
  "data-[separator=focus]:bg-border " +
  "focus-visible:outline-none";

// 양쪽 날개 안쪽 래퍼. min-h-full 이라 내용이 짧아도 컬럼 높이를 채우고,
// flex-col 의 flex-1 자식(댓글 목록)이 남는 높이를 먹어 입력창이 바닥에 선다.
const WING = "flex min-h-full flex-col";

// SpecColumns — SpecDetail 3컬럼 골격
//
// 슬롯만 받아 배치한다. 내용은 모른다 (Header 와 같은 방식).
//
// 1. 폭에 따라 배치가 갈린다.
//      >= lg  밀어내기. 양쪽 리사이즈 + 접기. 접으면 중앙이 넓어진다.
//      <  lg  덮기. 양쪽 오버레이. 3컬럼이 물리적으로 안 들어가는 구간이다.
//    슬롯은 어느 쪽이든 한 번만 렌더한다. DOM 을 두 벌 만들지 않는다.
// 2. v4 는 px 단위를 지원한다. 백분율 환산이 필요 없다.
//    양쪽에 preserve-pixel-size 를 주고 중앙은 기본값(relative)으로 둔다
//    (Group 은 relative 패널을 최소 하나 요구한다).
// 3. Panel 안쪽 div 에 overflow:auto 가 인라인으로 이미 있고 className 도 그 div 로 간다.
//    즉 스크롤 주체가 그 div 라 overscroll-none 은 Panel 의 className 에 붙인다.
// 4. expand() 는 "가장 최근 크기"로 되돌린다. 접었다 펴도 드래그한 폭이 유지된다.
// 5. 치수와 여백은 전부 panelMetrics 가 갖는다. 여기서 숫자를 직접 쓰지 않는다.
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
        <main
          className={cn(
            "h-full overflow-auto overscroll-none bg-surface-2",
            PANEL.detail.narrow,
          )}
        >
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
            "absolute inset-y-0 left-0 z-40 w-full max-w-2xl",
            "overflow-auto overscroll-none bg-surface-1 transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-hidden={!sidebarOpen}
        >
          <div className={cn(PANEL.sidebar.padding, WING)}>{sidebar}</div>
        </aside>

        <aside
          className={cn(
            "absolute inset-y-0 right-0 z-40 w-full max-w-2xl",
            "overflow-auto overscroll-none bg-surface-1 transition-transform",
            commentsOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!commentsOpen}
        >
          <div className={cn(PANEL.comments.padding, WING)}>{comments}</div>
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
          defaultSize={px(COLUMN.sidebar.default)}
          minSize={px(COLUMN.sidebar.min)}
          maxSize={px(COLUMN.sidebar.max)}
          groupResizeBehavior="preserve-pixel-size"
          className="overscroll-none bg-surface-1"
          onResize={(size) => setSidebarOpen(size.inPixels > 0)}
        >
          <div className={cn(PANEL.sidebar.padding, WING)}>{sidebar}</div>
        </Panel>

        <Separator className={SEPARATOR} aria-label="엔드포인트 목록 폭 조절" />

        {/* 중앙 — 남는 폭 */}
        <Panel
          minSize={px(COLUMN.detail.min)}
          className="overscroll-none bg-surface-2"
        >
          <main className={PANEL.detail.wide}>{detail}</main>
        </Panel>

        <Separator className={SEPARATOR} aria-label="댓글 패널 폭 조절" />

        {/* 오른쪽 — 댓글 패널 */}
        <Panel
          panelRef={commentsRef}
          collapsible
          collapsedSize="0px"
          defaultSize={px(COLUMN.comments.default)}
          minSize={px(COLUMN.comments.min)}
          maxSize={px(COLUMN.comments.max)}
          groupResizeBehavior="preserve-pixel-size"
          className="overscroll-none bg-surface-1"
          onResize={(size) => setCommentsOpen(size.inPixels > 0)}
        >
          <div className={cn(PANEL.comments.padding, WING)}>{comments}</div>
        </Panel>
      </Group>
    </div>
  );
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

// 3컬럼이 기본폭으로 성립하는 최소 폭은 240 + 320 + 300 + 구분선 2 = 862px 이다.
// lg(1024) 를 기준으로 잡으면 862~1024 가 여유분이 되고, 가로 태블릿과 데스크탑이
// 밀어내기, 세로 태블릿과 모바일이 덮기가 된다.
const WIDE = "(min-width: 1024px)";

type SpecPanelsValue = {
  // 넓은 폭 — 밀어내기. 좁은 폭 — 덮기.
  isWide: boolean;
  sidebarOpen: boolean;
  commentsOpen: boolean;
  toggleSidebar: () => void;
  toggleComments: () => void;
  closeAll: () => void;
  // 드래그로 접혔을 때 패널이 상태를 되돌려준다 (SpecColumns 전용).
  setSidebarOpen: (open: boolean) => void;
  setCommentsOpen: (open: boolean) => void;
};

const SpecPanelsContext = createContext<SpecPanelsValue | null>(null);

// SpecPanelsProvider — 양쪽 사이드바 열림 상태
//
// SpecLayout 이 <Outlet> 을 감싸 제공한다. 헤더 토글과 SpecColumns 가 같이 읽는다.
export function SpecPanelsProvider({ children }: { children: ReactNode }) {
  const isWide = useMediaQuery(WIDE);
  const [sidebarOpen, setSidebarOpen] = useState(isWide);
  const [commentsOpen, setCommentsOpen] = useState(isWide);

  // 폭 경계를 넘으면 기본값으로 되돌린다.
  // 넓어지면 둘 다 열고, 좁아지면 둘 다 닫는다 (덮기 모드의 기본은 닫힘).
  useEffect(() => {
    setSidebarOpen(isWide);
    setCommentsOpen(isWide);
  }, [isWide]);

  // 덮기 모드에서는 하나만 열린다. 둘 다 열면 중앙이 안 보여 오버레이의 의미가 없다.
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      if (!prev && !isWide) setCommentsOpen(false);
      return !prev;
    });
  }, [isWide]);

  const toggleComments = useCallback(() => {
    setCommentsOpen((prev) => {
      if (!prev && !isWide) setSidebarOpen(false);
      return !prev;
    });
  }, [isWide]);

  const closeAll = useCallback(() => {
    setSidebarOpen(false);
    setCommentsOpen(false);
  }, []);

  return (
    <SpecPanelsContext.Provider
      value={{
        isWide,
        sidebarOpen,
        commentsOpen,
        toggleSidebar,
        toggleComments,
        closeAll,
        setSidebarOpen,
        setCommentsOpen,
      }}
    >
      {children}
    </SpecPanelsContext.Provider>
  );
}

export function useSpecPanels() {
  const ctx = useContext(SpecPanelsContext);
  if (!ctx)
    throw new Error("useSpecPanels 는 SpecPanelsProvider 안에서만 쓴다.");
  return ctx;
}

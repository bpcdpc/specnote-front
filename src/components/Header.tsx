import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type HeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  // wide: 2행으로 내려가는 슬롯 (SpecDetail 의 Bearer 입력).
  // 폭 판단은 호출부가 한다 — 좁은 폭에서만 넘어온다.
  // 여기서 반응형 변형을 달면 호출부의 조건부 렌더와 기준이 어긋나 사각지대가 생긴다.
  wide?: ReactNode;
};

// Header — 헤더 뼈대
//
// 배경은 순검정(bg-surface-1, sticky 라 불투명 필요). 기본 보더 없음.
// 스크롤다운(window.scrollY > 60) 시에만 하단 보더가 나타난다.
//   AppLayout 처럼 문서가 스크롤되는 화면에서만 동작.
//   SpecLayout 은 h-dvh 고정 → window 스크롤 없음 → 보더 안 뜸.
//
// 좌우 여백은 px-4. 화면 대부분이 쓰는 기본값이며, SpecDetail 의 헤더 우측 슬롯 폭
// 계산(panelMetrics 의 HEADER_RIGHT_WIDTH)이 이 값을 전제로 한다.
export function Header({ left, right, wide }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 flex flex-wrap items-center gap-x-3 gap-y-2 bg-surface-1 px-4 py-2.5",
        "border-b transition-colors",
        scrolled ? "border-border" : "border-transparent",
      ].join(" ")}
    >
      {/* 좌측 — order 1. min-w-0 이 있어야 브레드크럼 truncate 가 먹는다 */}
      <div className="order-1 flex min-w-0 flex-1 items-center gap-2">
        {left}
      </div>

      {/* 우측 — order 2 */}
      <div className="order-2 flex shrink-0 items-center gap-2">{right}</div>

      {/* wide — order 3. w-full 이라 flex-wrap 이 2행으로 내린다 */}
      {wide && <div className="order-3 flex w-full items-center">{wide}</div>}
    </header>
  );
}

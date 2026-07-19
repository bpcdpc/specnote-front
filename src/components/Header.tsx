import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type HeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  // wide: 모바일(<md)에서 2행으로 내려가는 슬롯 (SpecDetail의 Bearer 입력).
  wide?: ReactNode;
};

// Header — 헤더 뼈대
//
// 배경은 순검정(bg-surface-1, sticky라 불투명 필요). 기본 보더 없음.
// 스크롤다운(window.scrollY>0) 시에만 하단 보더가 나타난다.
//   AppLayout처럼 문서가 스크롤되는 화면에서만 동작.
//   SpecLayout은 h-dvh 고정 → window 스크롤 없음 → 보더 안 뜸.
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
      {/* 좌측 — order 1 */}
      <div className="order-1 flex min-w-0 flex-1 items-center gap-2">
        {left}
      </div>

      {/* 우측 — order 2 */}
      <div className="order-2 flex shrink-0 items-center gap-2">{right}</div>

      {/* wide — 데스크탑 order 3(우측 왼편), 모바일 basis-full 2행 */}
      {wide && (
        <div className="order-3 flex w-full items-center md:order-3 md:w-auto md:flex-1 md:justify-end">
          {wide}
        </div>
      )}
    </header>
  );
}

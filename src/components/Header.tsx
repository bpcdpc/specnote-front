import type { ReactNode } from "react";

type HeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  /**
   * 데스크탑(≥md)에서는 right 앞에 나란히 놓이고,
   * 모바일(<md)에서는 두 번째 행으로 내려간다.
   * SpecDetail의 Bearer 토큰 입력이 여기 들어간다.
   * 접히거나 숨지 않고 어느 폭에서도 항상 보인다.
   */
  wide?: ReactNode;
};

// 헤더 뼈대. 내용은 각 페이지가 props로 넘긴다.
// sticky이므로 스크롤 컨테이너 밖에 두어야 한다.
//
// 배치는 order + flex-wrap으로 한다. DOM을 중복 렌더하지 않으므로
// wide 안의 입력 상태(포커스·커서·값)가 브레이크포인트를 넘어도 유지된다.
//
//   모바일:  [left ......... right]   ← 1행 (order 1, 2)
//          [wide ...............]   ← 2행 (order 3, basis-full)
//   데스크탑: [left ... wide  right]  ← 1행 (order 1, 2, 3)
export function Header({ left, right, wide }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 md:h-13 md:flex-nowrap md:py-0">
        {/* 좌측 — 남는 폭을 차지하고, 넘치면 내부에서 truncate */}
        <div className="order-1 flex min-w-0 flex-1 items-center gap-2">
          {left}
        </div>

        {/* wide — 모바일에선 basis-full로 2행, 데스크탑에선 우측 앞 */}
        {wide && (
          <div className="order-3 w-full min-w-0 md:order-2 md:w-auto md:shrink-0">
            {wide}
          </div>
        )}

        {/* 우측 — 항상 1행 오른쪽 끝 */}
        <div className="order-2 flex shrink-0 items-center gap-2 md:order-3">
          {right}
        </div>
      </div>
    </header>
  );
}

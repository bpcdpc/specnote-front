import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  to: string;
};

// BackButton — 뒤로가기 (←)
//
// 아이콘 버튼: 평소 보더·배경 없음. 호버 시 회색 배경.
// 포커스 링만 유지(키보드 접근성).
export function BackButton({ to }: BackButtonProps) {
  return (
    <Link
      to={to}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-2 hover:bg-hover-icon hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="뒤로 가기"
    >
      <ArrowLeft className="size-4" />
    </Link>
  );
}

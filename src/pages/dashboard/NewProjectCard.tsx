import { Link } from "react-router-dom";

// NewProjectCard — "새 프로젝트" 카드 (대시보드 전용)
//
// 점선 보더 + 중앙 정렬. ProjectCard 와 같은 그리드 셀에 놓인다.
export function NewProjectCard() {
  return (
    <Link
      to="/projects/new"
      className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-fg-2 hover:bg-hover-ghost hover:text-fg-1"
    >
      새 프로젝트 추가
    </Link>
  );
}

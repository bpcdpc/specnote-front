import { Link } from "react-router-dom";
import type { ProjectSummary } from "@/lib/types";

type ProjectCardProps = {
  project: ProjectSummary;
};

// ProjectCard — 대시보드 프로젝트 카드 (대시보드 전용)
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface-1 p-7 hover:bg-hover-ghost"
    >
      {/* 1행 — 제목  + owner 배지 */}
      <div className="flex items-center gap-2">
        <h3 className="flex-1 truncate font-medium text-fg-1">
          {project.title}
        </h3>
        {project.role === "OWNER" && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-accent-subtle px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-accent-strong">
            {project.role}
          </span>
        )}
      </div>

      {/* 2행 — description (0~2줄, 항상 2줄 높이 확보) */}
      <p className="line-clamp-2 min-h-10 text-sm text-fg-3 pr-8">
        {project.description ?? ""}
      </p>
    </Link>
  );
}

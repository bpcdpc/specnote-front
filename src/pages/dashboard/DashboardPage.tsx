import { FolderOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "./EmptyState";
import { PageHeading } from "@/components/PageHeading";
import { ProjectCard } from "./ProjectCard";
import { NewProjectCard } from "./NewProjectCard";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api/projects";

import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

// DashboardPage — 프로젝트 목록

export function DashboardPage() {
  const {
    data: projects,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({ queryKey: ["projects"], queryFn: getProjects });

  // 로딩중. 첫 진입시에만 보임
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-6">
        <LoadingState />
      </div>
    );
  }

  // 4xx 는 재시도하지 않으므로(queryClient) 여기까지 오면 사용자 조작이 필요하다.
  // 5xx 또는 네트워크 문제는 한 번 더 시도한 뒤 도달한다.
  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-6">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  // 프로젝트가 없는 경우
  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-6 px-8">
        <EmptyState
          icon={FolderOpen}
          title="아직 프로젝트가 없어요"
          action={
            <Link
              to="/projects/new"
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              <Plus className="size-4" />새 프로젝트
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-6 px-8">
      <div className="flex flex-col gap-4">
        <PageHeading icon={FolderOpen} title="내 프로젝트" />
        <div className="grid grid-cols-1 pt-4 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
          <NewProjectCard />
        </div>
      </div>
    </div>
  );
}

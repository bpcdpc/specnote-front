import { Settings } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { SpecJsonUrlField } from "./SpecJsonUrlField";
import { TryItBaseUrlField } from "./TryItBaseUrlField";
import { MemberList } from "./MemberList";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProject } from "@/lib/api/projects";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

// ProjectSettingsPage — 프로젝트 설정 (목)
//
// 헤더(브레드크럼)는 AppLayout 이 그린다.
//
// Owner 전용이다. Member 에게는 진입 경로가 없지만 백엔드는 GET 을 Member 에게도 허용한다.
// URL 로 직접 들어온 경우를 여기서 막는다.
export function ProjectSettingsPage() {
  const { projectId } = useParams();
  const id = Number(projectId);

  const {
    data: projectView,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => getProject(id),
    enabled: Number.isInteger(id) && id > 0,
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-6">
        <LoadingState />
      </div>
    );
  }

  // 삭제된 프로젝트와 비멤버는 둘 다 404 (리소스 은닉).
  // 재시도해도 답이 같으므로 onRetry={refetch} 버튼을 두지 않는다
  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-6">
        <ErrorState error={error} fallback="프로젝트를 불러오지 못했습니다." />
      </div>
    );
  }

  // 백엔드에서 Member를 막지 않고 있어, url 로 직접 접근한 일반 멤버의 경우, redirect해줘야 한다.
  const isOwner = projectView.project.role === "OWNER";
  if (!isOwner) {
    return <Navigate to={`/projects/${id}`} replace />;
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="flex flex-col gap-10 py-8">
        <PageHeading icon={Settings} title="프로젝트 설정" />
        <SpecJsonUrlField
          projectId={id}
          initialUrl={projectView.specJsonUrl ?? ""}
        />
        <TryItBaseUrlField
          projectId={id}
          initialUrl={projectView.tryItBaseUrl ?? ""}
        />
        <MemberList projectId={id} isOwner={isOwner} />
      </div>
    </div>
  );
}

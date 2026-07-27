import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { isHttpMethod } from "@/lib/constants";
import type { ProjectView } from "@/lib/types";

// ProjectOverview — 엔드포인트 미선택 시 중앙 컬럼
//
// ProjectView 에 이미 담겨 오는 값만 쓴다. 추가 API 호출이 없다.
// 프로젝트에 막 들어온 사용자가 스펙의 규모와 상태를 먼저 파악하는 자리다.
export function ProjectOverview({
  projectView,
  projectId,
}: {
  projectView: ProjectView;
  projectId: string | undefined;
}) {
  const { project, endpoints, tryItBaseUrl } = projectView;

  const active = endpoints.filter((e) => !e.isDeleted);
  const deletedCount = endpoints.length - active.length;

  // 메서드별 개수. 등장 순서를 유지해 스펙 원본 순서를 따른다.
  const byMethod = new Map<string, number>();
  for (const e of active) {
    byMethod.set(e.method, (byMethod.get(e.method) ?? 0) + 1);
  }

  const tagCount = new Set(active.flatMap((e) => e.tags)).size;
  const isOwner = project.role === "OWNER";

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-fg-1">{project.title}</h2>
        {project.description && (
          <p className="text-sm leading-relaxed text-fg-3">
            {project.description}
          </p>
        )}
      </div>

      {/* 메서드 분포 — 스펙의 성격을 한눈에 보여준다 */}
      <div className="flex flex-wrap gap-2">
        {[...byMethod].map(([method, count]) => (
          <span key={method} className="flex items-center gap-1.5">
            {isHttpMethod(method) ? (
              <MethodBadge method={method} />
            ) : (
              <FallbackBadge>{method}</FallbackBadge>
            )}
            <span className="text-xs tabular-nums text-fg-3">{count}</span>
          </span>
        ))}
      </div>

      <dl className="flex flex-col gap-3 text-sm">
        <Row label="엔드포인트">
          {active.length}개
          {deletedCount > 0 && (
            <span className="text-fg-3"> (삭제됨 {deletedCount}개)</span>
          )}
        </Row>
        <Row label="태그">{tagCount}개</Row>
        <Row label="스펙 버전">{project.version}</Row>
        <Row label="OpenAPI">{project.oasVersion}</Row>
        <Row label="Try it Base URL">
          {tryItBaseUrl ? (
            <span className="font-mono text-xs">{tryItBaseUrl}</span>
          ) : (
            <span className="text-fg-3">설정되지 않음</span>
          )}
        </Row>
      </dl>

      {/* FR-4.6 — baseUrl 이 없으면 Try it out 이 비활성이다.
          그 이유를 알 수 있는 자리가 지금 여기뿐이다. */}
      {!tryItBaseUrl && (
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-fg-2">
          Base URL이 없어 Try it out을 쓸 수 없습니다.
          {isOwner && (
            <Link
              to={`/projects/${projectId}/settings`}
              className="inline-flex items-center gap-1 text-accent-strong hover:text-accent-hover"
            >
              <Settings className="size-3.5" aria-hidden="true" />
              설정에서 등록
            </Link>
          )}
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <dt className="w-32 shrink-0 text-fg-3">{label}</dt>
      <dd className="min-w-0 text-fg-1">{children}</dd>
    </div>
  );
}

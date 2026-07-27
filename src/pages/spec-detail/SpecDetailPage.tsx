import { useState } from "react";
import { useParams } from "react-router-dom";
import { SpecColumns } from "./SpecColumns";
import { EndpointSidebar } from "./EndpointSidebar";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { isHttpMethod } from "@/lib/constants";
import {
  MOCK_PROJECT,
  MOCK_PROJECT_VIEW,
  getMockEndpointDetail,
} from "@/lib/mock";
import { ProjectOverview } from "./ProjectOverview";
import { cn } from "@/lib/utils";
import { useSpecCache } from "./useSpecCache";
import { EndpointDetail } from "./EndpointDetail";
import { SpecUpdateBanner } from "./SpecUpdateBanner";
import { CommentPanel } from "./comments/CommentPanel";
import type { SpecCache } from "./useSpecCache";
import type { ProjectView } from "@/lib/types";
import { MOCK_CURRENT_USER, MOCK_PROJECT_MEMBERS } from "@/lib/mock";

// SpecDetailPage — 3컬럼 본문
//
// 선택 상태의 소유자는 URL 이다. 컴포넌트 state 로 들지 않는다 —
// 새로고침과 뒤로가기가 살아야 하고, 13단계 딥링크가 같은 경로를 그대로 쓴다.
//
// TODO(데이터 단계): MOCK_PROJECT_VIEW 를 useProject(projectId),
//   getMockEndpointDetail 을 useEndpoint(endpointId) 로 교체.
export function SpecDetailPage() {
  const { projectId, endpointId } = useParams();
  const projectView = MOCK_PROJECT_VIEW;
  const cache = useSpecCache(projectView.components);

  const detail = endpointId ? getMockEndpointDetail(Number(endpointId)) : null;

  // TODO(데이터 단계): ProjectView 에 role 이 없어 ProjectSummary 에서 가져온다.
  //   SpecLayout 과 같은 출처를 봐야 두 곳이 어긋나지 않는다.
  const isOwner = MOCK_PROJECT.role === "OWNER";

  // 배너를 닫은 스냅샷을 기억한다. 그보다 더 새 스냅샷이 오면 다시 뜬다.
  const [dismissed, setDismissed] = useState<number | null>(null);

  // 상세 응답의 스냅샷이 캐시보다 높으면 그 사이 스펙이 커밋된 것이다.
  // 미선택 상태에서는 상세 응답이 없어 감지되지 않는다 — 엔드포인트를 열면 드러난다.
  const staleSnapshotId =
    detail && detail.snapshotId > projectView.snapshotId
      ? detail.snapshotId
      : null;
  const showBanner = staleSnapshotId !== null && staleSnapshotId !== dismissed;

  // TODO(데이터 단계): queryClient.invalidateQueries 로 교체한다.
  //   지금은 목이 정적이라 리로드해도 값이 그대로다. 배관이 붙으면 실제로 갱신된다.
  //   리로드는 Bearer 토큰(useState)도 날린다 — invalidateQueries 는 그러지 않는다.
  const refresh = () => window.location.reload();

  return (
    <>
      {showBanner && (
        <SpecUpdateBanner
          onRefresh={refresh}
          onDismiss={() => setDismissed(staleSnapshotId)}
        />
      )}

      <SpecColumns
        sidebar={<EndpointSidebar endpoints={projectView.endpoints} />}
        detail={
          !endpointId ? (
            <ProjectOverview projectView={projectView} projectId={projectId} />
          ) : (
            renderDetail(detail, cache, projectView)
          )
        }
        comments={
          <CommentPanel
            me={MOCK_CURRENT_USER}
            isOwner={isOwner}
            members={MOCK_PROJECT_MEMBERS}
            // 멘션 대상은 삭제되지 않은 엔드포인트로 한정된다(FR-8.3).
            // 여기서 걸러 보내면 에디터가 다시 판단하지 않는다.
            endpoints={projectView.endpoints.filter((e) => !e.isDeleted)}
          />
        }
      />
    </>
  );
}

// 중앙 컬럼 3상태 — 미선택 / 없는 엔드포인트 / 선택됨.
//
// 없는 엔드포인트를 404 페이지로 보내지 않는다. 사이드바가 사라져
// 다른 엔드포인트로 갈 방법이 없어진다. 링크가 상해도 복구 경로를 남긴다.
function renderDetail(
  detail: ReturnType<typeof getMockEndpointDetail>,
  cache: SpecCache,
  projectView: ProjectView,
) {
  if (!detail) {
    return (
      <p className="pt-16 text-center text-sm text-fg-3">
        엔드포인트를 찾을 수 없습니다
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 pt-1">
        {isHttpMethod(detail.method) ? (
          <MethodBadge
            method={detail.method}
            className="min-w-[72px] px-2.5 py-1 text-sm"
          />
        ) : (
          <FallbackBadge className="min-w-[72px] px-2.5 py-1 text-sm">
            {detail.method}
          </FallbackBadge>
        )}
        <h2
          className={cn(
            "font-mono text-2xl text-fg-1",
            detail.isDeleted && "text-fg-3",
          )}
        >
          {detail.path}
        </h2>
        {detail.isDeleted && <span className="text-xs text-fg-3">삭제됨</span>}
      </div>

      {detail.summary && <p className="text-sm text-fg-3">{detail.summary}</p>}

      <div className="pt-4">
        <EndpointDetail
          key={detail.id}
          method={detail.method}
          path={detail.path}
          operation={detail.operationJson}
          cache={cache}
          components={projectView.components}
          baseUrl={projectView.tryItBaseUrl}
        />
      </div>
    </div>
  );
}

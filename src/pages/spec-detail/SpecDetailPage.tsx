import { useState } from "react";
import type { ReactNode } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SpecColumns } from "./SpecColumns";
import { EndpointSidebar } from "./EndpointSidebar";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { isHttpMethod } from "@/lib/constants";
import { parseId } from "@/lib/routeParams";
import { ApiError } from "@/lib/api/client";
import { getEndpointDetail } from "@/lib/api/endpoints";
import { ProjectOverview } from "./ProjectOverview";
import { cn } from "@/lib/utils";
import { useSpecCache } from "./useSpecCache";
import { EndpointDetail } from "./EndpointDetail";
import { SpecUpdateBanner } from "./SpecUpdateBanner";
import { CommentPanel } from "./comments/CommentPanel";
import type { SpecOutletContext } from "@/layouts/SpecLayout";
import type { SpecCache } from "./useSpecCache";
import type {
  ProjectView,
  EndpointDetail as EndpointDetailType,
} from "@/lib/types";
import { useAuth } from "@/app/AuthContext";
import { getMembers } from "@/lib/api/projects";
import type { EndpointSummary } from "@/lib/types";

// SpecDetailPage — 3컬럼 본문
//
// 선택 상태의 소유자는 URL 이다. 컴포넌트 state 로 들지 않는다 —
// 새로고침과 뒤로가기가 살아야 하고, 13단계 딥링크가 같은 경로를 그대로 쓴다.
//
// projectView 는 SpecLayout 이 이미 확보해 내려준다. 여기서 다시 조회하지 않는다.
export function SpecDetailPage() {
  const { projectId, endpointId: endpointIdParam } = useParams();
  const { projectView } = useOutletContext<SpecOutletContext>();
  const cache = useSpecCache(projectView.components);

  // 선택 여부와 유효성은 다르다.
  //   /projects/1                → 미선택. 개요를 그린다.
  //   /projects/1/endpoints/abc  → 선택했지만 잘못된 값. 요청을 안 보낸다.
  const hasSelection = endpointIdParam !== undefined;
  const endpointId = parseId(endpointIdParam);

  const detailQuery = useQuery({
    queryKey: ["endpoints", endpointId],
    // enabled 가 endpointId !== null 을 보장한다.
    queryFn: () => getEndpointDetail(endpointId!),
    enabled: endpointId !== null,
  });

  const detail = detailQuery.data;
  const isOwner = projectView.project.role === "OWNER";

  // 배너를 닫은 스냅샷을 기억한다. 그보다 더 새 스냅샷이 오면 다시 뜬다.
  const [dismissed, setDismissed] = useState<number | null>(null);

  // 상세 응답의 스냅샷이 캐시보다 높으면 그 사이 스펙이 커밋된 것이다.
  // 미선택 상태에서는 상세 응답이 없어 감지되지 않는다 — 엔드포인트를 열면 드러난다.
  //
  // 반대 방향(detail < project)은 배너 대상이 아니다. 내 캐시가 낡은 게 아니라
  // 상세가 낡은 것이라 무효화만 하면 풀린다 — 사용자에게 물을 게 없다.
  const staleSnapshotId =
    detail && detail.snapshotId > projectView.snapshotId
      ? detail.snapshotId
      : null;
  const showBanner = staleSnapshotId !== null && staleSnapshotId !== dismissed;

  // 리로드는 Bearer 토큰(useState)도 날리기 때문에, invalidateQuery를 써서 토큰을 날리지 않는다.
  const queryClient = useQueryClient();

  // 스냅샷 두 개를 같이 무효화한다. 배너의 원인이 "둘이 어긋남"이라 한쪽만 다시 받으면 어긋난 채로 남는다.
  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["projects", projectView.project.id],
      exact: true,
    });
    queryClient.invalidateQueries({ queryKey: ["endpoints"] });
  };

  // 중앙 컬럼 5상태. SpecLayout 과 같은 분기 형태를 쓴다.
  let detailNode: ReactNode;
  if (!hasSelection) {
    detailNode = (
      <ProjectOverview projectView={projectView} projectId={projectId} />
    );
  } else if (endpointId === null) {
    detailNode = <NotFoundDetail />;
  } else if (detailQuery.isPending) {
    detailNode = <LoadingState />;
  } else if (detailQuery.isError) {
    // 404 는 두 갈래(엔드포인트 없음 / 남의 프로젝트)이고 문구가 서로 다르다.
    // 구분할 수 없고 후자의 문구("멤버쉽이…")는 이 화면에서 뜬금없으므로 고정 문구를 쓴다.
    detailNode = isNotFound(detailQuery.error) ? (
      <NotFoundDetail />
    ) : (
      <ErrorState
        error={detailQuery.error}
        fallback="엔드포인트를 불러오지 못했습니다."
        onRetry={() => detailQuery.refetch()}
      />
    );
  } else {
    detailNode = renderDetail(detailQuery.data, cache, projectView);
  }

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
        detail={detailNode}
        comments={
          <CommentSlot
            projectId={projectView.project.id}
            endpointId={endpointId}
            isOwner={isOwner}
            // 삭제된 것도 함께 넘긴다. 이미 달린 멘션은 대상이 삭제돼도 유지되므로
            // (FR-7.4) 렌더가 삭제된 엔드포인트도 찾아 취소선을 그을 수 있어야 한다.
            // 새로 멘션하거나 옮길 수 있는 대상은 CommentProvider 가 좁힌다.
            endpoints={projectView.endpoints}
          />
        }
      />
    </>
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

// 없는 엔드포인트를 404 페이지로 보내지 않는다. 사이드바가 사라져
// 다른 엔드포인트로 갈 방법이 없어진다. 링크가 상해도 복구 경로를 남긴다.
function NotFoundDetail() {
  return (
    <p className="pt-16 text-center text-sm text-fg-3">
      엔드포인트를 찾을 수 없습니다
    </p>
  );
}

function renderDetail(
  detail: EndpointDetailType,
  cache: SpecCache,
  projectView: ProjectView,
) {
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
        {/* snapshotId 를 key 에 넣는다. 스펙이 커밋되면 같은 endpointId 라도
            operationJson 이 갈리는데, id 만으로는 Try it 입력값이 옛 스키마
            기준으로 남는다. 리로드가 전부 초기화하던 종전 동작과 같아진다. */}
        <EndpointDetail
          key={`${detail.id}-${detail.snapshotId}`}
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

// 댓글 컬럼 — me 와 멤버 목록을 확보한 뒤에만 CommentPanel 을 그린다.
//
// 훅을 여기 가둔다. 본문에 두면 SpecDetailPage 가 상세와 무관한 쿼리까지 이고 간다.
//
// members 를 빈 배열로 흘려보내지 않는다. 에디터의 멘션 후보가 0건인 것과
// 아직 못 받은 것은 다른 상태인데, 화면에서는 똑같이 "후보 없음"으로 보인다.
function CommentSlot({
  projectId,
  endpointId,
  isOwner,
  endpoints,
}: {
  projectId: number;
  endpointId: number | null;
  isOwner: boolean;
  endpoints: EndpointSummary[];
}) {
  const { me } = useAuth();

  const membersQuery = useQuery({
    queryKey: ["projects", projectId, "members"],
    queryFn: () => getMembers(projectId),
  });

  // me 는 RequireAuth 안이라 실제로는 항상 있다. 타입을 좁히려고 두는 분기다.
  // 단언(!)을 쓰지 않는 이유는, 나중에 이 화면이 RequireAuth 밖으로 나가면
  // 단언은 조용히 깨지고 이 분기는 로딩 화면으로 남기 때문이다.
  if (!me || membersQuery.isPending) {
    return <LoadingState label="댓글을 불러오는 중…" />;
  }

  if (membersQuery.isError) {
    return (
      <ErrorState
        error={membersQuery.error}
        fallback="멤버 목록을 불러오지 못했습니다."
        onRetry={() => membersQuery.refetch()}
      />
    );
  }

  return (
    <CommentPanel
      me={me}
      isOwner={isOwner}
      // MemberView[] → PublicUser[]. 컨텍스트가 role 을 안 쓴다 —
      // Owner 판정은 isOwner 로 이미 내려온다.
      members={membersQuery.data.map((m) => m.user)}
      endpoints={endpoints}
      endpointId={endpointId}
    />
  );
}

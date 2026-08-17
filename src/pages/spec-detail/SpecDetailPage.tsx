import type { ReactNode } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SpecColumns } from "./SpecColumns";
import { EndpointSidebar } from "./EndpointSidebar";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { isHttpMethod } from "@/lib/constants";
import { parseId } from "@/lib/routeParams";
import { ProjectOverview } from "./ProjectOverview";
import { cn } from "@/lib/utils";
import { useSpecCache } from "./useSpecCache";
import { EndpointDetail } from "./EndpointDetail";
import { CommentPanel } from "./comments/CommentPanel";
import type { SpecOutletContext } from "@/layouts/SpecLayout";
import type { SpecCache } from "./useSpecCache";
import { useAuth } from "@/app/AuthContext";
import { getMembers } from "@/lib/api/projects";
import type { ProjectMeta, Spec, SpecOperation } from "@/lib/types";

// SpecDetailPage — 3컬럼 본문
//
// 선택 상태의 소유자는 URL 이다. 컴포넌트 state 로 들지 않는다 —
// 새로고침과 뒤로가기가 살아야 하고, 13단계 딥링크가 같은 경로를 그대로 쓴다.
//
// meta 와 spec은 SpecLayout 이 확보해 내려준다.
// 엔드포인트 선택은 내려받은 spec.operations 에서 찾는다. 네트워크 요청이 없다.
// 목록과 상세가 같은 배열에서 나오므로 둘의 버전이 구조적으로 어긋날 수 없다.
export function SpecDetailPage() {
  const { endpointId: endpointIdParam } = useParams();
  const { meta, spec, outdated } = useOutletContext<SpecOutletContext>();
  const cache = useSpecCache(spec.components);

  // 선택 여부와 유효성은 다르다.
  //   /projects/1                → 미선택. 개요를 그린다.
  //   /projects/1/endpoints/abc  → 선택했지만 잘못된 값.
  const hasSelection = endpointIdParam !== undefined;
  const endpointId = parseId(endpointIdParam);

  const operation =
    endpointId !== null
      ? spec.operations.find((o) => o.id === endpointId)
      : undefined;

  // 중앙 컬럼 5상태.
  let detailNode: ReactNode;
  if (!hasSelection) {
    detailNode = <ProjectOverview meta={meta} spec={spec} />;
  } else if (endpointId === null) {
    detailNode = <NotFoundDetail />;
  } else if (operation === undefined) {
    detailNode = outdated ? <NotInSnapshotDetail /> : <NotFoundDetail />;
  } else {
    detailNode = renderDetail(operation, spec, meta, cache);
  }

  return (
    <SpecColumns
      sidebar={<EndpointSidebar endpoints={spec.operations} />}
      detail={detailNode}
      comments={
        <CommentSlot
          projectId={meta.id}
          // 앵커 스펙에 없는 엔드포인트는 미선택과 같게 다룬다.
          // 그냥 endpointId={endpointId} 로 넘기면, 존재하지 않는 엔드포인트일 경우에
          // 댓글쿼리만 404로 처리되어 중앙은 "찾을 수 없음"인데 댓글 패널은 재시도 가능한 실패인 것처럼 보인다.
          endpointId={operation ? endpointId : null}
          isOwner={meta.role === "OWNER"}
          outdated={outdated}
          // 삭제된 것도 함께 넘긴다. 이미 달린 멘션은 대상이 삭제돼도 유지되므로 (FR-7.4)
          // 렌더가 삭제된 엔드포인트도 찾아 취소선을 그을 수 있어야 한다.
          // 새로 멘션하거나 옮길 수 있는 대상은 CommentProvider 가 좁힌다.
          endpoints={spec.operations}
        />
      }
    />
  );
}

// 없는 엔드포인트를 404 페이지로 보내지 않는다.
// 사이드바나 헤더가 사라지면 어색하다.
function NotFoundDetail() {
  return (
    <p className="pt-16 text-center text-sm text-fg-3">
      엔드포인트를 찾을 수 없습니다
    </p>
  );
}

// 현재 앵커 스펙에는 없지만 최신에는 있을 수 있는 엔드포인트.
// 배너가 떠 있는 동안 알림 딥링크로 들어오는 경우이다.
function NotInSnapshotDetail() {
  return (
    <p className="pt-16 text-center text-sm text-fg-3">
      이 버전의 스펙에는 없는 엔드포인트입니다. 새로고침하면 표시됩니다.
    </p>
  );
}

function renderDetail(
  operation: SpecOperation,
  spec: Spec,
  meta: ProjectMeta,
  cache: SpecCache,
) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 pt-1">
        {isHttpMethod(operation.method) ? (
          <MethodBadge
            method={operation.method}
            className="min-w-18 px-2.5 py-1 text-sm"
          />
        ) : (
          <FallbackBadge className="min-w-18 px-2.5 py-1 text-sm">
            {operation.method}
          </FallbackBadge>
        )}
        <h2
          className={cn(
            "font-mono text-2xl text-fg-1",
            operation.isDeleted && "text-fg-3",
          )}
        >
          {operation.path}
        </h2>
        {operation.isDeleted && (
          <span className="text-xs text-fg-3">삭제됨</span>
        )}
      </div>

      {operation.summary && (
        <p className="text-sm text-fg-3">{operation.summary}</p>
      )}

      <div className="pt-4">
        {/* snapshotId 를 key 에 포함시킨다.
            배너 새로고침으로 앵커가 바뀌면 operationJson이 달라질 수 있는데,
            Try it out 입력값은 useState 초기값이라 리마운트 시켜야 최신 내용으로 보낼 수 있다. */}
        <EndpointDetail
          key={`${operation.id}-${spec.snapshotId}`}
          method={operation.method}
          path={operation.path}
          operation={operation.operationJson}
          cache={cache}
          components={spec.components}
          // baseUrl 은 meta 에서 온다 - 스펙이 아니라 프로젝트 설정값이고,
          // 앵커와 무관하게 항상 최신이어야 한다.
          baseUrl={meta.tryItBaseUrl}
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
  outdated,
  endpoints,
}: {
  projectId: number;
  endpointId: number | null;
  isOwner: boolean;
  // 스펙이 갱신된 상태. 상태가 어긋날 스펙을 개별적으로 골라내는 것이 아니고
  // 배너가 떠 있는 동안은 댓글 이동 자체를 막는 안내를 띄운다.
  outdated: boolean;
  endpoints: SpecOperation[];
}) {
  const { me } = useAuth();

  const membersQuery = useQuery({
    queryKey: ["project", projectId, "members"],
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
      outdated={outdated}
      // MemberView[] → PublicUser[]. 컨텍스트가 role 을 안 쓴다 —
      // Owner 판정은 isOwner 로 이미 내려온다.
      members={membersQuery.data.map((m) => m.user)}
      endpoints={endpoints}
      endpointId={endpointId}
    />
  );
}

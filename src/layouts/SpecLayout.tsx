import { Link, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { PanelLeft, PanelRight, Settings } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { UserMenu } from "@/components/UserMenu";
import { IconButton } from "@/components/IconButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/lib/utils";
import { parseId } from "@/lib/routeParams";
import {
  SpecPanelsProvider,
  useSpecPanels,
} from "@/pages/spec-detail/SpecPanelsContext";
import { HEADER_RIGHT_WIDTH } from "@/pages/spec-detail/panelMetrics";
import { BearerTokenProvider } from "@/pages/spec-detail/BearerTokenContext";
import { BearerTokenInput } from "@/pages/spec-detail/BearerTokenInput";
import type { ProjectMeta, Spec } from "@/lib/types";
import { useSpecAnchor } from "@/app/SpecAnchorContext";
import { getProjectMeta, getSpec } from "@/lib/api/projects";
import { SpecUpdateBanner } from "@/pages/spec-detail/SpecUpdateBanner";

// 자식 라우트가 받는 값. 소비처가 SpecDetailPage 하나뿐이라 파일을 따로 만들지 않는다.
//
// meta와 spec을 나눠서 내린다. 어느 값이 앵커를 따르고, 어느 값이 최신인지 확실히 구분하기 위해서다.
// 예를들면, tryItBaseUrl은 최신, components 는 앵커 시점이다.
//
// outdated는 두 곳이 쓴다.
// 1 - 앵커에 없는 엔드포인트의 문구 분기(NotInSnapshot vs. NotFound)와
// 2 - 댓글 이동 차단
export type SpecOutletContext = {
  meta: ProjectMeta;
  spec: Spec;
  outdated: boolean;
};

const LINK_BUTTON_CLASS_NAMES = cn(
  "text-fg-2 hover:bg-hover-icon hover:text-fg-1",
  "dark:hover:bg-hover-icon",
);

// 토글 버튼이 컨텍스트를 읽어야 해서 Provider 안쪽에 있어야 한다.
// 헤더를 포함한 본문 전체를 별도 컴포넌트로 뺀다.
function SpecLayoutInner() {
  const { projectId } = useParams();
  const id = parseId(projectId);
  const { isWide, sidebarOpen, commentsOpen, toggleSidebar, toggleComments } =
    useSpecPanels();
  const { anchors, setAnchor } = useSpecAnchor();

  // 메타 - 스펙 버전과 무관. 30초 폴링에서 오는 latestSnapshotId 로 배너를 판정한다.
  // 폴링은 여기에서만 켠다. 설정화면에서 같은 키를 쓰지만 30초 간격으로 폴링할 필요는 없다.
  // refetchInterval은 옵저버 단위라 화면마다 달라도 충돌하지 않는다.
  const metaQuery = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectMeta(id!),
    enabled: id !== null,
    refetchInterval: 30_000,
  });

  const anchor = id !== null ? anchors[id] : undefined;

  // 스펙 - 앵커가 키에 들어간다. 앵커를 바꾸는 것이 곧 스펙 교체이다.
  // staleTime: Infinity 필수.
  // SpecSnapshot이 append only라 같은 키의 내용은 절대 안 바뀌는데,
  // 전역 staleTime이 30초로 되어 있어 설정하지 않으면 계속 같은 내용의 데이터를 수백 KB씩
  // 다시 받는다.
  const specQuery = useQuery({
    queryKey: ["spec", id, anchor],
    queryFn: () => getSpec(id!, anchor),
    enabled: id !== null && anchor !== undefined,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
  });

  // 첫 진입시 앵커 고정.
  // 프로젝트 당 한번씩이고, 이미 있으면 건드리지 않는다.
  // 다른 프로젝트를 보고 왔을 때에도 버전이 유지되어야 한다.
  useEffect(() => {
    if (id !== null && metaQuery.data && anchors[id] === undefined) {
      setAnchor(id, metaQuery.data.latestSnapshotId);
    }
  }, [id, metaQuery.data, anchors, setAnchor]);

  const meta = metaQuery.data;
  const spec = specQuery.data;

  // 배너 판정. > 로 비교한다. !== 로 비교하면 앵커를 먼저 당긴 owner에게
  // meta 폴링이 따라오기 전까지 배너가 깜박인다.
  const outdated =
    meta !== undefined &&
    spec !== undefined &&
    meta.latestSnapshotId > spec.snapshotId;

  // 닫은 스냅샷을 기억한다.
  // 이 state를 페이지가 아니라 레이아웃이 갖는다.
  // /projects/1 과 /projects/1/endpoints/2 는 다른 라우트라 페이지에 두면
  // 엔드포인트를 이동할 때마다 리마운트되어 배너를 닫은 것을 기억할 수 없다.
  const [dismissed, setDismissed] = useState<number | null>(null);
  const showBanner = outdated && meta.latestSnapshotId !== dismissed;

  // 배너 새로고침 = 앵커 이동. 키가 바뀌면 스펙 전체가 따라온다.
  // invalidateQueries 를 부르지 않으므로 무표화 순서가 어긋날 여지가 없고,
  // Bearer Token (useState) 도 살아남는다.
  const refresh = () => {
    if (id !== null && meta) setAnchor(id, meta.latestSnapshotId);
  };

  const isOwner = meta?.role === "OWNER";

  // 로딩, 에러 중에는 프로젝트 항목을 아예 뺀다. "프로젝트" 같은 대체 텍스트를 넣으면
  // 로드 후 실제 이름으로 바뀌며 헤더가 흔들리고, 그 사이 틀린 정보를 보여주는 셈이다.
  const breadcrumbItems = [
    { label: "Dashboard", to: "/" },
    ...(spec ? [{ label: spec.title, to: `/projects/${id}` }] : []),
  ];

  const headerLeft = (
    <>
      {/* 엔드포인트 목록 토글 — 최선두 */}
      <IconButton
        label="엔드포인트 목록"
        onClick={toggleSidebar}
        aria-pressed={sidebarOpen}
      >
        <PanelLeft />
      </IconButton>

      <Breadcrumb items={breadcrumbItems} />

      {/* role 을 모르는 동안에는 그리지 않는다. 나중에 나타나는 편이
          잘못 그렸다 사라지는 것보다 낫다. */}
      {isOwner && (
        <Link
          to={`/projects/${id}/settings`}
          className={cn(LINK_BUTTON_CLASS_NAMES, "ml-1")}
          aria-label="프로젝트 설정"
        >
          <Settings className="size-4" />
        </Link>
      )}
    </>
  );

  // 넓은 폭에서만 폭을 고정한다. 댓글 패널의 안쪽 내용 폭과 같은 값이라
  // 초기 로딩 시 헤더 우측 영역과 패널 내용의 좌우 끝이 맞아떨어진다.
  // 입력창은 w-* 고정이 아니라 flex-1 이다 — 아이콘 크기가 바뀌어도 합계가 안 깨진다.
  // min-w-0 이 없으면 flex 자식 기본 min-width:auto 때문에 내용 폭 아래로
  // 안 줄어들어 컨테이너를 밀어낸다.
  const headerRight = (
    <div
      className="flex items-center gap-2"
      style={isWide ? { width: HEADER_RIGHT_WIDTH } : undefined}
    >
      {isWide && <BearerTokenInput className="min-w-0 flex-1" />}

      <IconButton
        label="댓글 패널"
        onClick={toggleComments}
        aria-pressed={commentsOpen}
      >
        <PanelRight />
      </IconButton>

      <UserMenu />
    </div>
  );

  // 앵커가 아직 없으면 spec 쿼리가 enabled: false라 isPending 이 true로 남는다.
  // 그 상태가 바로 로딩이므로 따로 다르지 않는다.
  let body: ReactNode;
  if (id === null) {
    body = <ErrorState error={null} fallback="프로젝트를 찾을 수 없습니다." />;
  } else if (metaQuery.isError) {
    body = (
      <ErrorState
        error={metaQuery.error}
        fallback="프로젝트를 불러오지 못했습니다."
      />
    );
  } else if (specQuery.isError) {
    body = (
      <ErrorState
        error={specQuery.error}
        fallback="스펙을 불러오지 못했습니다."
      />
    );
  } else if (!meta || !spec) {
    body = <LoadingState />;
  } else {
    body = <Outlet context={{ meta, spec, outdated }} />;
  }

  return (
    <div className="flex h-dvh flex-col bg-surface-2">
      <Header
        left={headerLeft}
        right={headerRight}
        wide={!isWide ? <BearerTokenInput className="w-full" /> : undefined}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {showBanner && (
          <SpecUpdateBanner
            onRefresh={refresh}
            onDismiss={() => setDismissed(meta.latestSnapshotId)}
          />
        )}
        {body}
      </div>
      <Footer align="left" />
    </div>
  );
}

// SpecLayout — 스펙 상세 (3컬럼)
//
// h-dvh flex 세로 스택. 페이지 전체 스크롤은 없고 컬럼이 각자 스크롤한다.
// 양쪽 패널 열림 상태는 헤더 토글과 본문이 함께 읽으므로 Provider 로 잇는다.
export function SpecLayout() {
  return (
    <SpecPanelsProvider>
      <BearerTokenProvider>
        <SpecLayoutInner />
      </BearerTokenProvider>
    </SpecPanelsProvider>
  );
}

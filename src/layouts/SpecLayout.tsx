import { Link, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
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
import { getProject } from "@/lib/api/projects";
import {
  SpecPanelsProvider,
  useSpecPanels,
} from "@/pages/spec-detail/SpecPanelsContext";
import { HEADER_RIGHT_WIDTH } from "@/pages/spec-detail/panelMetrics";
import { BearerTokenProvider } from "@/pages/spec-detail/BearerTokenContext";
import { BearerTokenInput } from "@/pages/spec-detail/BearerTokenInput";
import type { ProjectView } from "@/lib/types";

// 자식 라우트가 받는 값. 소비처가 SpecDetailPage 하나뿐이라 파일을 따로 만들지 않는다.
export type SpecOutletContext = { projectView: ProjectView };

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

  // 프로젝트 조회를 레이아웃이 갖는다.
  //
  // 자식 라우트 둘(index, endpoints/:endpointId)이 같은 SpecDetailPage 이고
  // 둘 다 projectView 를 요구한다. 페이지에 두면 로딩·에러 분기가 두 벌 생기고,
  // useSpecCache 가 components 없이 한 번 만들어졌다 버려진다.
  //
  // 헤더는 어느 상태에서도 그린다. 프로젝트를 못 불러왔다고 전체 화면 에러로 덮으면
  // 대시보드로 돌아갈 길이 없어진다 — 없는 endpointId 를 404 페이지로 안 보내는 것과 같은 판단.
  const {
    data: projectView,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["projects", id],
    // enabled 가 id !== null 을 보장한다.
    queryFn: () => getProject(id!),
    enabled: id !== null,
  });

  const isOwner = projectView?.project.role === "OWNER";

  // 로딩·에러 중에는 프로젝트 항목을 아예 뺀다. "프로젝트" 같은 대체 텍스트를 넣으면
  // 로드 후 실제 이름으로 바뀌며 헤더가 흔들리고, 그 사이 틀린 정보를 보여주는 셈이다.
  const breadcrumbItems = [
    { label: "Dashboard", to: "/" },
    ...(projectView
      ? [{ label: projectView.project.title, to: `/projects/${id}` }]
      : []),
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

  // 재시도 버튼은 달지 않는다. 404(없음·비멤버·삭제됨)는 다시 물어도 같은 답이고,
  // 그 셋을 구분할 방법이 없다(리소스 은닉).
  let body: ReactNode;
  if (id === null) {
    // /projects/abc — 요청 자체를 보내지 않는다. 백엔드는 400 을 내는데, 그 문구("유효하지 않은 id입니다")는 화면에 띄울 말이 아니다.
    body = <ErrorState error={null} fallback="프로젝트를 찾을 수 없습니다." />;
  } else if (isPending) {
    body = <LoadingState />;
  } else if (isError) {
    body = (
      <ErrorState error={error} fallback="프로젝트를 불러오지 못했습니다." />
    );
  } else {
    body = <Outlet context={{ projectView }} />;
  }

  return (
    <div className="flex h-dvh flex-col bg-surface-2">
      <Header
        left={headerLeft}
        right={headerRight}
        wide={!isWide ? <BearerTokenInput className="w-full" /> : undefined}
      />
      {/* 세로 스택을 한 겹 더 둔다. 상태에 따라 내용이 갈려도
          SpecColumns(min-h-0 flex-1)와 배너(shrink-0)의 배치 전제가 그대로 성립한다.
          overflow 는 주지 않는다 — 스크롤 주체는 각 컬럼이다. */}
      <div className="flex min-h-0 flex-1 flex-col">{body}</div>
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

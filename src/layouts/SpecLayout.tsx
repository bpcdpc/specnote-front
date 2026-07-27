import { Link, Outlet, useParams } from "react-router-dom";
import { PanelLeft, PanelRight, Settings } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import {
  SpecPanelsProvider,
  useSpecPanels,
} from "@/pages/spec-detail/SpecPanelsContext";
import { HEADER_RIGHT_WIDTH } from "@/pages/spec-detail/panelMetrics";
import { MOCK_PROJECT } from "@/lib/mock";
import { BearerTokenProvider } from "@/pages/spec-detail/BearerTokenContext";
import { BearerTokenInput } from "@/pages/spec-detail/BearerTokenInput";
import { IconButton } from "@/components/IconButton";

// const ICON_BUTTON =
//   "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-2 " +
//   "hover:bg-hover-icon hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const LINK_BUTTON_CLASS_NAMES = cn(
  "text-fg-2 hover:bg-hover-icon hover:text-fg-1",
  "dark:hover:bg-hover-icon",
);

// 토글 버튼이 컨텍스트를 읽어야 해서 Provider 안쪽에 있어야 한다.
// 헤더를 포함한 본문 전체를 별도 컴포넌트로 뺀다.
function SpecLayoutInner() {
  const { projectId } = useParams();
  const { isWide, sidebarOpen, commentsOpen, toggleSidebar, toggleComments } =
    useSpecPanels();

  // TODO(데이터 단계): MOCK_PROJECT 를 useProject(id) 응답으로 교체.
  //   role 은 ProjectSummary 에 이미 담겨 온다. 별도 useAuth 비교가 필요 없다.
  const isOwner = MOCK_PROJECT.role === "OWNER";

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

      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/" },
          { label: MOCK_PROJECT.title, to: `/projects/${projectId}` },
        ]}
      />

      {isOwner && (
        <Link
          to={`/projects/${projectId}/settings`}
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

  return (
    <div className="flex h-dvh flex-col bg-surface-2">
      <Header
        left={headerLeft}
        right={headerRight}
        wide={!isWide ? <BearerTokenInput className="w-full" /> : undefined}
      />
      <Outlet />
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

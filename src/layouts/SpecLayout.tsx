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
import { MOCK_PROJECT } from "@/lib/mock";
import { BearerTokenProvider } from "@/pages/spec-detail/BearerTokenContext";
import { BearerTokenInput } from "@/pages/spec-detail/BearerTokenInput";

const ICON_BUTTON =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-2 " +
  "hover:bg-hover-icon hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
      <button
        type="button"
        onClick={toggleSidebar}
        className={ICON_BUTTON}
        aria-label="엔드포인트 목록"
        aria-pressed={sidebarOpen}
      >
        <PanelLeft className="size-4" />
      </button>

      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/" },
          { label: MOCK_PROJECT.title, to: `/projects/${projectId}` },
        ]}
      />

      {isOwner && (
        <Link
          to={`/projects/${projectId}/settings`}
          className={cn(ICON_BUTTON, "ml-1")}
          aria-label="프로젝트 설정"
        >
          <Settings className="size-4" />
        </Link>
      )}
    </>
  );

  const headerRight = (
    <>
      {isWide && <BearerTokenInput className="w-64" />}
      <button
        type="button"
        onClick={toggleComments}
        className={ICON_BUTTON}
        aria-label="댓글 패널"
        aria-pressed={commentsOpen}
      >
        <PanelRight className="size-4" />
      </button>
      <UserMenu />
    </>
  );

  return (
    <div className="flex h-dvh flex-col bg-surface-2">
      <Header
        left={headerLeft}
        right={headerRight}
        wide={!isWide ? <BearerTokenInput className="w-full" /> : undefined}
      />
      <Outlet />
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

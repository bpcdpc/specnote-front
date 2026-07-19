import { Outlet, useParams } from "react-router-dom";
import { Settings } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { UserMenu } from "@/components/UserMenu";

// SpecLayout — 스펙 상세 (3컬럼)
//
// h-dvh flex 세로 스택. 페이지 전체 스크롤은 없고 3컬럼이 각자 스크롤한다.
// 헤더는 이 레이아웃이 조립한다. 3컬럼 본문은 페이지가 Outlet에 채운다.
export function SpecLayout() {
  const { id } = useParams();

  // ── 헤더 좌측: ← + 프로젝트명 + ⚙(Owner만) ──
  //
  // TODO(데이터 단계):
  //   - 프로젝트명을 useProject(id).name 으로 교체
  //   - ⚙ 표시를 Owner 여부로 제어 (useAuth + project.ownerId 비교)
  const projectName = "프로젝트 이름";
  const isOwner = true;

  const headerLeft = (
    <>
      <BackButton to="/" />
      <h1 className="truncate font-medium text-fg-1">{projectName}</h1>
      {isOwner && (
        <a
          href={`/projects/${id}/settings`}
          className="ml-1 inline-flex size-8 items-center justify-center rounded-md text-fg-2 hover:bg-hover-icon hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="프로젝트 설정"
        >
          <Settings className="size-4" />
        </a>
      )}
    </>
  );

  // ── 헤더 우측: Bearer 입력 + UserMenu ──
  const headerRight = (
    <>
      <span className="text-sm text-fg-3">Bearer 입력 (예정)</span>
      <UserMenu />
    </>
  );

  return (
    <div className="flex h-dvh flex-col bg-surface-2">
      <Header left={headerLeft} right={headerRight} />
      {/* 3컬럼은 페이지가 채운다. flex-1 min-h-0 로 남는 높이를 차지. */}
      <Outlet />
      <Footer align="left" />
    </div>
  );
}

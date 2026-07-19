import { Outlet, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { UserMenu } from "@/components/UserMenu";

type AppLayoutProps = {
  // 헤더 좌측 형식을 정한다.
  //   dashboard         → "Dashboard" 텍스트
  //   project-create    → ← + "새 프로젝트" 텍스트
  //   project-settings  → ← + 프로젝트명
  variant: "dashboard" | "project-create" | "project-settings";
};

// AppLayout — 일반 앱 화면 (대시보드 / 프로젝트 생성 / 프로젝트 설정)
//
// 헤더 / 콘텐츠 / 푸터의 골격을 소유한다. 페이지는 Outlet에 콘텐츠만 채운다.
// 헤더는 이 레이아웃이 조립한다 — 페이지가 넘겨주지 않는다.
export function AppLayout({ variant }: AppLayoutProps) {
  const { id } = useParams();

  // ── 헤더 좌측 ──
  let headerLeft;
  if (variant === "dashboard") {
    headerLeft = <h1 className="font-medium text-fg-1">Dashboard</h1>;
  } else if (variant === "project-create") {
    headerLeft = (
      <>
        <BackButton to="/" />
        <h1 className="font-medium text-fg-1">새 프로젝트</h1>
      </>
    );
  } else {
    // project-settings — 프로젝트명.
    //
    // TODO(데이터 단계): useProject(id).name 으로 교체. 지금은 목.
    //   뒤로가기는 목록(/)이 아니라 해당 프로젝트(/projects/:id)로 보낸다
    //   (설정에서 나가면 프로젝트 화면으로 돌아가는 흐름).
    const title = "프로젝트 이름";
    headerLeft = (
      <>
        <BackButton to={`/projects/${id}`} />
        <h1 className="truncate font-medium text-fg-1">{title}</h1>
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-2">
      <Header left={headerLeft} right={<UserMenu />} />

      {/* 본문 — 흐름 스크롤. 하단 푸터 높이만큼 여백 확보 */}
      <main className="flex-1 pb-12">
        <Outlet />
      </main>

      <Footer align="left" />
    </div>
  );
}

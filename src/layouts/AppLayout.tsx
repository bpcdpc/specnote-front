import { Outlet, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Crumb } from "@/components/Breadcrumb";
import { UserMenu } from "@/components/UserMenu";
import { parseId } from "@/lib/routeParams";
import { useQuery } from "@tanstack/react-query";
import { getProjectMeta } from "@/lib/api/projects";

type AppLayoutProps = {
  // 헤더 좌측 경로를 정한다.
  //   dashboard         → Dashboard
  //   project-create    → Dashboard / 새 프로젝트
  //   project-settings  → Dashboard / 프로젝트명 / 설정
  variant: "dashboard" | "project-create" | "project-settings";
};

// AppLayout — 일반 앱 화면 (대시보드 / 프로젝트 생성 / 프로젝트 설정)
//
// 헤더 / 콘텐츠 / 푸터의 골격을 소유한다. 페이지는 Outlet 에 콘텐츠만 채운다.
// 헤더는 이 레이아웃이 조립한다 — 페이지가 넘겨주지 않는다.
export function AppLayout({ variant }: AppLayoutProps) {
  const { projectId } = useParams();
  const id = parseId(projectId);

  const { data: meta } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectMeta(id!),
    enabled: id !== null,
    // 30초 폴링은 켜지 않는다. 이 쿼리가 필요한 곳은 설정 화면뿐이고, 필요한 것은 프로젝트 이름 뿐이다.
  });

  let items: Crumb[];
  if (variant === "dashboard") {
    items = [{ label: "Dashboard" }];
  } else if (variant === "project-create") {
    items = [{ label: "Dashboard", to: "/" }, { label: "새 프로젝트" }];
  } else {
    items = [
      { label: "Dashboard", to: "/" },
      ...(meta ? [{ label: meta.title, to: `/projects/${id}` }] : []),
      { label: "설정" },
    ];
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-2">
      <Header left={<Breadcrumb items={items} />} right={<UserMenu />} />

      {/* 본문 — 흐름 스크롤. 하단 푸터 높이만큼 여백 확보 */}
      <main className="flex-1 pb-12">
        <Outlet />
      </main>

      <Footer align="left" />
    </div>
  );
}

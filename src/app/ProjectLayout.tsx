import { Outlet } from "react-router-dom";
import { Footer } from "@/components/Footer";

// Dashboard · ProjectForm
//
// 헤더는 그리지 않는다 — 각 페이지가 <Header left={…} right={…} />를 직접 렌더한다.
// 좌측 내용이 페이지마다 달라서(고정 텍스트 vs ←+프로젝트명),
// 레이아웃이 헤더를 그리면 자식(페이지)이 부모(레이아웃)로 내용을 올려보내야 한다.
//
// pb-12: 하단 고정 푸터에 콘텐츠가 가리지 않도록 확보.
export function ProjectLayout() {
  return (
    <div className="min-h-screen bg-surface-2 pb-12">
      <Outlet />
      <Footer align="left" />
    </div>
  );
}

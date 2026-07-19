import { createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { SpecLayout } from "@/layouts/SpecLayout";

import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProjectCreatePage } from "@/pages/project-form/ProjectCreatePage";
import { ProjectSettingsPage } from "@/pages/project-form/ProjectSettingsPage";
import { SpecDetailPage } from "@/pages/spec-detail/SpecDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// 라우트 정의
//
// 레이아웃 3종이 각 화면을 감싼다.
//   AuthLayout — 헤더 없음, 중앙 정렬 (로그인/회원가입)
//   AppLayout  — 헤더 + 흐름 + 푸터. variant로 헤더 좌측 형식 지정
//   SpecLayout — 헤더 + 3컬럼 (h-dvh 고정)
//
// 헤더는 레이아웃이 그린다. 페이지는 콘텐츠(Outlet)만 채운다.
// AppLayout variant:
//   dashboard        → "Dashboard" 텍스트
//   project-create   → ← + "새 프로젝트" 텍스트
//   project-settings → ← + 프로젝트명
export const router = createBrowserRouter([
  // 인증 — 로그인 안 한 사용자
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },

  // 대시보드 — 프로젝트 목록
  {
    element: <AppLayout variant="dashboard" />,
    children: [{ path: "/", element: <DashboardPage /> }],
  },

  // 프로젝트 생성
  {
    element: <AppLayout variant="project-create" />,
    children: [{ path: "/projects/new", element: <ProjectCreatePage /> }],
  },

  // 프로젝트 설정
  // path 를 부모에 둔다. 자식에만 두면 AppLayout 의 useParams() 가 비어
  // 브레드크럼 링크가 /projects/undefined 로 나간다.
  {
    path: "/projects/:projectId/settings",
    element: <AppLayout variant="project-settings" />,
    children: [{ index: true, element: <ProjectSettingsPage /> }],
  },

  // 스펙 상세 — 3컬럼
  {
    path: "/projects/:projectId",
    element: <SpecLayout />,
    children: [
      { index: true, element: <SpecDetailPage /> },
      { path: "endpoints/:endpointId", element: <SpecDetailPage /> },
    ],
  },

  // 404 — 어느 레이아웃에도 속하지 않음
  { path: "*", element: <NotFoundPage /> },
]);

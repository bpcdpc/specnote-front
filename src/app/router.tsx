import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { ProjectLayout } from "./ProjectLayout";
import { SpecLayout } from "./SpecLayout";
import {
  LoginPage,
  SignupPage,
  DashboardPage,
  ProjectFormPage,
  SpecDetailPage,
  NotFoundPage,
} from "./StubPages";

// 라우트 5개 + 404.
// 인증 가드(RequireAuth)는 9단계에서 ProjectLayout, SpecLayout을 감싸며 추가한다.
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
  {
    element: <ProjectLayout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/projects/new", element: <ProjectFormPage /> },
      { path: "/projects/:id/settings", element: <ProjectFormPage /> },
    ],
  },
  {
    element: <SpecLayout />,
    children: [{ path: "/projects/:id", element: <SpecDetailPage /> }],
  },
  {
    element: <ProjectLayout />,
    children: [{ path: "*", element: <NotFoundPage /> }],
  },
]);

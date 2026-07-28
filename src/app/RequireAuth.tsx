import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

// app/RequireAuth.tsx
//
// 보호 라우트 래퍼. router.tsx 에서 레이아웃 라우트로 쓴다.

export function RequireAuth() {
  const { me, isLoading } = useAuth();

  // 토큰은 있지만 me가 없는 상태
  if (isLoading) return null;
  // me가 없는 상태
  if (!me) return <Navigate to="/login" replace />;

  return <Outlet />;
}

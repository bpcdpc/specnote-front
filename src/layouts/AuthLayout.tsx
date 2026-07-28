import { useAuth } from "@/app/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

// AuthLayout — 로그인 · 회원가입
//
// 헤더도 푸터도 없다. 본문을 화면 중앙에 두고 모바일 너비로 제한한다.
export function AuthLayout() {
  const { me, isLoading } = useAuth();

  // 토큰은 있는데 me 가 없는 상태이면 아무것도 그리지 않음
  if (isLoading) return null;
  // 로그인된 상태이면 홈으로 리디렉트
  if (me) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-dvh flex-col bg-surface-2">
      {/* 본문 — 세로/가로 중앙, 최대 너비 제한 */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

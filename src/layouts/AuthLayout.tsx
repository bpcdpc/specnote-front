import { Outlet } from "react-router-dom";

// AuthLayout — 로그인 · 회원가입
//
// 헤더도 푸터도 없다. 본문을 화면 중앙에 두고 모바일 너비로 제한한다.
export function AuthLayout() {
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

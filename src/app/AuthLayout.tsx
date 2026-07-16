import { Outlet } from "react-router-dom";
import { Footer } from "@/components/Footer";

// Login · Signup
// 헤더 없음. 본문을 화면 중앙에 두고 모바일 너비로 제한. 푸터 중앙 정렬.
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-2 px-4 pb-12">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
      <Footer align="center" />
    </div>
  );
}

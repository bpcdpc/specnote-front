import { Sun, Moon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/app/ThemeContext";
import { useAuth } from "@/app/AuthContext";

// UserMenu — 헤더 우측 유저 메뉴
//
// 아바타 클릭 → 드롭다운(이름, 이메일, 알림, 테마 토글, 로그아웃).
//
// TODO
//   - 알림 목록·미확인 개수를 useNotifications() 로 교체 (빨간 점 표시)
export function UserMenu() {
  const { me, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!me) return null;

  // 이니셜은 백엔드에 없다. userName 에서 파생시킨다.
  const initial = me.userName.charAt(0);

  return (
    <DropdownMenu>
      {/* Trigger 자체가 <button> 을 렌더한다. 중첩 button 을 두지 않는다. */}
      <DropdownMenuTrigger
        className="inline-flex shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="유저 메뉴"
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* 이름, 이메일 — 단순 표시 (Label 컴포넌트 아님) */}
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="text-sm font-medium text-fg-1">{me.userName}</span>
          <span className="text-xs text-fg-3">{me.email}</span>
        </div>

        {/* 알림 — 목. 데이터 단계에서 실제 목록으로 */}
        <div className="px-2 py-1.5 text-xs text-fg-3">알림 (예정)</div>

        {/* 테마 토글 — 실제 동작 */}
        <DropdownMenuItem closeOnClick={false} onClick={() => toggleTheme()}>
          {theme === "dark" ? (
            <>
              <Sun className="size-4" />
              라이트 모드
            </>
          ) : (
            <>
              <Moon className="size-4" />
              다크 모드
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={logout}>
          <LogOut className="size-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

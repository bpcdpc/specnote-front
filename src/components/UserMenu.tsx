import { Sun, Moon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/app/ThemeContext";
import { useAuth } from "@/app/AuthContext";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead } from "@/lib/api/notifications";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNavigate } from "react-router-dom";
import type { NotificationView } from "@/lib/types";
import { ApiError } from "@/lib/api/client";
import { toast } from "./ui/toast";

// UserMenu — 헤더 우측 유저 메뉴
//
// 아바타 클릭 → 드롭다운(이름, 이메일, 알림, 테마 토글, 로그아웃).
export function UserMenu() {
  const { me, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // refetchInterval에서
  // 드롭다운이 열려있는지 여부를 사용해야 하므로 state로 선언한다.
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const readMutation = useMutation({ mutationFn: markAsRead });

  const {
    data: notifications,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    // 로그아웃 직후 me 가 비는 순간에도 이 컴포넌트가 한 번 더 렌더된다.
    // 막지 않으면 토큰 없는 요청이 나간다.
    enabled: Boolean(me),
    refetchInterval: open ? false : 10_000,
  });

  const handleSelect = async (n: NotificationView) => {
    const to = destination(n);

    if (!n.isRead) {
      try {
        await readMutation.mutateAsync(n.id);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch (e) {
        toast.add({
          title:
            e instanceof ApiError
              ? e.message
              : "알림을 읽음 처리하지 못했습니다",
          type: "error",
        });
      }
    }
    if (to) navigate(to);
  };

  // 로그인 상태가 아니면 조기 리턴한다.
  if (!me) return null;

  // 이니셜은 백엔드에 없다. userName 에서 파생시킨다.
  const initial = me.userName.charAt(0);

  // 아바타 뱃지용. 드롭다운도 같은 값을 자기가 다시 센다 —
  // 미확인은 전부 그리기 때문에 양쪽 값이 항상 일치한다.
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Trigger 자체가 <button> 을 렌더한다. 중첩 button 을 두지 않는다. */}
      <DropdownMenuTrigger
        className="inline-flex shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="유저 메뉴"
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          {unreadCount > 0 && (
            <AvatarBadge className="bg-destructive ring-surface-1 top-0 bottom-auto" />
          )}
        </Avatar>
      </DropdownMenuTrigger>

      {/* 스크롤 주체를 알림 목록 하나로 몰기 위해 팝업 자체의 overflow-y-auto 를 끈다.
    (dropdown-menu.tsx 기본값). 켜둔 채로 안쪽에 max-h 를 주면 컨테이너가 이중으로 겹친다. */}
      <DropdownMenuContent align="end" className="w-80 overflow-y-hidden">
        {/* 이름, 이메일 — 단순 표시 (Label 컴포넌트 아님) */}
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="text-sm font-medium text-fg-1">{me.userName}</span>
          <span className="text-xs text-fg-3">{me.email}</span>
        </div>

        <DropdownMenuSeparator />

        {isPending ? (
          <div className="px-1.5 py-1 text-xs text-fg-3">불러오는 중…</div>
        ) : isError ? (
          <div className="px-1.5 py-1 text-xs text-fg-3">
            알림을 불러오지 못했습니다
          </div>
        ) : (
          <NotificationDropdown
            notifications={notifications}
            userName={me.userName}
            onSelect={handleSelect}
          />
        )}

        <DropdownMenuSeparator />

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

// 알림의 착지 경로. INVITED 는 프로젝트 개요, MENTIONED 는 그 댓글까지 간다.
// 파생 필드가 비면 갈 곳이 없다 — 읽음 처리만 하고 이동은 건너뛴다.
// ?comment= 는 13단계 딥링크 규약(03-frontend-layouts)이고, 읽는 쪽은 CommentPanel 이다.
function destination(n: NotificationView): string | null {
  if (n.type === "INVITED")
    return n.invitedProjectId ? `/projects/${n.invitedProjectId}` : null;

  if (n.projectId === null || n.endpointId === null) return null;

  return `/projects/${n.projectId}/endpoints/${n.endpointId}?comment=${n.mentionedCommentId}`;
}

import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { getProjects } from "@/lib/api/projects";
import { timeAgo } from "@/lib/formatTime";
import { cn } from "@/lib/utils";
import type { NotificationView } from "@/lib/types";

// 읽은 알림을 채우는 상한. 미확인은 이 수와 무관하게 전부 그린다 —
// 목록 밖에 미확인이 남으면 아바타 점을 없앨 방법이 사라진다.
// 서버가 페이지네이션 없이 계정 수명 전체를 주므로 읽은 쪽만 여기서 자른다.
const READ_LIMIT = 10;

// NotificationDropdown — UserMenu 안의 알림 섹션
//
// 표시 전용이다. 알림 쿼리와 클릭 핸들러는 UserMenu 가 갖는다 —
// 이 컴포넌트는 팝업 안에 살고, 항목을 누르면 팝업째 언마운트되기 때문이다.
// 옵저버가 사라져도 뱃지는 계속 그려져야 하고, 읽음 mutation 도 끝까지 살아야 한다.
//
// 알림에 프로젝트 이름을 표시하기 위한 프로젝트 목록만 여기서 조회한다.
// 팝업이 열려 있을 때만 필요하고 대시보드가 이미 채워둔 캐시라 대개 즉시 히트한다.
export function NotificationDropdown({
  notifications,
  userName,
  onSelect,
}: {
  notifications: NotificationView[];
  userName: string;
  onSelect: (n: NotificationView) => void;
}) {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // 로딩 중, 실패, 제외된 프로젝트가 전부 null 로 수렴한다.
  // 셋 다 사용자가 할 수 있는 것이 없어 구분할 이유가 없다.
  const projectTitle = (id: number | null) =>
    projects?.find((p) => p.id === id)?.title ?? null;

  // 미확인은 전부, 읽은 것은 앞에서부터 READ_LIMIT 건까지.
  // 원래 순서(서버 desc)를 그대로 유지한다 — 미확인을 위로 몰면
  // 읽는 순간 그 항목이 아래로 점프하고, "새 것이 맨 위"라는 기대도 깨진다.
  //
  // 미확인을 다 그리므로 이 개수는 UserMenu 의 아바타 점 기준과 항상 일치한다.
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const visible: NotificationView[] = [];
  let readTaken = 0;
  for (const n of notifications) {
    if (n.isRead) {
      if (readTaken >= READ_LIMIT) continue;
      readTaken += 1;
    }
    visible.push(n);
  }

  return (
    <DropdownMenuGroup className="max-h-64 overflow-y-auto">
      {/* 알림만 스크롤한다. 이름·이메일과 테마·로그아웃은 위아래에 고정으로 남는다. */}
      {/* 라벨 단독으로 쓰지 않는다 — Group 안에서만(05-code-conventions) */}
      <DropdownMenuLabel>
        알림
        {unreadCount > 0 && (
          <span className="ml-1.5 tabular-nums text-destructive">
            {unreadCount}
          </span>
        )}
      </DropdownMenuLabel>

      {visible.length === 0 ? (
        <div className="px-1.5 py-1 text-xs text-fg-3">새 알림이 없습니다</div>
      ) : (
        visible.map((n) => (
          <DropdownMenuItem
            key={n.id}
            onClick={() => onSelect(n)}
            className="items-start gap-2"
          >
            {/* 읽은 항목도 점 자리를 비워둔다. 안 그리면 줄마다 들여쓰기가 어긋난다. */}
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                n.isRead ? "bg-transparent" : "bg-destructive",
              )}
            />
            <span className="flex min-w-0 flex-col">
              <span
                className={cn("truncate", n.isRead ? "text-fg-3" : "text-fg-1")}
              >
                {label(n, userName, projectTitle)}
              </span>
              {/* TimeAgo 를 쓰지 않는다. 툴팁이 드롭다운 위에 겹쳐 뜬다. */}
              <span className="text-xs text-fg-3">{timeAgo(n.createdAt)}</span>
            </span>
          </DropdownMenuItem>
        ))
      )}
    </DropdownMenuGroup>
  );
}

// 응답에 보낸 사람 이름도, 엔드포인트 path 도 없다.
// 그래서 주어는 수신자 본인이다 — "누가 멘션했는지"는 눌러서 확인한다.
//
// "댓글"이 아니라 "글"이다. 멘션은 댓글과 답글 양쪽에 달리는데
// "댓글"은 최상위만 가리키는 것처럼 읽힌다.
function label(
  n: NotificationView,
  userName: string,
  projectTitle: (id: number | null) => string | null,
): string {
  if (n.type === "MENTIONED") return `${userName}님이 글에 멘션되었습니다.`;

  const title = projectTitle(n.invitedProjectId);
  return title
    ? `${title} 프로젝트에 초대되었습니다.`
    : "프로젝트에 초대되었습니다.";
}

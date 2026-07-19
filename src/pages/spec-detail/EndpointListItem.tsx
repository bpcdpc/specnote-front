import { Link } from "react-router-dom";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { cn } from "@/lib/utils";
import { isHttpMethod } from "@/lib/constants";
import type { EndpointSummary } from "@/lib/types";

type EndpointListItemProps = {
  endpoint: EndpointSummary;
  to: string;
  isSelected: boolean;
};

// EndpointListItem — 사이드바 목록 행 (메서드 뱃지 + path)
//
// 1. 버튼이 아니라 <Link> 다. 새 탭 열기와 URL 복사가 동작해야 한다.
// 2. summary 는 표시하지 않는다. 240px 에 2줄이면 밀도가 깨진다. 검색 대상으로만 쓴다.
// 3. method 는 백엔드가 string 으로 준다. 렌더 직전에 좁히고 벗어난 값은 폴백한다
//    (OAS 는 head·options·trace 도 허용한다).
export function EndpointListItem({
  endpoint,
  to,
  isSelected,
}: EndpointListItemProps) {
  const { method, path, isDeleted } = endpoint;

  return (
    <Link
      to={to}
      aria-current={isSelected ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected ? "bg-surface-3" : "hover:bg-hover-icon",
      )}
    >
      {isHttpMethod(method) ? (
        <MethodBadge method={method} />
      ) : (
        // 폴백 — OAS 는 head·options·trace 도 허용한다.
        // 뱃지와 같은 폭·서체로 맞춰 path 세로 정렬을 유지한다.
        <FallbackBadge>{method}</FallbackBadge>
      )}

      <span
        className={cn(
          "truncate font-mono text-xs",
          isDeleted && "text-fg-3 line-through",
          !isDeleted &&
            (isSelected ? "text-fg-1" : "text-fg-2 group-hover:text-fg-1"),
        )}
      >
        {path}
      </span>

      {isDeleted && <span className="sr-only">삭제됨</span>}
    </Link>
  );
}

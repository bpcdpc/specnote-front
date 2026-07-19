import { cn } from "@/lib/utils";
import type { HTTP_METHOD } from "@/lib/constants";

// 라이트는 솔리드, 다크는 아웃라인 — 컴포넌트에 분기가 없다.
// CSS 변수(--sn-get-fg 등)가 .dark 에서 값만 바뀐다.
const STYLES: Record<HTTP_METHOD, string> = {
  GET: "text-get-fg bg-get-bg border-get-border",
  POST: "text-post-fg bg-post-bg border-post-border",
  PUT: "text-put-fg bg-put-bg border-put-border",
  PATCH: "text-patch-fg bg-patch-bg border-patch-border",
  DELETE: "text-delete-fg bg-delete-bg border-delete-border",
};

type MethodBadgeProps = {
  method: HTTP_METHOD;
  className?: string;
};

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        // min-w 로 폭을 맞춰 목록에서 경로가 세로로 정렬되게 한다.
        "inline-flex min-w-[52px] shrink-0 items-center justify-center",
        "rounded-[3px] border px-1.5 py-0.5",
        "font-mono text-[10px] font-bold tracking-wide",
        STYLES[method],
        className,
      )}
    >
      {method}
    </span>
  );
}

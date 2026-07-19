import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HTTP_METHOD } from "@/lib/constants";

// 뱃지 공통 형태. min-w 로 폭을 맞춰 목록에서 경로가 세로로 정렬되게 한다.
const BASE =
  "inline-flex min-w-[52px] shrink-0 items-center justify-center " +
  "rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide";

// 라이트는 솔리드(색 배경 + 흰 글자), 다크는 색 글자 + 같은 색 15% 배경.
// 컴포넌트에 분기가 없다 — CSS 변수가 .dark 에서 값만 바뀐다.
const STYLES: Record<HTTP_METHOD, string> = {
  get: "text-get-fg bg-get-bg",
  post: "text-post-fg bg-post-bg",
  put: "text-put-fg bg-put-bg",
  patch: "text-patch-fg bg-patch-bg",
  delete: "text-delete-fg bg-delete-bg",
};

export function MethodBadge({
  method,
  className,
}: {
  method: HTTP_METHOD;
  className?: string;
}) {
  return <span className={cn(BASE, STYLES[method], className)}>{method}</span>;
}

// FallbackBadge — 5종 밖 메서드용 무채색 뱃지
//
// OAS 는 head·options·trace 도 허용한다. 색을 배정하지 않고 회색으로 둔다 —
// 관례가 없는 메서드에 임의 색을 주면 5종의 색 규칙이 흐려진다.
export function FallbackBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(BASE, "bg-surface-3 text-fg-2", className)}>
      {children}
    </span>
  );
}

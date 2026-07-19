import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// SpecUpdateBanner — 스펙 스냅샷 불일치 알림
//
// 엔드포인트 상세 응답의 snapshotId 가 프로젝트 진입 때 캐시한 값보다 높으면
// Owner 가 그 사이 스펙을 커밋한 것이다.
//
// 조용히 교체하지 않는다. 보고 있던 내용이 예고 없이 바뀌면 댓글 맥락이 어긋나고,
// 사용자는 무엇이 달라졌는지 알 수 없다. 갱신 시점은 사용자가 정한다.
// WebSocket 실시간 푸시는 스코프 밖이다.
export function SpecUpdateBanner({
  onRefresh,
  onDismiss,
}: {
  onRefresh: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-surface-3 px-4 py-2.5"
    >
      <RefreshCw className="size-4 shrink-0 text-fg-2" aria-hidden="true" />

      <p className="min-w-0 flex-1 text-sm text-fg-1">
        스펙이 업데이트되었습니다. 지금 보고 있는 내용은 이전 버전입니다.
      </p>

      <Button onClick={onRefresh} className="h-8 shrink-0 px-3 text-xs">
        새로고침
      </Button>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="알림 닫기"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-3 hover:bg-hover-icon hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

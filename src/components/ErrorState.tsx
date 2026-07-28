// components/ErrorState.tsx
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";

// 조회 실패 표시. 재시도는 있을 때만 버튼을 그린다 —
// 404(없거나 권한 없음)는 다시 눌러도 같은 답이라 버튼을 조건에 맞춰 그린다.
export function ErrorState({
  error,
  fallback = "불러오지 못했습니다.",
  onRetry,
}: {
  error: unknown;
  fallback?: string;
  onRetry?: () => void;
}) {
  const message = error instanceof ApiError ? error.message : fallback;

  return (
    <div className="flex flex-col items-center gap-4 pt-16">
      <p className="text-sm text-fg-3">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}

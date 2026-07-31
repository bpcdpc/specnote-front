import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";

// 조회 실패 표시.
//
// 404 는 서버 문구를 쓰지 않는다. MembershipGuard 가 거부 단계에 따라 다른 문구를
// 내는데(리소스 없음 / 비멤버) 구분할 수 없고, 어느 쪽도 화면에 띄울 말이 아니다.
// 그래서 fallback 으로 대체하고, 다시 눌러도 답이 같으므로 재시도 버튼도 감춘다.
// 호출부가 onRetry 를 넘겨도 404 면 그리지 않는다.
export function ErrorState({
  error,
  fallback = "불러오지 못했습니다.",
  onRetry,
}: {
  error: unknown;
  fallback?: string;
  onRetry?: () => void;
}) {
  const isNotFound = error instanceof ApiError && error.status === 404;
  const message =
    error instanceof ApiError && !isNotFound ? error.message : fallback;
  const canRetry = onRetry !== undefined && !isNotFound;

  return (
    <div className="flex flex-col items-center gap-4 pt-16">
      <p className="text-sm text-fg-3">{message}</p>
      {canRetry && (
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}

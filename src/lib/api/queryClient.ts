import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client";

// TanStack Query 전역 설정
//
// 재시도 — 4xx 는 다시 물어도 같은 답이 온다(권한 없음, 검증 실패).
// 5xx 와 네트워크 오류만 한 번 더 시도한다.
//
// refetchOnWindowFocus 는 끈다. 켜면 팀원의 새 댓글을 자동으로 물어오지만,
// 화면을 오갈 때마다 목록이 흔들려 시연 중 예측이 어렵다.
// 협업 도구라 나중에 켜볼 수는 있다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < 1;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

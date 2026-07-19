import { useCallback, useSyncExternalStore } from "react";

// useMediaQuery — CSS 미디어 쿼리 일치 여부를 구독한다.
//
// useSyncExternalStore 를 쓰는 이유: useState + useEffect 조합은 첫 렌더가 항상
// false 로 시작해 한 프레임 깜빡인다. 이 훅의 결과로 레이아웃 전체가 갈리므로
// 초기값이 정확해야 한다.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
  );
}

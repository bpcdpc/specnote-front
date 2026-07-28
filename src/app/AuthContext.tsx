import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { login as requestLogin, getMe } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/api/client";
import type { PublicUser } from "@/lib/types";

// AuthContext — 로그인 유저 + JWT
//
// ── 상태 ──
//   token — localStorage 가 진짜 저장소지만 state 로도 든다.
//           localStorage 변경은 리렌더를 일으키지 않기 때문이다.
//           첫 렌더에 한 번만 읽고(lazy initializer), 이후로는 login/logout 이 저장소와 state 를 항상 같이 갱신한다. 다시 읽을 일이 없다.
//   me    — 서버 데이터라 state 로 들지 않는다. TanStack Query 가 캐시한다.
//           enabled 로 토큰이 있을 때만 요청을 내보낸다 — 없는데 부르면 무의미한 401 이 쌓인다.
//
// ── 화면 이동을 하지 않는다 ──
//   AuthProvider 가 RouterProvider 바깥이라 useNavigate 를 못 쓴다.
//   로그인 후 이동은 LoginPage 가, 미인증 리다이렉트는 RequireAuth 가 맡는다.
//
// ── 에러를 삼키지 않는다 ──
//   login 은 ApiError 를 그대로 통과시킨다.
//   401 문구를 화면에 띄우는 것은 호출부 담당.

type AuthContextValue = {
  me: PublicUser | null;
  // 토큰은 있는데 me 를 아직 못 받은 상태. RequireAuth 가 이걸 안 보면
  // 새로고침할 때마다 로그인 화면이 한 번 깜빡인다.
  isLoading: boolean;
  login: (body: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());

  const { data, isPending, isError } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: Boolean(token),
  });

  // 토큰이 죽으면 getMe 가 401 을 낸다.
  // queryClient 의 4xx 규칙이 재시도를 막아주므로 여기서 한 번만 정리하면 된다.
  // 안 비우면 "토큰은 있는데 me 는 없음" 상태에 갇힌다.
  useEffect(() => {
    if (isError) {
      tokenStorage.clear();
      setToken(null);
    }
  }, [isError]);

  // 토큰을 기준으로 판단한다. 세션 중간에 토큰이 만료되면 refetch 가 실패해도
  // data 에는 직전 성공값이 남아 있어서, 그것만 보면 로그아웃이 안 된 것처럼 보인다.
  const me = token ? (data ?? null) : null;

  // enabled 가 false 면 isPending 은 true 로 남는다. 토큰 여부로 한 번 막는다.
  const isLoading = Boolean(token) && isPending;

  const login = async (body: { email: string; password: string }) => {
    const { access_token } = await requestLogin(body);
    tokenStorage.set(access_token);
    setToken(access_token);
    // enabled 가 참이 되면서 ["me"] 쿼리가 저절로 돈다. refetch 를 부르지 않는다.
  };

  const logout = () => {
    tokenStorage.clear();
    setToken(null);
    // 다른 계정으로 다시 로그인했을 때 앞 사람의 프로젝트 목록이 캐시에서 잠깐 비치는 것을 막는다.
    queryClient.clear();
    // 백엔드 호출은 없다. JWT 라 서버가 할 일이 없다.
  };

  return (
    <AuthContext.Provider value={{ me, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 는 AuthProvider 안에서만 쓴다.");
  return ctx;
}

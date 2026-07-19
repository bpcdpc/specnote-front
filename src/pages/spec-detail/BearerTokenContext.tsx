import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// BearerTokenContext — Try it out 요청에 실을 전역 Bearer 토큰
//
// 저장소에 두지 않는다. 새로고침하면 사라지는 게 Swagger UI 기본 동작이고,
// SpecNote 는 대상 API 와 무관한 제3 서비스라 남의 API 토큰을 보관할 근거가 약하다.
// XSS 가 한 번 나면 팀원 전원의 토큰이 털린다.
//
// Provider 는 SpecLayout 에 있다. <Outlet> 위라 엔드포인트를 옮겨다녀도 유지된다 —
// 실제로 필요한 지속성은 그것뿐이다.
//
// 지원 범위는 http bearer 뿐이다(UC-4). oauth2 등은 11-8 에서 미지원 안내를 띄운다.
type BearerTokenValue = {
  token: string;
  setToken: (token: string) => void;
};

const BearerTokenContext = createContext<BearerTokenValue | null>(null);

export function BearerTokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");

  return (
    <BearerTokenContext.Provider value={{ token, setToken }}>
      {children}
    </BearerTokenContext.Provider>
  );
}

export function useBearerToken() {
  const ctx = useContext(BearerTokenContext);
  if (!ctx) {
    throw new Error("useBearerToken 은 BearerTokenProvider 안에서만 쓴다.");
  }
  return ctx;
}

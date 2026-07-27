// API 클라이언트 — fetch 래퍼
//
// 1. 경로는 항상 상대경로 /api 다.
//    배포는 NestJS 한 대가 프론트 정적 파일까지 서빙하므로 오리진이 같고,
//    dev 는 Vite 프록시가 백엔드로 넘긴다.
//    환경변수 분기가 필요 없다.
// 2. 에러는 ApiError 하나로 통일한다. 백엔드가 HttpException 서브클래스만 던지므로 응답 형태가 { statusCode, code?, message, error } 로 일정하다.
// 3. 토큰은 요청할 때마다 읽는다. 모듈 로드 시점에 읽으면 로그인 직후 갱신이 반영되지 않는다.

const BASE = "/api";
const TOKEN_KEY = "specnote.token";

export class ApiError extends Error {
  readonly status: number;
  // 백엔드가 code 를 주는 경우에만 채워진다(스펙 로드 실패 등).
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// AuthContext 와 client 가 같은 키를 봐야 하므로 여기서 한 번만 정의한다.
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type Method = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(
  path: string,
  method: Method = "GET",
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // 네트워크 단절, 서버 다운. status 가 없어 0 으로 표시한다.
    throw new ApiError(0, "서버에 연결할 수 없습니다.");
  }

  if (!res.ok) throw await toApiError(res);

  // 본문 없는 응답(204, moveComments 의 void 등)은 undefined 를 돌려준다.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function toApiError(res: Response): Promise<ApiError> {
  let message = `요청에 실패했습니다. (${res.status})`;
  let code: string | undefined;

  try {
    const body = await res.json();
    // class-validator 는 message 를 배열로 준다. 줄바꿈으로 잇는다.
    if (Array.isArray(body?.message)) message = body.message.join("\n");
    else if (typeof body?.message === "string") message = body.message;
    if (typeof body?.code === "string") code = body.code;
  } catch {
    // JSON 이 아니거나 비어 있다. 기본 문구를 쓴다.
  }

  return new ApiError(res.status, message, code);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string) => request<T>(path, "DELETE"),
};

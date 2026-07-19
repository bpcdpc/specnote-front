export type ROLE = "OWNER" | "MEMBER";

export const REACTION_TYPES = ["DONE", "CHECKING", "BEST", "ACK"] as const;
export type REACTION_TYPE = (typeof REACTION_TYPES)[number];

export type NOTIFICATION_TYPE = "INVITED" | "MENTIONED";

export const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
export type HTTP_METHOD = (typeof HTTP_METHODS)[number];

// method 는 백엔드가 string 으로 준다. OAS 는 head·options·trace 도 허용하므로
// 렌더 직전에 이 가드로 좁히고, 벗어난 값은 호출부가 폴백한다.
export function isHttpMethod(method: string): method is HTTP_METHOD {
  return (HTTP_METHODS as readonly string[]).includes(method);
}

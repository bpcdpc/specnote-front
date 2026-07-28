import { ApiError } from "@/lib/api/client";
// 스펙 로딩 실패 코드 → 안내 문구
//
// createProject 와 commitSpec 이 같은 코드를 낸다.
// 두 화면이 같은 문구를 쓰므로 여기에 둔다.
// 백엔드의 throwSpecError 메소드에서 정의된 코드와 에러 메세지.
const SPEC_ERROR: Record<string, string> = {
  INVALID_SPEC: "OpenAPI 스펙 형식이 올바르지 않습니다.",
  UNSUPPORTED_VERSION:
    "지원하지 않는 버전입니다. OpenAPI 3.0 또는 3.1만 됩니다.",
  SPEC_LOAD_ERROR: "스펙을 불러오지 못했습니다. URL 을 확인해주세요.",
};

export function specErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  return (error.code && SPEC_ERROR[error.code]) ?? error.message;
}

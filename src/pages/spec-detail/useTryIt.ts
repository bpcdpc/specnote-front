import { useCallback, useState } from "react";
import { buildExample } from "./buildExample";
import type { SpecCache } from "./useSpecCache";

// 요청 바디를 가질 수 있고, 실제 데이터를 바꾸는 메서드(FR-4.5).
const MUTATING = new Set(["post", "put", "patch", "delete"]);

export function isMutating(method: string): boolean {
  return MUTATING.has(method.toLowerCase());
}

export type MediaKind = "json" | "text" | "form" | "unsupported";

export function mediaKind(mediaType: string): MediaKind {
  if (mediaType.includes("json")) return "json";
  if (mediaType === "application/x-www-form-urlencoded") return "form";
  if (mediaType.startsWith("text/")) return "text";
  // multipart(파일 업로드)는 스코프 밖이다.
  return "unsupported";
}

export type TryItResponse = {
  status: number;
  statusText: string;
  durationMs: number;
  headers: [string, string][];
  body: string;
};

export type TryItError = {
  message: string;
  // 상태 코드 없는 실패. 브라우저가 CORS 실패를 네트워크 오류와 구분해주지 않는다(FR-4.7).
  maybeCors: boolean;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// 파라미터 초기값 — 스펙의 example 을 그대로 쓴다(UC-4).
function initialParamValues(
  parameters: Record<string, unknown>[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const param of parameters) {
    const name = String(param.name ?? "");
    if (!name) continue;

    const schema = isObject(param.schema) ? param.schema : {};
    const value =
      "example" in schema
        ? schema.example
        : Array.isArray(schema.enum)
          ? schema.enum[0]
          : "";

    out[name] = value === undefined || value === null ? "" : String(value);
  }
  return out;
}

// 요청 바디 초기값 — 스키마에서 조립한 example 을 문자열로 넣는다.
function initialBody(
  content: unknown,
  mediaType: string | null,
  cache: SpecCache,
): string {
  if (!mediaType || !isObject(content)) return "";
  const media = content[mediaType];
  if (!isObject(media)) return "";

  if (mediaKind(mediaType) !== "json") return "";

  const example =
    "example" in media ? media.example : buildExample(media.schema, cache);

  return example === undefined ? "" : JSON.stringify(example, null, 2);
}

// baseUrl 과 path 를 잇는다. 양쪽 슬래시 중복을 없앤다.
function joinUrl(baseUrl: string, path: string): string {
  return baseUrl.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

type UseTryItArgs = {
  method: string;
  path: string;
  parameters: Record<string, unknown>[];
  requestBodyContent: unknown;
  baseUrl: string | null;
  token: string;
  needsAuth: boolean;
  cache: SpecCache;
};

// useTryIt — Try it out 입력 상태와 실제 전송
//
// 상태는 엔드포인트마다 초기화돼야 한다. useEffect 로 되돌리지 않고
// 호출부가 key 로 리마운트시킨다 — 되돌릴 항목을 빠뜨릴 여지가 없다.
export function useTryIt({
  method,
  path,
  parameters,
  requestBodyContent,
  baseUrl,
  token,
  needsAuth,
  cache,
}: UseTryItArgs) {
  const mediaTypes = isObject(requestBodyContent)
    ? Object.keys(requestBodyContent)
    : [];
  const [mediaType, setMediaType] = useState<string | null>(
    mediaTypes[0] ?? null,
  );

  const [paramValues, setParamValues] = useState(() =>
    initialParamValues(parameters),
  );
  const [body, setBody] = useState(() =>
    initialBody(requestBodyContent, mediaTypes[0] ?? null, cache),
  );
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TryItResponse | null>(null);
  const [error, setError] = useState<TryItError | null>(null);

  const setParam = useCallback((name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 미디어 타입을 바꾸면 바디 초기값도 따라 바뀐다.
  const changeMediaType = useCallback(
    (next: string) => {
      setMediaType(next);
      setBody(initialBody(requestBodyContent, next, cache));
    },
    [requestBodyContent, cache],
  );

  const execute = useCallback(async () => {
    if (!baseUrl) return;

    setLoading(true);
    setResponse(null);
    setError(null);

    // path 파라미터를 경로에 박는다.
    let resolvedPath = path;
    const query = new URLSearchParams();
    const headers: Record<string, string> = {};

    for (const param of parameters) {
      const name = String(param.name ?? "");
      const value = paramValues[name];
      if (!name || !value) continue;

      if (param.in === "path") {
        resolvedPath = resolvedPath.replace(
          `{${name}}`,
          encodeURIComponent(value),
        );
      } else if (param.in === "query") {
        query.set(name, value);
      } else if (param.in === "header") {
        headers[name] = value;
      }
      // cookie 파라미터는 브라우저가 스크립트로 못 붙인다. 무시한다.
    }

    if (needsAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const hasBody = mediaType !== null && body.length > 0;
    if (hasBody) headers["Content-Type"] = mediaType;

    const url =
      joinUrl(baseUrl, resolvedPath) + (query.toString() ? `?${query}` : "");

    // HTTP 헤더 값은 latin-1(ISO-8859-1)만 허용한다. 한글 등이 섞이면
    // fetch 가 요청을 만들기도 전에 던진다 — CORS 와 무관한 입력 오류다.
    const badHeader = Object.entries(headers).find(
      ([, value]) => !/^[\u0000-\u00ff]*$/.test(value),
    );
    if (badHeader) {
      setError({
        message: `헤더 "${badHeader[0]}" 값에 사용할 수 없는 문자가 있습니다. HTTP 헤더에는 ASCII 문자만 쓸 수 있습니다.`,
        maybeCors: false,
      });
      setLoading(false);
      return;
    }

    const started = performance.now();

    try {
      const res = await fetch(url, {
        method: method.toUpperCase(),
        headers,
        body: hasBody ? body : undefined,
      });

      const text = await res.text();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(performance.now() - started),
        // CORS 가 노출을 허용한 헤더만 읽힌다. 서버가 보낸 전부가 아니다.
        headers: [...res.headers.entries()],
        body: text,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // fetch 는 CORS 차단과 네트워크 오류를 모두 TypeError 로 던지고 둘을 구분해주지 않는다.
      // 다만 요청을 만들지도 못한 경우(잘못된 URL·헤더 값)는 CORS 와 무관하다.
      const beforeSend =
        message.includes("RequestInit") || message.includes("Invalid URL");
      setError({ message, maybeCors: !beforeSend });
    } finally {
      setLoading(false);
    }
  }, [
    baseUrl,
    path,
    parameters,
    paramValues,
    needsAuth,
    token,
    mediaType,
    body,
    method,
  ]);

  return {
    mediaTypes,
    mediaType,
    changeMediaType,
    paramValues,
    setParam,
    body,
    setBody,
    confirmed,
    setConfirmed,
    loading,
    response,
    error,
    execute,
  };
}

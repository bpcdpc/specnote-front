import { useMemo } from "react";

// 스키마 노드. OAS 스키마는 형태가 자유로워 좁은 타입을 만들 이득이 없다.
// 실제 좁히기는 SchemaTree 가 렌더 직전에 한다.
export type SchemaNode = Record<string, unknown>;

export type ResolveResult =
  // 해석 성공. refName 은 $ref 를 따라온 경우에만 채워진다(표시·순환 추적용).
  | { status: "ok"; schema: SchemaNode; refName: string | null }
  // 가리키는 대상이 components 에 없다. 이 칸만 깨지고 나머지는 렌더돼야 한다.
  | { status: "missing"; ref: string }
  // $ref 가 $ref 를 물고 도는 경우. 구조적 순환과는 다르다.
  | { status: "ref-loop"; ref: string };

// JSON Pointer 토큰 디코드. ~1 = "/", ~0 = "~" (RFC 6901).
// 순서가 중요하다 — ~01 이 "~1" 로 풀려야 하므로 ~1 을 먼저 처리한다.
function decodeToken(token: string): string {
  return decodeURIComponent(token).replace(/~1/g, "/").replace(/~0/g, "~");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 문서 루트에서 포인터를 따라 내려간다. 없으면 undefined.
function walk(root: unknown, pointer: string): unknown {
  // "#/components/schemas/Foo" → ["components", "schemas", "Foo"]
  const parts = pointer.slice(2).split("/").map(decodeToken);

  let node: unknown = root;
  for (const part of parts) {
    if (!isObject(node)) return undefined;
    node = node[part];
    if (node === undefined) return undefined;
  }
  return node;
}

// createSpecCache — 훅 밖에서도 쓸 수 있게 순수 함수로 분리한다.
export function createSpecCache(components: unknown) {
  // 포인터가 "#/components/..." 로 시작하므로 components 를 문서 루트 아래에 놓는다.
  // 백엔드는 components 만 주지 components 를 감싼 문서를 주지 않는다.
  const root = { components };

  // 해석 결과 캐시.
  //
  // 성능보다 참조 안정성이 목적이다. 같은 $ref 에 항상 같은 객체를 돌려줘야
  // SchemaTree 의 memo 가 먹는다. 매번 새 객체를 만들면 재귀 트리 전체가 다시 그려진다.
  const cache = new Map<string, ResolveResult>();

  // 노드 하나를 해석한다. $ref 가 없으면 그대로 돌려준다.
  //
  // OAS 3.1 은 $ref 옆에 다른 키워드를 둘 수 있고(JSON Schema 2020-12),
  // 3.0 은 무시한다. 형제 키를 해석 결과 위에 덮어써 3.1 을 따르되,
  // 3.0 스펙에는 형제가 없어야 정상이라 실질 차이가 없다.
  function resolve(node: unknown): ResolveResult {
    if (!isObject(node)) {
      return { status: "ok", schema: {}, refName: null };
    }

    const ref = node.$ref;
    if (typeof ref !== "string") {
      return { status: "ok", schema: node, refName: null };
    }

    const cached = cache.get(ref);
    if (cached) return cached;

    const result = follow(ref);

    // 형제 키가 있으면 덮어쓴다. $ref 자체는 결과에서 뺀다.
    let final = result;
    if (result.status === "ok") {
      const { $ref: _drop, ...siblings } = node;
      if (Object.keys(siblings).length > 0) {
        // 형제가 붙은 노드는 캐시하지 않는다 — 같은 $ref 라도 형제가 다를 수 있다.
        return {
          status: "ok",
          schema: { ...result.schema, ...siblings },
          refName: result.refName,
        };
      }
    }

    cache.set(ref, final);
    return final;
  }

  // $ref 체인을 끝까지 따라간다. A → B → A 를 seen 으로 막는다.
  function follow(startRef: string): ResolveResult {
    const seen = new Set<string>();
    let current = startRef;

    // 체인이 아무리 길어도 seen 이 자라므로 무한 루프가 안 난다.
    for (;;) {
      if (seen.has(current)) {
        return { status: "ref-loop", ref: current };
      }
      seen.add(current);

      // 외부 파일 참조는 지원하지 않는다. 백엔드가 단일 문서만 저장한다.
      if (!current.startsWith("#/")) {
        return { status: "missing", ref: current };
      }

      const found = walk(root, current);
      if (!isObject(found)) {
        return { status: "missing", ref: current };
      }

      const next = found.$ref;
      if (typeof next === "string") {
        current = next;
        continue;
      }

      return {
        status: "ok",
        schema: found,
        // 포인터 마지막 조각. "#/components/schemas/TimeTableDto" → "TimeTableDto"
        refName: decodeToken(current.slice(current.lastIndexOf("/") + 1)),
      };
    }
  }

  return { resolve };
}

export type SpecCache = ReturnType<typeof createSpecCache>;

// useSpecCache — components 를 받아 $ref 를 지연 해석한다.
//
// components 는 프로젝트 진입 시 1회 통째로 받아 캐시한다.
// dereference 된 스펙을 받지 않으므로 $ref 는 렌더 시점에 여기서 푼다.
//
// 구조적 순환(CategoryNodeDto.children → 자기 자신)은 여기서 못 막는다.
// 조상 체인에 이미 있느냐에 달렸고 그건 렌더 경로가 아는 정보다 — SchemaTree 가 맡는다.
export function useSpecCache(components: unknown): SpecCache {
  return useMemo(() => createSpecCache(components), [components]);
}

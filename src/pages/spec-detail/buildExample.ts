import type { SpecCache, SchemaNode } from "./useSpecCache";

// buildExample — 스키마를 걸어 예시 JSON 을 조립한다.
//
// 스펙에 완성된 example 객체가 있는 경우는 드물다. 속성마다 흩어진 example 을
// 모아 하나로 만드는 게 Swagger UI 와 같은 방식이다.
//
// 요청 바디에만 쓴다. 응답은 스펙에 있는 example 만 표시하고 조립하지 않는다 —
// 만들어낸 값이 실제 응답처럼 보이면 오해를 부른다.

const EMPTY: ReadonlySet<string> = new Set();

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// 타입만 있고 example 이 없을 때의 폴백. Swagger UI 와 같은 값을 쓴다.
function fallbackFor(schema: SchemaNode): unknown {
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (type) {
    case "string":
      return typeof schema.format === "string" ? schema.format : "string";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return true;
    case "null":
      return null;
    default:
      return null;
  }
}

export function buildExample(
  node: unknown,
  cache: SpecCache,
  ancestors: ReadonlySet<string> = EMPTY,
): unknown {
  const result = cache.resolve(node);
  if (result.status !== "ok") return null;

  const { schema, refName } = result;

  // 스펙이 준 example 이 있으면 그대로 쓴다. 조립보다 항상 우선한다.
  if ("example" in schema) return schema.example;

  // 순환 — 같은 스키마가 조상에 이미 있으면 더 내려가지 않는다.
  if (refName && ancestors.has(refName)) return null;
  const nextAncestors = refName ? new Set([...ancestors, refName]) : ancestors;

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  if (type === "array") {
    return [buildExample(schema.items, cache, nextAncestors)];
  }

  if (type === "object" || isObject(schema.properties)) {
    const props = isObject(schema.properties) ? schema.properties : {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      out[key] = buildExample(value, cache, nextAncestors);
    }
    return out;
  }

  return fallbackFor(schema);
}

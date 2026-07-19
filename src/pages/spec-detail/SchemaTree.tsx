import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SchemaNode, SpecCache } from "./useSpecCache";

const EMPTY: ReadonlySet<string> = new Set();

// 이 깊이 미만은 펼친 채로 시작한다. 전부 펼치면 중첩이 깊은 스펙에서 화면이 길어지고,
// 전부 접으면 클릭이 많아진다.
const OPEN_DEPTH = 2;

type SchemaTreeProps = {
  schema: unknown;
  cache: SpecCache;
  // 속성 이름. 루트는 없다.
  name?: string;
  required?: boolean;
  depth?: number;
  // 조상 체인의 refName 집합. 구조적 순환을 여기서 끊는다.
  ancestors?: ReadonlySet<string>;
  // 루트는 자기 행을 그리지 않고 자식 목록만 낸다.
  root?: boolean;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// SchemaTree — 스키마 재귀 렌더
//
// 1. 순환은 여기서 막는다. 캐시는 $ref 문자열만 풀 뿐 렌더 경로를 모르므로
//    "조상에 같은 스키마가 있는가"는 이 컴포넌트만 판단할 수 있다.
// 2. 배열은 items 를 한 단계로 세지 않는다. `timeTables: TimeTableDto[]` 한 행 아래
//    바로 속성이 오게 해서 불필요한 중간 노드를 없앤다.
// 3. allOf/oneOf/anyOf 는 다루지 않는다(목 스펙에 없음). 만나면 잎으로 떨어진다.
//    TODO: 실제 스펙에서 만나면 분기 렌더 추가.
export function SchemaTree({
  schema,
  cache,
  name,
  required,
  depth = 0,
  ancestors = EMPTY,
  root = false,
}: SchemaTreeProps) {
  const [open, setOpen] = useState(depth < OPEN_DEPTH);

  const result = cache.resolve(schema);

  if (result.status !== "ok") {
    return (
      <Row depth={depth} name={name} required={required}>
        <span className="text-xs text-destructive">
          {result.status === "missing"
            ? `참조를 찾을 수 없음: ${result.ref}`
            : `참조가 순환함: ${result.ref}`}
        </span>
      </Row>
    );
  }

  const node = result.schema;
  const type = Array.isArray(node.type) ? node.type.join(" | ") : node.type;
  const isArray = type === "array";

  // 배열이면 items 를 풀어 그 내용을 이 행의 실체로 삼는다.
  const itemResult = isArray ? cache.resolve(node.items) : null;
  const target: SchemaNode =
    itemResult?.status === "ok" ? itemResult.schema : node;
  const targetRef =
    itemResult?.status === "ok" ? itemResult.refName : result.refName;

  // 표시용 타입 — 배열은 요소 타입에 [] 를 붙인다.
  const label = buildLabel(node, target, targetRef, isArray);

  // 순환 — 조상에 이미 있으면 펼치지 않는다.
  const isCycle = targetRef !== null && ancestors.has(targetRef);
  const nextAncestors = targetRef
    ? new Set([...ancestors, targetRef])
    : ancestors;

  const props = isObject(target.properties) ? target.properties : null;
  const requiredKeys = new Set(
    Array.isArray(target.required) ? (target.required as string[]) : [],
  );
  const hasChildren = props !== null && Object.keys(props).length > 0;

  const children =
    hasChildren && !isCycle ? (
      <ul className={cn(root ? "" : "border-l border-border")}>
        {Object.entries(props).map(([key, value]) => (
          <li key={key}>
            <SchemaTree
              schema={value}
              cache={cache}
              name={key}
              required={requiredKeys.has(key)}
              depth={depth + 1}
              ancestors={nextAncestors}
            />
          </li>
        ))}
      </ul>
    ) : null;

  // 루트는 행 없이 자식만 낸다. 최상위 스키마 자체를 한 줄로 요약할 필요가 없다.
  if (root) {
    return children ?? <p className="text-xs text-fg-3">속성이 없습니다</p>;
  }

  return (
    <div>
      <Row
        depth={depth}
        name={name}
        required={required}
        toggle={
          hasChildren && !isCycle
            ? { open, onToggle: () => setOpen((v) => !v) }
            : undefined
        }
      >
        <span className="font-mono text-xs text-fg-3">{label}</span>

        {isCycle && (
          <span className="rounded-sm bg-surface-3 px-1.5 py-0.5 text-[10px] text-fg-3">
            순환 참조
          </span>
        )}

        {Array.isArray(target.enum) && (
          <span className="font-mono text-xs text-accent-strong">
            {(target.enum as unknown[]).join(" | ")}
          </span>
        )}

        {typeof target.description === "string" && target.description && (
          <span className="text-xs text-fg-3">{target.description}</span>
        )}
      </Row>

      {open && children}
    </div>
  );
}

// 타입 라벨. 이름 있는 스키마는 이름을, 없으면 원시 타입을 쓴다.
function buildLabel(
  node: SchemaNode,
  target: SchemaNode,
  targetRef: string | null,
  isArray: boolean,
): string {
  const base =
    targetRef ??
    (Array.isArray(target.type)
      ? target.type.join(" | ")
      : String(target.type ?? "object"));

  const format = typeof target.format === "string" ? `<${target.format}>` : "";

  return isArray ? `${base}${format}[]` : `${base}${format}`;
}

function Row({
  depth,
  name,
  required,
  toggle,
  children,
}: {
  depth: number;
  name?: string;
  required?: boolean;
  toggle?: { open: boolean; onToggle: () => void };
  children: React.ReactNode;
}) {
  const content = (
    <>
      {toggle ? (
        toggle.open ? (
          <ChevronDown
            className="size-3.5 shrink-0 text-fg-3"
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            className="size-3.5 shrink-0 text-fg-3"
            aria-hidden="true"
          />
        )
      ) : (
        <span className="size-3.5 shrink-0" aria-hidden="true" />
      )}

      {name && (
        <span className="font-mono text-xs text-fg-1">
          {name}
          {required && (
            <span className="ml-0.5 text-destructive" title="필수">
              *
            </span>
          )}
        </span>
      )}

      {children}
    </>
  );

  const className =
    "flex w-full items-center gap-2 rounded-md py-1.5 pl-2 pr-2 text-left";

  if (!toggle) {
    return <div className={cn(className, depth > 0 && "ml-1")}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={toggle.onToggle}
      aria-expanded={toggle.open}
      className={cn(
        className,
        depth > 0 && "ml-1",
        "hover:bg-hover-ghost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {content}
    </button>
  );
}

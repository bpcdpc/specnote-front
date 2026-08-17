import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EndpointListItem } from "./EndpointListItem";
import { PANEL } from "./panelMetrics";
import type { SpecOperation } from "@/lib/types";

// 태그가 없는 엔드포인트의 그룹명. OAS 는 태그 없는 operation 을 정상으로 규정하므로
// 예외 취급하지 않고 그룹 하나로 묶어 맨 아래에 둔다.
const NO_TAG = "Tag 없음";

type Group = { tag: string; endpoints: SpecOperation[] };

// 태그별로 묶는다.
//
// 1. 그룹 순서는 태그가 처음 등장한 순서다. 백엔드가 태그 정렬 정보를 주지 않고,
//    엔드포인트 배열이 스펙 원본 순서를 따르므로 이게 스펙 작성자의 의도에 가장 가깝다.
// 2. 한 엔드포인트에 태그가 여럿이면 각 그룹에 모두 나타난다. OAS 의미가 그렇고
//    Swagger UI 도 같게 동작한다.
function groupByTag(endpoints: SpecOperation[]): Group[] {
  const map = new Map<string, SpecOperation[]>();

  for (const endpoint of endpoints) {
    const tags = endpoint.tags.length > 0 ? endpoint.tags : [NO_TAG];
    for (const tag of tags) {
      const bucket = map.get(tag);
      if (bucket) bucket.push(endpoint);
      else map.set(tag, [endpoint]);
    }
  }

  const groups = [...map].map(([tag, list]) => ({ tag, endpoints: list }));
  // "Tag 없음"만 맨 아래로 내린다. 나머지는 등장 순서 유지.
  return groups.sort((a, b) =>
    a.tag === NO_TAG ? 1 : b.tag === NO_TAG ? -1 : 0,
  );
}

// EndpointSidebar — 왼쪽 컬럼
//
// 검색 → 태그 그룹 → 목록. 스크롤은 컬럼(SpecColumns)이 갖는다.
//
// 1. 검색은 path 와 summary 를 대상으로 한다(FR-3.4).
//    summary 는 행에 표시하지 않지만 검색에는 쓴다 — "회원 등록"으로 찾을 수 있어야 한다.
// 2. 검색 중에는 모든 그룹을 펼친다. 접힌 그룹 안의 결과가 안 보이면 검색이 망가진다.
// 3. 삭제된 엔드포인트는 기본 숨김이고 토글로 노출한다(FR-11.1).
//    0건이면 토글 자체를 그리지 않는다.
export function EndpointSidebar({ endpoints }: { endpoints: SpecOperation[] }) {
  const { projectId, endpointId } = useParams();
  const [query, setQuery] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  // 기본은 전부 펼침. 여기 담긴 태그만 접힌다.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isSearching = query.trim().length > 0;
  const deletedCount = useMemo(
    () => endpoints.filter((e) => e.isDeleted).length,
    [endpoints],
  );

  const groups = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const visible = endpoints.filter((e) => {
      if (e.isDeleted && !showDeleted) return false;
      if (!keyword) return true;
      return (
        e.path.toLowerCase().includes(keyword) ||
        (e.summary?.toLowerCase().includes(keyword) ?? false)
      );
    });
    return groupByTag(visible);
  }, [endpoints, query, showDeleted]);

  const toggleGroup = (tag: string) =>
    setCollapsed((prev) => ({ ...prev, [tag]: !prev[tag] }));

  return (
    <div className="flex flex-col gap-1">
      <div className={PANEL.sidebar.stickyTop}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-3"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="엔드포인트 검색"
            aria-label="엔드포인트 검색"
            className="h-9 pl-8 text-xs"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="px-2.5 py-6 text-center text-sm text-fg-3">
          {isSearching ? "검색 결과가 없습니다" : "엔드포인트가 없습니다"}
        </p>
      ) : (
        groups.map(({ tag, endpoints: list }) => {
          // 검색 중에는 접힘 상태를 무시한다.
          const isOpen = isSearching || !collapsed[tag];

          return (
            <section key={tag}>
              <button
                type="button"
                onClick={() => toggleGroup(tag)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center gap-1 rounded-md px-1.5 py-1.5",
                  "text-xs font-medium uppercase tracking-wide text-fg-3",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {isOpen ? (
                  <ChevronDown
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronRight
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="truncate">{tag}</span>
                <span className="shrink-0 font-normal tabular-nums text-fg-3/70">
                  {list.length}
                </span>
              </button>

              {isOpen && (
                <ul className="flex flex-col">
                  {list.map((endpoint) => (
                    <li key={`${tag}-${endpoint.id}`}>
                      <EndpointListItem
                        endpoint={endpoint}
                        to={`/projects/${projectId}/endpoints/${endpoint.id}`}
                        isSelected={String(endpoint.id) === endpointId}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}

      {/* 삭제된 엔드포인트 — 0건이면 그리지 않는다 */}
      {deletedCount > 0 && (
        <button
          type="button"
          onClick={() => setShowDeleted((v) => !v)}
          aria-pressed={showDeleted}
          className={cn(
            "mt-2 rounded-md px-2.5 py-2 text-left text-xs text-fg-3",
            "hover:bg-hover-ghost hover:text-fg-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {showDeleted
            ? "삭제된 엔드포인트 숨기기"
            : `삭제된 엔드포인트 ${deletedCount}개 보기`}
        </button>
      )}
    </div>
  );
}

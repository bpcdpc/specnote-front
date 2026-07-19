import { MethodBadge } from "@/components/MethodBadge";
import type { HTTP_METHOD } from "@/lib/constants";

// SpecDetailPage — 3컬럼 본문 (목)
//
// 헤더는 SpecLayout이 그린다. 여기선 3컬럼만 채운다.
// 왼쪽 엔드포인트 사이드바: 보더 없음(Vercel 스타일). 오른쪽 댓글 패널만 border-l로 분리.
//
// TODO(spec 단계):
//   - 왼쪽: 엔드포인트 목록 useEndpoints(id)
//   - 중앙: 선택된 엔드포인트 상세 · Try it
//   - 오른쪽: 댓글 패널 (react-resizable-panels 로 드래그 리사이즈)
const MOCK_ENDPOINTS: { method: HTTP_METHOD; path: string }[] = [
  { method: "GET", path: "/projects" },
  { method: "POST", path: "/projects" },
  { method: "PUT", path: "/users/{id}" },
  { method: "PATCH", path: "/users/{id}" },
  { method: "DELETE", path: "/posts/{id}" },
];

export function SpecDetailPage() {
  return (
    <div className="min-h-0 flex-1 overflow-x-auto">
      <div className="flex h-full min-w-[900px]">
        {/* 왼쪽 — 고정폭. 엔드포인트 목록 (보더 없음) */}
        <aside className="w-[240px] shrink-0 overflow-y-auto bg-surface-1 p-2 pb-8">
          {MOCK_ENDPOINTS.map((e, i) => (
            <div
              key={i}
              className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-hover-icon"
            >
              <MethodBadge method={e.method} />
              <span className="font-mono text-sm text-fg-2 group-hover:text-fg-1">
                {e.path}
              </span>
            </div>
          ))}
        </aside>

        {/* 중앙 — 남는 폭. 스펙 상세 · Try it */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-8">
          <div className="flex items-center gap-2.5">
            <MethodBadge method="POST" />
            <span className="font-mono text-base text-fg-1">/projects</span>
          </div>
          <p className="mt-3 text-sm text-fg-2">
            중앙 컬럼 — 스펙 상세 · Try it (예정)
          </p>
        </main>

        {/* 오른쪽 — 댓글 패널. 기능 분리를 위해 border-l 유지 */}
        <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-surface-1">
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-sm font-medium text-fg-1">댓글</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-8">
            <p className="text-sm text-fg-3">댓글 목록 (예정)</p>
          </div>
          <div className="border-t border-border p-3">
            <p className="text-sm text-fg-3">댓글 입력 (예정)</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

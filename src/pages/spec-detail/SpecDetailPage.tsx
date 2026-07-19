import { useParams } from "react-router-dom";
import { SpecColumns } from "./SpecColumns";
import { EndpointSidebar } from "./EndpointSidebar";
import { MethodBadge, FallbackBadge } from "@/components/MethodBadge";
import { isHttpMethod } from "@/lib/constants";
import { MOCK_PROJECT_VIEW, getMockEndpointDetail } from "@/lib/mock";
import { ProjectOverview } from "./ProjectOverview";
import { cn } from "@/lib/utils";

// SpecDetailPage — 3컬럼 본문
//
// 선택 상태의 소유자는 URL 이다. 컴포넌트 state 로 들지 않는다 —
// 새로고침과 뒤로가기가 살아야 하고, 13단계 딥링크가 같은 경로를 그대로 쓴다.
//
// TODO(데이터 단계): MOCK_PROJECT_VIEW 를 useProject(projectId),
//   getMockEndpointDetail 을 useEndpoint(endpointId) 로 교체.
// TODO(11-5 이후): detail 자리를 <SpecUpdateBanner /> · <EndpointDetail /> · <TryItPanel /> 로.
export function SpecDetailPage() {
  const { projectId, endpointId } = useParams();
  const projectView = MOCK_PROJECT_VIEW;

  const detail = endpointId ? getMockEndpointDetail(Number(endpointId)) : null;

  return (
    <SpecColumns
      sidebar={<EndpointSidebar endpoints={projectView.endpoints} />}
      detail={
        !endpointId ? (
          <ProjectOverview projectView={projectView} projectId={projectId} />
        ) : (
          renderDetail(detail)
        )
      }
      comments={
        <>
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-sm font-medium text-fg-1">댓글</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-none p-3 pb-8">
            <p className="text-sm text-fg-3">댓글 목록 (예정)</p>
          </div>
          <div className="border-t border-border p-3">
            <p className="text-sm text-fg-3">댓글 입력 (예정)</p>
          </div>
        </>
      }
    />
  );
}

// 중앙 컬럼 3상태 — 미선택 / 없는 엔드포인트 / 선택됨.
//
// 없는 엔드포인트를 404 페이지로 보내지 않는다. 사이드바가 사라져
// 다른 엔드포인트로 갈 방법이 없어진다. 링크가 상해도 복구 경로를 남긴다.
function renderDetail(detail: ReturnType<typeof getMockEndpointDetail>) {
  if (!detail) {
    return (
      <p className="pt-16 text-center text-sm text-fg-3">
        엔드포인트를 찾을 수 없습니다
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {isHttpMethod(detail.method) ? (
          <MethodBadge
            method={detail.method}
            className="min-w-[72px] px-2.5 py-1 text-sm"
          />
        ) : (
          <FallbackBadge className="min-w-[72px] px-2.5 py-1 text-sm">
            {detail.method}
          </FallbackBadge>
        )}
        <h2
          className={cn(
            "font-mono text-2xl text-fg-1",
            detail.isDeleted && "text-fg-3",
          )}
        >
          {detail.path}
        </h2>
        {detail.isDeleted && <span className="text-xs text-fg-3">삭제됨</span>}
      </div>

      {detail.summary && <p className="text-sm text-fg-2">{detail.summary}</p>}

      <p className="pt-4 text-sm text-fg-3">
        parameters, requestBody, responses (11-6 예정)
      </p>
    </div>
  );
}

// import { MethodBadge } from "@/components/MethodBadge";
// import type { HTTP_METHOD } from "@/lib/constants";

// // SpecDetailPage — 3컬럼 본문 (목)
// //
// // 헤더는 SpecLayout이 그린다. 여기선 3컬럼만 채운다.
// // 왼쪽 엔드포인트 사이드바: 보더 없음(Vercel 스타일). 오른쪽 댓글 패널만 border-l로 분리.
// //
// // TODO(spec 단계):
// //   - 왼쪽: 엔드포인트 목록 useEndpoints(id)
// //   - 중앙: 선택된 엔드포인트 상세 · Try it
// //   - 오른쪽: 댓글 패널 (react-resizable-panels 로 드래그 리사이즈)
// const MOCK_ENDPOINTS: { method: HTTP_METHOD; path: string }[] = [
//   { method: "get", path: "/projects" },
//   { method: "post", path: "/projects" },
//   { method: "put", path: "/users/{id}" },
//   { method: "patch", path: "/users/{id}" },
//   { method: "delete", path: "/posts/{id}" },
// ];

// export function SpecDetailPage() {
//   return (
//     <div className="min-h-0 flex-1 overflow-x-auto">
//       <div className="flex h-full min-w-[900px]">
//         {/* 왼쪽 — 고정폭. 엔드포인트 목록 (보더 없음) */}
//         <aside className="w-[240px] shrink-0 overflow-y-auto bg-surface-1 p-2 pb-8">
//           {MOCK_ENDPOINTS.map((e, i) => (
//             <div
//               key={i}
//               className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-hover-icon"
//             >
//               <MethodBadge method={e.method} />
//               <span className="font-mono text-sm text-fg-2 group-hover:text-fg-1">
//                 {e.path}
//               </span>
//             </div>
//           ))}
//         </aside>

//         {/* 중앙 — 남는 폭. 스펙 상세 · Try it */}
//         <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-8">
//           <div className="flex items-center gap-2.5">
//             <MethodBadge method="post" />
//             <span className="font-mono text-base text-fg-1">/projects</span>
//           </div>
//           <p className="mt-3 text-sm text-fg-2">
//             중앙 컬럼 — 스펙 상세 · Try it (예정)
//           </p>
//         </main>

//         {/* 오른쪽 — 댓글 패널. 기능 분리를 위해 border-l 유지 */}
//         <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-surface-1">
//           <div className="border-b border-border px-3 py-2.5">
//             <span className="text-sm font-medium text-fg-1">댓글</span>
//           </div>
//           <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-8">
//             <p className="text-sm text-fg-3">댓글 목록 (예정)</p>
//           </div>
//           <div className="border-t border-border p-3">
//             <p className="text-sm text-fg-3">댓글 입력 (예정)</p>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }

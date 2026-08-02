import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { EndpointSummary, PublicUser } from "@/lib/types";

// 한 번에 하나만 열린다. 답글 에디터가 열린 채로 다른 곳의 수정을 누르면 앞의 것이 닫힌다.
export type EditingState =
  | { mode: "reply"; threadId: number }
  | { mode: "edit"; commentId: number }
  | null;

// 바깥(CommentPanel)이 주는 값.
export type CommentData = {
  me: PublicUser;
  isOwner: boolean;
  members: PublicUser[];
  // 삭제 포함 전체. 이미 달린 멘션은 대상이 삭제돼도 유지되므로(FR-7.4)
  // 렌더가 삭제된 엔드포인트도 찾을 수 있어야 한다.
  endpoints: EndpointSummary[];
};

// 컨텍스트가 제공하는 전체. 바깥이 준 것 + Provider 가 만든 편집 상태와 파생값.
type CommentContextValue = CommentData & {
  // 새로 멘션하거나 댓글을 옮길 수 있는 대상. endpoints 에서 삭제된 것을 뺀 것이다.
  activeEndpoints: EndpointSummary[];
  editing: EditingState;
  setEditing: (next: EditingState) => void;
  highlightedId: number | null;
  setHighlightedId: (id: number | null) => void;
};

const CommentContext = createContext<CommentContextValue | null>(null);

export function CommentProvider({
  me,
  isOwner,
  members,
  endpoints,
  initialHighlightedId = null,
  children,
}: CommentData & {
  // 알림 딥링크로 들어온 댓글. 첫 렌더에만 반영된다 —
  // key={endpointId} 라 엔드포인트가 바뀌면 Provider 째 새로 만들어진다.
  initialHighlightedId?: number | null;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState<EditingState>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(
    initialHighlightedId,
  );

  // 새로 멘션하거나 옮길 수 있는 대상은 살아 있는 엔드포인트뿐이다.
  //
  // endpoints 를 전체로 받고 여기서 좁힌다. 반대로 하면(걸러서 받고 전체를 따로 받으면)
  // 소비처마다 어느 목록을 써야 하는지 매번 판단해야 한다. 이름이 용도를 말하게 둔다.
  const activeEndpoints = useMemo(
    () => endpoints.filter((e) => !e.isDeleted),
    [endpoints],
  );

  return (
    <CommentContext.Provider
      value={{
        me,
        isOwner,
        members,
        endpoints,
        activeEndpoints,
        editing,
        setEditing,
        highlightedId,
        setHighlightedId,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentContext() {
  const ctx = useContext(CommentContext);
  if (!ctx)
    throw new Error("useCommentContext 는 CommentProvider 안에서만 쓴다.");
  return ctx;
}

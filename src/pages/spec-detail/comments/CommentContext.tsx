import { createContext, useContext, useState } from "react";
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
  endpoints: EndpointSummary[];
};

// 컨텍스트가 제공하는 전체. 바깥이 준 것 + Provider 가 만든 편집 상태.
type CommentContextValue = CommentData & {
  editing: EditingState;
  setEditing: (next: EditingState) => void;
  justAddedId: number | null;
  setJustAddedId: (id: number | null) => void;
};

const CommentContext = createContext<CommentContextValue | null>(null);

export function CommentProvider({
  me,
  isOwner,
  members,
  endpoints,
  children,
}: CommentData & { children: ReactNode }) {
  const [editing, setEditing] = useState<EditingState>(null);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  return (
    <CommentContext.Provider
      value={{
        me,
        isOwner,
        members,
        endpoints,
        editing,
        setEditing,
        justAddedId,
        setJustAddedId,
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

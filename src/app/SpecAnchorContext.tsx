import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

// SpecAnchorContext - 프로젝트별로 "지금 보고 있는 스냅샷"
//
// 앵커는 ["spec", projectId, anchor] 쿼리키에 들어간다.
// 그래서 앵커를 바꾸는 것이 곧 스펙 교체다.
// invalidateQueries나 setQueryData 쓸 일이 없어서,
// 조각들이 서로 다른 버전을 볼 일이 구조적으로 없어진다.
//
// 라우터보다 상위에 둔다. 다른 페이지에 갔다와도 버전이 유지되어야 하기 떄문이다.
//
// projectId를 키로 하는 맵인 이유
// 한 사용자가 여러 프로젝트를 오가기 때문에 프로젝트 별로 스냅샷을 묶어줘야 한다.
//
// 인증 정보를 읽지 않는다.
// 이 컨텍스트에 담기는 것은 프로젝트 번호와 버전 번호이고, 스펙 내용 자체는
// 쿼리가 JWT를 달고 받아온다.
// 로그아웃시 비우는 것은 다음 사람에게 앞사람의 캐시가 남지 않게 하려는 것이지, 인증 때문이 아니다.

type SpecAnchorValue = {
  // 없으면 아직 고정되지 않은 상태. SpecLayout이 Meta를 받은 뒤 한번 고정한다.
  anchors: Record<number, number>;
  setAnchor: (projectId: number, snapshotId: number) => void;
  clearAnchors: () => void;
};

const SpecAnchorContext = createContext<SpecAnchorValue | null>(null);

export function SpecAnchorProvider({ children }: { children: ReactNode }) {
  const [anchors, setAnchors] = useState<Record<number, number>>({});

  // 함수형 업데이트를 쓴다. 다른 프로젝트의 앵커를 지우지 않으면서
  // anchors를 의존성에 넣지 않아 참조가 안정된다.
  const setAnchor = useCallback((projectId: number, snapshotId: number) => {
    setAnchors((prev) => ({ ...prev, [projectId]: snapshotId }));
  }, []);

  const clearAnchors = useCallback(() => setAnchors({}), []);

  return (
    <SpecAnchorContext.Provider value={{ anchors, setAnchor, clearAnchors }}>
      {children}
    </SpecAnchorContext.Provider>
  );
}

export function useSpecAnchor() {
  const ctx = useContext(SpecAnchorContext);
  if (!ctx)
    throw new Error(
      "useSpecAnchor는 SpecAnchorProvider 안에서만 쓸 수 있습니다.",
    );
  return ctx;
}

import { REACTION_TYPES } from "@/lib/constants";
import type { REACTION_TYPE } from "@/lib/constants";
import type { ReactionSummary } from "@/lib/types";

// 리액션 표시 정의. 값(REACTION_TYPE)은 백엔드와 공유하지만 표시는 프론트가 정한다.
//
// 이모지를 쓰는 이유 — GitHub, Slack 등 리액션은 이모지가 관습이고,
// 단색 아이콘보다 뜻이 즉각 읽힌다. "색을 아낀다"는 원칙(04-design-tokens)의
// 예외이며, 리액션은 색 자체가 정보를 나르는 자리다.
//
// Record 라 4종을 하나라도 빠뜨리면 컴파일 에러다.
type ReactionMeta = { emoji: string; label: string };

export const REACTION_META: Record<REACTION_TYPE, ReactionMeta> = {
  DONE: { emoji: "✅", label: "처리됨" },
  CHECKING: { emoji: "👀", label: "확인 중" },
  BEST: { emoji: "👍", label: "최고" },
  ACK: { emoji: "👌", label: "알겠음" },
};

// 팝오버 표시 순서. constants 의 배열 순서를 그대로 따른다 —
// 여기서 따로 정하면 값이 늘거나 순서가 바뀔 때 두 곳을 봐야 한다.
export const REACTION_ORDER = REACTION_TYPES;

// 표시 순서를 REACTION_ORDER 로 고정한다.
// 서버는 summarizeReactions 의 Map 삽입 순서, 즉 그 타입이 처음 등장한 순서로 준다.
// 그래서 어떤 타입이 count 0 으로 사라졌다가 다시 생기면 맨 뒤로 밀려 칩 순서가 뒤바뀐다.
// 댓글마다 순서가 제각각인 문제도 같이 없앤다.
//
// sort 는 제자리 정렬이라 복사본을 만든다. reactions 는 Query 캐시 안의 배열이다.
export function sortReactions(reactions: ReactionSummary[]): ReactionSummary[] {
  return [...reactions].sort(
    (a, b) => REACTION_ORDER.indexOf(a.type) - REACTION_ORDER.indexOf(b.type),
  );
}

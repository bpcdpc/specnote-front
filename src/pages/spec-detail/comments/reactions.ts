import { REACTION_TYPES } from "@/lib/constants";
import type { REACTION_TYPE } from "@/lib/constants";

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

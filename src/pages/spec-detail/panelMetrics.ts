// 3컬럼 치수. 이 값을 보는 곳이 넷이다 —
// SpecColumns(Panel prop), SpecPanelsContext(분기 기준),
// SpecLayout(헤더 우측 슬롯 폭), 각 패널(sticky 영역).
// 흩어져 있으면 한쪽만 고쳤을 때 조용히 어긋난다.

// 화면 대부분이 쓰는 기본 가로 여백. 아래 PANEL 의 px-4 와 같은 값이다.
// 숫자와 클래스 두 표현으로 갈라져 있으니 한쪽을 바꾸면 다른 쪽도 같이 봐야 한다.
const INSET = 16;

export const COLUMN = {
  sidebar: { default: 330, min: 240, max: 400 },
  // 중앙 최소폭은 가로 스크롤을 막으려고 둔다.
  // 없으면 양쪽을 최대로 끌었을 때 중앙이 px-14(좌우 112px)보다 좁아져
  // 패딩만으로 폭을 넘기고 Panel 의 overflow 가 가로 스크롤을 띄운다.
  detail: { min: 320 },
  comments: { default: 440, min: 240, max: 600 },
} as const;

// 밀어내기/덮기 분기.
// 폭 계산으로 따로 분기하지 않는다 — 나머지 스타일이 전부 Tailwind lg 로 갈리는데
// JS 만 다른 임계값을 쓰면 그 사이 구간이 사각지대가 된다.
//
// 기준은 기본폭이 아니라 최소폭이다.
// 240 + 320 + 240 + 2(구분선) = 802 라 1024 에서 세 컬럼이 최소폭을 채운다.
// 기본폭으로 잡으면 위 COLUMN 값을 조정할 때마다 임계값을 다시 계산해야 한다.
export const WIDE_QUERY = "(min-width: 1024px)";

export const px = (n: number) => `${n}px`;

// 헤더 우측 슬롯 폭 — 댓글 패널의 "안쪽 내용" 폭과 맞춘다.
//
// 헤더와 패널 모두 px-4 라 오른쪽 끝은 이미 같다(둘 다 화면 우측 16px).
// 패널 폭에서 좌우 패딩을 뺀 값을 헤더 슬롯에 주면 왼쪽 끝도 맞는다.
// 패널 폭(COLUMN.comments.default)을 그대로 주면 32px 어긋난다.
//
// 초기 로딩 기준이다. 사용자가 리사이즈하면 어긋나지만 따라가게 만들 값은 아니다
// (드래그마다 헤더가 리렌더되고 접힘 상태 하한 처리도 붙는다).
export const HEADER_RIGHT_WIDTH = COLUMN.comments.default - INSET * 2;

// 양쪽 날개 여백과 sticky 영역.
//
// sticky 영역은 여백 밖까지 배경을 깔아야 한다. 안 그러면 스크롤되는 내용이
// 좌우 여백 틈으로 비쳐 지나간다. 음수 마진으로 패딩을 되돌리고 안쪽에서 다시 준다.
//
// 왼쪽만 pb-8(앱 푸터 h-8)을 비운다. 푸터가 align="left" 라 텍스트가 화면 왼쪽
// 아래에 있어 오른쪽 패널과는 겹치지 않는다.
export const PANEL = {
  sidebar: {
    padding: "px-4 pt-2 pb-8",
    stickyTop: "sticky top-0 z-10 -mx-4 -mt-2 bg-surface-1 px-4 pt-2 pb-2",
  },
  comments: {
    padding: "px-4 pt-2",
    stickyTop:
      "sticky top-0 z-10 -mx-4 -mt-2 bg-linear-to-b from-70% from-surface-2 to-transparent px-4 pt-2",
    stickyBottom:
      "sticky bottom-0 z-10 -mx-4 bg-linear-to-t from-70% from-surface-2 to-transparent px-4 pb-3 pt-4",
    body: "min-h-0 flex-1 py-2",
  },
  detail: {
    wide: "px-14 pt-2 pb-10",
    narrow: "px-4 pt-4 pb-10",
  },
} as const;

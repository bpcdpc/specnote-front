type FooterProps = {
  align?: "left" | "center";
};

export const FOOTER_HEIGHT = 32; // px — 본문 하단 패딩 계산용

// 화면 하단에 고정된 작은 글씨.
// 배경 없음 · 투명 · pointer-events-none → 아래 요소의 클릭을 막지 않는다.
// 클릭이 통과하므로 링크를 두지 않는다.
export function Footer({ align = "left" }: FooterProps) {
  return (
    <footer
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-60",
        "flex h-8 items-center px-4",
        "text-xs text-fg-3",
        align === "center" ? "justify-center" : "justify-start",
      ].join(" ")}
    >
      <span>SpecNote</span>
    </footer>
  );
}

import { Logo } from "./Logo";

type FooterProps = {
  align?: "center" | "right" | "left";
};

// Footer — 하단 고정, 투명
//
// 배경 없음 · pointer-events-none — 아래 요소의 클릭을 막지 않는다.
// 링크는 두지 않는다(클릭이 통과하므로).
// 본문은 이 높이(약 32px)만큼 pb 를 확보해 콘텐츠가 가리지 않게 한다.
//
// 로고는 장식이므로 as="span" — h1 을 쓰면 페이지에 제목이 둘 생긴다.
export function Footer({ align = "left" }: FooterProps) {
  return (
    <footer
      className={[
        "pointer-events-none fixed bottom-0 left-0 z-40 flex h-8 w-full items-center px-4",
        align === "center"
          ? "justify-center"
          : align === "right"
            ? "justify-end"
            : "justify-start",
      ].join(" ")}
    >
      <Logo as="span" className="text-xs text-fg-2 bg-surface-2 " />
    </footer>
  );
}

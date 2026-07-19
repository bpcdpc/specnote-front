import { cn } from "@/lib/utils";

type LogoProps = {
  // short:  축약형 {S}. 기본은 {SpecNote}.
  short?: boolean;
  // as: 렌더할 태그.
  //   "h1"   — 그 화면의 제목일 때 (로그인·회원가입)
  //   "span" — 장식일 때 (푸터).
  as?: "h1" | "span";
  className?: string;
};

// Logo — {SpecNote} 가로형 / {S} 축약형
//
// 폰트 Geist(중괄호 포함), 무채색. 중괄호도 이름과 같은 진한 색.
export function Logo({ short = false, as = "h1", className }: LogoProps) {
  const Tag = as;

  return (
    <Tag
      className={cn(
        "font-sans font-medium text-fg-1 select-none",
        short ? "text-lg" : "text-4xl",
        className,
      )}
    >
      {short ? "{S}" : "{SpecNote}"}
    </Tag>
  );
}

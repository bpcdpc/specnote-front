import type { LucideIcon } from "lucide-react";

type PageHeadingProps = {
  icon?: LucideIcon;
  title: string;
};

// PageHeading — 화면 상단 제목 블록 (아이콘 + 제목)
//
// 대시보드/생성/설정이 같은 리듬으로 시작하도록 간격과 크기를 한 곳에서 관리한다.
export function PageHeading({ icon: Icon, title }: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-3">
      {Icon && <Icon className="size-8 text-fg-3" aria-hidden="true" />}
      <h2 className="text-2xl font-medium text-fg-1">{title}</h2>
    </div>
  );
}

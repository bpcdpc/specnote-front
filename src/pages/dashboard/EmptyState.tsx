import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  action?: ReactNode;
};

// EmptyState — 빈 상태 공통
//
// 폭을 스스로 정하지 않는다. 감싸는 페이지 컨테이너를 그대로 따르므로
// 목록이 있을 때(카드 그리드)와 같은 좌측 기준선에서 시작한다.
export function EmptyState({ icon: Icon, title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col gap-4 py-8">
      <PageHeading icon={Icon} title={title} />
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

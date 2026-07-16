import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

type BackButtonProps = {
  to: string;
  label?: string;
};

export function BackButton({ to, label = "뒤로" }: BackButtonProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="flex size-8 shrink-0 items-center justify-center rounded-ctl text-fg-2 hover:bg-surface-2 hover:text-fg-1"
    >
      <ChevronLeft className="size-5" />
    </Link>
  );
}

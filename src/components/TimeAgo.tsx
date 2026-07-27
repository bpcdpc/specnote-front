import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { timeAgo, fullTime } from "@/lib/formatTime";

// TimeAgo — 상대 시각 + 전체 시각 툴팁
//
// title 속성을 쓰지 않는다. 브라우저 기본 지연(1초 내외)을 못 바꾸고 스타일도 못 준다.
//
// Provider 를 자기 안에 두지 않는다. 상위(SpecLayout)에서 받는다.
// Provider 가 없는 화면에서는 지연이 0 이 된다(shadcn 래퍼 기본값).
//
// Base UI 에는 asChild 가 없다. render 로 엘리먼트를 넘겨 <time> 으로 바꾼다.
// dateTime 을 유지하는 이유는 기계가 읽을 수 있는 원본을 남기기 위해서다.
export function TimeAgo({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<time dateTime={iso} />} className={className}>
        {timeAgo(iso)}
      </TooltipTrigger>
      <TooltipContent side="bottom">{fullTime(iso)}</TooltipContent>
    </Tooltip>
  );
}

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// IconButton — 아이콘만 있는 버튼
//
// 보더·배경 없음, hover 시 --sn-hover-icon (04-design-tokens).
//
// variant="ghost" 를 쓰되 hover 만 덮는다. ghost 의 hover 는 bg-muted(=surface-3,
// 선택 배경)이고 글자도 text-primary 로 튄다. 나머지(disabled, 포커스 링,
// active 눌림)는 Button 것을 그대로 받는다.
//
// label 은 aria-label 과 툴팁을 겸한다. title 은 쓰지 않는다 —
// 브라우저 기본 지연(1초 내외)을 못 바꾸고 툴팁과 중복으로 뜬다.
//
// Provider 를 자기 안에 두지 않는다. 버튼마다 Provider 가 생기면 나란히 붙은
// 버튼 사이를 옮길 때마다 지연을 다시 기다린다. 상위(SpecLayout)에서 받는다.
//
// Base UI 에는 asChild 가 없다. TooltipTrigger 의 render 로 Button 을 넘긴다.
//
// props 는 Trigger 가 아니라 Button 으로 내린다. Trigger 에 펼치면
// className / style / render 처럼 state 콜백을 받는 prop 들이 전부 타입 충돌한다
// (ButtonState 와 TooltipTriggerState 가 다른 타입이다). Trigger 는 render 로
// 넘긴 엘리먼트에 자기 핸들러를 병합하므로 여기 두어도 툴팁은 동작한다.
//
// render 는 호출부에서 못 넘기게 막는다. 내부에서 Button 을 넘기는 자리다.
type IconButtonProps = Omit<ButtonPrimitive.Props, "render"> & {
  label: string;
  size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg";
};

// IconButton 의 hover 덮어쓰기. Popover 트리거처럼 툴팁을 못 쓰는 자리에서
// 같은 스타일을 재현하려면 이 값을 Button 에 직접 넘긴다.
export const ICON_BUTTON_OVERRIDE =
  "text-fg-2 hover:bg-hover-icon hover:text-fg-1 dark:hover:bg-hover-icon";

export function IconButton({
  label,
  className,
  size = "icon",
  children,
  ...props
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size={size}
            aria-label={label}
            className={cn(ICON_BUTTON_OVERRIDE, className)}
            {...props}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

import { useState } from "react";
import { Eye, EyeOff, Lock, LockOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBearerToken } from "./BearerTokenContext";

const ICON_BUTTON =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-fg-3 " +
  "hover:bg-hover-icon hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// BearerTokenInput — 헤더의 전역 Bearer 토큰 입력
//
// 1. 항상 표시한다. 인증이 필요한 엔드포인트를 고른 뒤에 찾아 헤매지 않게 한다.
// 2. 자물쇠로 적용 여부를 보인다(Swagger 관례). 열림 = 미입력, 잠김 = 요청에 실린다.
//    Swagger 는 Authorize 버튼을 눌러야 잠기지만 우리는 입력 즉시 적용된다 —
//    지원 스킴이 http bearer 하나뿐이라 모달을 둘 이유가 없다(UC-4).
// 3. 기본은 마스킹이다. 화면 공유나 스크린샷에 토큰이 그대로 찍히면 안 된다.
//    type="password" 는 브라우저 비밀번호 저장 프롬프트를 부르므로 CSS 로 가린다.
export function BearerTokenInput({ className }: { className?: string }) {
  const { token, setToken } = useBearerToken();
  const [visible, setVisible] = useState(false);

  const hasToken = token.length > 0;
  const LockIcon = hasToken ? Lock : LockOpen;

  return (
    <div className={cn("relative flex items-center", className)}>
      <LockIcon
        className={cn(
          "pointer-events-none absolute left-2.5 size-3.5 transition-colors",
          hasToken ? "text-fg-1" : "text-fg-3",
        )}
        aria-hidden="true"
      />

      <Input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Bearer 토큰"
        aria-label="Try it out 에 사용할 Bearer 토큰"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "h-8 pl-8 font-mono text-xs",
          hasToken ? "pr-16" : "pr-2",
          // 마스킹 — 폰트 치환으로 가린다. 값은 그대로라 복사·붙여넣기가 동작한다.
          !visible && hasToken && "[-webkit-text-security:disc]",
        )}
      />

      {hasToken && (
        <div className="absolute right-1 flex items-center">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={ICON_BUTTON}
            aria-label={visible ? "토큰 가리기" : "토큰 보기"}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff className="size-3.5" aria-hidden="true" />
            ) : (
              <Eye className="size-3.5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setToken("")}
            className={ICON_BUTTON}
            aria-label="토큰 지우기"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

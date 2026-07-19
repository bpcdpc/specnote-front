import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ExampleBlock — 예시 JSON 표시
//
// 값을 그대로 보여주고 복사만 지원한다. 편집은 Try it out(11-8)의 몫이다.
export function ExampleBlock({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없으면 조용히 넘어간다. 사용자가 직접 선택해 복사할 수 있다.
    }
  };

  return (
    <div className={cn("relative rounded-md border border-border", className)}>
      <button
        type="button"
        onClick={copy}
        aria-label="예시 복사"
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-fg-3 hover:bg-hover-icon hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>

      <pre className="overflow-x-auto overscroll-x-none p-3 pr-11 font-mono text-xs leading-relaxed text-fg-2">
        {text}
      </pre>
    </div>
  );
}

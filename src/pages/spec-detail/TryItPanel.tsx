import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TryItError, TryItResponse } from "@/pages/spec-detail/useTryIt";
import { Checkbox } from "@/components/ui/checkbox";

// TryItPanel — 실행 버튼과 실제 응답
//
// 입력은 Parameters / Request Body 구획에 이미 붙어 있다. 여기는 실행과 결과만 맡는다.
export function TryItPanel({
  method,
  mutating,
  baseUrl,
  authUnsupported,
  confirmed,
  onConfirm,
  loading,
  response,
  error,
  onExecute,
}: {
  method: string;
  mutating: boolean;
  baseUrl: string | null;
  // http bearer 외 인증을 요구하는 엔드포인트(UC-4 예외 흐름).
  authUnsupported: string | null;
  confirmed: boolean;
  onConfirm: (v: boolean) => void;
  loading: boolean;
  response: TryItResponse | null;
  error: TryItError | null;
  onExecute: () => void;
}) {
  const disabled = !baseUrl || loading || (mutating && !confirmed);

  return (
    <section className="flex flex-col gap-3">
      {/* FR-4.5 — 변경 계열만. GET·HEAD 에는 안 나온다. */}
      {mutating && (
        <label className="flex items-center gap-2 text-xs text-fg-3">
          <Checkbox checked={confirmed} onCheckedChange={onConfirm} />
          <span>
            {method.toUpperCase()} 요청은 실제 서버의 데이터를 변경할 수 있음을
            확인했습니다.
          </span>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onExecute} disabled={disabled}>
          {loading && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Execute
        </Button>

        {/* FR-4.6 — baseUrl 이 없으면 Try it out 만 비활성. 열람과 댓글은 정상이다. */}
        {!baseUrl && (
          <span className="text-sm text-fg-3">
            프로젝트에 API Base URL이 없어 실행할 수 없습니다
          </span>
        )}

        {authUnsupported && (
          <span className="text-sm text-fg-3">
            {authUnsupported} 인증은 지원하지 않습니다 (http bearer만 지원)
          </span>
        )}
      </div>

      {error && <ErrorBlock error={error} />}
      {response && <ResponseBlock response={response} />}
    </section>
  );
}

function ErrorBlock({ error }: { error: TryItError }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-destructive p-3">
      <p className="text-sm font-medium text-destructive">요청 실패</p>
      <p className="font-mono text-xs text-fg-2">{error.message}</p>
      {error.maybeCors && (
        <p className="text-xs leading-relaxed text-fg-3">
          상태 코드가 없는 실패입니다. 대상 API가 SpecNote 오리진의 요청을
          CORS로 허용하지 않았거나, 네트워크에 닿지 못한 경우일 수 있습니다.
          브라우저는 두 경우를 구분해 알려주지 않습니다. CORS 설정은 대상 API
          쪽에서 다뤄야 합니다.
        </p>
      )}
    </div>
  );
}

function ResponseBlock({ response }: { response: TryItResponse }) {
  const [headersOpen, setHeadersOpen] = useState(false);

  const ok = response.status >= 200 && response.status < 300;
  const body = prettyIfJson(response.body);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold",
            ok ? "bg-get-bg text-get-fg" : "bg-delete-bg text-delete-fg",
          )}
        >
          {response.status}
        </span>
        {response.statusText && (
          <span className="text-sm text-fg-2">{response.statusText}</span>
        )}
        <span className="text-xs tabular-nums text-fg-3">
          {response.durationMs}ms
        </span>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setHeadersOpen((v) => !v)}
          aria-expanded={headersOpen}
          className="flex items-center gap-1 rounded-md py-1 text-xs text-fg-3 hover:text-fg-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {headersOpen ? (
            <ChevronDown className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-3.5" aria-hidden="true" />
          )}
          Headers ({response.headers.length})
        </button>

        {headersOpen && (
          <dl className="flex flex-col gap-1 py-1 pl-5">
            {response.headers.map(([key, value]) => (
              <div key={key} className="flex gap-2 font-mono text-xs">
                <dt className="shrink-0 text-fg-3">{key}:</dt>
                <dd className="min-w-0 break-all text-fg-2">{value}</dd>
              </div>
            ))}
            <p className="pt-1 text-xs text-fg-3">
              CORS가 노출을 허용한 헤더만 표시됩니다.
            </p>
          </dl>
        )}
      </div>

      <pre className="max-h-96 overflow-auto overscroll-none rounded-md border border-border p-3 font-mono text-xs leading-relaxed text-fg-2">
        {body || "(빈 응답)"}
      </pre>
    </div>
  );
}

// JSON 이면 들여쓰기해서 보여준다. 아니면 원문 그대로다.
function prettyIfJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Braces } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createProject } from "@/lib/api/projects";
import { specErrorMessage } from "./SpecError";

// ProjectCreatePage — 프로젝트 생성
//
// 스펙 JSON URL 하나만 입력받아 생성한다.
// title/description/version/oasVersion 은 이 URL 의 스펙을 서버가 파싱해 채운다. (FR-1.9)
// base URL, 멤버는 생성 후 설정 화면에서 추가.
//
// 컨테이너는 대시보드 목록과 동일 — 화면 간 좌측 기준선과 여백을 맞춘다.
export function ProjectCreatePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createProject({ specJsonUrl: url.trim() }),
    onSuccess: (meta) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate(`/projects/${meta.id}`, { replace: true });
    },
    onError: (e) => {
      setError(specErrorMessage(e, "프로젝트를 만들지 못했습니다."));
    },
  });

  const canSubmit = url.trim().length > 0 && !isPending;

  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="flex flex-col gap-4 py-8">
        <PageHeading icon={Braces} title="OpenAPI Spec URL" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutate();
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              id="specUrl"
              placeholder="https://dev.example.com/api-json"
              className="h-12 text-base"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              disabled={isPending}
              aria-invalid={Boolean(error)}
              autoFocus
            />
            <Button
              type="submit"
              variant="default"
              className="h-12 shrink-0 px-5"
              disabled={!canSubmit}
            >
              {isPending ? "불러오는 중…" : "스펙 불러오기"}
            </Button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

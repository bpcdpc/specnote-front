import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { updateProject } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";

type TryItBaseUrlFieldProps = {
  projectId: number;
  initialUrl: string;
};

// TryItBaseUrlField — Try it out 요청용 base URL (설정 화면 전용)
//
// 선택 항목(FR-4.5). 미입력이면 Try it out 만 비활성이고 스펙 열람과 댓글은 정상이다.
// PATCH 로 고칠 수 있는 유일한 필드다 — title, version 등은 스펙 재커밋으로만 바뀐다.
export function TryItBaseUrlField({
  projectId,
  initialUrl,
}: TryItBaseUrlFieldProps) {
  const queryClient = useQueryClient();

  // 부모가 데이터를 받은 뒤에만 이 컴포넌트를 그리므로 initializer 로 충분하다.
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    // 빈 문자열은 undefined 로 바꿔 보낸다. "지우기"와 "안 건드림"이 갈린다.
    mutationFn: () =>
      updateProject(projectId, { tryItBaseUrl: url.trim() || null }),
    onSuccess: () => {
      // meta 의 tryItBaseUrl 이 바뀐다. 스펙과 무관하므로 앵커는 건드리지 않는다.
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.add({ title: "저장했습니다", type: "success" });
    },
    onError: (e) => {
      setError(e instanceof ApiError ? e.message : "저장하지 못했습니다.");
    },
  });

  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="baseUrl">API Base URL</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="baseUrl"
              autoComplete="off"
              placeholder="https://dev.example.com/api"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(error)}
            />
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => mutate()}
              disabled={isPending}
            >
              {isPending ? "저장 중…" : "저장"}
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

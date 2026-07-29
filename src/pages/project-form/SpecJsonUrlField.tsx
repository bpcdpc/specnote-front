import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { commitSpec } from "@/lib/api/projects";
import type { EndpointDiff } from "@/lib/types";
import { specErrorMessage } from "./SpecError";

type SpecJsonUrlFieldProps = {
  projectId: number;
  initialUrl: string;
};

// SpecJsonUrlField — 스펙 업데이트 (설정 화면 전용)
//
// 서버는 새 스냅샷을 append 하고 엔드포인트를 upsert 한다.
// 사라진 것은 소프트 삭제되고 거기 달린 댓글은 남는다.
// 같은 path+method 가 다시 나타나면 기존 행이 부활해 댓글도 되살아난다(FR-10).

// 업데이트된 엔드포인트들의 갯수를 대략적으로 알려준다.
function describeDiff(diff: EndpointDiff): string {
  const parts = [
    diff.added && `${diff.added}개 추가`,
    diff.removed && `${diff.removed}개 삭제`,
    diff.updated && `${diff.updated}개 변경`,
    diff.revived && `${diff.revived}개 복구`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "변경된 엔드포인트가 없습니다";
}

export function SpecJsonUrlField({
  projectId,
  initialUrl,
}: SpecJsonUrlFieldProps) {
  const queryClient = useQueryClient();

  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => commitSpec(projectId, { specJsonUrl: url.trim() }),
    onSuccess: (result) => {
      // 목록 카드의 title, version 도 스펙에서 다시 뽑힌다.
      queryClient.invalidateQueries({ queryKey: ["projects"], exact: true });
      // 엔드포인트 목록과 snapshotId 가 통째로 바뀐다.
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId],
        exact: true,
      });
      // operationJson 이 전부 갈린다. 상세 캐시를 안 버리면 설정에서 돌아왔을 때
      // staleTime 동안 옛 스펙이 그대로 보이고, 배너로도 안 잡힌다
      // (detail < project 방향이라 배너 조건에 안 걸린다).
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      toast.add({
        title: "스펙을 업데이트했습니다",
        description: describeDiff(result.diff),
        type: "success",
      });
    },
    onError: (e) => {
      setError(specErrorMessage(e, "스펙을 업데이트하지 못했습니다."));
    },
  });

  // 빈 값 제출을 막는다. 입력창에 현재 URL 이 채워져 있으므로,
  const canSubmit = url.trim().length > 0 && !isPending;

  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="specUrl">OpenAPI Spec URL</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="specUrl"
              autoComplete="off"
              placeholder="https://dev.example.com/api-json"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              required
              aria-invalid={Boolean(error)}
            />
            <Button
              className="shrink-0"
              onClick={() => mutate()}
              disabled={!canSubmit}
            >
              {isPending ? "업데이트 중…" : "스펙 업데이트"}
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

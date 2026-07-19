import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";

// TryItBaseUrlField — Try it out 요청용 base URL (project-form 전용, 설정 화면)
//
// 선택 항목(FR-4.5). 미입력 시 Try it out 만 비활성, 스펙 열람·댓글은 정상.
// Owner 만 수정 가능(FR-4.7).
//
// TODO(데이터 단계): 기존값 useProject(id).tryItBaseUrl 로 초기화 →
//   저장 시 updateProject(id, { tryItBaseUrl }).
export function TryItBaseUrlField() {
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
            />
            <Button variant="outline" className="shrink-0">
              저장
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

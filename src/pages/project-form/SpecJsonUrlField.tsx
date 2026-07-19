import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";

// SpecJsonUrlField — 스펙 업데이트 (project-form 전용, 설정 화면)
//
// 새 스펙 URL 을 입력해 재로드한다. 서버는 파싱 후 스냅샷을 append 하고
// title/version 등 파싱값을 최신으로 갱신한다(FR-1.9 / FR-10).
//
// TODO(데이터 단계): reloadSpec(id, url).
export function SpecJsonUrlField() {
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
            />
            <Button className="shrink-0">스펙 업데이트</Button>
          </div>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

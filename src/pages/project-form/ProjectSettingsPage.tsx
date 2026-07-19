import { Settings } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { SpecJsonUrlField } from "./SpecJsonUrlField";
import { TryItBaseUrlField } from "./TryItBaseUrlField";
import { MemberList } from "./MemberList";

// ProjectSettingsPage — 프로젝트 설정 (목)
//
// 1컬럼. 헤더(← + 프로젝트명)는 AppLayout 이 그린다.
//
// TODO(데이터 단계):
//   - useParams 로 id 확보 → useProject(id) 로 tryItBaseUrl / members 로드
//   - Owner 만 수정 가능(FR-4.7). role 로 각 필드/버튼 활성 제어.
export function ProjectSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="flex flex-col gap-10 py-8">
        <PageHeading icon={Settings} title="프로젝트 설정" />

        <div className="flex flex-col gap-8">
          <SpecJsonUrlField />
          <TryItBaseUrlField />
        </div>

        <hr className="border-border" />

        <MemberList />
      </div>
    </div>
  );
}

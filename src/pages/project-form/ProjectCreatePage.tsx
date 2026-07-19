import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Braces } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";

// ProjectCreatePage — 프로젝트 생성 (목)
//
// 스펙 JSON URL 하나만 입력받아 생성한다.
//   title/description/version/oasVersion 은 이 URL 의 스펙을 서버가 파싱해 채운다
//   (FR-1.9 — 사용자 직접 입력 없음). base URL/멤버는 생성 후 설정 화면에서 추가.
//
// 컨테이너는 대시보드 목록과 동일 — 화면 간 좌측 기준선과 여백을 맞춘다.
//
// TODO(데이터 단계): 입력값 상태 + createProject(url) 연결, 빈 값일 때 비활성 처리.
export function ProjectCreatePage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="flex flex-col gap-4 py-8">
        <PageHeading icon={Braces} title="OpenAPI Spec URL" />

        <div className="flex items-center gap-2">
          <Input
            id="specUrl"
            placeholder="https://dev.example.com/api-json"
            className="h-12 text-base"
          />
          <Button variant="default" className="h-12 shrink-0 px-5">
            스펙 불러오기
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Ghost } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { Footer } from "@/components/Footer";
// NotFoundPage — 404
//
// 레이아웃(헤더/푸터) 밖에서 단독으로 그려진다.
// 로그인 화면과 같은 규칙 — 가로 중앙, max-w-sm.
// 세로는 정중앙보다 살짝 위(35vh 지점)에 둔다.
export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-2">
      <main className="flex flex-1 justify-center p-4 pt-[30vh]">
        <div className="flex h-fit w-full max-w-sm flex-col gap-4">
          <PageHeading icon={Ghost} title="페이지를 찾을 수 없어요" />

          <Link
            to="/"
            className="inline-flex h-10 w-fit items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </main>
      <Footer align="left" />
    </div>
  );
}

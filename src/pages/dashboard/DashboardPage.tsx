import { FolderOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { PageHeading } from "@/components/PageHeading";
import { ProjectCard } from "./ProjectCard";
import { NewProjectCard } from "./NewProjectCard";
import type { ProjectSummary } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

// DashboardPage — 프로젝트 목록 (목)
//
// TODO(데이터 단계): MOCK_PROJECTS 를 useProjects() 로 교체.
//   빈 배열이면 EmptyState, 아니면 ProjectCard 그리드 + NewProjectCard.
const MOCK_PROJECTS: ProjectSummary[] = [
  {
    id: 1,
    title: "결제 API",
    role: "MEMBER",
    version: "1.4.0",
    oasVersion: "3.1.0",
    isDeleted: false,
    description:
      "카드/계좌이체/포인트 결제를 하나의 인터페이스로 통합한 엔드포인트 모음. PG사 연동, 결제 취소, 부분 환불, 정기결제까지 지원한다.",
  },
  {
    id: 2,
    title: "유저 서비스",
    role: "OWNER",
    version: "2",
    oasVersion: "3.0.3",
    isDeleted: false,
    description: "회원가입, 인증, 프로필 관리 API",
  },
  // {
  //   id: 3,
  //   title: "알림 서비스",
  //   role: "MEMBER",
  //   version: "0.1",
  //   oasVersion: "3.1.0",
  //   isDeleted: false,
  //   description: "푸시/이메일/인앱 알림 발송 및 구독 관리",
  // },
  // {
  //   id: 4,
  //   title: "상품 카탈로그",
  //   role: "MEMBER",
  //   version: "3.1.2",
  //   oasVersion: "3.0.3",
  //   isDeleted: false,
  //   description: "상품 등록, 검색, 재고 조회 엔드포인트",
  // },
  // {
  //   id: 5,
  //   title: "주문 관리",
  //   role: "MEMBER",
  //   version: "1.1",
  //   oasVersion: "3.1.0",
  //   isDeleted: false,
  //   description: "주문 생성, 취소, 배송 추적 API",
  // },
  // {
  //   id: 6,
  //   title: "리뷰 서비스",
  //   role: "OWNER",
  //   version: "0.9.3",
  //   oasVersion: "3.0.0",
  //   isDeleted: false,
  //   description: null,
  // },
  // {
  //   id: 7,
  //   title: "검색 엔진",
  //   role: "OWNER",
  //   version: "2.3.1",
  //   oasVersion: "3.1.0",
  //   isDeleted: false,
  //   description:
  //     "전문 검색, 자동완성, 연관 검색어 추천을 제공하는 API. 오타 보정과 동의어 처리, 가중치 기반 랭킹으로 검색 품질을 높였고 대용량 색인에도 대응한다.",
  // },
];

export function DashboardPage() {
  //const projects = MOCK_PROJECTS;
  // const projects: ProjectSummary[] = [];
  const {
    data: projects,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({ queryKey: ["projects"], queryFn: getProjects });

  // 로딩중. 첫 진입시에만 보임
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-6">
        <LoadingState />
      </div>
    );
  }

  // 4xx 는 재시도하지 않으므로(queryClient) 여기까지 오면 사용자 조작이 필요하다.
  // 5xx 또는 네트워크 문제는 한 번 더 시도한 뒤 도달한다.
  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-6">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  // 프로젝트가 없는 경우
  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-6 px-8">
        <EmptyState
          icon={FolderOpen}
          title="아직 프로젝트가 없어요"
          action={
            <Link
              to="/projects/new"
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              <Plus className="size-4" />새 프로젝트
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-6 px-8">
      <div className="flex flex-col gap-4">
        <PageHeading icon={FolderOpen} title="내 프로젝트" />
        <div className="grid grid-cols-1 pt-4 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
          <NewProjectCard />
        </div>
      </div>
    </div>
  );
}

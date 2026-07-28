import type {
  ProjectSummary,
  ProjectView,
  SpecCommitResult,
  MemberView,
  Membership,
} from "../types";
import { api } from "./client";

// ── 프로젝트 ──

// GET  /api/projects
// →  ProjectSummary[]  (내가 속한 것만, 삭제 제외)
export function getProjects() {
  return api.get<ProjectSummary[]>("/projects");
}

// GET  /api/projects/:id
// →  ProjectView  (사이드바 목록 + components 를 한 번에)
export function getProject(projectId: number) {
  return api.get<ProjectView>(`/projects/${projectId}`);
}

// POST /api/projects
// { specJsonUrl, tryItBaseUrl? }  →  ProjectView
// 400 에 code — INVALID_SPEC | UNSUPPORTED_VERSION | SPEC_LOAD_ERROR
export function createProject(body: {
  specJsonUrl: string;
  tryItBaseUrl?: string;
}) {
  return api.post<ProjectView>("/projects", body);
}

// [Owner]
// PATCH /api/projects/:id
// { tryItBaseUrl? }  →  ProjectSummary
// 나머지 메타는 스펙 재커밋으로만 갱신된다.
export function updateProject(
  projectId: number,
  body: { tryItBaseUrl?: string | null },
) {
  return api.patch<ProjectSummary>(`/projects/${projectId}`, body);
}

// [Owner]
// DELETE /api/projects/:id
// →  void  (소프트 삭제)
export function deleteProject(projectId: number) {
  return api.delete<void>(`/projects/${projectId}`);
}

// [Owner]
// POST /api/projects/:id/spec-commits
// { specJsonUrl? }  →  SpecCommitResult
// 생략하면 기존 URL 을 다시 fetch 한다. 400 code 는 createProject 와 같다.
export function commitSpec(projectId: number, body: { specJsonUrl?: string }) {
  return api.post<SpecCommitResult>(
    `/projects/${projectId}/spec-commits`,
    body,
  );
}

// ── 멤버 ──

// GET  /api/projects/:id/members
// →  MemberView[]  (isDeleted=false 만)
export function getMembers(projectId: number) {
  return api.get<MemberView[]>(`/projects/${projectId}/members`);
}

// [Owner]
// POST /api/projects/:id/members
// { email }  →  Membership
// 404 미가입자 / 409 이미 활성 멤버
export function inviteMember(projectId: number, body: { email: string }) {
  return api.post<Membership>(`/projects/${projectId}/members`, body);
}

// [Owner]
// DELETE /api/projects/:id/members/:userId
// →  Membership
// membershipId 가 아니라 userId 다. 409 — 비활성 멤버 또는 Owner.
export function removeMember(projectId: number, userId: number) {
  return api.delete<Membership>(`/projects/${projectId}/members/${userId}`);
}

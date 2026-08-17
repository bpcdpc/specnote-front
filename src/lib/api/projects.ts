import type {
  ProjectSummary,
  SpecCommitResult,
  MemberView,
  Membership,
  ProjectMeta,
  Spec,
} from "../types";
import { api } from "./client";

// ── 프로젝트 ──

// GET  /api/projects
// →  ProjectSummary[]  (내가 속한 것만, 삭제 제외)
export function getProjects() {
  return api.get<ProjectSummary[]>("/projects");
}

// GET  /api/projects/:id
// →  ProjectMeta (id, role, title, spec url, try url, latest snapshot id)
// SpecLayout이 30초 간격으로 폴링한다. 스펙 내용은 getSpec이 담당한다.
export function getProjectMeta(projectId: number) {
  return api.get<ProjectMeta>(`/projects/${projectId}`);
}

// GET /api/projects/:id/spec
// →  Spec (그 스냅샷의 info 메타, components, operations)
//
// snapshotId를 생략하면 최신이 온다. 호출부(SpecLayout)은 항상 앵커를 넘긴다.
// 앵커가 아직 없는 동안에는 쿼리를 막으므로 생략 경로를 타지 않는다.
// 404 - 존재하지 않는 옛 스냅샷 id (남의 프로젝트의 스펙 포함, 리소스 은닉)
export function getSpec(projectId: number, snapshotId?: number) {
  const query = snapshotId === undefined ? "" : `?snapshotId=${snapshotId}`;
  return api.get<Spec>(`/projects/${projectId}/spec${query}`);
}

// POST /api/projects
// { specJsonUrl, tryItBaseUrl? }  →  ProjectMeta
// 400 에 code — INVALID_SPEC | UNSUPPORTED_VERSION | SPEC_LOAD_ERROR
export function createProject(body: {
  specJsonUrl: string;
  tryItBaseUrl?: string;
}) {
  return api.post<ProjectMeta>("/projects", body);
}

// [Owner]
// PATCH /api/projects/:id
// { tryItBaseUrl? }  →  ProjectMeta
// 나머지 메타는 스펙 재커밋으로만 갱신된다.
export function updateProject(
  projectId: number,
  body: { tryItBaseUrl?: string | null },
) {
  return api.patch<ProjectMeta>(`/projects/${projectId}`, body);
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

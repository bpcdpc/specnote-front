import type { EndpointDetail } from "../types";
import { api } from "./client";

// GET  /api/endpoints/:id?snapshotId=N
// →  EndpointDetail  (요청한 스냅샷 기준 operation + 비교용 latestSnapshotId)
//
// snapshotId는 프론트에서 캐싱한 projectView.snapshotId
// snapshotId는 필수다. 서버에서는 optional 로 받을 수 있지만
// 프론트에서는 항상 projectView 가 snapshotId 를 가지고 있으므로
// 이걸 넘기지 않고 요청하면 조용히 버그가 난다.
//
// 404 — 없는 엔드포인트, 또는 남의 프로젝트 것(리소스 은닉).
//       가드 단계에 따라 문구가 갈리므로 호출부는 고정 문구를 쓴다.
// 404 — code = "NOT_IN_SNAPSHOT" 일 경우
//       그 스냅샷 버전에 없다가 나중에 생긴 엔드포인트이므로 따로 처리해줘야 한다.
export function getEndpointDetail(endpointId: number, snapshotId: number) {
  return api.get<EndpointDetail>(
    `/endpoints/${endpointId}?snapshotId=${snapshotId}`,
  );
}

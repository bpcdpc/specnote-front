import type { EndpointDetail } from "../types";
import { api } from "./client";

// GET  /api/endpoints/:id
// →  EndpointDetail  (operationJson + 비교용 snapshotId)
// 404 — 없는 엔드포인트, 또는 남의 프로젝트 것(리소스 은닉).
//       가드 단계에 따라 문구가 갈리므로 호출부는 고정 문구를 쓴다.
export function getEndpointDetail(endpointId: number) {
  return api.get<EndpointDetail>(`/endpoints/${endpointId}`);
}

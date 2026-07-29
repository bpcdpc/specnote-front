// URL path param
//
// 백엔드 MembershipGuard 의 resolveProjectId
// Number.isInteger(id) && id > 0 을 요구하고, 벗어나면 400 '유효하지 않은 id입니다.' 를 낸다.
// 같은 조건을 여기서 먼저 걸러 요청 자체를 안 보낸다 —
// /projects/abc 같은 URL 로 400 을 받아와 봐야 화면에 띄울 말이 없다.
export function parseId(param: string | undefined): number | null {
  if (param === undefined) return null;
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

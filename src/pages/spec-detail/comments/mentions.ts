import type {
  UserRef,
  EndpointRef,
  PublicUser,
  EndpointSummary,
} from "@/lib/types";

// 멘션 저장 형식 — @userId| / #endpointId|
//
// 이름을 본문에 박지 않는다. 렌더 시점에 해석하므로 멤버가 이름을 바꾸면
// 옛 댓글의 멘션도 새 이름으로 따라간다.
//
// 백엔드는 content 를 파싱하지 않는다. 멘션 대상은 CreateCommentDto 의
// mentionedUserIds / mentionedEndpointIds 로 따로 간다. 즉 이 형식은
// 순수한 프론트 규약이고 백엔드는 이 문자열을 그대로 저장할 뿐이다.
//
// | 로 끝을 막는 이유 — @2 뒤에 숫자가 이어지면 @23 인지 @2 다음 3 인지 갈리지 않는다.

const USER_TOKEN = /@(\d+)\|/g;
const ENDPOINT_TOKEN = /#(\d+)\|/g;

// markdown 링크 텍스트 안의 대괄호와 역슬래시는 링크를 깨뜨린다.
// 한글 이름에는 없지만 path 에는 들어갈 수 있다.
function escapeLinkText(text: string): string {
  return text.replace(/([\\[\]])/g, "\\$1");
}

// 저장 형식을 markdown 링크로 바꾼다. react-markdown 이 파싱하기 전에 돌아야 한다 —
// 파싱 후에는 이미 React 엘리먼트라 문자열 치환이 안 된다.
//
// 이름과 경로는 댓글이 들고 온 memberMentions / endpointMentions 에서 꺼낸다.
// 프로젝트 멤버 목록을 따로 조회할 필요가 없다.
//
// 알려진 한계 — 문자열 전체를 훑으므로 코드블록 안이나 URL 경로에 토큰 모양이
// 들어 있으면 거기도 치환된다. AST 단계에서 하면 피할 수 있지만(remark 플러그인)
// 마주칠 확률이 낮아 감수한다.
export function mentionsToMarkdown(
  content: string,
  members: UserRef[],
  endpoints: EndpointRef[],
): string {
  return content
    .replace(USER_TOKEN, (raw, id: string) => {
      const found = members.find((m) => m.userId === Number(id));
      // 검증 배열에 없으면 칩으로 만들지 않고 원문을 둔다.
      // 사용자가 손으로 쳐 넣은 가짜 멘션이 살아나지 않는다.
      if (!found) return raw;
      return `[@${escapeLinkText(found.userName)}](mention:${id})`;
    })
    .replace(ENDPOINT_TOKEN, (raw, id: string) => {
      const found = endpoints.find((e) => e.endpointId === Number(id));
      if (!found) return raw;
      // 저장은 소문자(OAS Path Item Object 규약), 표시는 대문자.
      // # 는 입력할 때 친 문자와 같게 보이려고 남긴다 — @ 멘션과 대칭이다.
      const label = `#${found.method.toUpperCase()} ${found.path}`;
      return `[${escapeLinkText(label)}](endpoint:${id})`;
    });
}

// ── 에디터용 변환 ────────────────────────────────────────────
//
// textarea 에는 사람이 읽는 이름이 보이고, 저장은 토큰(@userId:number|)이다.
//
//   표시 → 저장   제출할 때. toStorage()
//   저장 → 표시   수정하려고 기존 댓글을 열 때. toDisplay()
//   저장 → ID    DTO 의 mentionedUserIds 를 만들 때. extractIds()
//
// 이름으로 되짚는 방식이라 문제점이 있지만 감안하고 진행한다.
//   1. 같은 이름의 멤버가 둘이면 먼저 찾은 쪽으로 붙는다.
//   2. 팝오버로 고르지 않고 손으로 @이름 을 쳐도 멘션 대상으로 파싱이 된다.

// 엔드포인트 표시 텍스트. 저장은 소문자(OAS 규약)지만 표시는 대문자다.
export function endpointLabel(endpoint: {
  path: string;
  method: string;
}): string {
  return `#${endpoint.method.toUpperCase()} ${endpoint.path}`;
}

// 표시 → 저장.
// 긴 이름부터 바꾼다 — "희경"과 "희경민"이 있을 때 짧은 쪽을 먼저 바꾸면 "@희경민"이 "@2|민"이 된다.
// 엔드포인트도 마찬가지이다.
export function toStorage(
  text: string,
  members: PublicUser[],
  endpoints: EndpointSummary[],
): string {
  let out = text;

  for (const m of [...members].sort(
    (a, b) => b.userName.length - a.userName.length,
  )) {
    out = out.replaceAll(`@${m.userName}`, `@${m.id}|`);
  }

  for (const e of [...endpoints].sort(
    (a, b) => endpointLabel(b).length - endpointLabel(a).length,
  )) {
    out = out.replaceAll(endpointLabel(e), `#${e.id}|`);
  }

  return out;
}

// 저장 → 표시. 수정 모드에서 기존 content 를 textarea 에 넣을 때 쓴다.
// 해석 못 하는 토큰은 원문을 남긴다.
export function toDisplay(
  content: string,
  members: PublicUser[],
  endpoints: EndpointSummary[],
): string {
  return content
    .replace(/@(\d+)\|/g, (raw, id: string) => {
      const found = members.find((m) => m.id === Number(id));
      return found ? `@${found.userName}` : raw;
    })
    .replace(/#(\d+)\|/g, (raw, id: string) => {
      const found = endpoints.find((e) => e.id === Number(id));
      return found ? endpointLabel(found) : raw;
    });
}

// 저장 형식에서 실제로 쓰인 ID 를 뽑는다. CreateCommentDto 로 보낼 값이다.
// 중복을 제거한다. 같은 사람을 두 번 멘션해도 보내는 ID는 하나다.
export function extractIds(content: string): {
  userIds: number[];
  endpointIds: number[];
} {
  const users = new Set<number>();
  const endpoints = new Set<number>();

  for (const [, id] of content.matchAll(/@(\d+)\|/g)) {
    users.add(Number(id));
  }
  for (const [, id] of content.matchAll(/#(\d+)\|/g)) {
    endpoints.add(Number(id));
  }

  return { userIds: [...users], endpointIds: [...endpoints] };
}

// 커서 앞에서 열려 있는 멘션 토큰을 찾는다.
// "@희" 처럼 트리거 뒤에 공백 없이 이어진 글자만 후보 검색어로 본다.
//
// 엔드포인트는 표시 텍스트에 공백이 들어간다(#GET /courses).
// 그래서 공백 하나까지만 허용한다.
export function activeMentionQuery(
  text: string,
  caret: number,
): { trigger: "@" | "#"; query: string; start: number } | null {
  const before = text.slice(0, caret);

  const user = before.match(/@([^\s@#]*)$/);
  if (user) {
    return { trigger: "@", query: user[1], start: caret - user[0].length };
  }

  const endpoint = before.match(/#([^\n@#]*)$/);

  if (endpoint && (endpoint[1].match(/ /g)?.length ?? 0) <= 1) {
    return {
      trigger: "#",
      query: endpoint[1],
      start: caret - endpoint[0].length,
    };
  }

  return null;
}

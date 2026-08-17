import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Link, useParams } from "react-router-dom";
import { mentionsToMarkdown } from "./mentions";
import { useCommentContext } from "./CommentContext";
import { cn } from "@/lib/utils";
import type { CommentView } from "@/lib/types";

// 허용 태그. 나머지는 unwrapDisallowed 로 껍데기만 벗기고 글자는 남긴다 —
// 통째로 지우면 사용자가 친 내용이 소리 없이 사라진다.
//
// 막는 것: h1~h6(300px 패널에서 2xl 제목은 과하다), img(스코프 밖),
//          table(가로로 넘친다), hr, blockquote
const ALLOWED = [
  "p",
  "br",
  "strong",
  "em",
  "del",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "a",
];

// mention: 과 endpoint: 두 스킴만 통과시키고 나머지는 기본 동작에 넘긴다.
// 기본을 안 거치면 javascript: 차단이 풀린다.
function urlTransform(url: string): string {
  if (/^(mention|endpoint):\d+$/.test(url)) return url;
  return defaultUrlTransform(url);
}

// CommentContent — 댓글 본문 렌더
//
// raw HTML 은 켜지 않는다(rehype-raw 없음). 사용자 입력 HTML 이 DOM 에 들어가지
// 않으므로 sanitize 도 필요 없다.
//
// strong 과 em 은 허용하되 아무 스타일도 주지 않는다. 좁은 패널에서 굵은 글자가
// 섞이면 작성자 이름보다 무거워 보여 위계가 뒤집힌다. 태그를 막지 않는 이유는
// 막으면 ** 별표가 그대로 노출되기 때문이다 — 굵은 글자보다 지저분하다.
//
// 멘션 대상이 사라진 경우 취소선을 긋는다. 멘션 기록 자체는 유지되고(FR-7.4)
// 판정은 여기서 한다 — mentions.ts 는 문자열 변환만 맡는 순수 모듈로 둔다.
export function CommentContent({ comment }: { comment: CommentView }) {
  const { projectId } = useParams();
  const { members, endpoints } = useCommentContext();

  // 제외된 멤버. getMembers 가 활성 멤버만 주므로 "목록에 없음"이 곧 "제외됨"이다.
  // 알려진 한계 — 프로젝트 진입 후 새로 초대된 멤버는 캐시에 없어 잘못 표시될 수 있다.
  // 멤버 목록이 다시 조회되면 풀린다.
  const removedMemberIds = new Set(
    comment.memberMentions
      .filter((m) => !members.some((x) => x.id === m.userId))
      .map((m) => m.userId),
  );

  // 삭제된 엔드포인트. 못 찾으면 살아 있는 것으로 둔다 —
  // 모르는 것을 삭제로 단정하지 않는다.
  const deletedEndpointIds = new Set(
    comment.endpointMentions
      .filter(
        (e) => endpoints.find((x) => x.id === e.endpointId)?.isDeleted ?? false,
      )
      .map((e) => e.endpointId),
  );

  const source = mentionsToMarkdown(
    comment.content,
    comment.memberMentions,
    comment.endpointMentions,
  );

  return (
    <div className="text-sm leading-relaxed wrap-break-word text-fg-2 font-light">
      <Markdown
        remarkPlugins={[remarkBreaks, remarkGfm]}
        allowedElements={ALLOWED}
        unwrapDisallowed
        urlTransform={urlTransform}
        components={{
          // 두께 대신 아무 구분도 두지 않는다. 래퍼조차 남기지 않는다.
          strong: ({ children }) => <>{children}</>,
          em: ({ children }) => <>{children}</>,

          p: ({ children }) => <p className="not-first:mt-2">{children}</p>,

          del: ({ children }) => (
            <del className="text-fg-3 line-through">{children}</del>
          ),

          ul: ({ children }) => (
            <ul className="mt-2 list-disc pl-4 first:mt-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-2 list-decimal pl-4 first:mt-0">{children}</ol>
          ),
          li: ({ children }) => <li className="mt-0.5">{children}</li>,

          // 인라인 코드. 코드블록 안의 code 는 pre 쪽에서 되돌린다.
          code: ({ children }) => (
            <code className="rounded bg-fg-1/9 px-1 py-0.5 font-mono text-[0.85em]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre
              className={[
                "mt-2 overflow-x-auto overscroll-x-none rounded-md bg-fg-1/9",
                "p-2.5 font-mono text-xs leading-relaxed",
                "[&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit",
              ].join(" ")}
            >
              {children}
            </pre>
          ),

          a: ({ href, children }) => {
            if (!href) return <>{children}</>;

            // 팀원 멘션 — 갈 곳이 없다. 알림 발송이 목적이라 표시만 한다.
            // 제외된 멤버는 취소선. 기록은 남기되 지금은 대상이 아니라는 표시다.
            if (href.startsWith("mention:")) {
              const id = Number(href.slice("mention:".length));
              return (
                <span
                  className={cn(
                    "rounded px-1 py-px text-xs text-amber-700 bg-amber-500/12 dark:bg-transparent dark:text-amber-400/80",
                    removedMemberIds.has(id) && "line-through opacity-70",
                  )}
                >
                  {children}
                </span>
              );
            }

            // 엔드포인트 멘션 — 알림 딥링크와 같은 경로로 이동한다.
            // 삭제된 엔드포인트는 취소선을 긋되 링크는 살려둔다. 상세와 댓글이
            // 그대로 열리고(FR-11.2) 스펙이 되살아나면 엔드포인트도 부활한다.
            //
            // 메서드 뱃지를 쓰지 않는다. 본문 안에 색 박스가 끼면 문장이 끊긴다.
            // 팀원 멘션과 같은 톤으로 두어 "멘션은 이 모양"이라는 규칙 하나만 남긴다.
            if (href.startsWith("endpoint:")) {
              const id = href.slice("endpoint:".length);
              return (
                <Link
                  to={`/projects/${projectId}/endpoints/${id}`}
                  className={cn(
                    "rounded bg-amber-500/12 px-1 py-px font-mono text-xs text-amber-700 dark:bg-transparent dark:text-amber-400/80",
                    deletedEndpointIds.has(Number(id))
                      ? "line-through opacity-70 hover:opacity-100"
                      : "hover:underline",
                  )}
                >
                  {children}
                </Link>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded font-mono text-xs text-amber-700 hover:underline dark:bg-transparent dark:text-amber-400/80"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </Markdown>
    </div>
  );
}

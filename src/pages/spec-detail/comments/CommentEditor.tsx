import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AtSign, Hash, Code, SquareCode, List, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/IconButton";
import { cn } from "@/lib/utils";
import { useCommentContext } from "./CommentContext";
import {
  MentionPopover,
  findCandidates,
  type MentionCandidate,
} from "./MentionPopover";
import {
  activeMentionQuery,
  endpointLabel,
  toStorage,
  toDisplay,
  extractIds,
} from "./mentions";
import type { MentionIds } from "@/lib/types";

type CommentEditorProps = {
  // content 는 저장 형식(@2|), mentions 는 거기서 뽑은 ID.
  onSubmit: (content: string, mentions: MentionIds) => void;
  // 답글,수정 모드에서만 준다. 없으면 취소 버튼을 그리지 않는다.
  onCancel?: () => void;
  // 수정 모드의 기존 본문. 저장 형식으로 들어와 표시 형식으로 풀어 보여준다.
  initialContent?: string;
  placeholder?: string;
  autoFocus?: boolean;
  submitLabel?: string;
};

// 최대 높이. 이보다 길어지면 안에서 스크롤한다.
// 패널이 세로로 좁아 입력창이 화면을 다 먹으면 위 댓글이 안 보인다.
const MAX_HEIGHT = 200;

// CommentEditor — 댓글 입력
//
// 최상위 작성 / 답글 / 수정 세 곳에서 같은 컴포넌트를 쓴다. 무엇을 하는지는
// 호출부가 onSubmit 으로 정하고, 여기는 글자를 받아 넘기기만 한다.
//
// 1. Enter 는 줄바꿈. 제출은 버튼만 — Cmd+Enter 는 한글 IME 충돌로 제외(01-frontend-stack 미결 참조)
// 2. 높이는 내용에 맞춰 늘어난다. rows 로 줄 수만 세면 좁은 패널에서 자동 줄바꿈된 분량이 빠져 실제보다 짧게 잡힌다. scrollHeight 를 읽는다.
// 3. 공백만 있으면 제출을 막는다. trim 결과를 넘긴다.
export function CommentEditor({
  onSubmit,
  onCancel,
  initialContent = "",
  placeholder = "댓글을 입력하세요",
  autoFocus = false,
  submitLabel = "등록",
}: CommentEditorProps) {
  const { members, endpoints } = useCommentContext();

  // 표시 형식으로 들고 있는다. 저장 형식은 제출할 때만 만든다.
  const [value, setValue] = useState(() =>
    toDisplay(initialContent, members, endpoints),
  );

  // 멘션 팝오버 상태. null 이면 닫힘.
  const [mention, setMention] = useState<{
    candidates: MentionCandidate[];
    activeIndex: number;
    // 교체 범위 — @ 가 시작된 위치. 선택 시 여기부터 커서까지를 갈아끼운다.
    start: number;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 높이를 내용에 맞춘다. auto 로 되돌린 뒤 재야 줄어들 때도 따라온다.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const canSubmit = value.trim().length > 0;

  // 값, 커서가 바뀔 때마다 멘션 입력 중인지 판단한다.
  const syncMention = (text: string, caret: number) => {
    const active = activeMentionQuery(text, caret);
    if (!active) {
      setMention(null);
      return;
    }
    const candidates = findCandidates(
      active.trigger,
      active.query,
      members,
      endpoints,
    );
    if (candidates.length === 0) {
      setMention(null);
      return;
    }
    setMention({ candidates, activeIndex: 0, start: active.start });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    syncMention(e.target.value, e.target.selectionStart);
  };

  // 후보를 골랐을 때 — start~caret 을 표시 텍스트로 교체하고 커서를 그 뒤로.
  const applyMention = (candidate: MentionCandidate) => {
    const el = textareaRef.current;
    if (!el || !mention) return;

    const insert =
      candidate.kind === "member"
        ? `@${candidate.member.userName} `
        : `${endpointLabel(candidate.endpoint)} `;

    const before = value.slice(0, mention.start);
    const after = value.slice(el.selectionStart);
    const next = before + insert + after;

    setValue(next);
    setMention(null);

    // 커서를 삽입한 텍스트 끝으로. setState 직후엔 DOM 이 아직이라 다음 틱에.
    const caret = before.length + insert.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  // 툴바 버튼 — 커서 위치에 문자열을 끼운다.
  // 선택 영역이 있으면 감싸고, 없으면 트리거 문자만 넣고 커서를 그 뒤에 둔다.
  const insertAtCursor = (opts: {
    before: string;
    after?: string;
    // 삽입 후 커서를 before 끝(트리거 직후)에 둘지. 멘션·인라인 코드용.
    caretAfterBefore?: boolean;
  }) => {
    const el = textareaRef.current;
    if (!el) return;
    const { before, after = "", caretAfterBefore = false } = opts;

    const s = el.selectionStart;
    const e = el.selectionEnd;
    const selected = value.slice(s, e);
    const next = value.slice(0, s) + before + selected + after + value.slice(e);

    setValue(next);

    const caret = caretAfterBefore
      ? s + before.length
      : s + before.length + selected.length + after.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
      syncMention(next, caret);
    });
  };

  const submit = () => {
    const text = value.trim();
    if (!text) return;

    const storage = toStorage(text, members, endpoints);
    onSubmit(storage, extractIds(storage));
    setValue("");
    setMention(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 조합 중 Enter 는 IME 확정용이다. 팝오버 선택으로 가로채면 조합 글자가 사라진다.
    if (mention && !e.nativeEvent.isComposing) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMention((m) =>
          m
            ? { ...m, activeIndex: (m.activeIndex + 1) % m.candidates.length }
            : m,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMention((m) =>
          m
            ? {
                ...m,
                activeIndex:
                  (m.activeIndex - 1 + m.candidates.length) %
                  m.candidates.length,
              }
            : m,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applyMention(mention.candidates[mention.activeIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMention(null);
        return;
      }
    }

    if (e.key === "Escape" && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-input-border bg-input-bg",
        "focus-within:border-input-border-focus transition-colors",
      )}
    >
      {/* 상단 툴바 — 서식 5종 */}
      <div className="flex items-center gap-0.5 border-b border-input-border px-1.5 py-1">
        <IconButton
          size="icon-xs"
          label="멤버 멘션"
          className="text-fg-3"
          onClick={() =>
            insertAtCursor({ before: "@", caretAfterBefore: true })
          }
        >
          <AtSign className="size-3.5" aria-hidden="true" />
        </IconButton>
        <IconButton
          size="icon-xs"
          label="엔드포인트 멘션"
          className="text-fg-3"
          onClick={() =>
            insertAtCursor({ before: "#", caretAfterBefore: true })
          }
        >
          <Hash className="size-3.5" aria-hidden="true" />
        </IconButton>
        <IconButton
          size="icon-xs"
          label="인라인 코드"
          className="text-fg-3"
          onClick={() => insertAtCursor({ before: "`", after: "`" })}
        >
          <Code className="size-3.5" aria-hidden="true" />
        </IconButton>
        <IconButton
          size="icon-xs"
          label="코드 블록"
          className="text-fg-3"
          onClick={() => insertAtCursor({ before: "```\n", after: "\n```" })}
        >
          <SquareCode className="size-3.5" aria-hidden="true" />
        </IconButton>
        <IconButton
          size="icon-xs"
          label="목록"
          className="text-fg-3"
          onClick={() => insertAtCursor({ before: "- " })}
        >
          <List className="size-3.5" aria-hidden="true" />
        </IconButton>
      </div>

      {/* textarea + 멘션 팝오버 */}
      <div className="relative">
        {mention && (
          <div className="absolute bottom-full left-0 mb-1 w-full px-2">
            <MentionPopover
              candidates={mention.candidates}
              activeIndex={mention.activeIndex}
              onSelect={applyMention}
              onHover={(i) =>
                setMention((m) => (m ? { ...m, activeIndex: i } : m))
              }
            />
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={(e) =>
            syncMention(e.currentTarget.value, e.currentTarget.selectionStart)
          }
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={1}
          className={cn(
            "w-full resize-none overflow-y-auto overscroll-none bg-transparent px-3 py-2",
            "text-sm leading-relaxed text-fg-1 placeholder:text-fg-3 outline-none",
          )}
        />
      </div>

      {/* 하단 바 — 좌: 파일 추가 / 우: 취소·전송 */}
      <div className="flex items-center justify-between px-1.5 py-1">
        <IconButton
          size="icon-xs"
          label="파일 첨부"
          className="text-fg-3"
          onClick={() => {
            /* TODO: 파일 첨부. 백엔드 구현됨, 프론트 배선 대기.
               onSubmit 시그니처에 files 추가 필요. CommentView 에 attachments 필드 필요. */
          }}
        >
          <Paperclip className="size-3.5" aria-hidden="true" />
        </IconButton>

        <div className="flex items-center gap-1">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button size="sm" onClick={submit} disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

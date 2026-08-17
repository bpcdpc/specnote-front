import { useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/app/AuthContext";
import { getMembers, inviteMember, removeMember } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";

type MemberListProps = {
  projectId: number;
  isOwner: boolean;
};

// MemberList — 멤버 초대 + 목록 (설정 화면 전용)
//
// 초대는 이메일 완전일치다(FR-2.1).
// 가입하지 않은 사람은 404 — 초대장을 보내지 않는다(FR-2.8).
//
// 초대와 제외 응답은 Membership 원형이라 이름이 없다. 그래서 응답을 쓰지 않고
// 목록을 재조회한다. 진입 응답(["project", id])과는 별개 캐시다.
export function MemberList({ projectId, isOwner }: MemberListProps) {
  const queryClient = useQueryClient();
  const { me } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const membersKey = ["project", projectId, "members"] as const;

  const {
    data: members,
    isPending,
    isError,
  } = useQuery({
    queryKey: membersKey,
    queryFn: () => getMembers(projectId),
  });

  const invite = useMutation({
    mutationFn: () => inviteMember(projectId, { email: email.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey });
      setEmail("");
    },
    onError: (e) => {
      setError(e instanceof ApiError ? e.message : "초대하지 못했습니다.");
    },
  });

  const remove = useMutation({
    // membershipId 가 아니라 userId 다.
    mutationFn: (userId: number) => removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey });
    },
    onError: (e) => {
      setError(e instanceof ApiError ? e.message : "제외하지 못했습니다.");
    },
  });

  const canInvite = isOwner && email.trim().length > 0 && !invite.isPending;

  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="inviteEmail">멤버</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="inviteEmail"
              type="email"
              autoComplete="off"
              placeholder="초대할 이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={!isOwner || invite.isPending}
              aria-invalid={Boolean(error)}
            />
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => invite.mutate()}
              disabled={!canInvite}
            >
              {invite.isPending ? "초대 중…" : "초대"}
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </Field>

        <Field>
          {isPending ? (
            <p className="text-sm text-fg-3">불러오는 중…</p>
          ) : isError ? (
            <p className="text-sm text-fg-3">
              멤버 목록을 불러오지 못했습니다.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {members?.map((m) => {
                const isMe = m.user.id === me?.id;
                // Owner 는 제거할 수 없다(백엔드도 409). 본인 칩에도 X 를 두지 않는다.
                const canRemove = isOwner && !isMe && m.role !== "OWNER";

                return (
                  <li
                    key={m.user.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-border py-1.5 pr-2 pl-3"
                  >
                    {/* 이름 위, 이메일 아래. 인라인으로 붙이면 칩 하나가 좁은 화면에서 한 줄을 다 먹는다. */}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-fg-1">
                        {m.user.userName}
                      </span>
                      <span className="truncate text-xs text-fg-3">
                        {m.user.email}
                      </span>
                    </span>

                    {isMe && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-strong">
                        본인
                      </span>
                    )}

                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => remove.mutate(m.user.id)}
                        disabled={remove.isPending}
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-fg-3 hover:bg-hover-icon hover:text-fg-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={`${m.user.userName} 제외`}
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

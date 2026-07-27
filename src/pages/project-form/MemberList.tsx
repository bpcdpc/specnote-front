import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";
import { MOCK_CURRENT_USER, MOCK_PROJECT_MEMBERS } from "@/lib/mock";

// MemberList — 멤버 초대 + 목록 (project-form 전용, 설정 화면)
//
// 초대: 이메일 완전일치로 기존 가입자 검색 후 Member 추가(FR-2.1).
//   이름은 검색 키 아님(표시용). 완전일치 실패 시 "대상 없음"(FR-2.8).
// 목록: 칩 형태로 가로 나열, 넘치면 다음 줄로 wrap.
//   본인은 뱃지, 나머지는 Owner 가 제외(X) 가능(FR-2.4).
//
// TODO(데이터 단계):
//   - 목록: useProject(id).members
//   - 초대: inviteMember(email) / 제외: removeMember(userId)
//   - X 는 Owner 에게만, 본인 칩엔 표시 안 함(role + isMe 로 제어)

export function MemberList() {
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
            />
            <Button variant="outline" className="shrink-0">
              초대
            </Button>
          </div>
        </Field>

        <Field>
          <ul className="flex flex-wrap gap-2">
            {MOCK_PROJECT_MEMBERS.map((m) => (
              <li
                key={m.user.id}
                className="inline-flex items-center gap-2 rounded-full border border-border py-1.5 pr-2 pl-3"
              >
                <span className="max-w-40 truncate text-sm text-fg-1">
                  {m.user.userName}
                </span>
                {m.user.id === MOCK_CURRENT_USER.id ? (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-strong">
                    본인
                  </span>
                ) : m.role === "OWNER" ? null : (
                  <button
                    type="button"
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-fg-3 hover:bg-hover-icon hover:text-fg-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={`${m.user.userName} 제외`}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

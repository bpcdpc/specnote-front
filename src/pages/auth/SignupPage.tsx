import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";

// SignupPage — 회원가입 (목)
//
// TODO(데이터 단계): 제출을 POST /api/auth/signup 으로 교체.
// 지금은 로그인 화면으로 이동.
export function SignupPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <Logo />
        {/* <hr className="border border-foreground" /> */}
      </header>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="userName">Name</FieldLabel>
            <Input id="userName" autoComplete="off" placeholder="빈영" />
          </Field>
          <Field>
            <FieldLabel htmlFor="userId">Email</FieldLabel>
            <Input
              id="userId"
              autoComplete="off"
              placeholder="user@example.com"
              type="email"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="userPw">Password</FieldLabel>
            <Input
              id="userPw"
              autoComplete="off"
              placeholder="12345678"
              type="password"
            />
          </Field>
          <Field>
            <Button onClick={handleSubmit}>회원가입</Button>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="mt-4 flex gap-4 text-sm justify-center">
        <Link
          to="/login"
          className="text-fg-2 hover:underline underline-offset-4"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}

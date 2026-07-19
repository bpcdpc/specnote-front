import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";

// LoginPage — 로그인 (목)
//
// TODO(데이터 단계): 제출을 POST /api/auth/login 으로 교체.
//   { email, password } → { access_token }, 401 처리, 토큰 localStorage 15일.
// 지금은 콘솔 출력 후 대시보드로 이동.
export function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // 목: 실제 인증 없이 대시보드로
    navigate("/");
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
            <Button onClick={handleSubmit}>로그인</Button>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="mt-4 flex gap-4 text-sm justify-center">
        <Link
          to="/signup"
          className="text-fg-2 hover:underline underline-offset-4"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}

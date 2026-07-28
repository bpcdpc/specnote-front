import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useState } from "react";
import { signup } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/app/AuthContext";

// SignupPage — 회원가입
//
// { userName, email, password } → PublicUser. 토큰은 발급되지 않는다.
// 가입 직후 같은 정보로로 login 을 한 번 더 부른다
//
// 에러는 두 갈래다.
// 409 — 이메일 중복. 필드가 확정이라 이메일 아래 FieldError 로 붙인다.
// 그 외 — 필드를 특정할 수 없어 폼 단위로 한 줄 띄운다.

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setEmailError(null);

    try {
      await signup({ email, password, userName });
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setEmailError(e.message);
      } else {
        setError(
          e instanceof ApiError ? e.message : "회원가입에 실패했습니다.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <Logo />
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="userName">Name</FieldLabel>
              <Input
                id="userName"
                type="text"
                placeholder="홍길동"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setError(null);
                }}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                  setEmailError(null);
                }}
                required
                aria-invalid={Boolean(emailError)}
              />
              {emailError && <FieldError>{emailError}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="최소 8 글자"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
                minLength={8}
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Field>
              <Button type="submit" disabled={submitting}>
                {submitting ? "회원가입 중..." : "회원가입"}
              </Button>
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
      </form>
    </div>
  );
}

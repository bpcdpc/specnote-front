import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Field, FieldSet, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/app/AuthContext";

// LoginPage — 로그인
//
// { email, password } → { access_token }, 401 처리, JWT 토큰 만료 15일.
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "로그인에 실패했습니다.");
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
                }}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Field>
              <Button type="submit" disabled={submitting}>
                {submitting ? "로그인 중..." : "로그인"}
              </Button>
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
      </form>
    </div>
  );
}

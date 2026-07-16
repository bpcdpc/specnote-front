import { Link, useParams } from "react-router-dom";
import { Settings } from "lucide-react";
import { Header } from "@/components/Header";
import { BackButton } from "@/components/BackButton";
import { useTheme } from "./ThemeContext";

// ── 임시 조각 (각 feature 단계에서 실제 컴포넌트로 교체) ────────────

// features/auth/UserBadge.tsx 로 대체 예정
function UserBadgeStub() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title="임시: 클릭 시 테마 전환 (실제로는 드롭다운)"
      className="size-8 shrink-0 rounded-full bg-avatar text-xs font-medium text-white"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}

// features/spec/BearerTokenInput.tsx 로 대체 예정
function BearerTokenInputStub() {
  return (
    <input
      placeholder="Bearer 토큰"
      className="h-8 w-full rounded-ctl border border-border bg-surface-2 px-3 text-xs text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary md:w-56"
    />
  );
}

function SettingsButtonStub({ to }: { to: string }) {
  return (
    <Link
      to={to}
      aria-label="프로젝트 설정"
      className="flex size-8 shrink-0 items-center justify-center rounded-ctl text-fg-2 hover:bg-surface-2 hover:text-fg-1"
    >
      <Settings className="size-4" />
    </Link>
  );
}

// ── 본문 뼈대 ──────────────────────────────────────────────────

function Body({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-card border border-border bg-surface-1 p-6">
        <h1 className="text-lg font-medium text-fg-1">{title}</h1>
        <p className="mt-1 text-sm text-fg-3">아직 뼈대입니다.</p>
        {children}
      </div>
    </div>
  );
}

// ── 페이지 ────────────────────────────────────────────────────

export function LoginPage() {
  return (
    <div className="rounded-card border border-border bg-surface-1 p-6">
      <h1 className="text-lg font-medium text-fg-1">로그인</h1>
      <p className="mt-1 text-sm text-fg-3">아직 뼈대입니다.</p>
      <div className="mt-4 flex gap-4 text-sm">
        <Link to="/signup" className="text-primary">
          회원가입
        </Link>
        <Link to="/" className="text-primary">
          대시보드
        </Link>
      </div>
    </div>
  );
}

export function SignupPage() {
  return (
    <div className="rounded-card border border-border bg-surface-1 p-6">
      <h1 className="text-lg font-medium text-fg-1">회원가입</h1>
      <p className="mt-1 text-sm text-fg-3">아직 뼈대입니다.</p>
      <div className="mt-4 text-sm">
        <Link to="/login" className="text-primary">
          로그인
        </Link>
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <>
      <Header
        left={<span className="font-semibold text-fg-1">Dashboard</span>}
        right={<UserBadgeStub />}
      />
      <Body title="대시보드">
        <div className="mt-4 flex gap-4 text-sm">
          <Link to="/projects/new" className="text-primary">
            새 프로젝트
          </Link>
          <Link to="/projects/1" className="text-primary">
            프로젝트 열기
          </Link>
        </div>
      </Body>
    </>
  );
}

export function ProjectFormPage() {
  const { id } = useParams();
  const title = id ? "결제 API" : "새 프로젝트";

  return (
    <>
      <Header
        left={
          <>
            <BackButton to={id ? `/projects/${id}` : "/"} />
            <span className="truncate font-semibold text-fg-1">{title}</span>
          </>
        }
        right={<UserBadgeStub />}
      />
      <Body title={id ? `프로젝트 설정 · ${id}` : "새 프로젝트"}>
        <div className="mt-4 text-sm">
          <Link to="/" className="text-primary">
            대시보드
          </Link>
        </div>
      </Body>
    </>
  );
}

export function SpecDetailPage() {
  const { id } = useParams();

  return (
    <>
      <Header
        left={
          <>
            <BackButton to="/" />
            <span className="truncate font-semibold text-fg-1">결제 API</span>
            <SettingsButtonStub to={`/projects/${id}/settings`} />
          </>
        }
        wide={<BearerTokenInputStub />}
        right={<UserBadgeStub />}
      />

      {/*
        flex-1 min-h-0: 헤더가 쓰고 남은 높이를 전부 차지한다.
          min-h-0이 없으면 flex 아이템이 콘텐츠보다 작아지지 않아 스크롤이 안 걸린다.
        overflow-x-auto: 좁은 화면에서 3컬럼을 가로 스크롤로 본다.
          헤더는 이 컨테이너 밖이므로 가로로 밀리지 않는다.
      */}
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex h-full min-w-225">
          {/* 왼쪽 — 고정폭. pb-8로 하단 푸터 글씨를 피한다. */}
          <aside className="w-55 shrink-0 overflow-y-auto border-r border-border bg-surface-1 p-3 pb-8">
            <p className="text-xs text-fg-3">엔드포인트 (고정폭)</p>
          </aside>

          {/* 중앙 — 남는 폭 */}
          <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-8">
            <p className="text-sm text-fg-2">중앙 — 스펙 상세 · Try it</p>
            <p className="mt-2 text-xs text-fg-3">프로젝트 {id}</p>
          </main>

          {/*
            오른쪽 — 컬럼 자체엔 overflow를 걸지 않는다.
            목록만 스크롤하고 입력창은 바닥에 고정되어야 하므로,
            컬럼은 flex-col, 목록에만 overflow-y-auto + pb-8을 준다.
            (푸터는 왼쪽이라 오른쪽 입력창과 겹치지 않는다.)
          */}
          <aside className="flex w-70 shrink-0 flex-col border-l border-border bg-surface-1">
            <div className="border-b border-border p-3">
              <p className="text-xs text-fg-3">댓글</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-8">
              <p className="text-xs text-fg-3">댓글 목록 (스크롤)</p>
            </div>

            <div className="border-t border-border p-3">
              <p className="text-xs text-fg-3">입력창 (바닥 고정)</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <Header
        left={<span className="font-semibold text-fg-1">SpecNote</span>}
        right={<UserBadgeStub />}
      />
      <Body title="404 — 없는 페이지">
        <div className="mt-4 text-sm">
          <Link to="/" className="text-primary">
            홈으로
          </Link>
        </div>
      </Body>
    </>
  );
}

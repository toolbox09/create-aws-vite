import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 20, label: "약함" };
  if (score <= 2) return { score: 40, label: "약함" };
  if (score <= 3) return { score: 60, label: "보통" };
  if (score <= 4) return { score: 80, label: "강함" };
  return { score: 100, label: "강함" };
}

function getStrengthColor(score: number): string {
  if (score <= 40) return "bg-red-500";
  if (score <= 60) return "bg-yellow-500";
  return "bg-green-500";
}

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired] = useState(!token);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password === confirmPassword;
  const showMismatch = confirmTouched && confirmPassword && !passwordsMatch;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirmPassword || !passwordsMatch) return;
    setSuccess(true);
  }

  // Expired / invalid token state
  if (expired) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 bg-background">
        <div className="w-full max-w-[420px] bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-8 space-y-7 animate-fade-up">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 text-destructive"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              링크 만료
            </h1>
            <p className="text-sm text-muted-foreground">
              비밀번호 재설정 링크가 만료되었습니다.
              <br />
              새로운 링크를 요청해주세요.
            </p>
          </div>

          <Button asChild className="w-full h-11 rounded-xl">
            <Link to="/auth/password-find">비밀번호 찾기로 이동</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Success dialog state
  if (success) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 bg-background">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" />
        {/* Dialog */}
        <div className="relative w-full max-w-[420px] bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-8 space-y-7 animate-fade-up">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 text-primary"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              비밀번호가 변경되었습니다
            </h1>
            <p className="text-sm text-muted-foreground">
              새로운 비밀번호로 로그인해주세요.
            </p>
          </div>

          <Button asChild className="w-full h-11 rounded-xl">
            <Link to="/auth/login">로그인으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center px-4 bg-background">
      <Link to="/" className="absolute left-6 top-6 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="콘마켓" className="h-7" />
      </Link>
      <div className="w-full max-w-[420px] bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-8 space-y-7 animate-fade-up">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            비밀번호 재설정
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">새 비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="rounded-xl h-11"
            />
            {password && (
              <div className="space-y-1.5">
                <div
                  role="progressbar"
                  aria-valuenow={strength.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={strength.label}
                  className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  비밀번호 강도:{" "}
                  <span
                    className={
                      strength.score <= 40
                        ? "text-red-500"
                        : strength.score <= 60
                          ? "text-yellow-600"
                          : "text-green-600"
                    }
                  >
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">비밀번호 확인</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmTouched(true)}
              autoComplete="new-password"
              required
              className={`rounded-xl h-11 ${showMismatch ? "ring-2 ring-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {showMismatch && (
              <p className="text-xs text-red-500">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl"
            disabled={!password || !confirmPassword || !passwordsMatch}
          >
            비밀번호 변경
          </Button>
        </form>
      </div>
    </div>
  );
}

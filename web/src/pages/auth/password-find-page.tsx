import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordFindPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      // Security: always show success regardless of email existence
      setSubmitted(true);
      setCooldown(60);
    },
    [email],
  );

  function handleResend() {
    if (cooldown > 0) return;
    setCooldown(60);
  }

  if (submitted) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 bg-background">
        <div className="w-full max-w-[420px] bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-8 space-y-7 animate-fade-up">
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
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">발송 완료</h1>
            <p className="text-sm text-muted-foreground">
              입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.
              <br />
              이메일을 확인해주세요.
            </p>
          </div>

          <Button asChild className="w-full h-11 rounded-xl">
            <Link to="/auth/login">로그인으로 돌아가기</Link>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            이메일을 받지 못하셨나요?{" "}
            {cooldown > 0 ? (
              <span className="text-muted-foreground">
                재발송 ({cooldown}초)
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary hover:underline underline-offset-4 font-medium transition-colors"
              >
                재발송
              </button>
            )}
          </p>
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
          <h1 className="text-2xl font-bold tracking-tight">비밀번호 찾기</h1>
          <p className="text-sm text-muted-foreground">
            가입하신 이메일을 입력해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="rounded-xl h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl">
            재설정 링크 발송
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/auth/login"
            className="text-primary hover:underline underline-offset-4 font-medium transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

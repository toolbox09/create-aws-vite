import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/features/auth/api/queries";
import { useAuthStore } from "@/lib/mock-auth";

function NaverIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13.54 10.65L6.17 0H0v20h6.46V9.35L13.83 20H20V0h-6.46v10.65z" />
    </svg>
  );
}

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 0C4.478 0 0 3.588 0 8.015c0 2.81 1.85 5.282 4.659 6.715l-1.19 4.352a.316.316 0 00.478.346l5.09-3.357c.31.027.626.042.963.042 5.522 0 10-3.588 10-8.015C20 3.588 15.522 0 10 0" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const { setUser } = useAuthStore();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setUser(data.user);
          toast.success("로그인 성공", { description: `환영합니다, ${data.user.name}님!` });
          navigate("/map");
        },
        onError: (error) => {
          const msg = (error as any)?.response?.data?.error || "로그인에 실패했습니다";
          toast.error("로그인 실패", { description: msg });
        },
      },
    );
  }

  function handleSocialLogin(provider: "naver" | "kakao") {
    // Redirect to server OAuth endpoint — server handles the full OAuth flow
    // and redirects back with tokens (existing user) or to signup (new user)
    window.location.href = `/api/auth/oauth/${provider}`;
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center px-4 bg-background">
      <Link to="/" className="absolute left-6 top-6 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="콘마켓" className="h-7" />
      </Link>
      <div className="w-full max-w-[420px] bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-8 space-y-7 animate-fade-up">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
          <p className="text-sm text-muted-foreground">
            계정에 로그인하여 서비스를 이용하세요
          </p>
        </div>

        <div className="space-y-2.5 animate-fade-up stagger-1">
          <button
            type="button"
            onClick={() => handleSocialLogin("naver")}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors bg-[#03C75A] text-white hover:bg-[#02b351]"
          >
            <NaverIcon className="size-4" />
            네이버로 시작하기
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("kakao")}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00]"
          >
            <KakaoIcon className="size-4" />
            카카오로 시작하기
          </button>
        </div>

        <div className="relative animate-fade-up stagger-2">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 py-0.5 text-xs text-muted-foreground">
            또는
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up stagger-3">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">비밀번호</Label>
              <Link
                to="/auth/password-find"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                비밀번호 찾기
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-xl h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground animate-fade-up stagger-4">
          아직 계정이 없으신가요?{" "}
          <a
            href="/auth/signup"
            className="text-primary hover:underline underline-offset-4 font-medium transition-colors"
          >
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordFind } from "@/features/auth/api/queries";

type FindMethod = "email" | "identity";

export default function PasswordFindPage() {
  const [method, setMethod] = useState<FindMethod>("email");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Identity verification
  const [identityVerified, setIdentityVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const passwordFindMutation = usePasswordFind();

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      passwordFindMutation.mutate({ email }, {
        onSettled: () => {
          // Always show success (security: don't reveal if email exists)
          setSubmitted(true);
          setCooldown(60);
        },
      });
    },
    [email, passwordFindMutation],
  );

  function handleResend() {
    if (cooldown > 0) return;
    setCooldown(60);
  }

  function handleIdentityVerify() {
    // Mock identity verification
    setTimeout(() => {
      setVerifiedName("김건축");
      setMaskedEmail("ki***@example.com");
      setIdentityVerified(true);
    }, 800);
  }

  function handleIdentitySendReset() {
    setSubmitted(true);
    setCooldown(60);
  }

  /* ─── Success screen (shared) ─── */
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
              {maskedEmail
                ? <><span className="font-medium text-foreground">{maskedEmail}</span>으로</>
                : "입력하신 이메일로"
              }
              <br />
              비밀번호 재설정 링크를 발송했습니다.
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
            이메일 또는 본인인증으로 비밀번호를 재설정하세요
          </p>
        </div>

        {/* ── Method tabs ── */}
        <div className="flex rounded-xl bg-muted p-1">
          <button
            onClick={() => { setMethod("email"); setIdentityVerified(false); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              method === "email"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            이메일로 찾기
          </button>
          <button
            onClick={() => setMethod("identity")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              method === "identity"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            본인인증으로 찾기
          </button>
        </div>

        {/* ── Email method ── */}
        {method === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
        )}

        {/* ── Identity verification method ── */}
        {method === "identity" && !identityVerified && (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-6 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                가입 시 인증한 휴대폰 번호로<br />본인인증을 진행합니다
              </p>
              <Button
                className="w-full h-11 rounded-xl"
                onClick={handleIdentityVerify}
              >
                <ShieldCheck className="size-4 mr-2" />
                본인인증 시작
              </Button>
            </div>
          </div>
        )}

        {method === "identity" && identityVerified && (
          <div className="space-y-4">
            <div className="rounded-xl ring-2 ring-emerald-500/20 bg-emerald-50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="size-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-semibold text-emerald-900">본인인증 완료</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">이름</span>
                  <span className="text-sm font-medium text-emerald-900">{verifiedName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">가입 이메일</span>
                  <span className="text-sm font-medium text-emerald-900">{maskedEmail}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-11 rounded-xl"
              onClick={handleIdentitySendReset}
            >
              이 이메일로 재설정 링크 발송
            </Button>
          </div>
        )}

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

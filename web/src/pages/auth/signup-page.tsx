import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  User,
  CheckCircle,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Constants ─── */

type Role = "건축주" | "파트너";

const STEPS = ["역할 선택", "기본 정보", "관심 분야", "가입 완료"] as const;

const USAGE_OPTIONS = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장"];
const REGION_OPTIONS = ["서울", "경기", "부산", "인천", "대전", "광주", "대구", "제주"];
const CERT_OPTIONS = ["설계", "시공", "감리"];

/* ─── Page ─── */

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [selectedUsages, setSelectedUsages] = useState<Set<string>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function canNext() {
    if (step === 0) return role !== null;
    if (step === 1) return name.trim() !== "" && email.trim() !== "";
    if (step === 2) return selectedUsages.size > 0;
    return true;
  }

  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      {/* ── Logo (top-left) ── */}
      <Link to="/" className="absolute left-6 top-6 hover:opacity-80 transition-opacity z-10">
        <img src="/logo.svg" alt="콘마켓" className="h-7" />
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-[520px]">
          {/* Progress bar + step indicator */}
          {step < totalSteps - 1 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {step + 1} / {totalSteps - 1} · {STEPS[step]}
                </p>
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3" />
                    이전
                  </button>
                )}
              </div>
              <div className="h-1 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Step 0: Role selection ── */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                어떤 역할로 시작하시겠어요?
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                나중에 언제든지 변경할 수 있어요
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRole("건축주")}
                  className={`flex flex-col items-center gap-4 rounded-2xl p-8 transition-all ${
                    role === "건축주"
                      ? "ring-2 ring-primary bg-primary/[0.03] shadow-sm"
                      : "ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5"
                  }`}
                >
                  <div className={`flex size-14 items-center justify-center rounded-2xl ${
                    role === "건축주" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <User className="size-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold">건축주</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-[1.6]">
                      건축 프로젝트를 의뢰하고<br />파트너를 찾아보세요
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setRole("파트너")}
                  className={`flex flex-col items-center gap-4 rounded-2xl p-8 transition-all ${
                    role === "파트너"
                      ? "ring-2 ring-primary bg-primary/[0.03] shadow-sm"
                      : "ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5"
                  }`}
                >
                  <div className={`flex size-14 items-center justify-center rounded-2xl ${
                    role === "파트너" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <Building className="size-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold">건축 파트너</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-[1.6]">
                      설계·시공·감리 전문가로<br />프로젝트에 참여하세요
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Basic info ── */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                기본 정보를 입력해 주세요
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                {role === "파트너" ? "사무소 정보와 담당자 정보를 알려주세요" : "건축주 정보를 입력해 주세요"}
              </p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">{role === "파트너" ? "담당자명" : "이름"}</Label>
                  <Input
                    id="name"
                    placeholder={role === "파트너" ? "담당자 이름" : "이름을 입력하세요"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>

                {role === "파트너" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">사무소명</Label>
                    <Input
                      id="company"
                      placeholder="건축사사무소 이름"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Interests ── */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                {role === "파트너" ? "전문 분야를 선택해 주세요" : "관심 분야를 알려주세요"}
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                여러 개를 선택할 수 있어요
              </p>

              <div className="space-y-8">
                {/* Certs (partner only) */}
                {role === "파트너" && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="size-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">인증 분야</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CERT_OPTIONS.map((c) => (
                        <button
                          key={c}
                          onClick={() => toggleSet(setSelectedCerts, c)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            selectedCerts.has(c)
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Building usage */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">건축 용도</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {USAGE_OPTIONS.map((u) => (
                      <button
                        key={u}
                        onClick={() => toggleSet(setSelectedUsages, u)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          selectedUsages.has(u)
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Regions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">관심 지역</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {REGION_OPTIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => toggleSet(setSelectedRegions, r)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          selectedRegions.has(r)
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Complete ── */}
          {step === 3 && (
            <div className="animate-fade-up text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="size-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                가입이 완료되었어요!
              </h1>
              <p className="text-sm text-muted-foreground mb-1">
                {name || "회원"}님, 콘마켓에 오신 것을 환영합니다.
              </p>
              <p className="text-sm text-muted-foreground mb-10">
                {role === "파트너"
                  ? "프로필을 완성하고 입찰에 참여해 보세요."
                  : "건축 파트너를 찾고 프로젝트를 시작해 보세요."}
              </p>

              <div className="space-y-3">
                <Button
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  onClick={() => navigate("/mypage")}
                >
                  마이페이지로 이동
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  onClick={() => navigate(role === "파트너" ? "/bids" : "/partners")}
                >
                  {role === "파트너" ? "입찰 공고 보기" : "건축 파트너 찾기"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Next button (steps 0-2) ── */}
          {step < totalSteps - 1 && (
            <div className="mt-10">
              <Button
                className="w-full h-12 rounded-xl text-base font-semibold"
                disabled={!canNext()}
                onClick={() => setStep(step + 1)}
              >
                {step === 2 ? "가입 완료" : "계속"}
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

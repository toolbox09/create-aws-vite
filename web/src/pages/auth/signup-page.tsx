import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  User,
  CheckCircle,
  MapPin,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Upload,
  X,
  Award,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSignup, useSocialSignup } from "@/features/auth/api/queries";
import { useAuthStore } from "@/lib/mock-auth";

/* ─── Constants ─── */

type RoleGroup = null | "건축주" | "파트너";
type Role = "건축주-개인" | "건축주-법인" | "파트너";
type SignupPath = null | "social" | "identity";
type StepLabel =
  | "본인인증"
  | "개인/법인 선택"
  | "약관 동의"
  | "사업자 인증"
  | "자격 인증"
  | "계정 정보"
  | "관심 분야"
  | "가입 완료";

const USAGE_OPTIONS = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장"];
const REGION_OPTIONS = ["서울", "경기", "부산", "인천", "대전", "광주", "대구", "제주"];
const CERT_OPTIONS = ["설계", "시공", "감리"];

/* ─── Agreements ─── */

interface Agreement {
  id: string;
  label: string;
  required: boolean;
  url?: string;
  roles?: Role[];
}

const AGREEMENTS: Agreement[] = [
  { id: "terms", label: "서비스 이용약관", required: true, url: "/terms" },
  { id: "privacy", label: "개인정보 수집·이용 동의", required: true, url: "/privacy" },
  { id: "thirdParty", label: "개인정보 제3자 제공 동의", required: true, url: "/privacy-third-party" },
  { id: "age", label: "만 14세 이상입니다", required: true },
  { id: "business", label: "사업자 정보 제공 동의", required: true, roles: ["건축주-법인", "파트너"] },
  { id: "license", label: "자격 정보 공개 동의", required: true, roles: ["파트너"] },
  { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
];

function getAgreementsForRole(role: Role | null): Agreement[] {
  return AGREEMENTS.filter((a) => !a.roles || (role && a.roles.includes(role)));
}

/* ─── Dynamic steps builder ─── */

function buildSteps(path: SignupPath, role: Role | null): StepLabel[] {
  if (path === "social") {
    return ["약관 동의", "관심 분야", "가입 완료"];
  }
  if (role === "파트너") {
    return ["본인인증", "약관 동의", "사업자 인증", "자격 인증", "계정 정보", "관심 분야", "가입 완료"];
  }
  // 건축주 identity path — includes 개인/법인 선택
  return ["본인인증", "개인/법인 선택", "약관 동의", "계정 정보", "관심 분야", "가입 완료"];
}

/* ─── Social Icons ─── */

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

/* ═══════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════ */

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupMutation = useSignup();
  const socialSignupMutation = useSocialSignup();
  const { setUser } = useAuthStore();
  const [signupError, setSignupError] = useState<string | null>(null);

  // Path & step
  const [roleGroup, setRoleGroup] = useState<RoleGroup>(null);
  const [path, setPath] = useState<SignupPath>(null);
  const [step, setStep] = useState(0);

  // Auto-trigger social flow from OAuth callback redirect (?social=naver|kakao)
  const [socialAutoTriggered, setSocialAutoTriggered] = useState(false);
  useEffect(() => {
    const socialParam = searchParams.get("social") as "naver" | "kakao" | null;
    if (socialParam && !socialAutoTriggered && (socialParam === "naver" || socialParam === "kakao")) {
      setSocialAutoTriggered(true);
      // Read social profile from sessionStorage (set by OAuth callback page)
      const storedProvider = sessionStorage.getItem("social_provider") || socialParam;
      const storedName = sessionStorage.getItem("social_name") || "";
      const storedEmail = sessionStorage.getItem("social_email") || "";
      sessionStorage.removeItem("social_provider");
      sessionStorage.removeItem("social_name");
      sessionStorage.removeItem("social_email");

      if (storedName && storedEmail) {
        // We have real OAuth data → go directly to social signup flow
        setSocialProvider(storedProvider as "naver" | "kakao");
        setSocialName(storedName);
        setSocialEmail(storedEmail);
        setRoleGroup("건축주");
        setRole("건축주-개인");
        setPath("social");
        setStep(0);
      } else {
        // Fallback: redirect to OAuth endpoint
        window.location.href = `/api/auth/oauth/${socialParam}`;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Identity verification
  const [identityVerified, setIdentityVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");

  // Social
  const [socialProvider, setSocialProvider] = useState<"naver" | "kakao" | null>(null);
  const [socialName, setSocialName] = useState("");
  const [socialEmail, setSocialEmail] = useState("");

  // Role
  const [role, setRole] = useState<Role | null>(null);

  // Agreements
  const [agreed, setAgreed] = useState<Set<string>>(new Set());

  // Business registration (partner)
  const [bizFile, setBizFile] = useState<File | null>(null);
  const [bizParsed, setBizParsed] = useState(false);
  const [bizCompany, setBizCompany] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizOwner, setBizOwner] = useState("");
  const [bizRegNo, setBizRegNo] = useState("");
  const bizFileRef = useRef<HTMLInputElement>(null);

  // License (partner, optional)
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseType, setLicenseType] = useState<string | null>(null);
  const licenseFileRef = useRef<HTMLInputElement>(null);

  // Account info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [company, setCompany] = useState("");

  // Interests
  const [selectedUsages, setSelectedUsages] = useState<Set<string>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());

  /* ─── History state management (browser back/forward) ─── */

  interface HistoryState {
    signupScreen: "roleGroup" | "method" | "step";
    roleGroup: RoleGroup;
    path: SignupPath;
    step: number;
    role: Role | null;
  }

  const isRestoringRef = useRef(false);

  function getCurrentScreen(): HistoryState["signupScreen"] {
    if (path !== null) return "step";
    if (roleGroup === "건축주") return "method";
    return "roleGroup";
  }

  function makeHistoryState(): HistoryState {
    return { signupScreen: getCurrentScreen(), roleGroup, path, step, role };
  }

  // Push history on navigation changes
  const prevStateRef = useRef<string>("");
  useEffect(() => {
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }
    const key = JSON.stringify(makeHistoryState());
    if (key === prevStateRef.current) return;

    if (prevStateRef.current === "") {
      // First render — replace current entry
      window.history.replaceState(makeHistoryState(), "");
    } else {
      window.history.pushState(makeHistoryState(), "");
    }
    prevStateRef.current = key;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleGroup, path, step, role]);

  // Listen for popstate (browser back/forward)
  const restoreState = useCallback((state: HistoryState | null) => {
    if (!state || !state.signupScreen) return;
    isRestoringRef.current = true;
    setRoleGroup(state.roleGroup);
    setPath(state.path);
    setStep(state.step);
    setRole(state.role);
    prevStateRef.current = JSON.stringify(state);
  }, []);

  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      const state = e.state as HistoryState | null;
      if (state?.signupScreen) {
        restoreState(state);
      } else {
        // No signup state — user went back before signup page, let browser handle it
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [restoreState]);

  /* ─── Step config ─── */

  const steps = buildSteps(path, role);
  const totalSteps = steps.length;
  const progress = ((step + 1) / totalSteps) * 100;
  const currentStepLabel = steps[step] ?? "";
  const isLastContentStep = step === totalSteps - 2;
  const isComplete = step === totalSteps - 1;

  /* ─── Helpers ─── */

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const effectiveRole: Role | null = path === "social" ? "건축주-개인" : role;
  const visibleAgreements = getAgreementsForRole(effectiveRole);
  const allRequiredAgreed = visibleAgreements.filter((a) => a.required).every((a) => agreed.has(a.id));
  const allAgreed = visibleAgreements.every((a) => agreed.has(a.id));

  function toggleAllAgreements() {
    if (allAgreed) setAgreed(new Set());
    else setAgreed(new Set(visibleAgreements.map((a) => a.id)));
  }

  const pwValid = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password);
  const pwMatch = password === passwordConfirm && passwordConfirm.length > 0;

  function canNext(): boolean {
    if (currentStepLabel === "본인인증") return identityVerified;
    if (currentStepLabel === "개인/법인 선택") return role !== null;
    if (currentStepLabel === "약관 동의") return allRequiredAgreed;
    if (currentStepLabel === "사업자 인증") return bizParsed;
    if (currentStepLabel === "자격 인증") return true; // optional, always can proceed
    if (currentStepLabel === "계정 정보") return email.trim() !== "" && pwValid && pwMatch;
    if (currentStepLabel === "관심 분야") return selectedUsages.size > 0;
    return true;
  }

  function handleIdentityVerify() {
    setTimeout(() => {
      setVerifiedName("김건축");
      setVerifiedPhone("010-1234-5678");
      setIdentityVerified(true);
    }, 800);
  }

  function handleSocialAuth(provider: "naver" | "kakao") {
    // Redirect to server OAuth endpoint for real social auth
    window.location.href = `/api/auth/oauth/${provider}`;
  }

  function handleBack() {
    window.history.back();
  }

  function handleNext() {
    if (isLastContentStep) {
      // Last content step → call signup API then move to completion
      setSignupError(null);

      if (path === "social" && socialProvider) {
        socialSignupMutation.mutate(
          {
            provider: socialProvider,
            provider_id: socialProvider, // placeholder, real OAuth would provide this
            name: socialName,
            email: socialEmail,
            agreed_marketing: agreed.has("marketing"),
            building_usages: Array.from(selectedUsages),
            regions: Array.from(selectedRegions),
          },
          {
            onSuccess: (data) => {
              setUser(data.user);
              setStep(step + 1);
            },
            onError: (error) => {
              const msg = (error as any)?.response?.data?.error || "회원가입에 실패했습니다";
              setSignupError(msg);
              toast.error("회원가입 실패", { description: msg });
            },
          },
        );
      } else {
        const roleMap: Record<string, "CL-P" | "CL-C" | "PT"> = {
          "건축주-개인": "CL-P",
          "건축주-법인": "CL-C",
          "파트너": "PT",
        };
        signupMutation.mutate(
          {
            email,
            password,
            name: verifiedName,
            phone: verifiedPhone || undefined,
            company: effectiveRole === "파트너" ? bizCompany : (effectiveRole === "건축주-법인" ? company : undefined),
            role: roleMap[effectiveRole ?? "건축주-개인"],
            agreed_marketing: agreed.has("marketing"),
            cert_types: Array.from(selectedCerts),
            building_usages: Array.from(selectedUsages),
            regions: Array.from(selectedRegions),
          },
          {
            onSuccess: (data) => {
              setUser(data.user);
              setStep(step + 1);
            },
            onError: (error) => {
              const msg = (error as any)?.response?.data?.error || "회원가입에 실패했습니다";
              setSignupError(msg);
              toast.error("회원가입 실패", { description: msg });
            },
          },
        );
      }
      return;
    }
    setStep(step + 1);
  }

  function displayName() {
    return path === "social" ? socialName : verifiedName;
  }

  /* ─── Business registration upload ─── */

  function handleBizFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBizFile(file);
    // Mock: simulate OCR/parsing of business registration
    setTimeout(() => {
      setBizCompany("(주)아크 건축사사무소");
      setBizAddress("서울특별시 강남구 테헤란로 123, 4층");
      setBizOwner(verifiedName || "김건축");
      setBizRegNo("123-45-67890");
      setBizParsed(true);
    }, 1000);
  }

  /* ─── License upload ─── */

  function handleLicenseFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseFile(file);
  }

  /* ─── Password strength ─── */

  function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
    if (pw.length === 0) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "약함", color: "bg-red-500" };
    if (score === 2) return { level: 2, label: "보통", color: "bg-amber-500" };
    if (score === 3) return { level: 3, label: "강함", color: "bg-emerald-500" };
    return { level: 4, label: "매우 강함", color: "bg-emerald-600" };
  }

  const pwStrength = getPasswordStrength(password);

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */

  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <Link to="/" className="absolute left-6 top-6 hover:opacity-80 transition-opacity z-10">
        <img src="/logo.svg" alt="콘마켓" className="h-7" />
      </Link>

      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-[520px]">

          {/* ════════════════════════════════════════
             Step 0: Role Group Selection (건축주 vs 파트너)
             ════════════════════════════════════════ */}
          {roleGroup === null && path === null && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">회원가입</h1>
              <p className="text-sm text-muted-foreground mb-8">어떤 역할로 가입하시겠어요?</p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setRoleGroup("건축주")}
                  className="w-full flex items-center gap-4 rounded-2xl p-6 ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5 transition-all text-left"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted shrink-0">
                    <User className="size-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold">건축주로 가입</p>
                    <p className="text-xs text-muted-foreground mt-0.5">건축 프로젝트를 의뢰하고 파트너를 찾아보세요</p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleGroup("파트너");
                    setRole("파트너");
                    setPath("identity");
                    setStep(0);
                  }}
                  className="w-full flex items-center gap-4 rounded-2xl p-6 ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5 transition-all text-left"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted shrink-0">
                    <Briefcase className="size-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold">파트너로 가입</p>
                    <p className="text-xs text-muted-foreground mt-0.5">설계·시공·감리 전문가로 프로젝트에 참여하세요</p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-8">
                이미 계정이 있으신가요?{" "}
                <Link to="/auth/login" className="text-primary hover:underline underline-offset-4 font-medium transition-colors">로그인</Link>
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════
             Step 1: 건축주 Method Choice (소셜 vs 본인인증)
             ════════════════════════════════════════ */}
          {roleGroup === "건축주" && path === null && (
            <div className="animate-fade-up">
              <div className="mb-8">
                <button onClick={() => { setRoleGroup(null); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
                  <ArrowLeft className="size-3" />
                  이전
                </button>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">건축주 가입</h1>
              <p className="text-sm text-muted-foreground mb-8">가입 방법을 선택해 주세요</p>

              <div className="space-y-2.5 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialAuth("naver")}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors bg-[#03C75A] text-white hover:bg-[#02b351]"
                >
                  <NaverIcon className="size-4" />
                  네이버로 간편 가입
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialAuth("kakao")}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00]"
                >
                  <KakaoIcon className="size-4" />
                  카카오로 간편 가입
                </button>
                <p className="text-xs text-muted-foreground text-center pt-1">
                  소셜 간편 가입은 <span className="font-medium text-foreground">건축주 개인</span> 전용입니다
                </p>
              </div>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 py-0.5 text-xs text-muted-foreground">
                  또는
                </span>
              </div>

              <button
                type="button"
                onClick={() => { setPath("identity"); setStep(0); }}
                className="w-full flex items-center gap-4 rounded-2xl px-6 py-5 ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted shrink-0">
                  <ShieldCheck className="size-6 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold">본인인증으로 가입</p>
                  <p className="text-xs text-muted-foreground mt-0.5">개인 또는 법인 건축주로 가입 가능</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 ml-auto" />
              </button>

              <p className="text-center text-sm text-muted-foreground mt-8">
                이미 계정이 있으신가요?{" "}
                <Link to="/auth/login" className="text-primary hover:underline underline-offset-4 font-medium transition-colors">로그인</Link>
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════
             Step-based flow
             ════════════════════════════════════════ */}
          {path !== null && (
            <>
              {/* Progress bar */}
              {!isComplete && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      {step + 1} / {totalSteps - 1} · {currentStepLabel}
                    </p>
                    <button onClick={handleBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="size-3" />
                      이전
                    </button>
                  </div>
                  <div className="h-1 bg-muted rounded-full">
                    <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* ── 본인인증 ── */}
              {currentStepLabel === "본인인증" && (
                <div className="animate-fade-up">
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">본인인증을 진행해 주세요</h1>
                  <p className="text-sm text-muted-foreground mb-8">안전한 서비스 이용을 위해 휴대폰 본인인증이 필요합니다</p>

                  {!identityVerified ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl ring-1 ring-black/[0.08] p-8 text-center">
                        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                          <ShieldCheck className="size-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">휴대폰 본인인증</h3>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          통신사에 등록된 본인 명의 휴대폰으로<br />인증을 진행합니다
                        </p>
                        <Button className="h-12 rounded-xl text-base font-semibold w-full" onClick={handleIdentityVerify}>
                          <ShieldCheck className="size-5 mr-2" />
                          본인인증 시작
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        본인인증 정보는 암호화되어 안전하게 처리되며,<br />중복가입 방지 목적으로만 사용됩니다.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl ring-2 ring-emerald-500/20 bg-emerald-50 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle className="size-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-emerald-900">본인인증 완료</p>
                            <p className="text-sm text-emerald-700">인증 정보가 확인되었습니다</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-3 border-b border-emerald-200/50">
                            <span className="text-sm text-emerald-700">이름</span>
                            <span className="text-sm font-semibold text-emerald-900">{verifiedName}</span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-emerald-700">휴대폰</span>
                            <span className="text-sm font-semibold text-emerald-900">{verifiedPhone}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">인증된 이름과 휴대폰 번호는 변경할 수 없으며, 재인증 시 변경됩니다.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── 개인/법인 선택 (건축주 identity path only) ── */}
              {currentStepLabel === "개인/법인 선택" && (
                <div className="animate-fade-up">
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">건축주 유형을 선택해 주세요</h1>
                  <p className="text-sm text-muted-foreground mb-8">개인 또는 법인에 따라 필요한 정보가 달라집니다</p>

                  <div className="space-y-3">
                    {([
                      { value: "건축주-개인" as Role, icon: User, title: "개인 건축주", desc: "개인 명의로 건축 프로젝트를 의뢰합니다" },
                      { value: "건축주-법인" as Role, icon: Building, title: "법인 건축주", desc: "법인 명의로 프로젝트를 등록하고 관리합니다" },
                    ]).map((item) => {
                      const Icon = item.icon;
                      const isActive = role === item.value;
                      return (
                        <button
                          key={item.value}
                          onClick={() => setRole(item.value)}
                          className={`w-full flex items-center gap-4 rounded-2xl p-6 transition-all text-left ${
                            isActive
                              ? "ring-2 ring-primary bg-primary/[0.03] shadow-sm"
                              : "ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5"
                          }`}
                        >
                          <div className={`flex size-12 items-center justify-center rounded-xl shrink-0 ${
                            isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            <Icon className="size-6" />
                          </div>
                          <div>
                            <p className="text-base font-semibold">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 약관 동의 ── */}
              {currentStepLabel === "약관 동의" && (
                <div className="animate-fade-up">
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">서비스 이용 약관에 동의해 주세요</h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    {path === "social"
                      ? "건축주 서비스 이용을 위해 약관 동의가 필요합니다"
                      : effectiveRole === "파트너"
                        ? "파트너 서비스 이용을 위해 약관 동의가 필요합니다"
                        : "콘마켓 서비스 이용을 위해 약관 동의가 필요합니다"
                    }
                  </p>

                  {path === "social" && socialProvider && (
                    <div className="rounded-xl bg-muted/50 px-5 py-4 mb-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{socialProvider === "naver" ? "네이버" : "카카오"} 계정</span>
                        <span className="text-sm font-medium">{socialEmail}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">이름</span>
                        <span className="text-sm font-medium">{socialName}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={toggleAllAgreements}
                    className={`w-full flex items-center gap-3 rounded-2xl px-5 py-4 mb-4 transition-all ${
                      allAgreed ? "ring-2 ring-primary bg-primary/[0.03]" : "ring-1 ring-black/[0.08] hover:bg-muted/30"
                    }`}
                  >
                    <div className={`flex size-6 items-center justify-center rounded-full transition-colors ${
                      allAgreed ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <CheckCircle className="size-4" />
                    </div>
                    <span className="text-base font-semibold">전체 동의</span>
                  </button>

                  <div className="space-y-1">
                    {visibleAgreements.map((agreement) => {
                      const isChecked = agreed.has(agreement.id);
                      return (
                        <div key={agreement.id} className="flex items-center gap-3 rounded-xl px-5 py-3.5 hover:bg-muted/30 transition-colors">
                          <button
                            onClick={() => toggleSet(setAgreed, agreement.id)}
                            className={`flex size-5 items-center justify-center rounded-full shrink-0 transition-colors ${
                              isChecked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <CheckCircle className="size-3.5" />
                          </button>
                          <span className="flex-1 text-sm">
                            <span className={agreement.required ? "text-primary font-medium mr-1" : "text-muted-foreground mr-1"}>
                              {agreement.required ? "[필수]" : "[선택]"}
                            </span>
                            {agreement.label}
                          </span>
                          {agreement.url && (
                            <Link to={agreement.url} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronRight className="size-4" />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 사업자 인증 (파트너 전용) ── */}
              {currentStepLabel === "사업자 인증" && (
                <div className="animate-fade-up">
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">사업자등록증을 등록해 주세요</h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    사업자등록증을 업로드하면 사업자 정보가 자동으로 입력됩니다
                  </p>

                  {/* File upload */}
                  <input ref={bizFileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleBizFileChange} />

                  {!bizFile ? (
                    <button
                      type="button"
                      onClick={() => bizFileRef.current?.click()}
                      className="w-full rounded-2xl border-2 border-dashed border-black/[0.08] hover:border-primary/30 hover:bg-primary/[0.02] p-10 text-center transition-all group"
                    >
                      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                        <Upload className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-base font-semibold mb-1">사업자등록증 업로드</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (최대 10MB)</p>
                    </button>
                  ) : !bizParsed ? (
                    <div className="rounded-2xl ring-1 ring-black/[0.08] p-8 text-center">
                      <div className="mx-auto mb-4 size-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <p className="text-sm font-medium">사업자등록증을 분석하고 있습니다...</p>
                      <p className="text-xs text-muted-foreground mt-1">{bizFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Uploaded file indicator */}
                      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/50 px-5 py-3">
                        <CheckCircle className="size-5 text-emerald-600 shrink-0" />
                        <span className="flex-1 text-sm font-medium text-emerald-900 truncate">{bizFile.name}</span>
                        <button
                          onClick={() => { setBizFile(null); setBizParsed(false); setBizCompany(""); setBizAddress(""); setBizOwner(""); setBizRegNo(""); }}
                          className="shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      {/* Parsed fields (editable) */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="biz-company">사무소명 (상호)</Label>
                          <Input id="biz-company" value={bizCompany} onChange={(e) => setBizCompany(e.target.value)} className="rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="biz-owner">대표자명</Label>
                          <Input id="biz-owner" value={bizOwner} onChange={(e) => setBizOwner(e.target.value)} className="rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="biz-regno">사업자등록번호</Label>
                          <Input id="biz-regno" value={bizRegNo} onChange={(e) => setBizRegNo(e.target.value)} className="rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="biz-address">사업장 주소</Label>
                          <Input id="biz-address" value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} className="rounded-xl h-11" />
                        </div>
                      </div>

                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <Info className="size-3.5 inline mr-1 -mt-px" />
                          자동 입력된 정보가 실제와 다른 경우 직접 수정할 수 있습니다.
                          사업자등록증은 관리자 심사를 거쳐 승인됩니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 자격 인증 (파트너 전용, 선택) ── */}
              {currentStepLabel === "자격 인증" && (
                <div className="animate-fade-up">
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">자격증을 등록하시겠어요?</h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    자격증을 인증하면 프로필에 인증 뱃지가 표시됩니다
                  </p>

                  {/* License type selection */}
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-semibold">인증할 분야 선택</p>
                    <div className="flex gap-2">
                      {CERT_OPTIONS.map((cert) => (
                        <button
                          key={cert}
                          onClick={() => setLicenseType(licenseType === cert ? null : cert)}
                          className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                            licenseType === cert
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {cert}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File upload */}
                  <input ref={licenseFileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleLicenseFileChange} />

                  {licenseType && !licenseFile && (
                    <button
                      type="button"
                      onClick={() => licenseFileRef.current?.click()}
                      className="w-full rounded-2xl border-2 border-dashed border-black/[0.08] hover:border-primary/30 hover:bg-primary/[0.02] p-8 text-center transition-all group mb-6"
                    >
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                        <Award className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm font-semibold mb-1">{licenseType} 자격증 업로드</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (최대 10MB)</p>
                    </button>
                  )}

                  {licenseFile && (
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/50 px-5 py-3 mb-6">
                      <Award className="size-5 text-emerald-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-900 truncate">{licenseFile.name}</p>
                        <p className="text-xs text-emerald-700">{licenseType} 자격증</p>
                      </div>
                      <button
                        onClick={() => { setLicenseFile(null); setLicenseType(null); }}
                        className="shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}

                  {/* Info notices */}
                  <div className="space-y-3">
                    <div className="rounded-xl bg-blue-50 ring-1 ring-blue-200/50 p-4">
                      <p className="text-xs text-blue-700 leading-relaxed">
                        <Info className="size-3.5 inline mr-1 -mt-px" />
                        지금은 <span className="font-semibold">1개 분야</span>만 인증할 수 있으며,
                        가입 후 마이페이지에서 추가 자격증을 등록할 수 있습니다.
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <Info className="size-3.5 inline mr-1 -mt-px" />
                        자격 인증은 선택사항입니다. 인증 없이도 서비스를 이용할 수 있으며,
                        인증 완료 시 프로필에 <span className="font-medium text-foreground">인증 파트너</span> 뱃지가 표시됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 계정 정보 ── */}
              {currentStepLabel === "계정 정보" && (
                <div className="animate-fade-up">
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">계정 정보를 입력해 주세요</h1>
                  <p className="text-sm text-muted-foreground mb-8">로그인에 사용할 이메일과 비밀번호를 설정하세요</p>

                  <div className="space-y-5">
                    <div className="rounded-xl bg-muted/50 px-5 py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">이름 (본인인증)</span>
                        <span className="text-sm font-medium">{verifiedName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">휴대폰 (본인인증)</span>
                        <span className="text-sm font-medium">{verifiedPhone}</span>
                      </div>
                      {role === "파트너" && bizCompany && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">사무소 (사업자등록증)</span>
                          <span className="text-sm font-medium">{bizCompany}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl h-11" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <Input id="password" type="password" placeholder="8자 이상, 영문·숫자·특수문자 포함" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl h-11" />
                      {password.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${pwStrength.level >= level ? pwStrength.color : "bg-muted"}`} />
                            ))}
                          </div>
                          <p className={`text-xs ${pwStrength.level <= 1 ? "text-red-500" : pwStrength.level === 2 ? "text-amber-500" : "text-emerald-600"}`}>
                            비밀번호 강도: {pwStrength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-confirm">비밀번호 확인</Label>
                      <Input id="password-confirm" type="password" placeholder="비밀번호를 다시 입력하세요" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="rounded-xl h-11" />
                      {passwordConfirm.length > 0 && !pwMatch && (
                        <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다</p>
                      )}
                    </div>

                    {role === "건축주-법인" && (
                      <div className="space-y-2">
                        <Label htmlFor="company">법인명</Label>
                        <Input id="company" placeholder="법인명을 입력하세요" value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-xl h-11" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 관심 분야 ── */}
              {currentStepLabel === "관심 분야" && (
                <div className="animate-fade-up">
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">
                    {effectiveRole === "파트너" ? "전문 분야를 선택해 주세요" : "관심 분야를 알려주세요"}
                  </h1>
                  <p className="text-sm text-muted-foreground mb-8">여러 개를 선택할 수 있어요</p>

                  <div className="space-y-8">
                    {effectiveRole === "파트너" && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="size-4 text-muted-foreground" />
                          <p className="text-sm font-semibold">전문 분야</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {CERT_OPTIONS.map((c) => (
                            <button
                              key={c}
                              onClick={() => toggleSet(setSelectedCerts, c)}
                              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                selectedCerts.has(c) ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

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
                              selectedUsages.has(u) ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

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
                              selectedRegions.has(r) ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
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

              {/* ── 완료 ── */}
              {isComplete && (
                <div className="animate-fade-up text-center">
                  <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle className="size-10 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight mb-2">가입이 완료되었어요!</h1>
                  <p className="text-sm text-muted-foreground mb-1">
                    {displayName() || "회원"}님, 콘마켓에 오신 것을 환영합니다.
                  </p>
                  <p className="text-sm text-muted-foreground mb-10">
                    {effectiveRole === "파트너"
                      ? "프로필을 완성하고 입찰에 참여해 보세요."
                      : "건축 파트너를 찾고 프로젝트를 시작해 보세요."}
                  </p>

                  <div className="space-y-3">
                    <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={() => navigate("/mypage")}>
                      마이페이지로 이동
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl text-base font-semibold" onClick={() => navigate(effectiveRole === "파트너" ? "/bids" : "/partners")}>
                      {effectiveRole === "파트너" ? "입찰 공고 보기" : "건축 파트너 찾기"}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Next / Skip buttons ── */}
              {!isComplete && (
                <div className="mt-10 space-y-3">
                  {signupError && (
                    <p className="text-sm text-destructive mb-2">{signupError}</p>
                  )}
                  <Button
                    className="w-full h-12 rounded-xl text-base font-semibold"
                    disabled={!canNext() || signupMutation.isPending || socialSignupMutation.isPending}
                    onClick={handleNext}
                  >
                    {(signupMutation.isPending || socialSignupMutation.isPending)
                      ? "가입 처리 중..."
                      : isLastContentStep ? "가입 완료" : "계속"}
                    {!signupMutation.isPending && !socialSignupMutation.isPending && <ArrowRight className="size-4 ml-2" />}
                  </Button>

                  {/* Skip button for optional license step */}
                  {currentStepLabel === "자격 인증" && !licenseFile && (
                    <Button
                      variant="ghost"
                      className="w-full h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground"
                      onClick={handleNext}
                    >
                      나중에 등록할게요
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

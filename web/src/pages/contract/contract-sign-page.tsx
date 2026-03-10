import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  Pen,
  Eye,
  ExternalLink,
  Shield,
  Mail,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type SignStatus = "서명대기" | "대기" | "서명완료" | "서명거부";

const STATUS_COLOR: Record<SignStatus, string> = {
  서명대기: "bg-amber-500",
  대기: "bg-muted-foreground/40",
  서명완료: "bg-emerald-500",
  서명거부: "bg-red-500",
};

/* ─── Mock Data ─── */

const CONTRACT = {
  id: "CTR-20260308-0001",
  title: "역삼동 단독주택 신축공사 본설계",
  amount: 42000000,
  partyA: "이건축주",
  partyB: "아크 건축사사무소",
  requestedAt: "2026.03.15",
  deadline: "2026.03.29",
  dDay: 14,
  ucansignDocId: "doc_abc123xyz",
};

const STEPS = [
  { label: "서명 요청", done: true, active: false },
  { label: "을 서명 (건축사)", done: false, active: true },
  { label: "갑 서명 (건축주)", done: false, active: false },
];

const SIGNERS: {
  name: string;
  role: string;
  signingMethod: string;
  status: SignStatus;
  signedAt: string | null;
  contactInfo: string;
}[] = [
  {
    name: "아크 건축사사무소",
    role: "을 (건축사)",
    signingMethod: "카카오 인증",
    status: "서명대기",
    signedAt: null,
    contactInfo: "010-9876-5432",
  },
  {
    name: "이건축주",
    role: "갑 (건축주)",
    signingMethod: "카카오 인증",
    status: "대기",
    signedAt: null,
    contactInfo: "010-1234-5678",
  },
];

// 현재 사용자가 건축주(갑)이고, 을의 서명을 기다리는 상태
const IS_MY_TURN = false;
const CURRENT_USER_ROLE = "건축주";

/* ─── Helpers ─── */

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

/* ─── Page ─── */

export default function ContractSignPage() {
  const { id } = useParams();

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[760px] px-6">
        {/* Back */}
        <div className="pt-6 pb-6">
          <Link
            to="/mypage"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            마이페이지
          </Link>
        </div>

        {/* Title */}
        <div className="pb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold tracking-tight">전자서명</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
              <span className="size-1.5 rounded-full bg-amber-500" />
              서명 대기중
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{CONTRACT.id}</p>
        </div>

        {/* UCanSign 안내 */}
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-violet-500/[0.05] p-4 ring-1 ring-violet-500/20">
          <Shield className="size-5 text-violet-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">유캔사인(UCanSign) 전자서명</p>
            <p className="text-xs text-muted-foreground">법적 효력이 있는 전자서명 서비스를 통해 계약이 진행됩니다.</p>
          </div>
        </div>

        {/* 1. 계약 요약 */}
        <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6 mb-5">
          <h2 className="text-base font-semibold mb-4">계약 요약</h2>
          <p className="text-sm text-muted-foreground mb-1">공사명</p>
          <p className="text-sm font-medium mb-4">{CONTRACT.title}</p>
          <p className="text-sm text-muted-foreground mb-1">계약 금액</p>
          <p className="text-2xl font-bold tracking-tight mb-5">₩{formatNumber(CONTRACT.amount)}</p>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm text-muted-foreground">갑 (건축주)</p>
              <p className="text-sm font-medium">{CONTRACT.partyA}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">을 (건축사)</p>
              <p className="text-sm font-medium">{CONTRACT.partyB}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">서명 요청일</p>
              <p className="text-sm font-medium">{CONTRACT.requestedAt}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">서명 기한</p>
              <p className="text-sm font-medium flex items-center gap-2">
                {CONTRACT.deadline}
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                  D-{CONTRACT.dDay}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* 2. 서명 진행 스텝퍼 */}
        <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6 mb-5">
          <h2 className="text-base font-semibold mb-6">서명 진행 현황</h2>
          <div className="flex items-center">
            {STEPS.map((step, idx) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${
                      step.done
                        ? "bg-primary"
                        : step.active
                          ? "ring-2 ring-primary bg-background animate-pulse"
                          : "bg-muted"
                    }`}
                  >
                    {step.done ? (
                      <Check className="size-5 text-primary-foreground" />
                    ) : step.active ? (
                      <Pen className="size-4 text-primary" />
                    ) : (
                      <Clock className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center whitespace-nowrap ${
                    step.done || step.active ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-3 mb-6 ${step.done ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. 서명 상세 테이블 */}
        <section className="mb-5">
          <h2 className="text-base font-semibold mb-4">서명자 정보</h2>
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.08]">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground bg-muted/50">
              <span>서명자</span>
              <span>역할</span>
              <span>인증 방식</span>
              <span>상태</span>
              <span>서명일시</span>
            </div>
            {/* Rows */}
            {SIGNERS.map((signer, idx) => (
              <div
                key={signer.name}
                className={`grid grid-cols-5 gap-4 px-5 py-4 text-sm ${idx % 2 === 1 ? "bg-muted/30" : ""}`}
              >
                <div>
                  <span className="font-medium">{signer.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{signer.contactInfo}</p>
                </div>
                <span className="text-muted-foreground self-center">{signer.role}</span>
                <span className="self-center flex items-center gap-1.5 text-xs">
                  <Mail className="size-3.5 text-muted-foreground" />
                  {signer.signingMethod}
                </span>
                <span className="flex items-center gap-1.5 self-center">
                  <span className={`size-1.5 rounded-full ${STATUS_COLOR[signer.status]}`} />
                  {signer.status}
                </span>
                <span className="text-muted-foreground self-center">{signer.signedAt || "—"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 전자서명 액션 */}
        <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6 mb-5">
          <h2 className="text-base font-semibold mb-4">전자서명</h2>

          <p className="text-sm text-muted-foreground mb-6">
            {IS_MY_TURN
              ? "유캔사인에서 계약서를 확인하고 전자서명을 진행해주세요."
              : "건축사(을)의 서명을 기다리고 있습니다. 서명 완료 시 알림을 받으실 수 있습니다."}
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl text-base font-semibold"
              asChild
            >
              <Link to={`/contracts/${id || CONTRACT.id}`}>
                <Eye className="size-4 mr-2" />
                계약서 미리보기
              </Link>
            </Button>

            {IS_MY_TURN ? (
              <Button className="w-full h-12 rounded-xl text-base font-semibold bg-violet-600 hover:bg-violet-700">
                <ExternalLink className="size-4 mr-2" />
                유캔사인에서 서명하기
              </Button>
            ) : (
              <Button className="w-full h-12 rounded-xl text-base font-semibold" disabled>
                <Clock className="size-4 mr-2" />
                상대방 서명 대기 중
              </Button>
            )}
          </div>

          {/* 재발송 / 서명 거부 */}
          <Separator className="my-5" />

          <div className="flex items-center justify-between">
            {CURRENT_USER_ROLE === "건축주" && (
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="size-3.5" />
                서명 재요청 발송
              </button>
            )}
            {IS_MY_TURN && (
              <button className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors ml-auto">
                <X className="size-3.5" />
                서명 거부
              </button>
            )}
          </div>
        </section>

        {/* UCanSign 플로우 설명 */}
        <section className="rounded-2xl bg-muted/50 p-6 mb-16">
          <h3 className="text-sm font-semibold mb-3">유캔사인 전자서명 절차</h3>
          <div className="space-y-2">
            {[
              { step: "1", text: "서명 요청 시 유캔사인에 계약서 문서가 자동 생성됩니다." },
              { step: "2", text: "을(건축사)에게 카카오/이메일로 서명 안내가 발송됩니다." },
              { step: "3", text: "을 서명 완료 후, 갑(건축주)에게 서명 안내가 발송됩니다." },
              { step: "4", text: "양측 서명 완료 시 계약이 자동 체결되고 PDF가 생성됩니다." },
              { step: "!", text: "서명 기한(14일) 초과 또는 거부 시 계약서를 수정하여 재요청할 수 있습니다." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  item.step === "!" ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"
                }`}>
                  {item.step}
                </span>
                <p className="text-sm text-muted-foreground leading-[1.5]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

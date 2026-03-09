import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  Pen,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type SignStatus = "서명대기" | "대기" | "서명완료" | "서명거부";

const STATUS_DOT_COLOR: Record<SignStatus, string> = {
  서명대기: "bg-amber-500",
  대기: "bg-muted-foreground/40",
  서명완료: "bg-emerald-500",
  서명거부: "bg-red-500",
};

/* ─── Mock Data ─── */

const CONTRACT = {
  id: 1,
  title: "역삼동 단독주택 본설계",
  amount: "42,000,000원",
  partyA: "이건축주",
  partyB: "아크 건축사사무소",
  requestedAt: "2026.03.08",
  deadline: "2026.03.22",
  dDay: 14,
};

const STEPS = [
  { label: "서명요청", done: true, active: false },
  { label: "을 서명(건축사)", done: false, active: true },
  { label: "갑 서명(건축주)", done: false, active: false },
];

const SIGNERS: {
  name: string;
  role: string;
  status: SignStatus;
  signedAt: string | null;
}[] = [
  { name: "아크 건축사사무소", role: "을(건축사)", status: "서명대기", signedAt: null },
  { name: "이건축주", role: "갑(건축주)", status: "대기", signedAt: null },
];

// Mock: currently viewed as 건축주 (갑), waiting for 을's signature
const IS_MY_TURN = false;

/* ─── Page ─── */

export default function ContractSignPage() {
  const { contractId } = useParams();

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[760px] px-6">
        {/* ── Back link ── */}
        <div className="pt-6 pb-6">
          <Link
            to="/mypage"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            마이페이지
          </Link>
        </div>

        {/* ── Title + status badge ── */}
        <div className="pb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold tracking-tight">전자서명</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
              <span className="size-1.5 rounded-full bg-amber-500" />
              서명 대기중
            </span>
          </div>
        </div>

        {/* ── 1. 계약 요약 카드 ── */}
        <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6 mb-5">
          <h2 className="text-base font-semibold mb-4">계약 요약</h2>
          <p className="text-sm text-muted-foreground mb-1">공고명</p>
          <p className="text-sm font-medium mb-4">{CONTRACT.title}</p>
          <p className="text-sm text-muted-foreground mb-1">계약금액</p>
          <p className="text-2xl font-bold tracking-tight mb-5">{CONTRACT.amount}</p>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm text-muted-foreground">갑(건축주)</p>
              <p className="text-sm font-medium">{CONTRACT.partyA}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">을(건축사)</p>
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

        {/* ── 2. 서명 진행 스테퍼 ── */}
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
                  <span
                    className={`text-xs font-medium text-center whitespace-nowrap ${
                      step.done || step.active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-3 mb-6 ${
                      step.done ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. 서명 상세 정보 (borderless striped table) ── */}
        <section className="mb-5">
          <h2 className="text-base font-semibold mb-4">서명 상세 정보</h2>

          <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.08]">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground bg-muted/50">
              <span>서명자</span>
              <span>역할</span>
              <span>상태</span>
              <span>서명일시</span>
            </div>

            {/* Rows */}
            {SIGNERS.map((signer, idx) => (
              <div
                key={signer.name}
                className={`grid grid-cols-4 gap-4 px-5 py-4 text-sm ${
                  idx % 2 === 1 ? "bg-muted/30" : ""
                }`}
              >
                <span className="font-medium">{signer.name}</span>
                <span className="text-muted-foreground">{signer.role}</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${STATUS_DOT_COLOR[signer.status]}`}
                  />
                  {signer.status}
                </span>
                <span className="text-muted-foreground">{signer.signedAt || "—"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. 서명 액션 영역 ── */}
        <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6 mb-16">
          <h2 className="text-base font-semibold mb-4">전자서명</h2>

          <p className="text-sm text-muted-foreground mb-6">
            {IS_MY_TURN
              ? "계약서를 확인하고 전자서명을 진행해주세요."
              : "건축사(을)의 서명을 기다리고 있습니다."}
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl text-base font-semibold"
              asChild
            >
              <Link to={`/contracts/${contractId || CONTRACT.id}`}>
                <Eye className="size-4 mr-2" />
                계약서 미리보기
              </Link>
            </Button>

            <Button
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={!IS_MY_TURN}
            >
              <Pen className="size-4 mr-2" />
              전자서명 진행
            </Button>
          </div>

          {IS_MY_TURN && (
            <>
              <Separator className="my-5" />
              <div className="text-center">
                <button className="text-sm text-red-500 hover:text-red-600 transition-colors">
                  서명 거부
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

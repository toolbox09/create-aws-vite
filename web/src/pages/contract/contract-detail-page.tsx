import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  Users,
  FileText,
  Download,
  MessageCircle,
  CheckCircle,
  Clock,
  Pen,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type ContractStatus = "협의중" | "계약진행중" | "계약완료" | "시공중" | "완료";

const STATUS_DOT: Record<ContractStatus, { color: string; pulse: boolean }> = {
  협의중: { color: "bg-amber-500", pulse: true },
  계약진행중: { color: "bg-primary", pulse: true },
  계약완료: { color: "bg-blue-500", pulse: false },
  시공중: { color: "bg-emerald-500", pulse: true },
  완료: { color: "bg-muted-foreground/50", pulse: false },
};

/* ─── Mock Data ─── */

const CONTRACT = {
  id: 1,
  title: "판교 단독주택 설계 계약",
  status: "계약진행중" as ContractStatus,
  createdAt: "2025.02.15",
  signedAt: null as string | null,
  startDate: "2025.03.01",
  endDate: "2025.09.30",
  amount: 4500,
  deposit: 1500,
  midPayment: 1500,
  finalPayment: 1500,
  scope: "설계",
  address: "경기도 성남시 분당구 판교동 123-4",
  usage: "단독주택",
  scale: "지상 3층",
  area: "264m²",
  description: "판교 소재 단독주택 설계 용역 계약입니다. 기본설계, 실시설계, 인허가 대행을 포함하며, 착공 전 설계 변경 1회를 포함합니다.",
};

const PARTNER = {
  name: "아크 건축사사무소",
  ceo: "김건축",
  profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  phone: "02-1234-5678",
  rating: 4.8,
  reviewCount: 23,
};

const CLIENT = {
  name: "이건축주",
  phone: "010-1234-5678",
  profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
};

const TIMELINE = [
  { step: "계약 요청", date: "2025.02.15", done: true },
  { step: "계약서 검토", date: "2025.02.18", done: true },
  { step: "계약금 입금", date: "2025.02.20", done: true },
  { step: "전자서명", date: null as string | null, done: false },
  { step: "계약 체결", date: null as string | null, done: false },
];

const DOCUMENTS = [
  { name: "설계 용역 계약서.pdf", size: "2.4 MB", date: "2025.02.18" },
  { name: "설계 범위 명세서.pdf", size: "1.1 MB", date: "2025.02.18" },
  { name: "사업자등록증.pdf", size: "0.5 MB", date: "2025.02.15" },
];

const PAYMENT_SCHEDULE = [
  { label: "계약금 (착수 시)", amount: CONTRACT.deposit, status: "완료" as const, date: "2025.02.20" },
  { label: "중도금 (기본설계 완료)", amount: CONTRACT.midPayment, status: "예정" as const, date: "2025.06.15" },
  { label: "잔금 (실시설계 완료)", amount: CONTRACT.finalPayment, status: "예정" as const, date: "2025.09.30" },
];

const TERMS = [
  "계약 해지 시 진행 단계에 따른 정산이 이루어집니다.",
  "설계 변경은 1회 무상, 이후 추가 비용이 발생합니다.",
  "인허가 관련 관공서 수수료는 별도입니다.",
  "천재지변 등 불가항력 사유 시 공기 연장이 가능합니다.",
  "분쟁 발생 시 대한상사중재원의 중재에 따릅니다.",
];

/* ─── Page ─── */

export default function ContractDetailPage() {
  const dot = STATUS_DOT[CONTRACT.status];
  const completedSteps = TIMELINE.filter((t) => t.done).length;
  const progress = (completedSteps / TIMELINE.length) * 100;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        {/* ── Breadcrumb ── */}
        <div className="pt-6 pb-6">
          <Link
            to="/mypage"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            마이페이지
          </Link>
        </div>

        {/* ── Title bar ── */}
        <div className="pb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`size-2.5 rounded-full ${dot.color} ${dot.pulse ? "animate-pulse" : ""}`} />
            <span className="text-sm font-medium text-muted-foreground">{CONTRACT.status}</span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight">{CONTRACT.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {CONTRACT.createdAt} 생성 · {CONTRACT.scope} · {CONTRACT.usage}
          </p>
        </div>

        {/* ── 2-column layout ── */}
        <div className="flex gap-12 pb-16">
          {/* ── Left column ── */}
          <div className="min-w-0 flex-1">
            {/* Progress timeline */}
            <section>
              <h2 className="text-base font-semibold mb-4">계약 진행 현황</h2>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedSteps} / {TIMELINE.length} 단계 완료
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-0">
                {TIMELINE.map((t, idx) => (
                  <div key={t.step} className="flex items-start gap-4 relative">
                    {/* Vertical line */}
                    {idx < TIMELINE.length - 1 && (
                      <div className={`absolute left-[11px] top-7 w-0.5 h-[calc(100%)] ${
                        t.done ? "bg-primary/30" : "bg-muted"
                      }`} />
                    )}
                    <div className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${
                      t.done ? "bg-primary" : "bg-muted"
                    }`}>
                      {t.done ? (
                        <CheckCircle className="size-4 text-primary-foreground" />
                      ) : (
                        <Clock className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${t.done ? "" : "text-muted-foreground"}`}>
                        {t.step}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.date || "대기 중"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-6" />

            {/* Parties */}
            <section>
              <h2 className="text-base font-semibold mb-5">계약 당사자</h2>
              <div className="grid grid-cols-2 gap-5">
                {/* Client */}
                <div className="rounded-2xl ring-1 ring-black/[0.08] p-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    건축주 (갑)
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={CLIENT.profileImage} alt={CLIENT.name} className="size-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{CLIENT.name}</p>
                      <p className="text-xs text-muted-foreground">{CLIENT.phone}</p>
                    </div>
                  </div>
                </div>
                {/* Partner */}
                <div className="rounded-2xl ring-1 ring-black/[0.08] p-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    파트너 (을)
                  </p>
                  <Link to="/partners/1" className="flex items-center gap-3 group">
                    <img src={PARTNER.profileImage} alt={PARTNER.name} className="size-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold group-hover:underline">{PARTNER.name}</p>
                      <p className="text-xs text-muted-foreground">{PARTNER.ceo} 대표</p>
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Project info (icon grid) */}
            <section>
              <h2 className="text-base font-semibold mb-5">프로젝트 정보</h2>
              <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                {[
                  { icon: MapPin, label: "소재지", value: CONTRACT.address },
                  { icon: Building, label: "건축 용도", value: CONTRACT.usage },
                  { icon: Users, label: "규모", value: `${CONTRACT.scale} / ${CONTRACT.area}` },
                  { icon: Calendar, label: "계약 기간", value: `${CONTRACT.startDate} ~ ${CONTRACT.endDate}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <Icon className="size-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-sm text-muted-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-[1.7]">
                {CONTRACT.description}
              </p>
            </section>

            <Separator className="my-6" />

            {/* Payment schedule */}
            <section>
              <h2 className="text-base font-semibold mb-5">대금 지급 일정</h2>
              <div className="space-y-0">
                {PAYMENT_SCHEDULE.map((p, idx) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-2 rounded-full ${
                          p.status === "완료" ? "bg-emerald-500" : "bg-muted-foreground/30"
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tracking-tight">
                          {p.amount.toLocaleString()}
                          <span className="text-xs font-normal text-muted-foreground ml-0.5">만원</span>
                        </p>
                        <p className={`text-[11px] font-medium ${
                          p.status === "완료" ? "text-emerald-600" : "text-muted-foreground"
                        }`}>
                          {p.status}
                        </p>
                      </div>
                    </div>
                    {idx < PAYMENT_SCHEDULE.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-6" />

            {/* Documents */}
            <section>
              <h2 className="text-base font-semibold mb-5">첨부 서류</h2>
              <div className="space-y-0">
                {DOCUMENTS.map((doc, idx) => (
                  <div key={doc.name}>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size} · {doc.date}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Download className="size-4" />
                      </button>
                    </div>
                    {idx < DOCUMENTS.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-6" />

            {/* Terms */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <AlertCircle className="size-5 text-muted-foreground" />
                <h2 className="text-base font-semibold">알아두어야 할 사항</h2>
              </div>
              <div className="space-y-3">
                {TERMS.map((term) => (
                  <div key={term} className="flex items-start gap-3">
                    <div className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0 mt-2" />
                    <p className="text-sm text-muted-foreground leading-[1.6]">{term}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right sticky card ── */}
          <div className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-20 space-y-5">
              {/* Amount card */}
              <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-6">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  계약 총액
                </p>
                <p className="text-[28px] font-bold tracking-tight">
                  {CONTRACT.amount.toLocaleString()}
                  <span className="text-base font-normal text-muted-foreground ml-1">만원</span>
                </p>

                <Separator className="my-5" />

                {/* Payment breakdown */}
                <div className="space-y-3 mb-6">
                  {PAYMENT_SCHEDULE.map((p) => (
                    <div key={p.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{p.label.split("(")[0].trim()}</span>
                      <span className="font-medium">{p.amount.toLocaleString()}만원</span>
                    </div>
                  ))}
                </div>

                <Separator className="mb-5" />

                {/* Status info */}
                <div className="flex items-center gap-2.5 mb-5 p-3 rounded-xl bg-primary/[0.05]">
                  <Shield className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">안전 거래 보호</p>
                    <p className="text-xs text-muted-foreground">콘마켓이 계약 이행을 보증합니다</p>
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full h-12 rounded-xl text-base font-semibold mb-3">
                  <Pen className="size-4 mr-2" />
                  전자서명 하기
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                >
                  <MessageCircle className="size-4 mr-2" />
                  파트너에게 메시지
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                  문제 신고하기
                </p>
              </div>

              {/* Partner mini card */}
              <Link
                to="/partners/1"
                className="block rounded-2xl ring-1 ring-black/[0.08] p-5 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={PARTNER.profileImage}
                    alt={PARTNER.name}
                    className="size-12 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{PARTNER.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {PARTNER.ceo} 대표 · ★ {PARTNER.rating} ({PARTNER.reviewCount})
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

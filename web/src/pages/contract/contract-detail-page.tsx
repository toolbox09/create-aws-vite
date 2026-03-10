import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  FileText,
  Download,
  MessageCircle,
  CheckCircle,
  Clock,
  Pen,
  Shield,
  AlertCircle,
  History,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type ContractStatus = "요청" | "수락" | "편집중" | "편집완료" | "서명요청" | "서명진행" | "체결" | "거부" | "만료";

const STATUS_CONFIG: Record<ContractStatus, { color: string; pulse: boolean; label: string }> = {
  요청: { color: "bg-amber-500", pulse: true, label: "계약 요청" },
  수락: { color: "bg-blue-500", pulse: false, label: "요청 수락" },
  편집중: { color: "bg-primary", pulse: true, label: "계약서 편집 중" },
  편집완료: { color: "bg-emerald-500", pulse: false, label: "편집 완료" },
  서명요청: { color: "bg-violet-500", pulse: true, label: "서명 요청됨" },
  서명진행: { color: "bg-violet-500", pulse: true, label: "서명 진행 중" },
  체결: { color: "bg-emerald-500", pulse: false, label: "계약 체결" },
  거부: { color: "bg-red-500", pulse: false, label: "서명 거부" },
  만료: { color: "bg-zinc-400", pulse: false, label: "서명 만료" },
};

/* ─── Mock Data ─── */

const CONTRACT = {
  id: "CTR-20260308-0001",
  status: "편집중" as ContractStatus,
  isEditable: true,
  title: "역삼동 단독주택 신축공사 본설계",
  buildingName: "역삼동 단독주택 신축공사",
  address: "서울 강남구 역삼동 123-4",
  usage: "단독주택",
  structure: "철근콘크리트구조",
  floors: "지하 1층, 지상 3층",
  constructionType: "신축",
  landArea: "198 m² (59.9평)",
  buildingCoverageArea: "118.8 m² (35.9평)",
  totalFloorArea: "356.4 m² (107.8평)",
  contractedArea: "356.4 m² (107.8평)",
  contractAmount: 42000000,
  contractDate: "2026.03.15",
  paymentPeriod: "성과품 수령 후 14일 이내",
  createdAt: "2026.03.08",
  lastModifiedBy: "이건축주",
  lastModifiedAt: "2026.03.10 14:30",
};

const PARTNER = {
  name: "아크 건축사사무소",
  ceo: "김건축",
  regNumber: "제2014-123호",
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
  { step: "계약 요청", date: "2026.03.08", done: true },
  { step: "건축사 수락", date: "2026.03.09", done: true },
  { step: "계약서 편집", date: "2026.03.10", done: false, active: true },
  { step: "편집 완료", date: null as string | null, done: false },
  { step: "서명 요청 (UCanSign)", date: null as string | null, done: false },
  { step: "을 서명 (건축사)", date: null as string | null, done: false },
  { step: "갑 서명 (건축주)", date: null as string | null, done: false },
  { step: "계약 체결", date: null as string | null, done: false },
];

const PAYMENTS = [
  { condition: "기본설계", rate: 20, amount: 8400000, dueDate: "2026.05.01", status: "대기" as const },
  { condition: "실시설계", rate: 30, amount: 12600000, dueDate: "2026.07.01", status: "대기" as const },
  { condition: "인허가", rate: 30, amount: 12600000, dueDate: "2026.09.01", status: "대기" as const },
  { condition: "준공", rate: 20, amount: 8400000, dueDate: "2026.11.01", status: "대기" as const },
];

const DESIGN_DOCS = [
  { category: "설계도", spec: "A3", quantity: "2부" },
  { category: "구조계산서", spec: "A4", quantity: "2부" },
  { category: "투시도", spec: "A2", quantity: "1부" },
];

const DOCUMENTS = [
  { name: "건축설계 표준계약서 (초안).pdf", size: "2.4 MB", date: "2026.03.10" },
  { name: "사업자등록증.pdf", size: "0.5 MB", date: "2026.03.08" },
];

const FIELD_CHANGES = [
  { field: "계약 금액", changedBy: "이건축주", role: "건축주", date: "03.10 14:30" },
  { field: "기성 일정 (실시설계)", changedBy: "아크 건축사사무소", role: "건축사", date: "03.09 16:20" },
  { field: "특약사항", changedBy: "이건축주", role: "건축주", date: "03.09 11:00" },
];

/* ─── Helpers ─── */

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

/* ─── Page ─── */

export default function ContractDetailPage() {
  const statusCfg = STATUS_CONFIG[CONTRACT.status];
  const completedSteps = TIMELINE.filter((t) => t.done).length;
  const progress = (completedSteps / TIMELINE.length) * 100;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        {/* Breadcrumb */}
        <div className="pt-6 pb-6">
          <Link to="/mypage" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="size-4" />
            마이페이지
          </Link>
        </div>

        {/* Title */}
        <div className="pb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`size-2.5 rounded-full ${statusCfg.color} ${statusCfg.pulse ? "animate-pulse" : ""}`} />
            <span className="text-sm font-medium text-muted-foreground">{statusCfg.label}</span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight">{CONTRACT.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {CONTRACT.id} · {CONTRACT.createdAt} 생성 · {CONTRACT.constructionType}
          </p>
        </div>

        {/* 2-column */}
        <div className="flex gap-12 pb-16">

          {/* ── Left column ── */}
          <div className="min-w-0 flex-1">

            {/* 편집 상태 배너 */}
            {CONTRACT.isEditable && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/[0.05] p-4 ring-1 ring-primary/20">
                <Eye className="size-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">양측 편집 모드</p>
                  <p className="text-xs text-muted-foreground">
                    마지막 수정: {CONTRACT.lastModifiedBy} · {CONTRACT.lastModifiedAt}
                  </p>
                </div>
                <Link to={`/contracts/${CONTRACT.id}/edit`}>
                  <Button size="sm" className="rounded-lg gap-1.5 h-8">
                    <Pen className="size-3.5" />
                    편집
                  </Button>
                </Link>
              </div>
            )}

            {/* Progress timeline */}
            <section>
              <h2 className="text-base font-semibold mb-4">계약 진행 현황</h2>
              <div className="mb-5">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{completedSteps} / {TIMELINE.length} 단계 완료</p>
              </div>
              <div className="space-y-0">
                {TIMELINE.map((t, idx) => (
                  <div key={t.step} className="flex items-start gap-4 relative">
                    {idx < TIMELINE.length - 1 && (
                      <div className={`absolute left-[11px] top-7 w-0.5 h-[calc(100%)] ${t.done ? "bg-primary/30" : "bg-muted"}`} />
                    )}
                    <div className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${
                      t.done ? "bg-primary" : (t as { active?: boolean }).active ? "ring-2 ring-primary bg-background" : "bg-muted"
                    }`}>
                      {t.done ? (
                        <CheckCircle className="size-4 text-primary-foreground" />
                      ) : (t as { active?: boolean }).active ? (
                        <Pen className="size-3 text-primary" />
                      ) : (
                        <Clock className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${t.done || (t as { active?: boolean }).active ? "" : "text-muted-foreground"}`}>{t.step}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.date || "대기 중"}</p>
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
                <div className="rounded-2xl ring-1 ring-black/[0.08] p-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">건축주 (갑)</p>
                  <div className="flex items-center gap-3">
                    <img src={CLIENT.profileImage} alt={CLIENT.name} className="size-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{CLIENT.name}</p>
                      <p className="text-xs text-muted-foreground">{CLIENT.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl ring-1 ring-black/[0.08] p-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">건축사 (을)</p>
                  <Link to="/partners/1" className="flex items-center gap-3 group">
                    <img src={PARTNER.profileImage} alt={PARTNER.name} className="size-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold group-hover:underline">{PARTNER.name}</p>
                      <p className="text-xs text-muted-foreground">{PARTNER.ceo} 대표 · {PARTNER.regNumber}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Building info */}
            <section>
              <h2 className="text-base font-semibold mb-5">건축물 개요</h2>
              <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                {[
                  { icon: MapPin, label: "대지위치", value: CONTRACT.address },
                  { icon: Building, label: "건축물용도", value: CONTRACT.usage },
                  { label: "건축물구조", value: CONTRACT.structure },
                  { label: "층수", value: CONTRACT.floors },
                  { label: "공사유형", value: CONTRACT.constructionType },
                  { label: "대지면적", value: CONTRACT.landArea },
                  { label: "건축면적", value: CONTRACT.buildingCoverageArea },
                  { label: "연면적", value: CONTRACT.totalFloorArea },
                  { label: "계약면적", value: CONTRACT.contractedArea },
                  { icon: Calendar, label: "계약일", value: CONTRACT.contractDate },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    {Icon ? <Icon className="size-5 shrink-0 text-muted-foreground mt-0.5" /> : <div className="size-5 shrink-0" />}
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-6" />

            {/* Payment schedule */}
            <section>
              <h2 className="text-base font-semibold mb-5">기성 지불 일정</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3 pr-3 font-medium">기성</th>
                      <th className="py-3 pr-3 font-medium w-20 text-right">기성율</th>
                      <th className="py-3 pr-3 font-medium w-32 text-right">금액</th>
                      <th className="py-3 font-medium w-28">지급예정일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAYMENTS.map((p, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                        <td className="py-3 pr-3 font-medium">{p.condition}</td>
                        <td className="py-3 pr-3 text-right tabular-nums">{p.rate}%</td>
                        <td className="py-3 pr-3 text-right tabular-nums font-medium">₩{formatNumber(p.amount)}</td>
                        <td className="py-3 text-muted-foreground">{p.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-semibold">
                      <td className="py-3 pr-3">합계</td>
                      <td className="py-3 pr-3 text-right">{PAYMENTS.reduce((s, p) => s + p.rate, 0)}%</td>
                      <td className="py-3 pr-3 text-right tabular-nums">₩{formatNumber(PAYMENTS.reduce((s, p) => s + p.amount, 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Design documents */}
            <section>
              <h2 className="text-base font-semibold mb-5">설계 도서</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3 pr-3 font-medium">분류</th>
                      <th className="py-3 pr-3 font-medium w-24">규격</th>
                      <th className="py-3 font-medium w-20">수량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DESIGN_DOCS.map((d, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                        <td className="py-3 pr-3 font-medium">{d.category}</td>
                        <td className="py-3 pr-3">{d.spec}</td>
                        <td className="py-3">{d.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Attached docs */}
            <section>
              <h2 className="text-base font-semibold mb-5">첨부 서류</h2>
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
            </section>

            <Separator className="my-6" />

            {/* Recent changes */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <History className="size-5 text-muted-foreground" />
                <h2 className="text-base font-semibold">최근 변경 이력</h2>
              </div>
              <div className="space-y-3">
                {FIELD_CHANGES.map((c) => (
                  <div key={c.field + c.date} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        c.role === "건축주" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {c.role}
                      </span>
                      <span className="text-sm">{c.changedBy}님이 <span className="font-medium">{c.field}</span>을 수정</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{c.date}</span>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-6" />

            {/* Terms */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <AlertCircle className="size-5 text-muted-foreground" />
                <h2 className="text-base font-semibold">유의사항</h2>
              </div>
              <div className="space-y-3">
                {[
                  "계약 해지 시 진행 단계에 따른 정산이 이루어집니다.",
                  "설계 변경은 특약에 명시된 횟수까지 무상이며, 이후 추가 비용이 발생합니다.",
                  "인허가 관련 관공서 수수료는 별도입니다.",
                  "전자서명은 유캔사인(UCanSign) 서비스를 통해 진행됩니다.",
                  "서명 기한은 요청일로부터 14일이며, 초과 시 자동 만료됩니다.",
                ].map((term) => (
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
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">계약 총액</p>
                <p className="text-[28px] font-bold tracking-tight">
                  ₩{formatNumber(CONTRACT.contractAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">대금 지급: {CONTRACT.paymentPeriod}</p>

                <Separator className="my-5" />

                {/* Payment breakdown */}
                <div className="space-y-3 mb-6">
                  {PAYMENTS.map((p) => (
                    <div key={p.condition} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{p.condition} ({p.rate}%)</span>
                      <span className="font-medium tabular-nums">₩{formatNumber(p.amount)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="mb-5" />

                {/* UCanSign info */}
                <div className="flex items-center gap-2.5 mb-5 p-3 rounded-xl bg-violet-500/[0.05] ring-1 ring-violet-500/20">
                  <Shield className="size-5 text-violet-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">유캔사인 전자서명</p>
                    <p className="text-xs text-muted-foreground">법적 효력이 있는 전자계약</p>
                  </div>
                </div>

                {/* CTAs */}
                {CONTRACT.isEditable ? (
                  <>
                    <Link to={`/contracts/${CONTRACT.id}/edit`} className="block mb-3">
                      <Button className="w-full h-12 rounded-xl text-base font-semibold">
                        <Pen className="size-4 mr-2" />
                        계약서 편집
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full h-12 rounded-xl text-base font-semibold">
                      <MessageCircle className="size-4 mr-2" />
                      파트너에게 메시지
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to={`/contracts/${CONTRACT.id}/sign`} className="block mb-3">
                      <Button className="w-full h-12 rounded-xl text-base font-semibold">
                        <ExternalLink className="size-4 mr-2" />
                        전자서명 하기
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full h-12 rounded-xl text-base font-semibold">
                      <MessageCircle className="size-4 mr-2" />
                      파트너에게 메시지
                    </Button>
                  </>
                )}

                <p className="mt-4 text-center text-xs text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                  문제 신고하기
                </p>
              </div>

              {/* Partner mini card */}
              <Link to="/partners/1" className="block rounded-2xl ring-1 ring-black/[0.08] p-5 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <img src={PARTNER.profileImage} alt={PARTNER.name} className="size-12 rounded-full object-cover" />
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

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  MapPin,
  Building,
  Phone,
  Layers,
  Ruler,
  MessageSquare,
} from "lucide-react";
import SiteHeader from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ─── Types ─── */

type ProjectStatus = "진행중" | "완료";

interface Milestone {
  label: string;
  percentage: number;
  date: string | null;
  amount: string | null;
  state: "completed" | "current" | "pending";
}

interface Deliverable {
  name: string;
  date: string;
}

/* ─── Mock Data ─── */

const PROJECT = {
  id: 1,
  title: "역삼동 단독주택 설계",
  status: "진행중" as ProjectStatus,
  contract: {
    amount: "120,000,000원",
    date: "2026.01.15",
    status: "계약 체결 완료",
  },
  building: {
    name: "역삼 하우스",
    address: "서울특별시 강남구 역삼동 123-45",
    usage: "단독주택",
    area: "264m²",
    structure: "철근콘크리트조",
    floors: "지하 1층 / 지상 3층",
  },
  partner: {
    company: "아크 건축사사무소",
    ceo: "김건축",
    phone: "02-1234-5678",
  },
  review: null as {
    keywords: string[];
    text: string;
  } | null,
};

const MILESTONES: Milestone[] = [
  { label: "계약 체결", percentage: 10, date: "2026.01.15", amount: "12,000,000원", state: "completed" },
  { label: "설계 심의", percentage: 10, date: "2026.02.10", amount: "12,000,000원", state: "completed" },
  { label: "건축 허가", percentage: 50, date: null, amount: "60,000,000원", state: "current" },
  { label: "실시 설계", percentage: 20, date: null, amount: "24,000,000원", state: "pending" },
  { label: "골조 완료", percentage: 5, date: null, amount: "6,000,000원", state: "pending" },
  { label: "사용 승인", percentage: 5, date: null, amount: "6,000,000원", state: "pending" },
];

const DELIVERABLES: Deliverable[] = [
  { name: "기본설계도면_v2.pdf", date: "2026.02.28" },
  { name: "구조계산서.pdf", date: "2026.02.25" },
  { name: "설계설명서_초안.docx", date: "2026.02.20" },
];

const REVIEW_KEYWORDS = ["전문적이에요", "소통이 좋아요", "약속을 잘 지켜요", "꼼꼼해요"];

/* ─── Helpers ─── */

function getOverallProgress(milestones: Milestone[]) {
  return milestones
    .filter((m) => m.state === "completed")
    .reduce((sum, m) => sum + m.percentage, 0);
}

/* ─── Building Overview Items ─── */

const BUILDING_ITEMS = [
  { icon: Building, label: "건물명", value: PROJECT.building.name },
  { icon: MapPin, label: "주소", value: PROJECT.building.address },
  { icon: Layers, label: "용도", value: PROJECT.building.usage },
  { icon: Ruler, label: "면적", value: PROJECT.building.area },
  { icon: Building, label: "구조", value: PROJECT.building.structure },
  { icon: Layers, label: "층수", value: PROJECT.building.floors },
];

/* ─── Page ─── */

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState(PROJECT.review);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");

  const status = PROJECT.status;
  const progress = getOverallProgress(MILESTONES);
  const currentMilestone = MILESTONES.find((m) => m.state === "current");

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw],
    );
  };

  const submitReview = () => {
    if (selectedKeywords.length === 0 && !reviewText.trim()) return;
    setReview({ keywords: selectedKeywords, text: reviewText });
    setShowReviewForm(false);
  };

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        {/* ── Back link ── */}
        <div className="pt-6 pb-6">
          <Link
            to="/projects"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            내 프로젝트
          </Link>
        </div>

        {/* ── Page header with progress ── */}
        <div className="pb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className={`size-2 rounded-full ${status === "진행중" ? "bg-green-500 animate-pulse" : "bg-zinc-400"}`} />
            <span className="text-sm font-medium text-muted-foreground">{status}</span>
            {currentMilestone && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-sm text-muted-foreground">현재 단계: <span className="font-medium text-foreground">{currentMilestone.label}</span></span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-semibold -tracking-tight">{PROJECT.title}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
            <MapPin className="size-3.5" />
            {PROJECT.building.address}
          </p>

          {/* Overall progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-muted-foreground">전체 진행률</span>
              <span className="text-sm font-semibold tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${status === "진행중" ? "bg-primary" : "bg-zinc-400"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* ── 2-Column Layout ── */}
        <div className="flex gap-10 lg:gap-16 pt-8 pb-16">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            {/* SEC-1: 기성 일정 — vertical timeline */}
            <section>
              <h2 className="text-base font-semibold mb-6">기성 일정</h2>
              <div>
                {MILESTONES.map((m, idx) => {
                  const isLast = idx === MILESTONES.length - 1;
                  return (
                    <div key={m.label} className="relative flex gap-4">
                      {/* Dot + line */}
                      <div className="flex flex-col items-center">
                        {m.state === "completed" ? (
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
                            <Check className="size-4 text-primary-foreground" />
                          </div>
                        ) : m.state === "current" ? (
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary">
                            <div className="size-2.5 rounded-full bg-primary animate-pulse" />
                          </div>
                        ) : (
                          <div className="size-7 shrink-0 rounded-full ring-2 ring-muted-foreground/20 bg-background" />
                        )}
                        {!isLast && (
                          <div
                            className={`w-px flex-1 min-h-6 ${
                              m.state === "completed"
                                ? "bg-primary"
                                : "border-l-2 border-dashed border-muted-foreground/20"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-sm font-semibold leading-7 ${m.state === "pending" ? "text-muted-foreground" : ""}`}>
                              {m.label}
                              <span className="ml-2 text-xs font-normal text-muted-foreground">{m.percentage}%</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{m.date || "미정"}</p>
                          </div>
                          <p className={`text-sm tabular-nums leading-7 shrink-0 ${m.state === "pending" ? "text-muted-foreground" : "font-medium"}`}>
                            {m.amount}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <Separator className="my-8" />

            {/* SEC-2: 건축 개요 */}
            <section>
              <h2 className="text-base font-semibold mb-4">건축 개요</h2>
              <div className="grid grid-cols-2 gap-x-8">
                {BUILDING_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label + item.value} className="flex items-start gap-3 py-3">
                      <Icon className="size-5 shrink-0 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <Separator className="my-8" />

            {/* SEC-3: 산출물 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">산출물</h2>
                <Link
                  to={`/projects/${id}/deliverables`}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  전체보기
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {DELIVERABLES.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">등록된 산출물이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {DELIVERABLES.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-4 hover:bg-muted/50 rounded-lg px-3 py-3 -mx-3 transition-colors"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-muted/80 shrink-0">
                        <FileText className="size-4.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SEC-4: 리뷰 (완료 status only) */}
            {status === "완료" && (
              <>
                <Separator className="my-8" />

                <section>
                  <h2 className="text-base font-semibold mb-5">리뷰</h2>

                  {review ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Check className="size-4 text-primary" />
                        <span className="text-sm font-semibold">작성 완료</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {review.keywords.map((kw) => (
                          <span key={kw} className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                      {review.text && (
                        <p className="text-sm text-muted-foreground leading-[1.7]">{review.text}</p>
                      )}
                    </div>
                  ) : showReviewForm ? (
                    <div>
                      <p className="text-sm font-semibold mb-3">키워드를 선택해주세요</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {REVIEW_KEYWORDS.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => toggleKeyword(kw)}
                            className={`rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors ${
                              selectedKeywords.includes(kw)
                                ? "bg-foreground text-background ring-foreground"
                                : "ring-black/[0.12] hover:bg-muted"
                            }`}
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm font-semibold mb-2">상세 리뷰 (선택)</p>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="프로젝트 경험을 자유롭게 작성해주세요"
                        className="w-full rounded-xl ring-1 ring-black/[0.12] bg-background p-3 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                      />
                      <div className="flex gap-3 mt-4">
                        <Button onClick={submitReview} className="rounded-xl">리뷰 등록하기</Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => setShowReviewForm(false)}>취소</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-1">프로젝트가 완료되었습니다</p>
                      <p className="text-sm text-muted-foreground mb-5">파트너에 대한 리뷰를 남겨주세요</p>
                      <Button className="rounded-xl" onClick={() => setShowReviewForm(true)}>리뷰 작성하기</Button>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {/* ════ Right Column — Sticky Action Card ════ */}
          <div className="w-[380px] shrink-0 hidden lg:block">
            <div className="sticky top-20 space-y-4">
              {/* Main card */}
              <div className="rounded-2xl bg-card ring-1 ring-black/[0.12] shadow-sm p-6">
                {/* Contract amount */}
                <p className="text-2xl font-bold -tracking-tight">{PROJECT.contract.amount}</p>
                <p className="text-sm text-muted-foreground mt-1">계약일 {PROJECT.contract.date}</p>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="size-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{PROJECT.contract.status}</span>
                </div>

                <Separator className="my-5" />

                {/* Progress in card */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">진행률</span>
                    <span className="text-xs font-semibold tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  {currentMilestone && (
                    <p className="text-xs text-muted-foreground mt-1.5">현재: {currentMilestone.label}</p>
                  )}
                </div>

                {/* Partner info */}
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {PROJECT.partner.company.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{PROJECT.partner.company}</p>
                    <p className="text-xs text-muted-foreground">대표 {PROJECT.partner.ceo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-0.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  {PROJECT.partner.phone}
                </div>

                <Separator className="my-5" />

                {/* CTA */}
                <Button className="w-full h-12 rounded-xl gap-2" size="lg">
                  <MessageSquare className="size-4" />
                  채팅하기
                </Button>
                <div className="text-center mt-3">
                  <Link
                    to={`/contracts/${id}`}
                    className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    계약서 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

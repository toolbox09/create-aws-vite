import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type AreaUnit = "m2" | "pyeong";
type RevenueMode = "sales" | "rental";

interface RevenueRow {
  category: string;
  floor: string;
  exclusiveArea: number;
  commonArea: number;
  supplyArea: number;
  exclusiveRatio: number;
  pricePerPyeong: number;
  totalPrice: number;
  rentalDeposit: number;
  monthlyRent: number;
}

/* ─── Mock Data ─── */

const REPORT = {
  id: 1,
  purpose: "다세대/연립",
  purposeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
};

const BUSINESS_SUMMARY = {
  totalSalesPrice: 2_438_000_000,
  totalCost: 1_892_000_000,
  profit: 546_000_000,
  profitRate: 22.4,
  costRate: 77.6,
};

const BUILDING_OVERVIEW = [
  { label: "대지면적", value: "264.3 m²", subValue: "79.9평" },
  { label: "건폐율", value: "59.8%", subValue: "허용 60%" },
  { label: "용적률", value: "249.8%", subValue: "허용 250%" },
  { label: "연면적", value: "660.2 m²", subValue: "199.7평" },
  { label: "층수", value: "지하1층 / 지상5층", subValue: "" },
  { label: "세대수", value: "12세대", subValue: "주차 8대" },
];

const REVENUE_ROWS: RevenueRow[] = [
  { category: "1층 근생", floor: "1층", exclusiveArea: 82.5, commonArea: 33.0, supplyArea: 115.5, exclusiveRatio: 71.4, pricePerPyeong: 3200, totalPrice: 1_120_000_000, rentalDeposit: 200_000_000, monthlyRent: 4_500_000 },
  { category: "2층 주거", floor: "2층", exclusiveArea: 59.4, commonArea: 24.8, supplyArea: 84.2, exclusiveRatio: 70.5, pricePerPyeong: 2800, totalPrice: 714_000_000, rentalDeposit: 100_000_000, monthlyRent: 1_200_000 },
  { category: "3층 주거", floor: "3층", exclusiveArea: 59.4, commonArea: 24.8, supplyArea: 84.2, exclusiveRatio: 70.5, pricePerPyeong: 2850, totalPrice: 727_000_000, rentalDeposit: 100_000_000, monthlyRent: 1_200_000 },
  { category: "4층 주거", floor: "4층", exclusiveArea: 59.4, commonArea: 24.8, supplyArea: 84.2, exclusiveRatio: 70.5, pricePerPyeong: 2900, totalPrice: 739_000_000, rentalDeposit: 100_000_000, monthlyRent: 1_250_000 },
  { category: "5층 주거", floor: "5층", exclusiveArea: 49.5, commonArea: 20.7, supplyArea: 70.2, exclusiveRatio: 70.5, pricePerPyeong: 2950, totalPrice: 627_000_000, rentalDeposit: 80_000_000, monthlyRent: 1_050_000 },
];

const ACQUISITION_COSTS = [
  { label: "토지매입비", amount: 980_000_000 },
  { label: "취득세", amount: 44_100_000 },
  { label: "법무사 비용", amount: 3_000_000 },
  { label: "중개수수료", amount: 8_820_000 },
];

const CONSTRUCTION_COSTS = [
  { label: "건축공사비", amount: 594_180_000, note: "900만원/평" },
  { label: "설계비", amount: 39_600_000, note: "60만원/평" },
  { label: "감리비", amount: 19_800_000, note: "30만원/평" },
  { label: "인허가 비용", amount: 15_000_000, note: "" },
  { label: "기타 공사비", amount: 29_700_000, note: "45만원/평" },
];

const LOANS = [
  { label: "토지담보대출", principal: 686_000_000, ltv: 70, rate: 5.5, months: 18, interest: 56_595_000 },
  { label: "PF 대출", principal: 415_920_000, ltv: 70, rate: 7.0, months: 12, interest: 29_114_400 },
];

/* ─── Helpers ─── */

function formatKrw(value: number): string {
  if (value >= 100_000_000) {
    const eok = Math.floor(value / 100_000_000);
    const remainder = value % 100_000_000;
    if (remainder === 0) return `${eok}억`;
    const man = Math.round(remainder / 10_000);
    return `${eok}억 ${man.toLocaleString("ko-KR")}만`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
  }
  return value.toLocaleString("ko-KR");
}

function formatFullKrw(value: number): string {
  return value.toLocaleString("ko-KR") + "원";
}

function toMoney(value: number): string {
  return value.toLocaleString("ko-KR");
}

function m2ToPyeong(m2: number): number {
  return m2 / 3.3058;
}

/* ─── Page ─── */

export default function AiReportPage() {
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("sales");

  function displayArea(m2: number): string {
    if (areaUnit === "pyeong") return m2ToPyeong(m2).toFixed(1) + "평";
    return m2.toFixed(1) + " m²";
  }

  const totalRevenue = REVENUE_ROWS.reduce((sum, r) => sum + r.totalPrice, 0);
  const totalRentalDeposit = REVENUE_ROWS.reduce((sum, r) => sum + r.rentalDeposit, 0);
  const totalMonthlyRent = REVENUE_ROWS.reduce((sum, r) => sum + r.monthlyRent, 0);
  const totalExclusive = REVENUE_ROWS.reduce((sum, r) => sum + r.exclusiveArea, 0);
  const totalCommon = REVENUE_ROWS.reduce((sum, r) => sum + r.commonArea, 0);
  const totalSupply = REVENUE_ROWS.reduce((sum, r) => sum + r.supplyArea, 0);

  const totalAcquisition = ACQUISITION_COSTS.reduce((sum, c) => sum + c.amount, 0);
  const totalConstruction = CONSTRUCTION_COSTS.reduce((sum, c) => sum + c.amount, 0);
  const totalInterest = LOANS.reduce((sum, l) => sum + l.interest, 0);

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Back link */}
        <Link
          to="/analysis/ai/1"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          프로젝트 상세
        </Link>

        {/* Header with toggles */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">리포트 #{REPORT.id}</h1>
            <Badge variant="outline" className={`text-xs ${REPORT.purposeColor}`}>
              {REPORT.purpose}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Area unit toggle — segmented control */}
            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
              <button
                onClick={() => setAreaUnit("m2")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  areaUnit === "m2" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                m²
              </button>
              <button
                onClick={() => setAreaUnit("pyeong")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  areaUnit === "pyeong" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                평
              </button>
            </div>
            {/* Revenue mode toggle — segmented control */}
            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
              <button
                onClick={() => setRevenueMode("sales")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  revenueMode === "sales" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                분양
              </button>
              <button
                onClick={() => setRevenueMode("rental")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  revenueMode === "rental" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                임대
              </button>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="flex gap-8">
          {/* Left column — main content */}
          <div className="min-w-0 flex-1">
            {/* Business Summary */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">사업 요약</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Total Sales / Revenue */}
                <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {revenueMode === "sales" ? "총 분양가" : "보증금 합계"}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {revenueMode === "sales" ? formatKrw(BUSINESS_SUMMARY.totalSalesPrice) : formatKrw(totalRentalDeposit)}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[#F26118]" style={{ width: "100%" }} />
                  </div>
                </div>
                {/* Total Cost */}
                <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
                  <p className="mb-1 text-xs text-muted-foreground">총 사업비</p>
                  <p className="text-2xl font-semibold tabular-nums">{formatKrw(BUSINESS_SUMMARY.totalCost)}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-muted-foreground/40"
                      style={{ width: `${BUSINESS_SUMMARY.costRate}%` }}
                    />
                  </div>
                </div>
                {/* Profit — accent when positive */}
                <div className={`bg-card rounded-2xl p-5${BUSINESS_SUMMARY.profit > 0 ? " ring-1 ring-[#F26118]/20" : ""}`}>
                  <p className="mb-1 text-xs text-muted-foreground">수익</p>
                  <p className="text-2xl font-semibold tabular-nums text-[#F26118]">
                    {formatKrw(BUSINESS_SUMMARY.profit)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[#F26118]"
                        style={{ width: `${BUSINESS_SUMMARY.profitRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {BUSINESS_SUMMARY.profitRate}%
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <Separator className="mb-8" />

            {/* Building Overview */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">건물 개요</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {BUILDING_OVERVIEW.map((item) => (
                  <div key={item.label} className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-4">
                    <p className="mb-1 text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                    {item.subValue && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.subValue}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <Separator className="mb-8" />

            {/* Revenue Table — borderless striped */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">
                {revenueMode === "sales" ? "분양 수익" : "임대 수익"}
              </h2>
              <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.08]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">구분</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">층</th>
                        <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">전용면적</th>
                        <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">공용면적</th>
                        <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">공급면적</th>
                        <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">전용률</th>
                        {revenueMode === "sales" ? (
                          <>
                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">평당분양가(만)</th>
                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">분양가</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">보증금</th>
                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">월임대료</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {REVENUE_ROWS.map((row, idx) => (
                        <tr
                          key={row.category}
                          className={`transition-colors hover:bg-muted/50${idx % 2 === 1 ? " bg-muted/30" : ""}`}
                        >
                          <td className="px-4 py-3 font-medium">{row.category}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.floor}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{displayArea(row.exclusiveArea)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{displayArea(row.commonArea)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{displayArea(row.supplyArea)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{row.exclusiveRatio.toFixed(1)}%</td>
                          {revenueMode === "sales" ? (
                            <>
                              <td className="px-4 py-3 text-right tabular-nums">{toMoney(row.pricePerPyeong)}</td>
                              <td className="px-4 py-3 text-right tabular-nums font-medium">{formatKrw(row.totalPrice)}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-right tabular-nums">{formatKrw(row.rentalDeposit)}</td>
                              <td className="px-4 py-3 text-right tabular-nums font-medium">{formatKrw(row.monthlyRent)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="bg-muted/20 font-semibold">
                        <td className="px-4 py-3" colSpan={2}>합계</td>
                        <td className="px-4 py-3 text-right tabular-nums">{displayArea(totalExclusive)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{displayArea(totalCommon)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{displayArea(totalSupply)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {(totalExclusive / totalSupply * 100).toFixed(1)}%
                        </td>
                        {revenueMode === "sales" ? (
                          <>
                            <td className="px-4 py-3 text-right">—</td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatKrw(totalRevenue)}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-right tabular-nums">{formatKrw(totalRentalDeposit)}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatKrw(totalMonthlyRent)}</td>
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <Separator className="mb-8" />

            {/* Cost Sections */}
            <section className="mb-8 space-y-6">
              <h2 className="text-lg font-semibold">비용 내역</h2>

              {/* Acquisition Costs */}
              <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <h3 className="font-semibold">매입비용</h3>
                  <span className="text-sm font-semibold text-muted-foreground">{formatFullKrw(totalAcquisition)}</span>
                </div>
                <div>
                  {ACQUISITION_COSTS.map((cost, idx) => (
                    <div
                      key={cost.label}
                      className={`flex items-center justify-between px-5 py-3${idx % 2 === 1 ? " bg-muted/30" : ""}`}
                    >
                      <span className="text-sm text-muted-foreground">{cost.label}</span>
                      <span className="text-sm tabular-nums">{formatFullKrw(cost.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Construction Costs */}
              <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <h3 className="font-semibold">건축비용</h3>
                  <span className="text-sm font-semibold text-muted-foreground">{formatFullKrw(totalConstruction)}</span>
                </div>
                <div>
                  {CONSTRUCTION_COSTS.map((cost, idx) => (
                    <div
                      key={cost.label}
                      className={`flex items-center justify-between px-5 py-3${idx % 2 === 1 ? " bg-muted/30" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{cost.label}</span>
                        {cost.note && (
                          <span className="text-xs text-muted-foreground/60">({cost.note})</span>
                        )}
                      </div>
                      <span className="text-sm tabular-nums">{formatFullKrw(cost.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finance Costs */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">금융비용</h3>
                  <span className="text-sm font-semibold text-muted-foreground">
                    이자 합계: {formatFullKrw(totalInterest)}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {LOANS.map((loan) => (
                    <div key={loan.label} className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
                      <h4 className="mb-3 font-semibold">{loan.label}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">대출원금</span>
                          <span className="tabular-nums">{formatFullKrw(loan.principal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">LTV</span>
                          <span className="tabular-nums">{loan.ltv}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">금리</span>
                          <span className="tabular-nums">{loan.rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">대출기간</span>
                          <span className="tabular-nums">{loan.months}개월</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-semibold">
                          <span>이자비용</span>
                          <span className="tabular-nums text-[#F26118]">{formatFullKrw(loan.interest)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right column — sticky summary card */}
          <div className="hidden lg:block w-[340px] shrink-0">
            <div className="sticky top-20 rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-6">
              {/* Purpose badge */}
              <Badge variant="outline" className={`mb-5 text-xs ${REPORT.purposeColor}`}>
                {REPORT.purpose}
              </Badge>

              {/* Compact business summary */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {revenueMode === "sales" ? "총분양가" : "보증금 합계"}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {revenueMode === "sales" ? formatKrw(BUSINESS_SUMMARY.totalSalesPrice) : formatKrw(totalRentalDeposit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">총사업비</p>
                  <p className="text-sm font-semibold tabular-nums">{formatKrw(BUSINESS_SUMMARY.totalCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">수익</p>
                  <p className="text-sm font-semibold tabular-nums">{formatKrw(BUSINESS_SUMMARY.profit)}</p>
                </div>
              </div>

              <Separator className="my-5" />

              {/* Profit rate — large accent */}
              <div className="text-center">
                <p className="mb-1 text-xs text-muted-foreground">수익률</p>
                <p className="text-3xl font-semibold tabular-nums text-[#F26118]">
                  {BUSINESS_SUMMARY.profitRate}%
                </p>
              </div>

              <Separator className="my-5" />

              {/* Action buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="size-3.5" />
                    PDF 다운로드
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Share2 className="size-3.5" />
                    공유하기
                  </Button>
                </div>
                <Button className="w-full" size="sm">
                  입찰 공고 등록
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

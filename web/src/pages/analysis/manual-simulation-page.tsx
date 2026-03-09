import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Download,
  Pencil,
  MapPin,
  Building2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types & Constants ─── */

type AreaUnit = "m2" | "pyeong";
type SaleMode = "sale" | "lease";

const USE_TABS = ["단독/다가구", "다세대/연립", "근린생활", "오피스텔"] as const;

const M2_PER_PYEONG = 3.305785;

function fmt(n: number): string {
  return n.toLocaleString("ko-KR");
}

function toEok(n: number): string {
  const eok = n / 100_000_000;
  return eok >= 1
    ? `${(eok).toFixed(1)}억`
    : `${fmt(Math.round(n / 10_000))}만`;
}

function convertArea(m2: number, unit: AreaUnit): string {
  if (unit === "pyeong") return (m2 / M2_PER_PYEONG).toFixed(1);
  return m2.toFixed(1);
}

/* ─── Mock Data ─── */

interface RevenueRow {
  id: number;
  category: string;
  floor: string;
  exclusiveArea: number;
  commonArea: number;
  supplyArea: number;
  exclusiveRate: number;
  pricePerPyeong: number;
  totalPrice: number;
}

const REVENUE_ROWS: RevenueRow[] = [
  { id: 1, category: "주차장", floor: "지하1층", exclusiveArea: 120.0, commonArea: 30.0, supplyArea: 150.0, exclusiveRate: 80.0, pricePerPyeong: 350, totalPrice: 15_909 },
  { id: 2, category: "근생", floor: "1층", exclusiveArea: 132.0, commonArea: 33.0, supplyArea: 165.0, exclusiveRate: 80.0, pricePerPyeong: 2_800, totalPrice: 139_999 },
  { id: 3, category: "주거", floor: "2층", exclusiveArea: 148.5, commonArea: 16.5, supplyArea: 165.0, exclusiveRate: 90.0, pricePerPyeong: 1_850, totalPrice: 92_434 },
  { id: 4, category: "주거", floor: "3층", exclusiveArea: 148.5, commonArea: 16.5, supplyArea: 165.0, exclusiveRate: 90.0, pricePerPyeong: 1_800, totalPrice: 89_937 },
  { id: 5, category: "주거", floor: "4층", exclusiveArea: 148.5, commonArea: 16.5, supplyArea: 165.0, exclusiveRate: 90.0, pricePerPyeong: 1_750, totalPrice: 87_440 },
  { id: 6, category: "주거", floor: "5층", exclusiveArea: 132.0, commonArea: 16.5, supplyArea: 148.5, exclusiveRate: 88.9, pricePerPyeong: 1_700, totalPrice: 76_477 },
];

interface CostItem {
  id: number;
  label: string;
  unitPrice: number;
  total: number;
}

const CONSTRUCTION_COSTS: CostItem[] = [
  { id: 1, label: "공사비", unitPrice: 580, total: 575_520_000 },
  { id: 2, label: "설계비", unitPrice: 35, total: 34_720_000 },
  { id: 3, label: "감리비", unitPrice: 25, total: 24_800_000 },
  { id: 4, label: "철거비", unitPrice: 15, total: 14_880_000 },
  { id: 5, label: "기타부대비", unitPrice: 30, total: 29_760_000 },
];

/* ─── Sub-components ─── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  accent,
  large,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div className={`bg-card rounded-2xl p-5${large ? " sm:col-span-2" : ""}${accent ? " ring-1 ring-[#F26118]/20" : " ring-1 ring-black/[0.08]"}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`font-bold tracking-tight ${large ? "text-3xl" : "text-2xl"} ${accent ? "text-primary" : ""}`}>
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs font-medium text-emerald-600">{sub}</p>
      )}
    </div>
  );
}

function FinanceCard({
  title,
  loanRatio,
  totalAmount,
  interestRate,
  loanAmount,
  monthlyInterest,
  yearlyInterest,
}: {
  title: string;
  loanRatio: number;
  totalAmount: number;
  interestRate: number;
  loanAmount: number;
  monthlyInterest: number;
  yearlyInterest: number;
}) {
  return (
    <div className="flex-1 bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">대출비율(%)</span>
          <span className="text-sm font-medium">{loanRatio}%</span>
        </div>
        {/* Loan ratio visual progress bar */}
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#F26118]"
              style={{ width: `${loanRatio}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums">{loanRatio}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">총액</span>
          <span className="text-sm font-medium">{toEok(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">금리(%)</span>
          <span className="text-sm font-medium">{interestRate}%</span>
        </div>
        <Separator className="opacity-50" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">대출금</span>
          <span className="text-sm font-semibold">{toEok(loanAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">이자(월)</span>
          <span className="text-sm font-medium">{fmt(Math.round(monthlyInterest / 10_000))}만</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">이자(연)</span>
          <span className="text-sm font-medium">{fmt(Math.round(yearlyInterest / 10_000))}만</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function ManualSimulationPage() {
  const location = useLocation();
  const passedParcel = (location.state as { parcel?: { address?: string; landArea?: number } })?.parcel;

  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [saleMode, setSaleMode] = useState<SaleMode>("sale");
  const [activeTab, setActiveTab] = useState<string>(USE_TABS[0]);

  const totalRevenue = REVENUE_ROWS.reduce((s, r) => s + r.totalPrice * 10_000, 0);
  const totalCost = 2_210_000_000;
  const profit = totalRevenue - totalCost;
  const profitRate = ((profit / totalCost) * 100).toFixed(1);

  const revenueTotal = {
    exclusiveArea: REVENUE_ROWS.reduce((s, r) => s + r.exclusiveArea, 0),
    commonArea: REVENUE_ROWS.reduce((s, r) => s + r.commonArea, 0),
    supplyArea: REVENUE_ROWS.reduce((s, r) => s + r.supplyArea, 0),
    totalPrice: REVENUE_ROWS.reduce((s, r) => s + r.totalPrice, 0),
  };

  const constructionTotal = CONSTRUCTION_COSTS.reduce((s, c) => s + c.total, 0);

  const unitLabel = areaUnit === "m2" ? "m\u00B2" : "평";

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8 space-y-6 mb-20">
        {/* ─── Page Header ─── */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                사업성 분석 시뮬레이션
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {passedParcel?.address ?? "서울특별시 강남구 역삼동 123-4"}
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-fit rounded-xl gap-1.5">
              <Download className="size-4" />
              Excel 다운로드
            </Button>
          </div>

          {/* Toggles — segmented controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Area unit toggle */}
            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
              {(["m2", "pyeong"] as AreaUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setAreaUnit(u)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    areaUnit === u
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {u === "m2" ? "m\u00B2" : "평"}
                </button>
              ))}
            </div>

            {/* Sale mode toggle */}
            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
              {([
                { key: "sale" as SaleMode, label: "분양" },
                { key: "lease" as SaleMode, label: "임대" },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSaleMode(key)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    saleMode === key
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Use type tabs — segmented control */}
          <div className="flex gap-1 overflow-x-auto bg-muted rounded-xl p-1">
            {USE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* ─── Section 1: Business Summary ─── */}
        <section className="space-y-5">
          <SectionTitle>사업성 요약</SectionTitle>

          {/* Bento grid: profit card spans 2 cols on sm+ (4-col layout idea, but 3 items so we use grid-cols-4) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <SummaryCard label="총 분양가" value="28.5억" />
            <SummaryCard label="총 사업비" value="22.1억" />
            <SummaryCard
              label="분양 수익"
              value="6.4억"
              sub={`+${profitRate}%`}
              accent
              large
            />
          </div>

          {/* Building overview */}
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">건물 개요</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
              <InfoItem label="대지면적" value={`${convertArea(330, areaUnit)} ${unitLabel}`} />
              <InfoItem label="용도지역" value="제2종일반주거" />
              <InfoItem label="지목" value="대" />
              <InfoItem label="건폐율" value="60%" />
              <InfoItem label="용적률" value="200%" />
              <InfoItem label="규모" value="지상5층 / 지하1층" />
            </div>
          </div>
        </section>

        <Separator />

        {/* ─── Section 2: Revenue Table — borderless striped ─── */}
        <section className="space-y-4">
          <SectionTitle>매출 산정</SectionTitle>

          <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-black/[0.08]">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">구분</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">층</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    전용면적({unitLabel})
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    공용면적({unitLabel})
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    공급면적({unitLabel})
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <span className="inline-flex items-center gap-1">
                      전용률(%)
                      <Pencil className="size-3 text-primary" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <span className="inline-flex items-center gap-1">
                      평당분양가(만원)
                      <Pencil className="size-3 text-primary" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    분양가(만원)
                  </th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_ROWS.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-muted/50${idx % 2 === 1 ? " bg-muted/30" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium">{row.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.floor}</td>
                    <td className="px-4 py-3 text-right">
                      {convertArea(row.exclusiveArea, areaUnit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {convertArea(row.commonArea, areaUnit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {convertArea(row.supplyArea, areaUnit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        defaultValue={row.exclusiveRate.toFixed(1)}
                        className="ml-auto h-7 w-20 text-right text-xs rounded-lg"
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        defaultValue={fmt(row.pricePerPyeong)}
                        className="ml-auto h-7 w-24 text-right text-xs rounded-lg"
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {fmt(row.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 font-semibold">
                  <td className="px-4 py-3" colSpan={2}>합계</td>
                  <td className="px-4 py-3 text-right">
                    {convertArea(revenueTotal.exclusiveArea, areaUnit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {convertArea(revenueTotal.commonArea, areaUnit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {convertArea(revenueTotal.supplyArea, areaUnit)}
                  </td>
                  <td className="px-4 py-3 text-right">-</td>
                  <td className="px-4 py-3 text-right">-</td>
                  <td className="px-4 py-3 text-right text-primary">
                    {fmt(revenueTotal.totalPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <Separator />

        {/* ─── Section 3: Business Cost ─── */}
        <section className="space-y-6">
          <SectionTitle>사업 비용</SectionTitle>

          {/* 3-1 Purchase cost */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">3-1. 매입 비용</h3>
            <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">대지면적</label>
                  <p className="text-sm font-medium">{convertArea(330, areaUnit)} {unitLabel}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">평당 매입가</label>
                  <p className="text-sm font-medium">{fmt(3_200)}만원</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      토지 매입비
                      <Pencil className="size-3 text-primary" />
                    </span>
                  </label>
                  <Input
                    defaultValue="1,320,000,000"
                    className="h-8 text-sm rounded-lg"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3-2 Construction cost — borderless striped */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">3-2. 건축 비용</h3>
            <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-black/[0.08]">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">항목</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <span className="inline-flex items-center gap-1">
                        단가(만원/{unitLabel})
                        <Pencil className="size-3 text-primary" />
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">소계(원)</th>
                  </tr>
                </thead>
                <tbody>
                  {CONSTRUCTION_COSTS.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-muted/50${idx % 2 === 1 ? " bg-muted/30" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium">{item.label}</td>
                      <td className="px-4 py-3 text-right">
                        <Input
                          defaultValue={fmt(item.unitPrice)}
                          className="ml-auto h-7 w-28 text-right text-xs rounded-lg"
                          readOnly
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/40 font-semibold">
                    <td className="px-4 py-3">합계</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right text-primary">{fmt(constructionTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 3-3 Financial cost */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">3-3. 금융 비용</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FinanceCard
                title="매입비 금융"
                loanRatio={60}
                totalAmount={1_320_000_000}
                interestRate={4.5}
                loanAmount={792_000_000}
                monthlyInterest={2_970_000}
                yearlyInterest={35_640_000}
              />
              <FinanceCard
                title="건축사업비 금융"
                loanRatio={70}
                totalAmount={679_680_000}
                interestRate={5.0}
                loanAmount={475_776_000}
                monthlyInterest={1_982_400}
                yearlyInterest={23_788_800}
              />
            </div>
          </div>
        </section>
      </div>

      {/* ─── Bottom CTA Bar — fixed at viewport bottom ─── */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-5">
          <div className="flex items-center justify-between rounded-2xl bg-card ring-1 ring-black/[0.08] px-5 py-3 shadow-sm">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
              <RotateCcw className="size-4" />
              초기화
            </Button>
            <Button size="sm" className="rounded-xl">
              입찰 공고 등록
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Mock Data ─── */

const ARCHITECT = {
  id: 1,
  firmName: "아크 건축사사무소",
  region: "서울",
  yearsInBusiness: 12,
  totalPermits: 87,
};

const USAGE_DISTRIBUTION = [
  { label: "근린생활시설", percentage: 40, color: "bg-blue-500" },
  { label: "단독주택", percentage: 25, color: "bg-emerald-500" },
  { label: "다세대주택", percentage: 15, color: "bg-amber-500" },
  { label: "공동주택", percentage: 10, color: "bg-violet-500" },
  { label: "기타", percentage: 10, color: "bg-gray-400" },
];

const YEARLY_PERMITS = [
  { year: 2016, count: 5 },
  { year: 2017, count: 8 },
  { year: 2018, count: 7 },
  { year: 2019, count: 12 },
  { year: 2020, count: 9 },
  { year: 2021, count: 11 },
  { year: 2022, count: 14 },
  { year: 2023, count: 10 },
  { year: 2024, count: 8 },
  { year: 2025, count: 3 },
];

const DESIGN_TYPES = [
  { label: "신축", color: "bg-blue-500" },
  { label: "증축", color: "bg-emerald-500" },
  { label: "용도변경", color: "bg-amber-500" },
  { label: "대수선", color: "bg-violet-500" },
  { label: "개축", color: "bg-rose-500" },
  { label: "재축", color: "bg-cyan-500" },
  { label: "이전", color: "bg-gray-400" },
];

const YEARLY_DESIGN_DISTRIBUTION = [
  { year: 2016, values: [3, 1, 0, 1, 0, 0, 0] },
  { year: 2017, values: [4, 2, 1, 0, 1, 0, 0] },
  { year: 2018, values: [3, 1, 1, 1, 0, 1, 0] },
  { year: 2019, values: [6, 2, 1, 1, 1, 0, 1] },
  { year: 2020, values: [4, 2, 1, 1, 0, 0, 1] },
  { year: 2021, values: [5, 3, 1, 1, 0, 1, 0] },
  { year: 2022, values: [7, 3, 2, 1, 0, 0, 1] },
  { year: 2023, values: [5, 2, 1, 1, 0, 1, 0] },
  { year: 2024, values: [4, 1, 1, 1, 1, 0, 0] },
  { year: 2025, values: [2, 0, 0, 1, 0, 0, 0] },
];

/* ─── Page ─── */

export default function PublicArchitectDetailPage() {
  const { id } = useParams();
  void id;

  const maxCount = Math.max(...YEARLY_PERMITS.map((y) => y.count));
  const totalPermits = USAGE_DISTRIBUTION.reduce((s, d) => s + d.percentage, 0);

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* ═══ Back Link ═══ */}
        <Link
          to="/architects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          목록으로
        </Link>

        {/* ═══ Company Info Card ═══ */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-4">
            {ARCHITECT.firmName}
          </h1>
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">건축사무소명</p>
              <p className="text-sm font-medium">{ARCHITECT.firmName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">주 인허가 지역</p>
              <p className="text-sm font-medium">{ARCHITECT.region}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">업력</p>
              <p className="text-sm font-medium">{ARCHITECT.yearsInBusiness}년</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">총 인허가 수</p>
              <p className="text-lg font-bold text-primary">{ARCHITECT.totalPermits}건</p>
            </div>
          </div>
        </div>

        {/* ═══ Chart Sections ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ── Donut Chart: 건축 용도별 인허가 분포 ── */}
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6">
            <h2 className="text-base font-semibold tracking-tight mb-5">
              건축 용도별 인허가 분포
            </h2>

            {USAGE_DISTRIBUTION.length > 0 ? (
              <div className="flex gap-6">
                {/* Donut visualization */}
                <div className="relative shrink-0">
                  <svg viewBox="0 0 120 120" className="size-[140px]">
                    {(() => {
                      let cumulative = 0;
                      return USAGE_DISTRIBUTION.map((item, idx) => {
                        const radius = 45;
                        const circumference = 2 * Math.PI * radius;
                        const strokeLen = (item.percentage / totalPermits) * circumference;
                        const offset = -(cumulative / totalPermits) * circumference;
                        cumulative += item.percentage;

                        const colorMap: Record<string, string> = {
                          "bg-blue-500": "#3b82f6",
                          "bg-emerald-500": "#10b981",
                          "bg-amber-500": "#f59e0b",
                          "bg-violet-500": "#8b5cf6",
                          "bg-gray-400": "#9ca3af",
                        };

                        return (
                          <circle
                            key={idx}
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={colorMap[item.color] ?? "#9ca3af"}
                            strokeWidth="16"
                            strokeDasharray={`${strokeLen} ${circumference - strokeLen}`}
                            strokeDashoffset={offset}
                            transform="rotate(-90 60 60)"
                          />
                        );
                      });
                    })()}
                    <text
                      x="60"
                      y="56"
                      textAnchor="middle"
                      className="fill-foreground text-[11px] font-semibold"
                    >
                      총
                    </text>
                    <text
                      x="60"
                      y="72"
                      textAnchor="middle"
                      className="fill-foreground text-[15px] font-bold"
                    >
                      {ARCHITECT.totalPermits}건
                    </text>
                  </svg>
                </div>

                {/* Legend list with proportional bars */}
                <div className="flex-1 space-y-2.5">
                  {USAGE_DISTRIBUTION.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className={`size-2.5 rounded-full ${item.color}`} />
                          <span>{item.label}</span>
                        </span>
                        <span className="font-medium tabular-nums">{item.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* ── Bar Chart: 연도별 인허가 추이 ── */}
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6">
            <h2 className="text-base font-semibold tracking-tight mb-5">
              연도별 인허가 추이
            </h2>

            {YEARLY_PERMITS.length > 0 ? (
              <div className="flex items-end gap-2 h-[180px]">
                {YEARLY_PERMITS.map((y) => (
                  <div
                    key={y.year}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <span className="text-[11px] font-medium tabular-nums mb-1">
                      {y.count}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-primary/80 min-h-[4px] transition-all"
                      style={{
                        height: `${(y.count / maxCount) * 140}px`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground mt-2 tabular-nums">
                      {String(y.year).slice(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>

        {/* ── Stacked Horizontal Bars: 연도별 설계 종류 분포 ── */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6">
          <h2 className="text-base font-semibold tracking-tight mb-5">
            연도별 설계 종류 분포
          </h2>

          {YEARLY_DESIGN_DISTRIBUTION.length > 0 ? (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-5">
                {DESIGN_TYPES.map((dt) => (
                  <span key={dt.label} className="flex items-center gap-1.5 text-xs">
                    <span className={`size-2.5 rounded-full ${dt.color}`} />
                    {dt.label}
                  </span>
                ))}
              </div>

              {/* Bars */}
              <div className="space-y-2.5">
                {YEARLY_DESIGN_DISTRIBUTION.map((row) => {
                  const total = row.values.reduce((s, v) => s + v, 0);
                  return (
                    <div key={row.year} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground tabular-nums w-10 shrink-0 text-right">
                        {row.year}
                      </span>
                      <div className="flex-1 flex h-6 rounded-md overflow-hidden bg-muted">
                        {row.values.map((val, idx) => {
                          if (val === 0) return null;
                          const colorMap: Record<string, string> = {
                            "bg-blue-500": "#3b82f6",
                            "bg-emerald-500": "#10b981",
                            "bg-amber-500": "#f59e0b",
                            "bg-violet-500": "#8b5cf6",
                            "bg-rose-500": "#f43f5e",
                            "bg-cyan-500": "#06b6d4",
                            "bg-gray-400": "#9ca3af",
                          };
                          return (
                            <div
                              key={idx}
                              className="h-full transition-all"
                              style={{
                                width: `${(val / total) * 100}%`,
                                backgroundColor:
                                  colorMap[DESIGN_TYPES[idx].color] ?? "#9ca3af",
                              }}
                              title={`${DESIGN_TYPES[idx].label}: ${val}건`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-xs font-medium tabular-nums w-8 shrink-0">
                        {total}건
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-16" />
      </div>
    </div>
  );
}

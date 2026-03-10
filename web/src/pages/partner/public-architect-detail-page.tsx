import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Building2, CalendarDays, Award, MapPin, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/layout/site-header";
import {
  useArchitectBaseByRegNumQuery,
  useArchitectMainQuery,
  useArchitectTypeQuery,
  useArchitectCnstrQuery,
} from "@/features/architect/api/queries";
import {
  PmtBldgDsgnUseCdCntLabel,
  PmtBldgDsgnCnstrCdCntLabel,
} from "@conmarket/apis";
import type {
  BuildingDesignerBaseDTO,
  BuildingDesignerMainDTO,
  BuildingDesignerTypeDTO,
  BuildingDesignerConstructionTypeDTO,
} from "@conmarket/apis";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ─── Colors ─── */

const USAGE_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#8b5cf6",
  "#f43f5e", "#06b6d4", "#ec4899", "#94a3b8",
];

const CNSTR_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#8b5cf6",
  "#f43f5e", "#06b6d4", "#94a3b8",
];

/* ─── Key lists ─── */

type UsageCntKey = keyof typeof PmtBldgDsgnUseCdCntLabel;
type CnstrCntKey = keyof typeof PmtBldgDsgnCnstrCdCntLabel;

const usageKeys = Object.keys(PmtBldgDsgnUseCdCntLabel).filter(
  (k) => k !== "main_use_cd_00_cnt",
) as UsageCntKey[];

const cnstrKeys = Object.keys(PmtBldgDsgnCnstrCdCntLabel).filter(
  (k) => k !== "main_construction_cd_00_cnt",
) as CnstrCntKey[];

/* ─── Helpers ─── */

function parseLawdEntries(lawd: string) {
  if (!lawd) return [];
  return lawd.split(",").map((entry) => {
    const [name, cnt] = entry.split("/");
    return { name: name?.trim() ?? "-", count: Number(cnt) || 0 };
  });
}

function derivePrimaryUsage(dto: BuildingDesignerMainDTO): string {
  let maxKey = usageKeys[0];
  let maxVal = 0;
  for (const key of usageKeys) {
    const val = Number(dto[key]) || 0;
    if (val > maxVal) { maxVal = val; maxKey = key; }
  }
  return PmtBldgDsgnUseCdCntLabel[maxKey];
}

function parseUsageDistribution(dto: BuildingDesignerMainDTO) {
  const total = Number(dto.main_use_cd_00_cnt) || 1;
  return usageKeys
    .map((key, idx) => ({
      name: PmtBldgDsgnUseCdCntLabel[key],
      value: Number(dto[key]) || 0,
      percentage: Math.round(((Number(dto[key]) || 0) / total) * 100),
      color: USAGE_COLORS[idx],
    }))
    .filter((d) => d.value > 0);
}

function parseTypeByYear(rows: BuildingDesignerTypeDTO[]) {
  return [...rows]
    .sort((a, b) => Number(a.yyyy) - Number(b.yyyy))
    .map((row) => {
      const result: Record<string, string | number> = { year: row.yyyy };
      usageKeys.forEach((key) => {
        result[PmtBldgDsgnUseCdCntLabel[key]] = Number(row[key as keyof BuildingDesignerTypeDTO] as string) || 0;
      });
      return result;
    });
}

function parseCnstrByYear(rows: BuildingDesignerConstructionTypeDTO[]) {
  return [...rows]
    .sort((a, b) => Number(a.yyyy) - Number(b.yyyy))
    .map((row) => {
      const result: Record<string, string | number> = { year: row.yyyy };
      cnstrKeys.forEach((key) => {
        result[PmtBldgDsgnCnstrCdCntLabel[key]] = Number(row[key]) || 0;
      });
      return result;
    });
}

function parseYearlyTotals(rows: BuildingDesignerConstructionTypeDTO[]) {
  return [...rows]
    .sort((a, b) => Number(a.yyyy) - Number(b.yyyy))
    .map((row) => ({
      year: row.yyyy,
      count: Number(row.main_construction_cd_00_cnt) || 0,
    }));
}

function parseBaseUsageSummary(dto: BuildingDesignerBaseDTO) {
  const total = Number(dto.main_use_cd_00_cnt) || 1;
  return usageKeys
    .map((key, idx) => ({
      label: PmtBldgDsgnUseCdCntLabel[key],
      count: Number(dto[key as keyof BuildingDesignerBaseDTO] as string) || 0,
      percentage: Math.round(((Number(dto[key as keyof BuildingDesignerBaseDTO] as string) || 0) / total) * 100),
      color: USAGE_COLORS[idx],
    }))
    .filter((d) => d.count > 0);
}

/* ─── Stat Card ─── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-4">
      <div className={`flex size-9 items-center justify-center rounded-lg ${accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground leading-none mb-1">{label}</p>
        <p className={`text-sm font-semibold leading-tight ${accent ? "text-primary" : ""}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Chart Card Wrapper ─── */

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl ring-1 ring-black/[0.06] shadow-sm p-5">
      <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground uppercase mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ─── Custom Tooltip ─── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover/95 backdrop-blur border shadow-lg p-3 text-xs">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium tabular-nums">{p.value.toLocaleString()}건</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut Center Label ─── */

function DonutCenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">총</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-foreground text-[16px] font-bold">{total.toLocaleString()}건</text>
    </>
  );
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */

export default function PublicArchitectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const regNum = id ?? "";

  const { data: baseData, isPending: basePending } = useArchitectBaseByRegNumQuery(regNum);
  const { data: mainData, isPending: mainPending } = useArchitectMainQuery(regNum);
  const { data: typeData, isPending: typePending } = useArchitectTypeQuery(regNum);
  const { data: cnstrData, isPending: cnstrPending } = useArchitectCnstrQuery(regNum);

  const architect = baseData?.body?.[0];
  const mainDto = mainData?.body?.[0];
  const typeRows = typeData?.body ?? [];
  const cnstrRows = cnstrData?.body ?? [];

  const usageDist = mainDto ? parseUsageDistribution(mainDto) : [];
  const primaryUsage = mainDto ? derivePrimaryUsage(mainDto) : "-";
  const typeByYear = parseTypeByYear(typeRows);
  const cnstrByYear = parseCnstrByYear(cnstrRows);
  const yearlyTotals = parseYearlyTotals(cnstrRows);

  const totalPermits = Number(architect?.main_use_cd_00_cnt ?? 0);

  const lv1Regions = architect ? parseLawdEntries(architect.lv1_lawd) : [];
  const lv2Regions = architect ? parseLawdEntries(architect.lv2_lawd) : [];
  const baseUsageSummary = architect ? parseBaseUsageSummary(architect) : [];

  const isLoading = basePending || mainPending || typePending || cnstrPending;

  // active usage labels for stacked bar
  const activeUsageLabels = usageKeys.map((k) => PmtBldgDsgnUseCdCntLabel[k]);
  const activeCnstrLabels = cnstrKeys.map((k) => PmtBldgDsgnCnstrCdCntLabel[k]);

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Back */}
        <Link
          to="/partners?view=permits"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          목록으로
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && !architect && (
          <div className="py-32 text-center text-sm text-muted-foreground">
            건축사 정보를 찾을 수 없습니다
          </div>
        )}

        {!isLoading && architect && (
          <>
            {/* ═══ Header ═══ */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight mb-1">
                {architect.building_designer_nm}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                {architect.building_designer_reg_num}
              </p>
            </div>

            {/* ═══ Stat Grid ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard
                icon={TrendingUp}
                label="총 인허가 수"
                value={`${totalPermits.toLocaleString()}건`}
                accent
              />
              <StatCard
                icon={Building2}
                label="주 건축용도"
                value={primaryUsage}
              />
              <StatCard
                icon={MapPin}
                label="주 인허가 지역"
                value={lv1Regions[0]?.name ?? "-"}
                sub={lv1Regions.length > 1 ? `외 ${lv1Regions.length - 1}개 지역` : undefined}
              />
              <StatCard
                icon={CalendarDays}
                label="업력"
                value={`${architect.work_diff}년`}
                sub={`최초 허가 ${architect.init_permission_dt}`}
              />
            </div>

            {/* ═══ Score + Regions ═══ */}
            <div className="bg-card rounded-2xl ring-1 ring-black/[0.06] shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">자체점수</span>
                <span className="text-sm font-bold text-primary ml-1">
                  {Number(architect.total_score).toLocaleString()}점
                </span>
              </div>

              <Separator className="mb-4" />

              {/* lv1 */}
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                시/도별 활동지역
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {lv1Regions.map((r) => (
                  <Badge key={r.name} variant="secondary" className="text-xs rounded-lg font-normal">
                    {r.name} <span className="text-muted-foreground ml-1">{r.count}</span>
                  </Badge>
                ))}
              </div>

              {/* lv2 */}
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                시/군/구별 활동지역
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lv2Regions.slice(0, 12).map((r) => (
                  <Badge key={r.name} variant="outline" className="text-xs rounded-lg font-normal">
                    {r.name} <span className="text-muted-foreground ml-1">{r.count}</span>
                  </Badge>
                ))}
                {lv2Regions.length > 12 && (
                  <Badge variant="outline" className="text-xs rounded-lg font-normal text-muted-foreground">
                    +{lv2Regions.length - 12}개
                  </Badge>
                )}
              </div>
            </div>

            {/* ═══ Row 1: Donut + Yearly Trend ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Donut */}
              <ChartCard title="건축 용도별 인허가 분포">
                {usageDist.length > 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={usageDist}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                          strokeWidth={2}
                          stroke="var(--color-card)"
                        >
                          {usageDist.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                          <Pie data={[]} dataKey="value" label={<DonutCenterLabel total={totalPermits} />} />
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.[0]) return null;
                            const d = payload[0].payload as typeof usageDist[0];
                            return (
                              <div className="rounded-lg bg-popover/95 backdrop-blur border shadow-lg p-3 text-xs">
                                <span className="font-semibold">{d.name}</span>
                                <span className="ml-2 tabular-nums">{d.value.toLocaleString()}건 ({d.percentage}%)</span>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                      {usageDist.map((d) => (
                        <span key={d.name} className="inline-flex items-center gap-1.5 text-xs">
                          <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                          {d.name}
                          <span className="text-muted-foreground tabular-nums">{d.percentage}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">데이터가 없습니다</div>
                )}
              </ChartCard>

              {/* Yearly Trend */}
              <ChartCard title="연도별 인허가 추이">
                {yearlyTotals.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={yearlyTotals} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: string) => `'${v.slice(2)}`}
                      />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" name="인허가" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">데이터가 없습니다</div>
                )}
              </ChartCard>
            </div>

            {/* ═══ Row 2: Usage Summary Grid ═══ */}
            <ChartCard title="용도별 인허가 요약">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {baseUsageSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border p-2.5 text-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="size-2 rounded-full mx-auto mb-1.5" style={{ backgroundColor: item.color }} />
                    <p className="text-[11px] text-muted-foreground leading-tight mb-1">{item.label}</p>
                    <p className="text-sm font-bold tabular-nums">{item.count.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* ═══ Row 3: Yearly Usage Stacked Bar ═══ */}
            <div className="mt-6">
              <ChartCard title="연도별 건축 용도 분포">
                {typeByYear.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(320, typeByYear.length * 24 + 60)}>
                    <BarChart
                      data={typeByYear}
                      layout="vertical"
                      margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="year"
                        type="category"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        tickFormatter={(v: string) => `'${v.slice(2)}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      />
                      {activeUsageLabels.map((label, idx) => (
                        <Bar
                          key={label}
                          dataKey={label}
                          stackId="usage"
                          fill={USAGE_COLORS[idx]}
                          radius={idx === activeUsageLabels.length - 1 ? [0, 3, 3, 0] : undefined}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">데이터가 없습니다</div>
                )}
              </ChartCard>
            </div>

            {/* ═══ Row 4: Yearly Construction Type Stacked Bar ═══ */}
            <div className="mt-6">
              <ChartCard title="연도별 설계 종류 분포">
                {cnstrByYear.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(320, cnstrByYear.length * 24 + 60)}>
                    <BarChart
                      data={cnstrByYear}
                      layout="vertical"
                      margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="year"
                        type="category"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        tickFormatter={(v: string) => `'${v.slice(2)}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      />
                      {activeCnstrLabels.map((label, idx) => (
                        <Bar
                          key={label}
                          dataKey={label}
                          stackId="cnstr"
                          fill={CNSTR_COLORS[idx]}
                          radius={idx === activeCnstrLabels.length - 1 ? [0, 3, 3, 0] : undefined}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">데이터가 없습니다</div>
                )}
              </ChartCard>
            </div>

            <div className="h-16" />
          </>
        )}
      </div>
    </div>
  );
}

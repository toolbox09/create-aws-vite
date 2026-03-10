import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  MapPin,
  Heart,
  Star,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterPillCheckbox, ActiveFilterChips, SegmentedControl, SearchInput } from "@/components/ui/filters";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/layout/site-header";
import { useArchitectBaseQuery } from "@/features/architect/api/queries";
import { usePartnerListQuery, useFavoriteMutation } from "@/features/partner/api/queries";
import type { PartnerListItem, PartnerListParams } from "@/shared/api/partners/types";
import type { GetPermitBuildingDesignerBaseReq, PmtBldgDsgnReqOrderEnum } from "@conmarket/apis";

/* ═══════════════════════════════════════════
   Shared
   ═══════════════════════════════════════════ */

const REGIONS: { label: string; sidoCodes: string[] }[] = [
  { label: "수도권", sidoCodes: ["11", "28", "41"] },
  { label: "대전·충청", sidoCodes: ["30", "36", "43", "44"] },
  { label: "대구·경북", sidoCodes: ["27", "47"] },
  { label: "부산·울산·경남", sidoCodes: ["26", "31", "48"] },
  { label: "광주·전라", sidoCodes: ["29", "45", "46"] },
  { label: "강원", sidoCodes: ["42"] },
  { label: "제주", sidoCodes: ["50"] },
];

const REGION_LABELS = REGIONS.map((r) => r.label);

const TOP_TABS = ["콘마켓 파트너", "인허가 실적 조회"] as const;
type TopTab = (typeof TOP_TABS)[number];

/* ═══════════════════════════════════════════
   Partner tab — constants
   ═══════════════════════════════════════════ */

const CERT_STYLES: Record<string, string> = {
  설계: "bg-primary/8 text-primary",
  시공: "bg-blue-500/8 text-blue-600",
  감리: "bg-emerald-500/8 text-emerald-600",
};

const CERT_MAP: Record<string, string> = { 설계: "design", 시공: "construction", 감리: "supervision" };
const USAGES = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장"];
const USAGE_MAP: Record<string, string> = {
  단독주택: "detached_house", 다세대주택: "multi_family", 근린생활: "neighborhood",
  오피스텔: "officetel", 상가: "commercial", 공장: "factory",
};
const YEAR_RANGES = ["5년 이하", "5~10년", "10~20년", "20년 이상"];
const PORTFOLIO_RANGES = ["10건 이상", "30건 이상", "50건 이상"];
const SORT_OPTIONS = ["종합순", "포트폴리오순", "업력순"] as const;
const CERT_OPTIONS = ["설계", "시공", "감리"];

const SORT_MAP: Record<string, "rating" | "portfolio" | "years"> = {
  종합순: "rating", 포트폴리오순: "portfolio", 업력순: "years",
};

function yearRangeToParams(ranges: Set<string>): { minYears?: number; maxYears?: number } {
  if (ranges.size === 0) return {};
  let min = Infinity;
  let max = -Infinity;
  for (const r of ranges) {
    if (r === "5년 이하") { min = Math.min(min, 0); max = Math.max(max, 5); }
    if (r === "5~10년") { min = Math.min(min, 5); max = Math.max(max, 10); }
    if (r === "10~20년") { min = Math.min(min, 10); max = Math.max(max, 20); }
    if (r === "20년 이상") { min = Math.min(min, 20); max = Infinity; }
  }
  return {
    minYears: min === Infinity ? undefined : min,
    maxYears: max === Infinity ? undefined : max === -Infinity ? undefined : max,
  };
}

function portfolioRangeToMin(ranges: Set<string>): number | undefined {
  if (ranges.size === 0) return undefined;
  let min = Infinity;
  for (const r of ranges) {
    if (r === "10건 이상") min = Math.min(min, 10);
    if (r === "30건 이상") min = Math.min(min, 30);
    if (r === "50건 이상") min = Math.min(min, 50);
  }
  return min === Infinity ? undefined : min;
}

/* ═══════════════════════════════════════════
   Architect tab — types & columns
   ═══════════════════════════════════════════ */

const PAGE_SIZE = 20;

const ARCHITECT_SORT_OPTIONS = ["기본순", "업력순", "인허가수순"] as const;
type ArchitectSort = (typeof ARCHITECT_SORT_OPTIONS)[number];

const sortToOrder: Record<ArchitectSort, keyof typeof PmtBldgDsgnReqOrderEnum | undefined> = {
  "기본순": undefined,
  "업력순": "work_diff",
  "인허가수순": "main_use_cd_00_cnt",
};

function parsePrimaryRegion(lv1Lawd: string): string {
  const first = lv1Lawd.split(",")[0];
  return first?.split("/")[0] ?? "-";
}

const COLUMNS: { key: string; label: string; className?: string }[] = [
  { key: "reg", label: "등록번호", className: "w-[160px]" },
  { key: "name", label: "사무소명" },
  { key: "region", label: "주 인허가 지역", className: "w-[120px]" },
  { key: "years", label: "업력", className: "w-[80px] text-right" },
  { key: "permits", label: "인허가건수", className: "w-[100px] text-right" },
];

/* ═══════════════════════════════════════════
   Partner Card (API-driven)
   ═══════════════════════════════════════════ */

function PartnerCard({ partner }: { partner: PartnerListItem }) {
  const favMutation = useFavoriteMutation();
  const liked = partner.isFavorited === true;

  return (
    <Link to={`/partners/${partner.id}`} className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {partner.coverImage ? (
          <img
            src={partner.coverImage}
            alt={`${partner.name} 대표 포트폴리오`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            favMutation.mutate(partner.id, {
              onSuccess: (data) => {
                if (data.favorited) toast("관심 파트너에 추가했습니다", { icon: "❤️" });
              },
              onError: () => toast.error("로그인이 필요합니다"),
            });
          }}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50"
          aria-label="즐겨찾기"
        >
          <Heart className={`size-4 ${liked ? "fill-primary text-primary" : "text-white/80"}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {partner.certs.map((cert) => (
            <span key={cert.code} className={`rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold ${CERT_STYLES[cert.label] ?? "bg-muted"}`}>
              {cert.label}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-3">
          {partner.profileImage ? (
            <img src={partner.profileImage} alt={partner.name} className="size-9 rounded-xl object-cover" loading="lazy" />
          ) : (
            <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-xs font-semibold">{partner.name.charAt(0)}</div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate">{partner.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span>{partner.sido.label}</span>
              <span className="opacity-30">·</span>
              <span>업력 {partner.years}년</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="font-medium text-foreground">{partner.rating.toFixed(1)}</span>
            ({partner.reviewCount})
          </span>
          <span>포트폴리오 {partner.portfolioCount}건</span>
        </div>

        {partner.topReviewTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {partner.topReviewTags.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-[11px] font-normal rounded-lg">{kw}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════
   Partner Grid (API-driven)
   ═══════════════════════════════════════════ */

function PartnerGrid({
  params,
  onClearFilters,
}: {
  params: PartnerListParams;
  onClearFilters: () => void;
}) {
  const { data, isPending, isError } = usePartnerListQuery(params);
  const partners = data?.data ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const size = data?.size ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / size));

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm text-destructive">데이터를 불러오는데 실패했습니다</p>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onClearFilters}>
          <RotateCcw className="size-3.5 mr-1.5" />다시 시도
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{total.toLocaleString()}</span>건
        </p>
      </div>

      {partners.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {partners.map((p) => <PartnerCard key={p.id} partner={p} />)}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3">
          <p className="text-muted-foreground">검색 결과가 없습니다</p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={onClearFilters}>필터 초기화</Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <Button variant="outline" size="sm" className="rounded-xl" disabled={page === 1} onClick={() => {}}>
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const startPage = Math.max(1, Math.min(page - 4, totalPages - 9));
            return startPage + i;
          }).map((p) => (
            <Button key={p} variant={page === p ? "default" : "outline"} size="sm" className="rounded-xl min-w-[36px]">
              {p}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="rounded-xl" disabled={page === totalPages} onClick={() => {}}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   Architect Table (API-driven)
   ═══════════════════════════════════════════ */

function ArchitectTable({
  searchKeyword,
  onClearFilters,
}: {
  searchKeyword: string;
  onClearFilters: () => void;
}) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [architectSort, setArchitectSort] = useState<ArchitectSort>("기본순");

  const params: GetPermitBuildingDesignerBaseReq = useMemo(() => ({
    building_designer_nm: searchKeyword || undefined,
    page: String(currentPage),
    page_size: String(PAGE_SIZE),
    order: sortToOrder[architectSort],
  }), [searchKeyword, currentPage, architectSort]);

  const { data, isPending, isError } = useArchitectBaseQuery(params);

  const rows = data?.body ?? [];
  const totalCnt = Number(rows[0]?.total_cnt ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCnt / PAGE_SIZE));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{isPending ? "..." : totalCnt.toLocaleString()}</span>건
        </p>
        <select
          value={architectSort}
          onChange={(e) => { setArchitectSort(e.target.value as ArchitectSort); setCurrentPage(1); }}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {ARCHITECT_SORT_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {isPending && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="py-20 text-center space-y-3">
          <p className="text-sm text-destructive">데이터를 불러오는데 실패했습니다</p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={onClearFilters}>
            <RotateCcw className="size-3.5 mr-1.5" />다시 시도
          </Button>
        </div>
      )}

      {!isPending && !isError && (
        <div className="hidden md:block rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {COLUMNS.map((col) => (
                  <th key={col.key} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold ${col.className ?? ""}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((a, idx) => (
                  <tr
                    key={a.building_designer_reg_num}
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate(`/public-architects/${a.building_designer_reg_num}`)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/public-architects/${a.building_designer_reg_num}`); } }}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${idx % 2 === 1 ? "bg-muted/30" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.building_designer_reg_num}</td>
                    <td className="px-4 py-3 font-medium">{a.building_designer_nm}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="rounded-lg text-[11px] font-normal">{parsePrimaryRegion(a.lv1_lawd)}</Badge></td>
                    <td className="px-4 py-3 text-right tabular-nums">{a.work_diff}년</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{Number(a.main_use_cd_00_cnt).toLocaleString()}건</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-muted-foreground">검색 조건에 맞는 건축사가 없습니다</p>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={onClearFilters}><RotateCcw className="size-3.5 mr-1.5" />필터 초기화</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isPending && !isError && (
        <div className="md:hidden space-y-3">
          {rows.length > 0 ? (
            rows.map((a) => (
              <Link key={a.building_designer_reg_num} to={`/public-architects/${a.building_designer_reg_num}`} className="block rounded-2xl bg-card ring-1 ring-black/[0.08] p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">{a.building_designer_nm}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{a.building_designer_reg_num}</p>
                  </div>
                  <Badge variant="outline" className="rounded-lg text-[11px] font-normal shrink-0">{parsePrimaryRegion(a.lv1_lawd)}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">업력 <span className="font-medium text-foreground">{a.work_diff}년</span></span>
                  <span className="text-muted-foreground">인허가 <span className="font-medium text-foreground">{Number(a.main_use_cd_00_cnt).toLocaleString()}건</span></span>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground mb-3">검색 조건에 맞는 건축사가 없습니다</p>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={onClearFilters}><RotateCcw className="size-3.5 mr-1.5" />필터 초기화</Button>
            </div>
          )}
        </div>
      )}

      {!isPending && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <Button variant="outline" size="sm" className="rounded-xl" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const startPage = Math.max(1, Math.min(currentPage - 4, totalPages - 9));
            return startPage + i;
          }).map((page) => (
            <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="rounded-xl min-w-[36px]" onClick={() => setCurrentPage(page)}>
              {page}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="rounded-xl" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   Page (shared filters + segmented tab)
   ═══════════════════════════════════════════ */

export default function PartnerSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const activeView: TopTab = viewParam === "permits" ? "인허가 실적 조회" : "콘마켓 파트너";

  function setView(tab: TopTab) {
    if (tab === "인허가 실적 조회") setSearchParams({ view: "permits" });
    else setSearchParams({});
  }

  const [search, setSearch] = useState("");
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [selectedUsages, setSelectedUsages] = useState<Set<string>>(new Set());
  const [selectedPortfolios, setSelectedPortfolios] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("종합순");
  const [currentPage, setCurrentPage] = useState(1);

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) {
    setter((prev) => { const next = new Set(prev); if (next.has(value)) next.delete(value); else next.add(value); return next; });
    setCurrentPage(1);
  }

  const activeFilters: { key: string; label: string }[] = [];
  selectedCerts.forEach((c) => activeFilters.push({ key: `cert:${c}`, label: c }));
  selectedRegions.forEach((r) => activeFilters.push({ key: `region:${r}`, label: r }));
  selectedYears.forEach((y) => activeFilters.push({ key: `years:${y}`, label: `업력 ${y}` }));
  selectedUsages.forEach((u) => activeFilters.push({ key: `usage:${u}`, label: u }));
  selectedPortfolios.forEach((p) => activeFilters.push({ key: `portfolio:${p}`, label: `포트폴리오 ${p}` }));

  function removeFilter(key: string) {
    const [type, val] = [key.split(":")[0], key.split(":").slice(1).join(":")];
    if (type === "cert") toggleSet(setSelectedCerts, val);
    else if (type === "region") toggleSet(setSelectedRegions, val);
    else if (type === "years") toggleSet(setSelectedYears, val);
    else if (type === "usage") toggleSet(setSelectedUsages, val);
    else if (type === "portfolio") toggleSet(setSelectedPortfolios, val);
  }

  function clearAll() {
    setSearch(""); setSelectedCerts(new Set()); setSelectedRegions(new Set()); setSelectedYears(new Set()); setSelectedUsages(new Set()); setSelectedPortfolios(new Set()); setCurrentPage(1);
  }

  // Build API params
  const partnerParams: PartnerListParams = useMemo(() => {
    const certsArr = Array.from(selectedCerts).map((c) => CERT_MAP[c]).filter(Boolean);
    const sidoArr = Array.from(selectedRegions).flatMap((r) => REGIONS.find((rg) => rg.label === r)?.sidoCodes ?? []);
    const usagesArr = Array.from(selectedUsages).map((u) => USAGE_MAP[u]).filter(Boolean);
    const { minYears, maxYears } = yearRangeToParams(selectedYears);
    const minPortfolio = portfolioRangeToMin(selectedPortfolios);

    return {
      q: search || undefined,
      certs: certsArr.length > 0 ? certsArr.join(",") : undefined,
      sidoCodes: sidoArr.length > 0 ? sidoArr.join(",") : undefined,
      usages: usagesArr.length > 0 ? usagesArr.join(",") : undefined,
      minYears,
      maxYears,
      minPortfolio,
      sort: SORT_MAP[sort],
      page: currentPage,
      size: 20,
    };
  }, [search, selectedCerts, selectedRegions, selectedYears, selectedUsages, selectedPortfolios, sort, currentPage]);

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="mb-5 space-y-1 animate-fade-up">
          <h1 className="text-2xl font-bold tracking-tight">전문가 찾기</h1>
          <p className="text-sm text-muted-foreground">
            설계·시공·감리 전문가를 찾아보세요
          </p>
        </div>

        <div className="mb-6 animate-fade-up stagger-1">
          <SegmentedControl
            options={TOP_TABS}
            value={activeView}
            onChange={setView}
            size="md"
          />
        </div>

        <div className="relative z-40 space-y-4 mb-6 animate-fade-up stagger-1">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput placeholder="사무소명 검색" value={search} onChange={setSearch} className="w-[200px]" />
            <FilterPillCheckbox label="분야" options={CERT_OPTIONS} selected={selectedCerts} onToggle={(v) => toggleSet(setSelectedCerts, v)} />
            <FilterPillCheckbox label="지역" options={REGION_LABELS} selected={selectedRegions} onToggle={(v) => toggleSet(setSelectedRegions, v)} />
            <FilterPillCheckbox label="업력" options={YEAR_RANGES} selected={selectedYears} onToggle={(v) => toggleSet(setSelectedYears, v)} />
            {activeView === "콘마켓 파트너" && (
              <FilterPillCheckbox label="건축 용도" options={USAGES} selected={selectedUsages} onToggle={(v) => toggleSet(setSelectedUsages, v)} />
            )}
            <FilterPillCheckbox label="포트폴리오" options={PORTFOLIO_RANGES} selected={selectedPortfolios} onToggle={(v) => toggleSet(setSelectedPortfolios, v)} />
          </div>
          <ActiveFilterChips filters={activeFilters} onRemove={removeFilter} onClearAll={clearAll} />
        </div>

        {activeView === "콘마켓 파트너" ? (
          <>
            <div className="flex items-center justify-end mb-5">
              <SegmentedControl options={SORT_OPTIONS} value={sort} onChange={(v) => { setSort(v); setCurrentPage(1); }} />
            </div>
            <PartnerGrid params={partnerParams} onClearFilters={clearAll} />
          </>
        ) : (
          <ArchitectTable searchKeyword={search} onClearFilters={clearAll} />
        )}
      </div>
    </div>
  );
}

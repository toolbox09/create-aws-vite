import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Ruler,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterPill, FilterPillCheckbox, ActiveFilterChips, SegmentedControl, SearchInput } from "@/components/ui/filters";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types & Constants ─── */

type BidStatus = "입찰대기" | "입찰공고중" | "업체선정중" | "종료";
type BidType = "공개" | "제한" | "지명";

interface Bid {
  id: number;
  status: BidStatus;
  bidType: BidType;
  designScope: "가설계" | "본설계";
  address: string;
  region: string;
  buildingUse: string;
  scale: string;
  landArea: number;
  participants: number;
  designFeeMin: number;
  designFeeMax: number;
  dDay: number | null;
  certs: string[];
  liked: boolean;
}

const STATUS_LABEL: Record<BidStatus, { text: string; color: string }> = {
  입찰대기: { text: "WAITING", color: "text-zinc-400" },
  입찰공고중: { text: "OPEN", color: "text-primary" },
  업체선정중: { text: "REVIEWING", color: "text-blue-500" },
  종료: { text: "CLOSED", color: "text-zinc-300" },
};

const BID_TYPE_STYLES: Record<BidType, string> = {
  공개: "border-primary/30 text-primary",
  제한: "border-blue-500/30 text-blue-500",
  지명: "border-emerald-500/30 text-emerald-500",
};

const CERT_STYLES: Record<string, string> = {
  토지소유: "bg-emerald-500/8 text-emerald-600",
  건축가능여부: "bg-amber-500/8 text-amber-600",
  건축허가: "bg-violet-500/8 text-violet-600",
};

const FEE_MAX_BOUND = 20000;

const BUILDING_USES = [
  "단독주택",
  "다세대주택",
  "근린생활",
  "오피스텔",
  "상가",
  "공장",
];
const REGIONS = ["전체", "서울", "경기", "부산", "인천", "대전", "광주", "대구"];
const STATUS_OPTIONS = ["전체", "입찰대기", "입찰공고중", "업체선정중", "종료"];
const DESIGN_SCOPE_OPTIONS = ["전체", "가설계", "본설계"];
const FEE_RANGES = ["전체", "3,000만원 이하", "3,000~5,000만원", "5,000~10,000만원", "10,000만원 이상"];
const SORT_OPTIONS = [
  "최신순",
  "마감임박순",
  "참여자순",
] as const;

/* ─── Mock Data ─── */

const MOCK_BIDS: Bid[] = [
  { id: 1, status: "입찰공고중", bidType: "공개", designScope: "본설계", address: "서울 강남구 역삼동 123-4", region: "서울", buildingUse: "단독주택", scale: "지상 3층", landArea: 198, participants: 7, designFeeMin: 3000, designFeeMax: 5000, dDay: 12, certs: ["토지소유", "건축가능여부"], liked: false },
  { id: 2, status: "입찰공고중", bidType: "제한", designScope: "본설계", address: "경기 성남시 분당구 판교동 45-6", region: "경기", buildingUse: "근린생활", scale: "지상 5층", landArea: 330, participants: 4, designFeeMin: 8000, designFeeMax: 12000, dDay: 5, certs: ["토지소유", "건축가능여부", "건축허가"], liked: false },
  { id: 3, status: "입찰대기", bidType: "공개", designScope: "가설계", address: "부산 해운대구 우동 78-9", region: "부산", buildingUse: "다세대주택", scale: "지상 4층", landArea: 264, participants: 0, designFeeMin: 4000, designFeeMax: 6000, dDay: null, certs: ["토지소유"], liked: false },
  { id: 4, status: "업체선정중", bidType: "지명", designScope: "본설계", address: "서울 마포구 상수동 33-2", region: "서울", buildingUse: "오피스텔", scale: "지상 7층", landArea: 450, participants: 3, designFeeMin: 15000, designFeeMax: 20000, dDay: null, certs: ["토지소유", "건축가능여부"], liked: false },
  { id: 5, status: "입찰공고중", bidType: "공개", designScope: "본설계", address: "인천 연수구 송도동 100-5", region: "인천", buildingUse: "상가", scale: "지상 3층", landArea: 220, participants: 11, designFeeMin: 5000, designFeeMax: 8000, dDay: 8, certs: ["토지소유", "건축가능여부"], liked: false },
  { id: 6, status: "종료", bidType: "제한", designScope: "가설계", address: "대전 유성구 봉명동 56-1", region: "대전", buildingUse: "단독주택", scale: "지상 2층", landArea: 165, participants: 6, designFeeMin: 2000, designFeeMax: 3500, dDay: null, certs: ["토지소유"], liked: false },
  { id: 7, status: "입찰공고중", bidType: "공개", designScope: "본설계", address: "경기 수원시 팔달구 인계동 22-8", region: "경기", buildingUse: "다세대주택", scale: "지상 5층", landArea: 396, participants: 9, designFeeMin: 7000, designFeeMax: 10000, dDay: 3, certs: ["토지소유", "건축가능여부", "건축허가"], liked: false },
  { id: 8, status: "종료", bidType: "지명", designScope: "본설계", address: "광주 서구 치평동 88-3", region: "광주", buildingUse: "공장", scale: "지상 2층", landArea: 660, participants: 2, designFeeMin: 4000, designFeeMax: 6000, dDay: null, certs: ["토지소유", "건축가능여부"], liked: false },
  { id: 9, status: "입찰대기", bidType: "제한", designScope: "가설계", address: "서울 송파구 잠실동 11-7", region: "서울", buildingUse: "근린생활", scale: "지상 4층", landArea: 280, participants: 0, designFeeMin: 6000, designFeeMax: 9000, dDay: null, certs: ["토지소유"], liked: false },
];

const ITEMS_PER_PAGE = 6;

/* ─── Sub-components ─── */

function DdayBadge({
  dDay,
  status,
}: {
  dDay: number | null;
  status: BidStatus;
}) {
  if (dDay !== null) {
    const urgent = dDay <= 3;
    return (
      <span
        className={`inline-flex items-center font-mono text-xs font-bold tabular-nums tracking-wider ${
          urgent ? "text-red-500" : "text-primary"
        }`}
      >
        D-{dDay}
      </span>
    );
  }
  if (status === "입찰대기")
    return <span className="font-mono text-[11px] tracking-wider text-zinc-400">STANDBY</span>;
  if (status === "종료")
    return <span className="font-mono text-[11px] tracking-wider text-zinc-300 line-through">ENDED</span>;
  if (status === "업체선정중")
    return (
      <span className="font-mono text-[11px] tracking-wider text-blue-500">IN REVIEW</span>
    );
  return null;
}

function FeeBar({ min, max }: { min: number; max: number }) {
  const leftPct = (min / FEE_MAX_BOUND) * 100;
  const widthPct = ((max - min) / FEE_MAX_BOUND) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[3px] flex-1 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className="absolute inset-y-0 rounded-full bg-foreground transition-all duration-700"
          style={{
            left: `${leftPct}%`,
            width: `${Math.max(widthPct, 4)}%`,
          }}
        />
      </div>
      <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground tracking-tight">
        {min.toLocaleString()}–{max.toLocaleString()}
        <span className="ml-0.5 font-normal text-zinc-400">만</span>
      </span>
    </div>
  );
}

function ParticipantStack({ count }: { count: number }) {
  const shown = Math.min(count, 4);
  return (
    <div className="flex items-center gap-2">
      {count > 0 && (
        <div className="flex -space-x-1.5">
          {Array.from({ length: shown }, (_, i) => (
            <div
              key={i}
              className="flex size-5 items-center justify-center rounded-full bg-zinc-100 ring-2 ring-white"
            >
              <Users className="size-2.5 text-zinc-400" />
            </div>
          ))}
        </div>
      )}
      <span className="font-mono text-[11px] tracking-wide text-zinc-400">
        {count > 0 ? (
          <>
            <span className="font-semibold text-foreground">{count}</span>
            {" JOINED"}
          </>
        ) : (
          "NO ENTRY"
        )}
      </span>
    </div>
  );
}

/* ─── Bid Card (ABND Style) ─── */

function BidCard({ bid, index }: { bid: Bid; index: number }) {
  const [liked, setLiked] = useState(bid.liked);
  const meta = STATUS_LABEL[bid.status];

  return (
    <Link
      to={`/bids/${bid.id}`}
      className="group relative flex flex-col overflow-hidden bg-white animate-fade-up"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Card inner with border that animates */}
      <div className="relative flex flex-1 flex-col border border-zinc-200 transition-all duration-500 group-hover:border-foreground">
        {/* Top strip — status + type */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className={`font-mono text-[11px] font-bold tracking-[0.15em] ${meta.color}`}>
              {meta.text}
            </span>
            <span className="h-3 w-px bg-zinc-200" />
            <span
              className={`border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider ${BID_TYPE_STYLES[bid.bidType]}`}
            >
              {bid.bidType}
            </span>
          </div>
          <DdayBadge dDay={bid.dDay} status={bid.status} />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* Address — hero typography */}
          <div className="space-y-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-zinc-300" />
              <p className="text-[15px] font-semibold leading-snug tracking-tight">
                {bid.address}
              </p>
            </div>
            <p className="font-mono text-[11px] tracking-wider text-zinc-400">
              {bid.buildingUse} · {bid.scale}
            </p>
          </div>

          {/* Specs row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Ruler className="size-3.5" />
              <span className="font-mono text-xs font-medium tabular-nums">
                {bid.landArea.toLocaleString()}m²
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-wider text-zinc-300">
              {bid.designScope}
            </span>
          </div>

          {/* Fee range */}
          <FeeBar min={bid.designFeeMin} max={bid.designFeeMax} />

          {/* Participants */}
          <ParticipantStack count={bid.participants} />

          {/* Cert badges + heart */}
          <div className="mt-auto flex items-center justify-between pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {bid.certs.map((cert) => (
                <span
                  key={cert}
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-medium tracking-tight ${
                    CERT_STYLES[cert] ?? "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {cert}
                </span>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLiked(!liked);
                if (!liked) toast("관심 공고에 추가했습니다", { icon: "❤️" });
              }}
              className="flex size-8 items-center justify-center transition-colors hover:bg-zinc-50"
              aria-label="관심 공고"
            >
              <Heart
                className={`size-4 transition-all ${liked ? "fill-primary text-primary scale-110" : "text-zinc-300 group-hover:text-zinc-400"}`}
              />
            </button>
          </div>
        </div>

        {/* Hover reveal: arrow */}
        <div className="absolute bottom-5 right-5 flex size-8 items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
          <ArrowUpRight className="size-4 text-foreground" />
        </div>
      </div>
    </Link>
  );
}

/* ─── Helpers ─── */

function matchFeeRange(min: number, max: number, range: string) {
  if (range === "전체") return true;
  if (range === "3,000만원 이하") return max <= 3000;
  if (range === "3,000~5,000만원") return min >= 3000 && max <= 5000;
  if (range === "5,000~10,000만원") return min >= 5000 && max <= 10000;
  return min >= 10000;
}

/* ─── Page ─── */

export default function BidListPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [designScope, setDesignScope] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedUses, setSelectedUses] = useState<Set<string>>(new Set());
  const [selectedFeeRange, setSelectedFeeRange] = useState("전체");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("최신순");
  const [page, setPage] = useState(1);

  function toggleSet(
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string,
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  /* ── Active filter chips ── */
  const activeFilters: { key: string; label: string }[] = [];
  if (selectedStatus !== "전체") activeFilters.push({ key: "status", label: selectedStatus });
  if (designScope !== "전체") activeFilters.push({ key: "scope", label: designScope });
  if (selectedRegion !== "전체") activeFilters.push({ key: "region", label: selectedRegion });
  if (selectedFeeRange !== "전체") activeFilters.push({ key: "fee", label: `설계비 ${selectedFeeRange}` });
  selectedUses.forEach((u) => activeFilters.push({ key: `use:${u}`, label: u }));

  function removeFilter(key: string) {
    if (key === "status") setSelectedStatus("전체");
    else if (key === "scope") setDesignScope("전체");
    else if (key === "region") setSelectedRegion("전체");
    else if (key === "fee") setSelectedFeeRange("전체");
    else if (key.startsWith("use:")) toggleSet(setSelectedUses, key.replace("use:", ""));
    setPage(1);
  }

  function clearAll() {
    setSearch("");
    setSelectedStatus("전체");
    setDesignScope("전체");
    setSelectedRegion("전체");
    setSelectedUses(new Set());
    setSelectedFeeRange("전체");
    setPage(1);
  }

  /* ── Filter ── */
  const filtered = MOCK_BIDS.filter((b) => {
    if (search && !b.address.includes(search) && !b.buildingUse.includes(search) && !b.region.includes(search)) return false;
    if (selectedStatus !== "전체" && b.status !== selectedStatus) return false;
    if (designScope !== "전체" && b.designScope !== designScope) return false;
    if (selectedRegion !== "전체" && !b.region.includes(selectedRegion)) return false;
    if (selectedUses.size > 0 && !selectedUses.has(b.buildingUse)) return false;
    if (!matchFeeRange(b.designFeeMin, b.designFeeMax, selectedFeeRange)) return false;
    return true;
  });

  /* ── Sort ── */
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "마감임박순") return (a.dDay ?? 999) - (b.dDay ?? 999);
    if (sort === "참여자순") return b.participants - a.participants;
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const openCount = MOCK_BIDS.filter((b) => b.status === "입찰공고중").length;

  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />

      {/* ── ABND Hero Section ── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* Left: Typography */}
            <div className="space-y-3 animate-fade-up">
              <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
                Architecture Bidding Platform
              </p>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                입찰공고
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                건축 프로젝트를 위한 설계 입찰 공고를 탐색하고,
                <br className="hidden sm:block" />
                최적의 프로젝트에 참여하세요.
              </p>
            </div>

            {/* Right: Stats + CTA */}
            <div className="flex items-end gap-8 animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="hidden md:flex gap-8">
                <div className="space-y-1 text-right">
                  <p className="font-mono text-3xl font-bold tabular-nums text-primary">
                    {openCount}
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
                    OPEN NOW
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-mono text-3xl font-bold tabular-nums">
                    {MOCK_BIDS.length}
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
                    TOTAL
                  </p>
                </div>
              </div>
              <Link to="/bids/new">
                <Button className="h-11 gap-2 rounded-none bg-primary px-6 font-mono text-sm tracking-wider hover:bg-primary/90">
                  <Plus className="size-4" />
                  NEW BID
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative line */}
          <div className="mt-10 h-px w-full bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 animate-scale-x" />
        </div>
      </section>

      {/* ── Filter Section ── */}
      <div className="border-b border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto max-w-[1200px] px-6 py-5">
          <div className="relative z-40 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="주소, 건축용도 검색"
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                className="w-[200px]"
              />

              <FilterPill
                label="공고 상태"
                options={STATUS_OPTIONS}
                value={selectedStatus}
                onChange={(v) => { setSelectedStatus(v); setPage(1); }}
              />
              <FilterPill
                label="설계 범위"
                options={DESIGN_SCOPE_OPTIONS}
                value={designScope}
                onChange={(v) => { setDesignScope(v); setPage(1); }}
              />
              <FilterPill
                label="지역"
                options={REGIONS}
                value={selectedRegion}
                onChange={(v) => { setSelectedRegion(v); setPage(1); }}
              />
              <FilterPillCheckbox
                label="건축 용도"
                options={BUILDING_USES}
                selected={selectedUses}
                onToggle={(v) => { toggleSet(setSelectedUses, v); setPage(1); }}
              />
              <FilterPill
                label="설계비"
                options={FEE_RANGES}
                value={selectedFeeRange}
                onChange={(v) => { setSelectedFeeRange(v); setPage(1); }}
              />
            </div>

            <ActiveFilterChips
              filters={activeFilters}
              onRemove={removeFilter}
              onClearAll={clearAll}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        {/* ── Results Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.15em] text-zinc-400 uppercase">
              Results
            </span>
            <span className="h-3 w-px bg-zinc-200" />
            <p className="font-mono text-sm tabular-nums text-foreground">
              <span className="font-bold">{sorted.length}</span>
              <span className="ml-1 text-zinc-400">건</span>
            </p>
          </div>
          <SegmentedControl options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>

        {/* ── Card Grid ── */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((bid, i) => (
              <BidCard key={bid.id} bid={bid} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <p className="font-mono text-sm tracking-wider text-zinc-400">
              NO RESULTS FOUND
            </p>
            <p className="text-sm text-zinc-400">
              조건에 맞는 입찰 공고가 없습니다
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none font-mono text-xs tracking-wider"
              onClick={clearAll}
            >
              CLEAR FILTERS
            </Button>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-none"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex size-9 items-center justify-center font-mono text-sm font-medium transition-all ${
                  page === p
                    ? "bg-foreground text-white"
                    : "text-zinc-400 hover:text-foreground hover:bg-zinc-50"
                }`}
              >
                {p}
              </button>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-none"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

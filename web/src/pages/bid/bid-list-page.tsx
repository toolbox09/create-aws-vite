import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  Search,
  X,
  MapPin,
  Ruler,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SegmentedControl } from "@/components/ui/filters";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types & Constants ─── */

type BidCategory = "전체" | "설계" | "시공" | "감리";
type BidStatus = "입찰대기" | "입찰공고중" | "업체선정중" | "종료";
type BidType = "공개" | "제한" | "지명";

interface Bid {
  id: number;
  category: BidCategory;
  status: BidStatus;
  bidType: BidType;
  subScope: string;
  address: string;
  region: string;
  buildingUse: string;
  scale: string;
  landArea: number;
  participants: number;
  feeMin: number;
  feeMax: number;
  feeLabel: string;
  dDay: number | null;
  certs: string[];
  liked: boolean;
}

const CATEGORY_TABS: BidCategory[] = ["전체", "설계", "시공", "감리"];

const STATUS_DOT: Record<BidStatus, string> = {
  입찰대기: "bg-zinc-400",
  입찰공고중: "bg-primary animate-pulse",
  업체선정중: "bg-blue-500",
  종료: "bg-zinc-300",
};

const USE_STYLE: Record<string, string> = {
  단독주택: "bg-amber-500/8 text-amber-700",
  다세대주택: "bg-violet-500/8 text-violet-700",
  근린생활: "bg-emerald-500/8 text-emerald-700",
  오피스텔: "bg-blue-500/8 text-blue-700",
  상가: "bg-rose-500/8 text-rose-700",
  공장: "bg-zinc-500/8 text-zinc-700",
};

const USE_SHORT: Record<string, string> = {
  단독주택: "단독",
  다세대주택: "다세",
  근린생활: "근생",
  오피스텔: "오피",
  상가: "상가",
  공장: "공장",
};

const CATEGORY_BADGE_STYLE: Record<string, string> = {
  설계: "bg-primary/8 text-primary",
  시공: "bg-violet-500/8 text-violet-700",
  감리: "bg-blue-500/8 text-blue-700",
};

const SUB_SCOPE_STYLE: Record<string, string> = {
  가설계: "bg-amber-500/8 text-amber-700",
  본설계: "bg-primary/8 text-primary",
  신축: "bg-violet-500/8 text-violet-700",
  증축: "bg-violet-500/8 text-violet-700",
  리모델링: "bg-violet-500/8 text-violet-700",
  인테리어: "bg-violet-500/8 text-violet-700",
  상주감리: "bg-blue-500/8 text-blue-700",
  비상주감리: "bg-blue-500/8 text-blue-700",
  책임감리: "bg-blue-500/8 text-blue-700",
};

const BUILDING_USES = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장"];
const REGIONS = ["전체", "수도권", "대전·충청", "대구·경북", "부산·울산·경남", "광주·전라", "강원영서", "강원영동", "제주도", "기타"];
const STATUS_OPTIONS = ["전체", "입찰대기", "입찰공고중", "업체선정중", "종료"];
const SORT_OPTIONS = ["최신순", "마감임박순", "참여자순"] as const;

/* ── Category-specific sub-scope filters ── */
const SUB_SCOPE_OPTIONS: Record<BidCategory, string[]> = {
  "전체": [],
  "설계": ["가설계", "본설계"],
  "시공": ["신축", "증축", "리모델링", "인테리어"],
  "감리": ["상주감리", "비상주감리", "책임감리"],
};

/* ── Category-specific fee ranges ── */
const FEE_RANGES: Record<BidCategory, { label: string; options: string[] }> = {
  "전체": { label: "비용", options: ["전체", "3,000만원 이하", "3,000~5,000만원", "5,000~1억원", "1억원 이상"] },
  "설계": { label: "설계비", options: ["전체", "3,000만원 이하", "3,000~5,000만원", "5,000~1억원", "1억원 이상"] },
  "시공": { label: "공사비", options: ["전체", "5억원 이하", "5~10억원", "10~30억원", "30억원 이상"] },
  "감리": { label: "감리비", options: ["전체", "5,000만원 이하", "5,000만~1억원", "1~2억원", "2억원 이상"] },
};

/* ─── Mock Data ─── */

const MOCK_BIDS: Bid[] = [
  // 설계
  { id: 1, category: "설계", status: "입찰공고중", bidType: "공개", subScope: "본설계", address: "서울 강남구 역삼동 123-4", region: "서울", buildingUse: "단독주택", scale: "지상 3층", landArea: 198, participants: 7, feeMin: 3000, feeMax: 5000, feeLabel: "설계비", dDay: 12, certs: ["토지소유", "건축가능여부"], liked: false },
  { id: 2, category: "설계", status: "입찰공고중", bidType: "제한", subScope: "본설계", address: "경기 성남시 분당구 판교동 45-6", region: "경기", buildingUse: "근린생활", scale: "지상 5층", landArea: 330, participants: 4, feeMin: 8000, feeMax: 12000, feeLabel: "설계비", dDay: 5, certs: ["토지소유", "건축가능여부", "건축허가"], liked: false },
  { id: 3, category: "설계", status: "입찰대기", bidType: "공개", subScope: "가설계", address: "부산 해운대구 우동 78-9", region: "부산", buildingUse: "다세대주택", scale: "지상 4층", landArea: 264, participants: 0, feeMin: 4000, feeMax: 6000, feeLabel: "설계비", dDay: null, certs: ["토지소유"], liked: false },
  { id: 9, category: "설계", status: "입찰대기", bidType: "제한", subScope: "가설계", address: "서울 송파구 잠실동 11-7", region: "서울", buildingUse: "근린생활", scale: "지상 4층", landArea: 280, participants: 0, feeMin: 6000, feeMax: 9000, feeLabel: "설계비", dDay: null, certs: ["토지소유"], liked: false },
  // 시공
  { id: 4, category: "시공", status: "업체선정중", bidType: "지명", subScope: "신축", address: "서울 마포구 상수동 33-2", region: "서울", buildingUse: "오피스텔", scale: "지상 7층", landArea: 450, participants: 3, feeMin: 200000, feeMax: 280000, feeLabel: "공사비", dDay: null, certs: ["토지소유", "건축허가"], liked: false },
  { id: 10, category: "시공", status: "입찰공고중", bidType: "공개", subScope: "신축", address: "경기 용인시 수지구 죽전동 55-1", region: "경기", buildingUse: "단독주택", scale: "지상 2층", landArea: 330, participants: 5, feeMin: 80000, feeMax: 120000, feeLabel: "공사비", dDay: 15, certs: ["토지소유", "건축허가", "설계도서확보"], liked: false },
  { id: 11, category: "시공", status: "입찰공고중", bidType: "제한", subScope: "리모델링", address: "서울 종로구 가회동 31-5", region: "서울", buildingUse: "근린생활", scale: "지상 3층", landArea: 165, participants: 8, feeMin: 50000, feeMax: 80000, feeLabel: "공사비", dDay: 7, certs: ["토지소유", "건축허가"], liked: false },
  { id: 12, category: "시공", status: "종료", bidType: "공개", subScope: "증축", address: "대전 유성구 봉명동 56-1", region: "대전", buildingUse: "공장", scale: "지상 2층", landArea: 660, participants: 2, feeMin: 30000, feeMax: 50000, feeLabel: "공사비", dDay: null, certs: ["토지소유"], liked: false },
  // 감리
  { id: 5, category: "감리", status: "입찰공고중", bidType: "공개", subScope: "상주감리", address: "인천 연수구 송도동 100-5", region: "인천", buildingUse: "다세대주택", scale: "지상 7층", landArea: 450, participants: 11, feeMin: 8000, feeMax: 12000, feeLabel: "감리비", dDay: 8, certs: ["토지소유", "건축허가", "시공계약확보"], liked: false },
  { id: 13, category: "감리", status: "입찰공고중", bidType: "제한", subScope: "비상주감리", address: "경기 수원시 팔달구 인계동 22-8", region: "경기", buildingUse: "단독주택", scale: "지상 3층", landArea: 198, participants: 3, feeMin: 3000, feeMax: 5000, feeLabel: "감리비", dDay: 20, certs: ["토지소유", "건축허가"], liked: false },
  { id: 14, category: "감리", status: "입찰대기", bidType: "공개", subScope: "책임감리", address: "부산 수영구 광안동 88-3", region: "부산", buildingUse: "상가", scale: "지상 5층", landArea: 396, participants: 0, feeMin: 15000, feeMax: 25000, feeLabel: "감리비", dDay: null, certs: ["토지소유"], liked: false },
  // Mixed ended
  { id: 6, category: "설계", status: "종료", bidType: "제한", subScope: "가설계", address: "대전 유성구 봉명동 56-1", region: "대전", buildingUse: "단독주택", scale: "지상 2층", landArea: 165, participants: 6, feeMin: 2000, feeMax: 3500, feeLabel: "설계비", dDay: null, certs: ["토지소유"], liked: false },
  { id: 7, category: "설계", status: "입찰공고중", bidType: "공개", subScope: "본설계", address: "경기 수원시 팔달구 인계동 22-8", region: "경기", buildingUse: "다세대주택", scale: "지상 5층", landArea: 396, participants: 9, feeMin: 7000, feeMax: 10000, feeLabel: "설계비", dDay: 3, certs: ["토지소유", "건축가능여부", "건축허가"], liked: false },
  { id: 8, category: "감리", status: "종료", bidType: "지명", subScope: "상주감리", address: "광주 서구 치평동 88-3", region: "광주", buildingUse: "공장", scale: "지상 2층", landArea: 660, participants: 2, feeMin: 4000, feeMax: 6000, feeLabel: "감리비", dDay: null, certs: ["토지소유", "건축허가"], liked: false },
];

const ITEMS_PER_PAGE = 10;

/* ─── Helpers ─── */

function matchFeeRange(min: number, _max: number, range: string, category: BidCategory) {
  if (range === "전체") return true;
  if (category === "시공") {
    if (range === "5억원 이하") return min <= 50000;
    if (range === "5~10억원") return min >= 50000 && min <= 100000;
    if (range === "10~30억원") return min >= 100000 && min <= 300000;
    return min >= 300000;
  }
  if (category === "감리") {
    if (range === "5,000만원 이하") return min <= 5000;
    if (range === "5,000만~1억원") return min >= 5000 && min <= 10000;
    if (range === "1~2억원") return min >= 10000 && min <= 20000;
    return min >= 20000;
  }
  // 설계 / 전체
  if (range === "3,000만원 이하") return min <= 3000;
  if (range === "3,000~5,000만원") return min >= 3000 && min <= 5000;
  if (range === "5,000~1억원") return min >= 5000 && min <= 10000;
  return min >= 10000;
}

/* ─── Sidebar Filter Group ─── */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxList({ options, selected, onToggle }: { options: string[]; selected: Set<string>; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-0.5">
      {options.map((opt) => {
        const checked = selected.has(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className="w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 text-foreground hover:bg-muted/50"
          >
            <span className={`size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              checked ? "border-foreground bg-foreground" : "border-muted-foreground/30"
            }`}>
              {checked && (
                <svg className="size-2.5 text-background" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Bid Card (wide / single-column) ─── */

function BidCard({ bid }: { bid: Bid }) {
  const [liked, setLiked] = useState(bid.liked);
  const isEnded = bid.status === "종료";

  const feeDisplay = bid.category === "시공"
    ? `${(bid.feeMin / 10000).toFixed(0)}~${(bid.feeMax / 10000).toFixed(0)}억`
    : `${bid.feeMin.toLocaleString()}~${bid.feeMax.toLocaleString()}만원`;

  return (
    <Link
      to={`/bids/${bid.id}?field=${bid.category}`}
      className="group block rounded-2xl bg-card ring-1 ring-black/[0.12] hover:shadow-sm transition-all px-5 py-5"
    >
      <div className="flex items-start gap-4">
        {/* ── Avatar: Building use ── */}
        <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${USE_STYLE[bid.buildingUse] ?? "bg-muted text-muted-foreground"}`}>
          <span className="text-base font-bold">{USE_SHORT[bid.buildingUse] ?? bid.buildingUse.slice(0, 2)}</span>
        </div>

        {/* ── Center: Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Category + Scope badge + type + status */}
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="secondary" className={`text-[11px] font-medium rounded-lg ${CATEGORY_BADGE_STYLE[bid.category] ?? "bg-muted text-muted-foreground"}`}>
              {bid.category}
            </Badge>
            <Badge variant="secondary" className={`text-[11px] font-medium rounded-lg ${SUB_SCOPE_STYLE[bid.subScope] ?? "bg-muted text-muted-foreground"}`}>
              {bid.subScope}
            </Badge>
            <span className="text-xs text-muted-foreground">{bid.bidType}입찰</span>
            <span className="flex items-center gap-1.5 ml-1">
              <span className={`size-1.5 rounded-full ${STATUS_DOT[bid.status]}`} />
              <span className="text-xs text-muted-foreground">{bid.status}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold -tracking-tight leading-snug group-hover:text-primary transition-colors">
            {bid.address}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {bid.region}
            </span>
            <span className="flex items-center gap-1">
              <Ruler className="size-3.5" />
              {bid.landArea.toLocaleString()}m²
            </span>
            <span>{bid.buildingUse} · {bid.scale}</span>
          </div>

          {/* Certs (checkmark style) + Participants */}
          <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
            {bid.certs.map((cert) => (
              <span key={cert} className="flex items-center gap-1">
                <svg className="size-3.5 text-emerald-500" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{cert}</span>
              </span>
            ))}
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {bid.participants > 0 ? (
                <span className="font-medium text-foreground tabular-nums">{bid.participants}명 참여</span>
              ) : (
                <span>아직 없음</span>
              )}
            </span>
          </div>
        </div>

        {/* ── Right: Fee + D-day + Heart ── */}
        <div className="shrink-0 text-right flex flex-col items-end gap-2 pt-0.5">
          {bid.dDay !== null ? (
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${bid.dDay <= 3 ? "bg-red-500/8 text-red-600" : "bg-primary/8 text-primary"}`}>
              <Clock className="size-3.5" />
              D-{bid.dDay}
            </span>
          ) : isEnded ? (
            <span className="text-sm text-muted-foreground">마감</span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              대기중
            </span>
          )}

          <p className="text-sm text-muted-foreground tabular-nums">
            {feeDisplay}
          </p>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked(!liked);
              if (!liked) toast("관심 공고에 추가했습니다", { icon: "❤️" });
            }}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="관심 공고"
          >
            <Heart
              className={`size-4 transition-all ${liked ? "fill-primary text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"}`}
            />
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ─── */

export default function BidListPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<BidCategory>("전체");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedSubScopes, setSelectedSubScopes] = useState<Set<string>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [selectedUses, setSelectedUses] = useState<Set<string>>(new Set());
  const [selectedFees, setSelectedFees] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("최신순");
  const [activeOnly, setActiveOnly] = useState(false);
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

  const activeCount = selectedStatuses.size + selectedSubScopes.size + selectedRegions.size + selectedUses.size + selectedFees.size;

  function clearAll() {
    setSearch("");
    setSelectedStatuses(new Set());
    setSelectedSubScopes(new Set());
    setSelectedRegions(new Set());
    setSelectedUses(new Set());
    setSelectedFees(new Set());
    setPage(1);
  }

  function switchCategory(cat: BidCategory) {
    setActiveCategory(cat);
    setSelectedSubScopes(new Set());
    setSelectedFees(new Set());
    setPage(1);
  }

  const subScopeOptions = SUB_SCOPE_OPTIONS[activeCategory];
  const feeConfig = FEE_RANGES[activeCategory];

  /* ── Filter ── */
  const filtered = MOCK_BIDS.filter((b) => {
    if (activeCategory !== "전체" && b.category !== activeCategory) return false;
    if (activeOnly && b.status !== "입찰공고중") return false;
    if (search && !b.address.includes(search) && !b.buildingUse.includes(search) && !b.region.includes(search)) return false;
    if (selectedStatuses.size > 0 && !selectedStatuses.has(b.status)) return false;
    if (selectedSubScopes.size > 0 && !selectedSubScopes.has(b.subScope)) return false;
    if (selectedRegions.size > 0 && !selectedRegions.has(b.region)) return false;
    if (selectedUses.size > 0 && !selectedUses.has(b.buildingUse)) return false;
    if (selectedFees.size > 0 && ![...selectedFees].some((r) => matchFeeRange(b.feeMin, b.feeMax, r, b.category as BidCategory))) return false;
    return true;
  });

  /* ── Sort ── */
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "마감임박순") return (a.dDay ?? 999) - (b.dDay ?? 999);
    if (sort === "참여자순") return b.participants - a.participants;
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* ── Category counts ── */
  const categoryCounts: Record<BidCategory, number> = {
    "전체": MOCK_BIDS.length,
    "설계": MOCK_BIDS.filter((b) => b.category === "설계").length,
    "시공": MOCK_BIDS.filter((b) => b.category === "시공").length,
    "감리": MOCK_BIDS.filter((b) => b.category === "감리").length,
  };

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto" style={{ maxWidth: "var(--page-max)", padding: "var(--section-gap) var(--page-px)" }}>
        {/* ── Title ── */}
        <div className="mb-6 flex items-end justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold -tracking-tight">입찰공고</h1>
            <p className="text-sm text-muted-foreground">
              건축 프로젝트를 위한 설계·시공·감리 입찰 공고를 탐색하고 참여하세요
            </p>
          </div>
          <Link to="/bids/new">
            <Button className="h-10 rounded-xl gap-1.5">
              <Plus className="size-4" />
              공고 등록
            </Button>
          </Link>
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex items-center gap-1 mb-6 border-b border-border/50">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
              <span className="ml-1.5 text-xs text-muted-foreground">{categoryCounts[cat]}</span>
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── 2-column: Sidebar + List ── */}
        <div className="flex gap-8">
          {/* ════ Left Sidebar Filters ════ */}
          <aside className="w-[240px] shrink-0 hidden lg:block">
            <div className="sticky top-20">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="주소, 건축용도 검색"
                  className="w-full pl-9 pr-8 h-10 rounded-xl bg-muted/50 ring-1 ring-black/[0.12] text-sm outline-none focus:ring-foreground transition-colors"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setPage(1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              <Separator />

              <FilterSection title="공고 상태">
                <CheckboxList options={STATUS_OPTIONS.filter((o) => o !== "전체")} selected={selectedStatuses} onToggle={(v) => { toggleSet(setSelectedStatuses, v); setPage(1); }} />
              </FilterSection>

              <Separator />

              {/* Category-specific sub-scope filter */}
              {subScopeOptions.length > 0 && (
                <>
                  <FilterSection title={activeCategory === "설계" ? "설계 범위" : activeCategory === "시공" ? "시공 범위" : "감리 유형"}>
                    <CheckboxList options={subScopeOptions} selected={selectedSubScopes} onToggle={(v) => { toggleSet(setSelectedSubScopes, v); setPage(1); }} />
                  </FilterSection>
                  <Separator />
                </>
              )}

              <FilterSection title="지역">
                <CheckboxList options={REGIONS.filter((o) => o !== "전체")} selected={selectedRegions} onToggle={(v) => { toggleSet(setSelectedRegions, v); setPage(1); }} />
              </FilterSection>

              <Separator />

              <FilterSection title="건축 용도">
                <CheckboxList options={BUILDING_USES} selected={selectedUses} onToggle={(v) => { toggleSet(setSelectedUses, v); setPage(1); }} />
              </FilterSection>

              <Separator />

              {/* Category-specific fee filter */}
              <FilterSection title={feeConfig.label}>
                <CheckboxList options={feeConfig.options.filter((o) => o !== "전체")} selected={selectedFees} onToggle={(v) => { toggleSet(setSelectedFees, v); setPage(1); }} />
              </FilterSection>
            </div>
          </aside>

          {/* ════ Right: Results ════ */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  총 <span className="font-semibold text-foreground">{sorted.length}</span>건
                </p>
                <button
                  onClick={() => { setActiveOnly(!activeOnly); setPage(1); }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${activeOnly ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${activeOnly ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                  </span>
                  <span className={`text-sm transition-colors ${activeOnly ? "text-foreground font-medium" : "text-muted-foreground"}`}>진행중만</span>
                </button>
              </div>
              <SegmentedControl options={SORT_OPTIONS} value={sort} onChange={setSort} />
            </div>

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {[...selectedStatuses].map((v) => (
                  <button key={`s-${v}`} onClick={() => toggleSet(setSelectedStatuses, v)} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors">
                    {v}<X className="size-3 text-muted-foreground" />
                  </button>
                ))}
                {[...selectedSubScopes].map((v) => (
                  <button key={`sc-${v}`} onClick={() => toggleSet(setSelectedSubScopes, v)} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors">
                    {v}<X className="size-3 text-muted-foreground" />
                  </button>
                ))}
                {[...selectedRegions].map((v) => (
                  <button key={`r-${v}`} onClick={() => toggleSet(setSelectedRegions, v)} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors">
                    {v}<X className="size-3 text-muted-foreground" />
                  </button>
                ))}
                {[...selectedUses].map((v) => (
                  <button key={`u-${v}`} onClick={() => toggleSet(setSelectedUses, v)} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors">
                    {v}<X className="size-3 text-muted-foreground" />
                  </button>
                ))}
                {[...selectedFees].map((v) => (
                  <button key={`f-${v}`} onClick={() => toggleSet(setSelectedFees, v)} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors">
                    {v}<X className="size-3 text-muted-foreground" />
                  </button>
                ))}
                <button onClick={clearAll} className="text-xs text-primary font-medium hover:underline ml-1">
                  초기화
                </button>
              </div>
            )}

            {/* Card List */}
            {paginated.length > 0 ? (
              <div className="space-y-3">
                {paginated.map((bid) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <p className="text-muted-foreground">검색 결과가 없습니다</p>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={clearAll}>
                  필터 초기화
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl min-w-[36px]"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

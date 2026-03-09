import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  MapPin,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterPill, FilterPillCheckbox, ActiveFilterChips, SegmentedControl, SearchInput } from "@/components/ui/filters";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types & Constants ─── */

const CERT_STYLES = {
  설계: "bg-primary/8 text-primary",
  시공: "bg-blue-500/8 text-blue-600",
  감리: "bg-emerald-500/8 text-emerald-600",
} as const;

type CertType = keyof typeof CERT_STYLES;

interface Partner {
  id: number;
  name: string;
  region: string;
  image: string;
  profileImage: string;
  certs: CertType[];
  usage: string[];
  portfolioCount: number;
  reviewCount: number;
  rating: number;
  years: number;
  keywords: string[];
}

const REGIONS = ["전체", "서울", "경기", "부산", "인천", "대전", "광주"];
const USAGES = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장"];
const YEAR_RANGES = ["전체", "5년 이하", "5~10년", "10~20년", "20년 이상"];
const PORTFOLIO_RANGES = ["전체", "10건 이상", "30건 이상", "50건 이상"];
const SORT_OPTIONS = ["종합순", "포트폴리오순", "업력순"] as const;
const CERT_OPTIONS: CertType[] = ["설계", "시공", "감리"];

/* ─── Mock Data ─── */

const PARTNERS: Partner[] = [
  { id: 1, name: "아크 건축사사무소", region: "서울 강남구", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", certs: ["설계", "감리"], usage: ["단독주택", "다세대주택"], portfolioCount: 47, reviewCount: 23, rating: 4.8, years: 12, keywords: ["전문적이에요", "소통이 좋아요"] },
  { id: 2, name: "리움 디자인 건축", region: "서울 서초구", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face", certs: ["설계"], usage: ["단독주택", "근린생활"], portfolioCount: 32, reviewCount: 18, rating: 4.9, years: 8, keywords: ["디자인이 좋아요", "약속을 잘 지켜요"] },
  { id: 3, name: "한빛 종합건설", region: "경기 성남시", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", certs: ["시공"], usage: ["다세대주택", "오피스텔", "상가"], portfolioCount: 89, reviewCount: 56, rating: 4.6, years: 20, keywords: ["믿음이 가요", "꼼꼼해요"] },
  { id: 4, name: "도시공간 건축", region: "서울 마포구", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face", certs: ["설계", "시공", "감리"], usage: ["단독주택", "근린생활", "공장"], portfolioCount: 63, reviewCount: 41, rating: 4.7, years: 15, keywords: ["전문적이에요", "친절해요"] },
  { id: 5, name: "블루프린트 건축", region: "부산 해운대구", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", certs: ["설계", "감리"], usage: ["단독주택"], portfolioCount: 28, reviewCount: 14, rating: 4.5, years: 6, keywords: ["소통이 좋아요", "합리적이에요"] },
  { id: 6, name: "정우 감리사무소", region: "인천 연수구", image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face", certs: ["감리"], usage: ["다세대주택", "오피스텔"], portfolioCount: 34, reviewCount: 29, rating: 4.9, years: 18, keywords: ["꼼꼼해요", "전문적이에요"] },
  { id: 7, name: "세움 건축설계", region: "대전 유성구", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=face", certs: ["설계"], usage: ["단독주택", "근린생활"], portfolioCount: 15, reviewCount: 8, rating: 4.7, years: 4, keywords: ["감각적이에요", "소통이 좋아요"] },
  { id: 8, name: "태양 종합건설", region: "경기 수원시", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop", profileImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop&crop=face", certs: ["시공", "감리"], usage: ["다세대주택", "상가", "공장"], portfolioCount: 72, reviewCount: 45, rating: 4.5, years: 22, keywords: ["믿음이 가요", "경험이 풍부해요"] },
];

/* ─── Helpers ─── */

function matchYearRange(years: number, range: string) {
  if (range === "전체") return true;
  if (range === "5년 이하") return years <= 5;
  if (range === "5~10년") return years > 5 && years <= 10;
  if (range === "10~20년") return years > 10 && years <= 20;
  return years > 20;
}

function matchPortfolioRange(count: number, range: string) {
  if (range === "전체") return true;
  if (range === "10건 이상") return count >= 10;
  if (range === "30건 이상") return count >= 30;
  return count >= 50;
}

/* ─── Partner Card ─── */

function PartnerCard({ partner }: { partner: Partner }) {
  const [liked, setLiked] = useState(false);

  return (
    <Link to={`/partners/${partner.id}`} className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.08] hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="relative aspect-[3/2] overflow-hidden">
        <img
          src={partner.image}
          alt={`${partner.name} 대표 포트폴리오`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); if (!liked) toast("관심 파트너에 추가했습니다", { icon: "❤️" }); }}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50"
          aria-label="즐겨찾기"
        >
          <Heart className={`size-4 ${liked ? "fill-primary text-primary" : "text-white/80"}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {partner.certs.map((cert) => (
            <span key={cert} className={`rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold ${CERT_STYLES[cert]}`}>
              {cert}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-3">
          <img src={partner.profileImage} alt={partner.name} className="size-9 rounded-xl object-cover" loading="lazy" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate">{partner.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span>{partner.region}</span>
              <span className="opacity-30">·</span>
              <span>업력 {partner.years}년</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="font-medium text-foreground">{partner.rating}</span>
            ({partner.reviewCount})
          </span>
          <span>포트폴리오 {partner.portfolioCount}건</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {partner.keywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="text-[11px] font-normal rounded-lg">{kw}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ─── */

export default function PartnerSearchPage() {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedYears, setSelectedYears] = useState("전체");
  const [selectedPortfolio, setSelectedPortfolio] = useState("전체");
  const [selectedUsages, setSelectedUsages] = useState<Set<string>>(new Set());
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("종합순");

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) {
    setter((prev) => { const next = new Set(prev); if (next.has(value)) next.delete(value); else next.add(value); return next; });
  }

  const activeFilters: { key: string; label: string }[] = [];
  if (selectedRegion !== "전체") activeFilters.push({ key: "region", label: selectedRegion });
  if (selectedYears !== "전체") activeFilters.push({ key: "years", label: `업력 ${selectedYears}` });
  if (selectedPortfolio !== "전체") activeFilters.push({ key: "portfolio", label: `포트폴리오 ${selectedPortfolio}` });
  selectedUsages.forEach((u) => activeFilters.push({ key: `usage:${u}`, label: u }));
  selectedCerts.forEach((c) => activeFilters.push({ key: `cert:${c}`, label: c }));

  function removeFilter(key: string) {
    if (key === "region") setSelectedRegion("전체");
    else if (key === "years") setSelectedYears("전체");
    else if (key === "portfolio") setSelectedPortfolio("전체");
    else if (key.startsWith("usage:")) toggleSet(setSelectedUsages, key.replace("usage:", ""));
    else if (key.startsWith("cert:")) toggleSet(setSelectedCerts, key.replace("cert:", ""));
  }

  function clearAll() {
    setSearch(""); setSelectedRegion("전체"); setSelectedYears("전체"); setSelectedPortfolio("전체"); setSelectedUsages(new Set()); setSelectedCerts(new Set());
  }

  const filtered = PARTNERS.filter((p) => {
    if (search && !p.name.includes(search) && !p.region.includes(search)) return false;
    if (selectedRegion !== "전체" && !p.region.includes(selectedRegion)) return false;
    if (!matchYearRange(p.years, selectedYears)) return false;
    if (!matchPortfolioRange(p.portfolioCount, selectedPortfolio)) return false;
    if (selectedUsages.size > 0 && !p.usage.some((u) => selectedUsages.has(u))) return false;
    if (selectedCerts.size > 0 && !p.certs.some((c) => selectedCerts.has(c))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "포트폴리오순") return b.portfolioCount - a.portfolioCount;
    if (sort === "업력순") return b.years - a.years;
    return b.rating * b.reviewCount - a.rating * a.reviewCount;
  });

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="mb-6 space-y-1 animate-fade-up">
          <h1 className="text-2xl font-bold tracking-tight">건축 파트너 찾기</h1>
          <p className="text-sm text-muted-foreground">인증된 설계·시공·감리 파트너를 찾아보세요</p>
        </div>

        {/* ── Horizontal Filter Bar ── */}
        <div className="relative z-40 space-y-4 mb-6 animate-fade-up stagger-1">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput placeholder="사무소명, 지역 검색" value={search} onChange={setSearch} className="w-[200px]" />

            <FilterPill label="지역" options={REGIONS} value={selectedRegion} onChange={setSelectedRegion} />
            <FilterPillCheckbox label="분야" options={CERT_OPTIONS} selected={selectedCerts} onToggle={(v) => toggleSet(setSelectedCerts, v)} />
            <FilterPill label="업력" options={YEAR_RANGES} value={selectedYears} onChange={setSelectedYears} />
            <FilterPillCheckbox label="건축 용도" options={USAGES} selected={selectedUsages} onToggle={(v) => toggleSet(setSelectedUsages, v)} />
            <FilterPill label="포트폴리오" options={PORTFOLIO_RANGES} value={selectedPortfolio} onChange={setSelectedPortfolio} />
          </div>

          <ActiveFilterChips filters={activeFilters} onRemove={removeFilter} onClearAll={clearAll} />
        </div>

        {/* ── Results Header ── */}
        <div className="flex items-center justify-between mb-5 animate-fade-up stagger-2">
          <p className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{sorted.length}</span>개 파트너
          </p>
          <SegmentedControl options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>

        {/* ── Card Grid (full width) ── */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((p) => <PartnerCard key={p.id} partner={p} />)}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={clearAll}>필터 초기화</Button>
          </div>
        )}
      </div>
    </div>
  );
}

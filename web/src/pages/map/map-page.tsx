import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  MapPin,
  Layers,
  Ruler,
  Eye,
  Plus,
  Minus,
  Navigation,
  Combine,
  SlidersHorizontal,
  ChevronLeft,
  Building2,
  LandPlot,
  ArrowUpRight,
  ArrowLeftRight,
  TrendingUp,
  Trash2,
  Sparkles,
  Calculator,
  Clock,
  Home,
  Briefcase,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface Parcel {
  pnu: string;
  address: string;
  roadAddress: string;
  landArea: number;
  landUse: string;
  zoning: string;
  landCategory: string;
  officialPrice: number;
  officialPriceYear: number;
  roadAccess: string;
  terrain: string;
  shape: string;
  lat: number;
  lng: number;
}

interface Building {
  name: string;
  type: string;
  mainUse: string;
  buildingArea: number;
  totalFloorArea: number;
  coverageRatio: number;
  floorAreaRatio: number;
  floors: number;
  basements: number;
  approvalDate: string;
}

interface TradeRecord {
  date: string;
  price: number;
  area: number;
  type: string;
  pricePerM2: number;
}

interface Listing {
  type: string;
  price: number;
  area: number;
  floor: string;
  direction: string;
  registeredDate: string;
}

interface SearchResult {
  type: string;
  text: string;
  sub: string;
  lat: number;
  lng: number;
}

type AreaUnit = "m2" | "pyeong";
type DetailTab = "land" | "building" | "trade";
type MapMode = "default" | "merge" | "measure" | "roadview";

/* ─── Constants ─── */

const M2_PER_PYEONG = 3.305785;
const SEOUL_CENTER: [number, number] = [37.5015, 127.0397]; // 강남구 역삼동

function fmt(n: number): string {
  return n.toLocaleString("ko-KR");
}

function toEok(n: number): string {
  const eok = n / 100_000_000;
  if (eok >= 1) return `${eok.toFixed(1)}억`;
  return `${fmt(Math.round(n / 10_000))}만`;
}

function convertArea(m2: number, unit: AreaUnit): string {
  if (unit === "pyeong") return (m2 / M2_PER_PYEONG).toFixed(1);
  return m2.toFixed(1);
}

/* ─── Naver Maps Marker HTML ─── */

/* ─── Pulse animation style (injected once) ─── */
const PULSE_STYLE_ID = "map-pulse-style";
if (typeof document !== "undefined" && !document.getElementById(PULSE_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes marker-bounce {
      0%, 100% { transform: rotate(-45deg) scale(1); }
      30% { transform: rotate(-45deg) scale(1.25); }
      60% { transform: rotate(-45deg) scale(0.95); }
    }
    @keyframes marker-pulse-ring {
      0% { transform: scale(0.5); opacity: 0.8; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .marker-selected {
      animation: marker-bounce 0.5s ease-out;
    }
    .marker-pulse-ring {
      position: absolute; top: 50%; left: 50%;
      width: 28px; height: 28px; margin-top: -14px; margin-left: -14px;
      border-radius: 50%; background: rgba(242,97,24,0.3);
      animation: marker-pulse-ring 1.5s ease-out infinite;
    }
  `;
  document.head.appendChild(style);
}

const PRIMARY_ICON_HTML = `<div style="position:relative;">
  <div class="marker-pulse-ring"></div>
  <div class="marker-selected" style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#F26118;transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  "><div style="width:10px;height:10px;border-radius:50%;background:white;"></div></div>
</div>`;

function priceMarkerHtml(label: string) {
  return `<div style="
    background:#F26118;color:white;font-size:11px;font-weight:700;
    padding:3px 8px;border-radius:6px;white-space:nowrap;
    box-shadow:0 1px 4px rgba(0,0,0,0.2);
  ">${label}</div>`;
}

function listingMarkerHtml(label: string) {
  return `<div style="
    background:#3B82F6;color:white;font-size:11px;font-weight:700;
    padding:3px 8px;border-radius:6px;white-space:nowrap;
    box-shadow:0 1px 4px rgba(0,0,0,0.2);
  ">${label}</div>`;
}

const PARCEL_DOT_HTML = `<div style="
  width:12px;height:12px;border-radius:50%;
  background:rgba(242,97,24,0.3);border:2px solid #F26118;
"></div>`;

/* ─── Mock Data ─── */

const MOCK_PARCELS: Parcel[] = [
  {
    pnu: "1168010100101230004",
    address: "서울특별시 강남구 역삼동 123-4",
    roadAddress: "서울특별시 강남구 테헤란로 152",
    landArea: 330.5,
    landUse: "택지",
    zoning: "제2종일반주거지역",
    landCategory: "대",
    officialPrice: 12_500_000,
    officialPriceYear: 2025,
    roadAccess: "광대로한면",
    terrain: "평지",
    shape: "정방형",
    lat: 37.5015,
    lng: 127.0397,
  },
  {
    pnu: "1168010100101230005",
    address: "서울특별시 강남구 역삼동 456-7",
    roadAddress: "서울특별시 강남구 테헤란로 210",
    landArea: 210.3,
    landUse: "택지",
    zoning: "제3종일반주거지역",
    landCategory: "대",
    officialPrice: 11_800_000,
    officialPriceYear: 2025,
    roadAccess: "소로한면",
    terrain: "평지",
    shape: "사다리형",
    lat: 37.5035,
    lng: 127.0420,
  },
  {
    pnu: "1168010100101230006",
    address: "서울특별시 강남구 삼성동 78-2",
    roadAddress: "서울특별시 강남구 삼성로 95",
    landArea: 520.0,
    landUse: "상업",
    zoning: "일반상업지역",
    landCategory: "대",
    officialPrice: 18_200_000,
    officialPriceYear: 2025,
    roadAccess: "광대로한면",
    terrain: "평지",
    shape: "정방형",
    lat: 37.5085,
    lng: 127.0580,
  },
  {
    pnu: "1168010100101230007",
    address: "서울특별시 강남구 대치동 501-3",
    roadAddress: "서울특별시 강남구 남부순환로 2947",
    landArea: 420.7,
    landUse: "택지",
    zoning: "제3종일반주거지역",
    landCategory: "대",
    officialPrice: 14_300_000,
    officialPriceYear: 2025,
    roadAccess: "중로한면",
    terrain: "평지",
    shape: "장방형",
    lat: 37.4945,
    lng: 127.0620,
  },
  {
    pnu: "1168010100101230008",
    address: "서울특별시 강남구 논현동 62-18",
    roadAddress: "서울특별시 강남구 논현로 523",
    landArea: 285.2,
    landUse: "택지",
    zoning: "제2종일반주거지역",
    landCategory: "대",
    officialPrice: 13_100_000,
    officialPriceYear: 2025,
    roadAccess: "소로한면",
    terrain: "평지",
    shape: "부정형",
    lat: 37.5120,
    lng: 127.0310,
  },
  {
    pnu: "1168010100101230009",
    address: "서울특별시 강남구 청담동 130-5",
    roadAddress: "서울특별시 강남구 선릉로 826",
    landArea: 680.0,
    landUse: "상업",
    zoning: "일반상업지역",
    landCategory: "대",
    officialPrice: 22_500_000,
    officialPriceYear: 2025,
    roadAccess: "광대로각지",
    terrain: "평지",
    shape: "정방형",
    lat: 37.5210,
    lng: 127.0510,
  },
  {
    pnu: "1168010100101230010",
    address: "서울특별시 강남구 역삼동 735-12",
    roadAddress: "서울특별시 강남구 강남대로 382",
    landArea: 198.5,
    landUse: "택지",
    zoning: "제2종일반주거지역",
    landCategory: "대",
    officialPrice: 11_200_000,
    officialPriceYear: 2025,
    roadAccess: "소로한면",
    terrain: "평지",
    shape: "사다리형",
    lat: 37.4988,
    lng: 127.0355,
  },
  {
    pnu: "1168010100101230011",
    address: "서울특별시 강남구 삼성동 154-9",
    roadAddress: "서울특별시 강남구 봉은사로 317",
    landArea: 756.3,
    landUse: "상업",
    zoning: "준주거지역",
    landCategory: "대",
    officialPrice: 16_800_000,
    officialPriceYear: 2025,
    roadAccess: "광대로한면",
    terrain: "평지",
    shape: "장방형",
    lat: 37.5130,
    lng: 127.0560,
  },
  {
    pnu: "1168010100101230012",
    address: "서울특별시 강남구 대치동 890-4",
    roadAddress: "서울특별시 강남구 삼성로 212",
    landArea: 345.0,
    landUse: "택지",
    zoning: "제3종일반주거지역",
    landCategory: "대",
    officialPrice: 15_600_000,
    officialPriceYear: 2025,
    roadAccess: "중로한면",
    terrain: "평지",
    shape: "정방형",
    lat: 37.5005,
    lng: 127.0530,
  },
];

const MOCK_BUILDING: Building = {
  name: "역삼빌딩",
  type: "일반",
  mainUse: "근린생활시설",
  buildingArea: 198.3,
  totalFloorArea: 792.0,
  coverageRatio: 59.9,
  floorAreaRatio: 239.6,
  floors: 5,
  basements: 1,
  approvalDate: "2018-03-15",
};

const MOCK_TRADES: TradeRecord[] = [
  { date: "2025.01", price: 2_850_000_000, area: 330.5, type: "토지", pricePerM2: 8_623_000 },
  { date: "2024.06", price: 2_650_000_000, area: 330.5, type: "토지", pricePerM2: 8_018_000 },
  { date: "2023.11", price: 2_500_000_000, area: 330.5, type: "토지", pricePerM2: 7_564_000 },
  { date: "2022.08", price: 2_780_000_000, area: 330.5, type: "토지", pricePerM2: 8_411_000 },
];

const MOCK_LISTINGS: Listing[] = [
  { type: "근린생활", price: 850_000_000, area: 132.0, floor: "1층", direction: "남향", registeredDate: "2025.02.15" },
  { type: "주거", price: 620_000_000, area: 82.5, floor: "3층", direction: "남동향", registeredDate: "2025.01.22" },
];

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  { type: "주소", text: "서울특별시 강남구 역삼동 123-4", sub: "역삼동", lat: 37.5015, lng: 127.0397 },
  { type: "주소", text: "서울특별시 강남구 역삼동 456-7", sub: "역삼동", lat: 37.5035, lng: 127.0420 },
  { type: "주소", text: "서울특별시 강남구 삼성동 78-2", sub: "삼성동", lat: 37.5085, lng: 127.0580 },
  { type: "주소", text: "서울특별시 강남구 대치동 501-3", sub: "대치동", lat: 37.4945, lng: 127.0620 },
  { type: "주소", text: "서울특별시 강남구 논현동 62-18", sub: "논현동", lat: 37.5120, lng: 127.0310 },
  { type: "주소", text: "서울특별시 강남구 청담동 130-5", sub: "청담동", lat: 37.5210, lng: 127.0510 },
  { type: "주소", text: "서울특별시 강남구 역삼동 735-12", sub: "역삼동", lat: 37.4988, lng: 127.0355 },
  { type: "주소", text: "서울특별시 강남구 삼성동 154-9", sub: "삼성동", lat: 37.5130, lng: 127.0560 },
  { type: "주소", text: "서울특별시 강남구 대치동 890-4", sub: "대치동", lat: 37.5005, lng: 127.0530 },
  { type: "지하철", text: "역삼역 2호선", sub: "강남구", lat: 37.5007, lng: 127.0366 },
  { type: "시군구", text: "서울특별시 강남구", sub: "서울", lat: 37.4979, lng: 127.0276 },
];

const MOCK_PRICE_MARKERS = [
  { lat: 37.4995, lng: 127.0350, label: "2.8억" },
  { lat: 37.5055, lng: 127.0450, label: "8.5억" },
  { lat: 37.5070, lng: 127.0320, label: "6.2억" },
];

const MOCK_LISTING_MARKERS = [
  { lat: 37.5040, lng: 127.0500, label: "매물 3" },
];

const RECENT_SEARCHES = [
  "서울특별시 강남구 역삼동",
  "서울특별시 서초구 서초동",
  "서울특별시 송파구 잠실동",
];

/* ─── Sub-components ─── */

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${accent ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3">
      <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="text-base font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─── Naver Maps hook ─── */

function useNaverMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: { center: [number, number]; zoom: number },
) {
  const mapRef = useRef<naver.maps.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // Guard: wait for Naver Maps SDK to load
    if (typeof naver === "undefined" || !naver.maps) return;
    const map = new naver.maps.Map(containerRef.current, {
      center: new naver.maps.LatLng(options.center[0], options.center[1]),
      zoom: options.zoom,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: true,
      mapDataControl: false,
    });
    mapRef.current = map;
    return () => {
      mapRef.current = null;
      try { map.destroy(); } catch { /* SDK already torn down */ }
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mapRef;
}

/* ─── Map Page ─── */

export default function MapPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("land");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [mapMode, setMapMode] = useState<MapMode>("default");
  const [mergedParcels, setMergedParcels] = useState<Parcel[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(SEOUL_CENTER);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [emptyClickPos, setEmptyClickPos] = useState<[number, number] | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedBuildingTypes, setSelectedBuildingTypes] = useState<string[]>([]);

  // Naver Map
  const naverMapRef = useNaverMap(mapContainerRef, { center: SEOUL_CENTER, zoom: 16 });
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const clickListenerRef = useRef<any>(null);

  // Filter state
  const [filterMarkerTypes, setFilterMarkerTypes] = useState<Set<string>>(new Set(["실거래", "매물"]));
  const [filterPropertyTypes, setFilterPropertyTypes] = useState<Set<string>>(new Set());
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterAreaMin, setFilterAreaMin] = useState("");
  const [filterAreaMax, setFilterAreaMax] = useState("");

  // Compute active filter chips
  const activeFilters: { key: string; label: string }[] = [];
  if (filterMarkerTypes.size > 0 && filterMarkerTypes.size < 2) {
    activeFilters.push({ key: "marker", label: Array.from(filterMarkerTypes).join(", ") });
  }
  filterPropertyTypes.forEach((t) => {
    activeFilters.push({ key: `prop-${t}`, label: t });
  });
  if (filterPriceMin || filterPriceMax) {
    activeFilters.push({ key: "price", label: `금액 ${filterPriceMin || "0"}~${filterPriceMax || "∞"}` });
  }
  if (filterAreaMin || filterAreaMax) {
    activeFilters.push({ key: "area", label: `면적 ${filterAreaMin || "0"}~${filterAreaMax || "∞"}m²` });
  }

  const handleResetFilters = useCallback(() => {
    setFilterMarkerTypes(new Set(["실거래", "매물"]));
    setFilterPropertyTypes(new Set());
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterAreaMin("");
    setFilterAreaMax("");
  }, []);

  const handleRemoveFilter = useCallback((key: string) => {
    if (key === "marker") setFilterMarkerTypes(new Set(["실거래", "매물"]));
    else if (key.startsWith("prop-")) {
      const t = key.replace("prop-", "");
      setFilterPropertyTypes((prev) => { const next = new Set(prev); next.delete(t); return next; });
    }
    else if (key === "price") { setFilterPriceMin(""); setFilterPriceMax(""); }
    else if (key === "area") { setFilterAreaMin(""); setFilterAreaMax(""); }
  }, []);

  const toggleMarkerType = useCallback((t: string) => {
    setFilterMarkerTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }, []);

  const togglePropertyType = useCallback((t: string) => {
    setFilterPropertyTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }, []);

  const unitLabel = areaUnit === "m2" ? "m\u00B2" : "평";

  // ─── Naver Maps: pan to center when mapCenter/mapZoom changes ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || typeof naver === "undefined" || !naver.maps) return;
    map.panTo(new naver.maps.LatLng(mapCenter[0], mapCenter[1]));
    if (mapZoom !== undefined) {
      map.setZoom(mapZoom, true);
    }
  }, [mapCenter, mapZoom, naverMapRef]);

  // ─── Naver Maps: click handler ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || typeof naver === "undefined" || !naver.maps) return;
    if (clickListenerRef.current) {
      naver.maps.Event.removeListener(clickListenerRef.current);
    }
    clickListenerRef.current = naver.maps.Event.addListener(map, "click", (e: any) => {
      const lat = e.coord.lat();
      const lng = e.coord.lng();
      // Find nearest mock parcel (within ~330m)
      const nearest = MOCK_PARCELS.reduce<{ parcel: Parcel; dist: number } | null>((best, p) => {
        const dist = Math.sqrt((p.lat - lat) ** 2 + (p.lng - lng) ** 2);
        if (!best || dist < best.dist) return { parcel: p, dist };
        return best;
      }, null);

      if (nearest && nearest.dist < 0.003) {
        setSelectedParcel(nearest.parcel);

        setShowFilter(false);
        setMapCenter([nearest.parcel.lat, nearest.parcel.lng]);
        setMapZoom(17);
        setEmptyClickPos(null);
        setDetailTab("land");
      } else {
        setEmptyClickPos([lat, lng]);
      }
    });
    return () => {
      try {
        if (clickListenerRef.current && typeof naver !== "undefined" && naver.maps) {
          naver.maps.Event.removeListener(clickListenerRef.current);
        }
      } catch { /* SDK already torn down */ }
      clickListenerRef.current = null;
    };
  }, [naverMapRef]);

  // ─── Naver Maps: manage markers ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || typeof naver === "undefined" || !naver.maps) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Selected parcel marker
    if (selectedParcel) {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(selectedParcel.lat, selectedParcel.lng),
        map,
        icon: {
          content: PRIMARY_ICON_HTML,
          size: new naver.maps.Size(28, 28),
          anchor: new naver.maps.Point(14, 28),
        },
        zIndex: 100,
      });
      markersRef.current.push(marker);
    }

    // Price markers
    if (mapMode === "default") {
      MOCK_PRICE_MARKERS.forEach((m) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(m.lat, m.lng),
          map,
          icon: {
            content: priceMarkerHtml(m.label),
            size: new naver.maps.Size(60, 24),
            anchor: new naver.maps.Point(30, 12),
          },
        });
        markersRef.current.push(marker);
      });

      // Listing markers
      MOCK_LISTING_MARKERS.forEach((m) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(m.lat, m.lng),
          map,
          icon: {
            content: listingMarkerHtml(m.label),
            size: new naver.maps.Size(60, 24),
            anchor: new naver.maps.Point(30, 12),
          },
        });
        markersRef.current.push(marker);
      });
    }

    // Parcel dot markers
    MOCK_PARCELS.forEach((parcel) => {
      if (selectedParcel?.pnu === parcel.pnu) return;
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(parcel.lat, parcel.lng),
        map,
        icon: {
          content: PARCEL_DOT_HTML,
          size: new naver.maps.Size(12, 12),
          anchor: new naver.maps.Point(6, 6),
        },
        clickable: true,
      });
      naver.maps.Event.addListener(marker, "click", () => {
        setSelectedParcel(parcel);

        setShowFilter(false);
        setMapCenter([parcel.lat, parcel.lng]);
        setMapZoom(17);
        setEmptyClickPos(null);
        setDetailTab("land");
      });
      markersRef.current.push(marker);
    });

    return () => {
      try {
        markersRef.current.forEach((m) => { try { m.setMap(null); } catch { /* */ } });
      } catch { /* SDK already torn down */ }
      markersRef.current = [];
    };
  }, [selectedParcel, mapMode, naverMapRef]);

  // ─── Naver Maps: empty click info window ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || !emptyClickPos || typeof naver === "undefined" || !naver.maps) return;

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const infoWindow = new naver.maps.InfoWindow({
      content: '<div style="font-size:12px;padding:6px 10px;white-space:nowrap;">이 위치에 필지 정보가 없습니다</div>',
      borderColor: "transparent",
      backgroundColor: "white",
      anchorSize: new naver.maps.Size(8, 8),
      anchorColor: "white",
      pixelOffset: new naver.maps.Point(0, -4),
    });
    infoWindow.open(map, new naver.maps.LatLng(emptyClickPos[0], emptyClickPos[1]));
    infoWindowRef.current = infoWindow;

    const timer = setTimeout(() => {
      infoWindow.close();
      infoWindowRef.current = null;
    }, 2000);

    return () => {
      clearTimeout(timer);
      try { infoWindow.close(); } catch { /* SDK already torn down */ }
    };
  }, [emptyClickPos, naverMapRef]);

  // ─── Zoom controls ───
  const handleZoomIn = useCallback(() => {
    const map = naverMapRef.current;
    if (map) map.setZoom(map.getZoom() + 1, true);
  }, [naverMapRef]);

  const handleZoomOut = useCallback(() => {
    const map = naverMapRef.current;
    if (map) map.setZoom(map.getZoom() - 1, true);
  }, [naverMapRef]);

  const handleCurrentLocation = useCallback(() => {
    const map = naverMapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      map.panTo(new naver.maps.LatLng(SEOUL_CENTER[0], SEOUL_CENTER[1]));
      map.setZoom(17, true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.panTo(new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        map.setZoom(17, true);
      },
      () => {
        map.panTo(new naver.maps.LatLng(SEOUL_CENTER[0], SEOUL_CENTER[1]));
        map.setZoom(17, true);
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, [naverMapRef]);

  const filteredResults = MOCK_SEARCH_RESULTS.filter(
    (r) => searchQuery.length >= 2 && (r.text.includes(searchQuery) || r.sub.includes(searchQuery))
  );

  const handleSearch = useCallback(() => {
    if (searchQuery.trim().length >= 2) {
      setShowSearchResults(true);
    }
  }, [searchQuery]);

  const handleSelectSearchResult = useCallback((result: SearchResult) => {
    // Find matching parcel or use the first mock parcel with this location
    const matchedParcel = MOCK_PARCELS.find((p) => p.address === result.text) ?? {
      ...MOCK_PARCELS[0],
      address: result.text,
      lat: result.lat,
      lng: result.lng,
    };
    setSelectedParcel(matchedParcel);
    setShowSearchResults(false);
    setSearchQuery(result.text);
    setMapCenter([result.lat, result.lng]);
    setMapZoom(17);
    setEmptyClickPos(null);
    setDetailTab("land");
  }, []);

  const handleSelectParcel = useCallback((parcel: Parcel) => {
    setSelectedParcel(parcel);
    setShowFilter(false);
    setMapCenter([parcel.lat, parcel.lng]);
    setMapZoom(17);
    setEmptyClickPos(null);
    setDetailTab("land");
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedParcel(null);
    setSearchQuery("");
    setDetailTab("land");
    setShowStickyHeader(false);
    searchInputRef.current?.focus();
  }, []);

  const handlePanelScroll = useCallback(() => {
    if (!addressRef.current) return;
    const rect = addressRef.current.getBoundingClientRect();
    const parentRect = panelScrollRef.current?.getBoundingClientRect();
    if (!parentRect) return;
    setShowStickyHeader(rect.bottom < parentRect.top + 12);
  }, []);

  const handleToggleMerge = useCallback(() => {
    if (mapMode === "merge") {
      setMapMode("default");
      setMergedParcels([]);
    } else if (selectedParcel) {
      setMapMode("merge");
      setMergedParcels([selectedParcel]);
    }
  }, [mapMode, selectedParcel]);

  const handleAddMergeParcel = useCallback(() => {
    const additionalParcel = MOCK_PARCELS[1];
    setMergedParcels((prev) => {
      if (prev.some((p) => p.pnu === additionalParcel.pnu)) return prev;
      return [...prev, additionalParcel];
    });
  }, []);

  const totalMergedArea = mergedParcels.reduce((s, p) => s + p.landArea, 0);

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <SiteHeader />

      {/* ─── Main Content: Left Panel + Map ─── */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* ─── Left Panel ─── */}
        <div className="w-[380px] shrink-0 bg-card flex flex-col overflow-hidden shadow-[2px_0_8px_rgba(0,0,0,0.06)] z-10">

            {/* ─── Search Bar (always visible when no parcel selected) ─── */}
            {!selectedParcel && (
              <>
                <div className="px-5 pt-5 pb-4">
                  <h2 className="text-lg font-semibold -tracking-tight mb-3">토지 검색</h2>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length >= 2) setShowSearchResults(true);
                        else setShowSearchResults(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      onFocus={() => {
                        if (searchQuery.length >= 2) setShowSearchResults(true);
                      }}
                      placeholder="주소, 지번, 도로명으로 검색"
                      className="pl-10 pr-9 h-11 rounded-xl bg-muted/50 ring-1 ring-black/[0.08] text-sm"
                      aria-label="주소 검색"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setShowSearchResults(false);
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted transition-colors"
                      >
                        <X className="size-3.5 text-muted-foreground" />
                      </button>
                    )}

                    {showSearchResults && filteredResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm overflow-hidden z-50" role="listbox">
                        {filteredResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSearchResult(result)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                            role="option"
                            aria-selected={false}
                          >
                            <div className="flex items-center justify-center size-8 rounded-full bg-muted shrink-0">
                              <MapPin className="size-3.5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{result.text}</p>
                              <p className="text-[11px] text-muted-foreground">{result.type} · {result.sub}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* ─── Panel Content ─── */}
            {!selectedParcel ? (
              /* ── Search / Empty State ── */
              <div className="flex-1 overflow-y-auto">
                {/* Recent searches */}
                <div className="px-5 py-5">
                  <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    최근 검색
                  </h3>
                  <div className="space-y-0.5">
                    {RECENT_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setShowSearchResults(true);
                        }}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center justify-center size-7 rounded-full bg-muted/60 group-hover:bg-muted shrink-0 transition-colors">
                          <Clock className="size-3 text-muted-foreground/60" />
                        </div>
                        <span className="text-sm text-foreground truncate">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quick access parcels */}
                <div className="px-5 py-5">
                  <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    주변 필지
                  </h3>
                  <div className="space-y-2">
                    {MOCK_PARCELS.map((parcel) => (
                      <button
                        key={parcel.pnu}
                        onClick={() => handleSelectParcel(parcel)}
                        className="w-full rounded-2xl ring-1 ring-black/[0.08] px-4 py-3.5 text-left hover:shadow-sm hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center size-9 rounded-full bg-primary/[0.06] shrink-0 mt-0.5">
                            <MapPin className="size-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {parcel.address}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {parcel.roadAddress}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{parcel.zoning}</span>
                              <span className="text-[10px] text-muted-foreground">{fmt(parcel.landArea)}m²</span>
                              <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{fmt(parcel.officialPrice)}원/m²</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Empty state hint */}
                <div className="px-6 py-10 text-center">
                  <div className="flex items-center justify-center size-12 rounded-full bg-muted/50 mx-auto mb-3">
                    <MapPin className="size-5 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground">지도에서 필지를 클릭하거나</p>
                  <p className="text-sm text-muted-foreground">위에서 주소를 검색하세요</p>
                </div>
              </div>
            ) : mapMode === "merge" ? (
              /* ── Merge Mode Panel ── */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">합필 분석</h2>
                    <button
                      onClick={() => { setMapMode("default"); setMergedParcels([]); setSelectedParcel(null); setSearchQuery(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      종료
                    </button>
                  </div>

                  <div className="space-y-2">
                    {mergedParcels.map((p, idx) => (
                      <div
                        key={p.pnu}
                        className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2.5"
                      >
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {idx === 0 ? "기준" : `합필${idx}`}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{p.address}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {convertArea(p.landArea, areaUnit)} {unitLabel}
                          </p>
                        </div>
                        {idx > 0 && (
                          <button
                            onClick={() => setMergedParcels((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-xs gap-1.5"
                    onClick={handleAddMergeParcel}
                    disabled={totalMergedArea >= 10000}
                  >
                    <Plus className="size-3.5" />
                    지도에서 필지 추가 선택
                  </Button>

                  <Separator />

                  <div className="space-y-1">
                    <h3 className="text-xs text-muted-foreground font-medium mb-2">합산 정보</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard label="선택 필지" value={`${mergedParcels.length}개`} />
                      <StatCard
                        label="합산 면적"
                        value={`${convertArea(totalMergedArea, areaUnit)} ${unitLabel}`}
                      />
                      <StatCard label="합산 공시지가" value={toEok(mergedParcels.reduce((s, p) => s + p.officialPrice * p.landArea, 0))} />
                      <StatCard label="합산 추정시세" value={toEok(mergedParcels.reduce((s, p) => s + p.officialPrice * p.landArea * 1.8, 0))} />
                    </div>
                  </div>

                  {totalMergedArea >= 10000 && (
                    <p className="text-[11px] text-destructive">합산 면적이 10,000m²를 초과할 수 없습니다</p>
                  )}
                </div>

                {mergedParcels.length > 0 && (
                  <div className="p-3 ring-1 ring-black/[0.06] bg-card flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 rounded-xl gap-1.5 text-xs"
                      onClick={() =>
                        navigate("/analysis/manual", {
                          state: { parcels: mergedParcels },
                        })
                      }
                    >
                      <Calculator className="size-3.5" />
                      일반 분석
                    </Button>
                    <Button
                      className="flex-1 h-9 rounded-xl gap-1.5 text-xs"
                      onClick={() => {
                        setSelectedBuildingTypes([]);
                        setShowAiModal(true);
                      }}
                    >
                      <Sparkles className="size-3.5" />
                      AI 분석
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* ── Default Detail Panel (Airbnb-inspired) ── */
              <>
                {/* ─ Sticky header (shows address on scroll) ─ */}
                <div className={`shrink-0 bg-card transition-shadow ${showStickyHeader ? "shadow-sm" : ""}`}>
                  <div className="flex items-center justify-between gap-2 px-4 h-12">
                    <button
                      onClick={handleClearSelection}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <p className={`flex-1 text-sm font-medium truncate text-center transition-opacity duration-200 ${showStickyHeader ? "opacity-100" : "opacity-0"}`}>
                      {selectedParcel.address}
                    </p>
                    <button
                      onClick={handleClearSelection}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <Separator />
                </div>

                {/* ─ Scrollable content ─ */}
                <div className="flex-1 overflow-y-auto" ref={panelScrollRef} onScroll={handlePanelScroll}>

                  {/* ── Address info ── */}
                  <div className="px-5 pt-5 pb-4" ref={addressRef}>
                    <h2 className="text-xl font-semibold -tracking-tight leading-snug">
                      {selectedParcel.address}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedParcel.roadAddress}
                    </p>

                    {/* Quick stat pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{selectedParcel.landCategory}</span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{selectedParcel.zoning}</span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{selectedParcel.shape}</span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{selectedParcel.roadAccess}</span>
                    </div>
                  </div>

                  {/* ── Hero: Estimated Value ── */}
                  <div className="px-5 pb-5">
                    <div className="rounded-2xl bg-muted/50 ring-1 ring-black/[0.08] p-4">
                      <p className="text-xs text-muted-foreground font-medium mb-1">추정 시세</p>
                      <p className="text-3xl font-bold tracking-tight">
                        {toEok(selectedParcel.officialPrice * selectedParcel.landArea * 1.8)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>공시지가 총액 {toEok(selectedParcel.officialPrice * selectedParcel.landArea)}</span>
                        <span>·</span>
                        <span>건물 포함 {toEok(selectedParcel.officialPrice * selectedParcel.landArea * 2.3)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* ── Unit toggle + detail tab ── */}
                  <div className="px-5 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5 bg-muted rounded-xl p-0.5">
                      {([
                        { key: "land" as DetailTab, label: "토지", icon: LandPlot },
                        { key: "building" as DetailTab, label: "건축물", icon: Building2 },
                        { key: "trade" as DetailTab, label: "거래", icon: ArrowLeftRight },
                      ]).map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setDetailTab(key)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            detailTab === key
                              ? "bg-foreground text-background shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="size-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
                      {(["m2", "pyeong"] as AreaUnit[]).map((u) => (
                        <button
                          key={u}
                          onClick={() => setAreaUnit(u)}
                          className={`rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            areaUnit === u
                              ? "bg-foreground text-background shadow-sm"
                              : "text-muted-foreground"
                          }`}
                        >
                          {u === "m2" ? "m\u00B2" : "평"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* ── Tab Content ── */}
                  <div className="px-5 py-5 space-y-0">
                    {detailTab === "land" ? (
                      /* ── 토지 정보 탭 ── */
                      <>
                        {/* Key metrics grid (Airbnb booking card style) */}
                        <div className="rounded-xl ring-1 ring-black/[0.08] overflow-hidden mb-5">
                          <div className="grid grid-cols-2 divide-x divide-border">
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">토지면적</p>
                              <p className="text-sm font-semibold mt-0.5">{convertArea(selectedParcel.landArea, areaUnit)} {unitLabel}</p>
                            </div>
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">공시지가</p>
                              <p className="text-sm font-semibold mt-0.5">{fmt(selectedParcel.officialPrice)}원/m²</p>
                            </div>
                          </div>
                          <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">건폐율 상한</p>
                              <p className="text-sm font-semibold mt-0.5">60%</p>
                            </div>
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">용적률 상한</p>
                              <p className="text-sm font-semibold mt-0.5">200%</p>
                            </div>
                          </div>
                        </div>

                        {/* Basic info — icon+label+value (Airbnb amenities style) */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-4">기본 현황</h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                            {[
                              { icon: LandPlot, label: "지목", value: selectedParcel.landCategory },
                              { icon: MapPin, label: "도로접면", value: selectedParcel.roadAccess },
                              { icon: Layers, label: "지형 고저", value: selectedParcel.terrain },
                              { icon: Building2, label: "지형 형상", value: selectedParcel.shape },
                              { icon: ArrowLeftRight, label: "토지이용", value: selectedParcel.landUse },
                              { icon: LandPlot, label: "PNU", value: selectedParcel.pnu.slice(-8) },
                            ].map(({ icon: Ic, label, value }) => (
                              <div key={label} className="flex items-center gap-2.5 py-2.5">
                                <Ic className="size-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground leading-none">{label}</p>
                                  <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* 용도지역 */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-2">토지이용계획</h3>
                          <p className="text-sm text-muted-foreground mb-3">도시계획 규제 및 건축 가능 범위</p>
                          <div className="space-y-0">
                            <InfoRow label="용도지역" value={selectedParcel.zoning} />
                            <InfoRow label="토지이용" value={selectedParcel.landUse} />
                          </div>
                          <a
                            href="https://www.eum.go.kr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-xs text-primary font-medium hover:underline"
                          >
                            토지이음에서 상세 확인
                            <ArrowUpRight className="size-3" />
                          </a>
                        </section>

                        {/* 공시지가 추이 */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-3">공시지가 추이</h3>
                          <div className="space-y-1.5">
                            {[
                              { year: 2025, price: selectedParcel.officialPrice },
                              { year: 2024, price: Math.round(selectedParcel.officialPrice * 0.94) },
                              { year: 2023, price: Math.round(selectedParcel.officialPrice * 0.89) },
                              { year: 2022, price: Math.round(selectedParcel.officialPrice * 0.84) },
                            ].map((item) => {
                              const maxP = selectedParcel.officialPrice;
                              const pct = (item.price / maxP) * 100;
                              const isCurrent = item.year === selectedParcel.officialPriceYear;
                              return (
                                <div key={item.year} className="flex items-center gap-2">
                                  <span className={`text-xs w-9 text-right tabular-nums ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                                    {item.year}
                                  </span>
                                  <div className="flex-1 h-7 bg-muted/30 rounded-md overflow-hidden relative">
                                    <div
                                      className={`h-full rounded-md ${isCurrent ? "bg-primary/15" : "bg-muted/60"}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                    <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-xs tabular-nums ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                                      {fmt(item.price)}원
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      </>
                    ) : detailTab === "building" ? (
                      /* ── 건축물 정보 탭 ── */
                      <>
                        {/* Key building metrics */}
                        <div className="rounded-xl ring-1 ring-black/[0.08] overflow-hidden mb-5">
                          <div className="grid grid-cols-2 divide-x divide-border">
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">건축면적</p>
                              <p className="text-sm font-semibold mt-0.5">{convertArea(MOCK_BUILDING.buildingArea, areaUnit)} {unitLabel}</p>
                            </div>
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">연면적</p>
                              <p className="text-sm font-semibold mt-0.5">{convertArea(MOCK_BUILDING.totalFloorArea, areaUnit)} {unitLabel}</p>
                            </div>
                          </div>
                          <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">건폐율</p>
                              <p className="text-sm font-semibold mt-0.5">{MOCK_BUILDING.coverageRatio}%</p>
                            </div>
                            <div className="px-3.5 py-3">
                              <p className="text-xs text-muted-foreground">용적률</p>
                              <p className="text-sm font-semibold mt-0.5">{MOCK_BUILDING.floorAreaRatio}%</p>
                            </div>
                          </div>
                        </div>

                        {/* Building info grid */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-4">건축물 현황</h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                            {[
                              { icon: Building2, label: "건물명", value: MOCK_BUILDING.name },
                              { icon: Layers, label: "대장 구분", value: MOCK_BUILDING.type },
                              { icon: LandPlot, label: "주용도", value: MOCK_BUILDING.mainUse },
                              { icon: Building2, label: "규모", value: `지상${MOCK_BUILDING.floors}층 / 지하${MOCK_BUILDING.basements}층` },
                              { icon: TrendingUp, label: "사용승인일", value: MOCK_BUILDING.approvalDate },
                            ].map(({ icon: Ic, label, value }) => (
                              <div key={label} className="flex items-center gap-2.5 py-2.5">
                                <Ic className="size-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground leading-none">{label}</p>
                                  <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Floor breakdown — striped table */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-3">층별 개요</h3>
                          <div className="rounded-xl overflow-hidden">
                            {[
                              { floor: "지하1층", use: "주차장", area: 120.0 },
                              { floor: "1층", use: "근린생활시설", area: 165.0 },
                              { floor: "2층", use: "주거", area: 165.0 },
                              { floor: "3층", use: "주거", area: 165.0 },
                              { floor: "4층", use: "주거", area: 165.0 },
                              { floor: "5층", use: "주거", area: 148.5 },
                            ].map((f, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between px-3 py-2.5 ${idx % 2 === 0 ? "bg-muted/30" : ""}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium w-16">{f.floor}</span>
                                  <span className="text-xs text-muted-foreground">{f.use}</span>
                                </div>
                                <span className="text-sm font-medium tabular-nums">
                                  {convertArea(f.area, areaUnit)} {unitLabel}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Building appraisal + estimate */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-3">건물 공시가격</h3>
                          <div className="space-y-0">
                            <InfoRow label="2025년" value="4.2억" accent />
                            <InfoRow label="2024년" value="3.9억" />
                            <InfoRow label="2023년" value="3.7억" />
                          </div>
                        </section>

                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-3">추정 시세</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <StatCard label="토지 추정시세" value={toEok(selectedParcel.officialPrice * selectedParcel.landArea * 1.8)} />
                            <StatCard label="건물 포함 추정" value={toEok(selectedParcel.officialPrice * selectedParcel.landArea * 2.3)} />
                          </div>
                        </section>
                      </>
                    ) : (
                      /* ── 거래 정보 탭 ── */
                      <>
                        {/* Trade history — clean striped */}
                        <section className="pb-5">
                          <h3 className="text-base font-semibold mb-3">실거래 이력</h3>
                          <div className="rounded-xl overflow-hidden">
                            {MOCK_TRADES.map((trade, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between px-3 py-3 ${idx % 2 === 0 ? "bg-muted/30" : ""}`}
                              >
                                <div>
                                  <p className="text-sm font-medium">{trade.date}</p>
                                  <p className="text-xs text-muted-foreground">{trade.type} · {convertArea(trade.area, areaUnit)}{unitLabel}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold">{toEok(trade.price)}</p>
                                  <p className="text-xs text-muted-foreground tabular-nums">
                                    {fmt(trade.pricePerM2)}원/m²
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Nearby trades */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-1">인근 유사 거래</h3>
                          <p className="text-xs text-muted-foreground mb-3">반경 500m 이내 최근 거래</p>
                          <div className="space-y-2">
                            {[
                              { address: "역삼동 125-3", date: "2025.02", price: 3_100_000_000, area: 298.0, distance: "120m" },
                              { address: "역삼동 130-1", date: "2024.09", price: 2_450_000_000, area: 264.5, distance: "280m" },
                              { address: "역삼동 118-7", date: "2024.05", price: 2_980_000_000, area: 312.0, distance: "350m" },
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                className="rounded-xl ring-1 ring-black/[0.08] px-3.5 py-3"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-sm font-medium">{item.address}</span>
                                  <span className="text-sm font-semibold">{toEok(item.price)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{item.date}</span>
                                  <span>{convertArea(item.area, areaUnit)}{unitLabel}</span>
                                  <span className="ml-auto">{item.distance}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Listings */}
                        <section className="py-5 border-t border-border">
                          <h3 className="text-base font-semibold mb-1">매물 목록</h3>
                          <p className="text-xs text-muted-foreground mb-3">현재 등록된 매물 정보</p>
                          {MOCK_LISTINGS.length > 0 ? (
                            <div className="space-y-2">
                              {MOCK_LISTINGS.map((listing, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl ring-1 ring-black/[0.08] px-3.5 py-3"
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium">{listing.type}</span>
                                    <span className="text-sm font-semibold text-primary">
                                      {toEok(listing.price)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{convertArea(listing.area, areaUnit)}{unitLabel}</span>
                                    <span>{listing.floor}</span>
                                    <span>{listing.direction}</span>
                                    <span className="ml-auto">{listing.registeredDate}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground py-6 text-center">등록된 매물이 없습니다</p>
                          )}
                        </section>
                      </>
                    )}
                  </div>
                </div>

                {/* ─── CTA Buttons (sticky bottom) ─── */}
                <div className="p-3 ring-1 ring-black/[0.06] bg-card flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 rounded-xl gap-1.5 text-xs"
                    onClick={() =>
                      navigate("/analysis/manual", {
                        state: { pnu: selectedParcel.pnu, parcel: selectedParcel },
                      })
                    }
                  >
                    <Calculator className="size-3.5" />
                    일반 분석
                  </Button>
                  <Button
                    className="flex-1 h-9 rounded-xl gap-1.5 text-xs"
                    onClick={() => {
                      setSelectedBuildingTypes([]);
                      setShowAiModal(true);
                    }}
                  >
                    <Sparkles className="size-3.5" />
                    AI 분석
                  </Button>
                </div>
              </>
            )}
          </div>

        {/* ─── Map Canvas (Naver Maps) ─── */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="h-full w-full z-0" />

          {/* ─── Top-left: Action tools (합필 + 필터) ─── */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 z-[1000]">
            <button
              onClick={handleToggleMerge}
              className={`h-8 flex items-center gap-1.5 px-3 rounded-xl ring-1 shadow-sm text-xs font-medium transition-colors ${
                mapMode === "merge"
                  ? "bg-foreground text-background ring-foreground"
                  : "bg-card ring-black/[0.08] hover:bg-muted/50"
              }`}
              title="합필"
            >
              <Combine className="size-3.5" />
              합필
            </button>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`relative h-8 flex items-center gap-1.5 px-3 rounded-xl ring-1 shadow-sm text-xs font-medium transition-colors ${
                showFilter
                  ? "bg-foreground text-background ring-foreground"
                  : "bg-card ring-black/[0.08] hover:bg-muted/50"
              }`}
            >
              <SlidersHorizontal className="size-3.5" />
              필터
              {activeFilters.length > 0 && !showFilter && (
                <span className="absolute -top-1.5 -right-1.5 size-4 flex items-center justify-center rounded-full bg-primary text-[9px] text-white font-bold">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* ─── Active filter chips (below top-left toolbar) ─── */}
          {activeFilters.length > 0 && !showFilter && (
            <div className="absolute left-3 top-14 z-[1000] flex items-center gap-1.5 flex-wrap max-w-[320px]">
              {activeFilters.map(({ key, label }) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-full ring-1 ring-black/[0.08] shadow-sm px-2.5 py-1 text-[11px] font-medium"
                >
                  {label}
                  <button
                    onClick={() => handleRemoveFilter(key)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1"
              >
                초기화
              </button>
            </div>
          )}

          {/* ─── Top-right: View mode controls (레이어, 거리뷰, 측정) ─── */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-[1000]">
            <button
              className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors"
              title="레이어"
            >
              <Layers className="size-4" />
            </button>
            <button
              className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors"
              title="거리뷰"
            >
              <Eye className="size-4" />
            </button>
            <button
              className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors"
              title="측정"
            >
              <Ruler className="size-4" />
            </button>
          </div>

          {/* ─── Filter Panel (opens from top-left) ─── */}
          {showFilter && mapMode !== "merge" && (
            <div
              className="absolute left-3 top-14 w-72 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-4 z-[1000] space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">마커 필터</h3>
                <button onClick={() => setShowFilter(false)}>
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>

              {/* Marker type toggle */}
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium">마커 유형</p>
                <div className="flex gap-1.5">
                  {["실거래", "매물"].map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleMarkerType(t)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        filterMarkerTypes.has(t)
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type multi-select */}
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium">부동산 분류</p>
                <div className="flex flex-wrap gap-1.5">
                  {["토지", "단독·다가구", "상업·업무", "공장·창고"].map((t) => (
                    <button
                      key={t}
                      onClick={() => togglePropertyType(t)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        filterPropertyTypes.has(t)
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium">거래 금액 (만원)</p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="최소"
                    value={filterPriceMin}
                    onChange={(e) => setFilterPriceMin(e.target.value)}
                    className="h-8 rounded-lg text-xs flex-1"
                  />
                  <span className="text-xs text-muted-foreground">~</span>
                  <Input
                    placeholder="최대"
                    value={filterPriceMax}
                    onChange={(e) => setFilterPriceMax(e.target.value)}
                    className="h-8 rounded-lg text-xs flex-1"
                  />
                </div>
              </div>

              {/* Area range */}
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium">토지면적 (m²)</p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="최소"
                    value={filterAreaMin}
                    onChange={(e) => setFilterAreaMin(e.target.value)}
                    className="h-8 rounded-lg text-xs flex-1"
                  />
                  <span className="text-xs text-muted-foreground">~</span>
                  <Input
                    placeholder="최대"
                    value={filterAreaMax}
                    onChange={(e) => setFilterAreaMax(e.target.value)}
                    className="h-8 rounded-lg text-xs flex-1"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  초기화
                </button>
                <Button
                  size="sm"
                  className="rounded-lg h-8 px-4 text-xs"
                  onClick={() => setShowFilter(false)}
                >
                  적용
                </Button>
              </div>

              {/* Active count summary */}
              {activeFilters.length > 0 && (
                <p className="text-[10px] text-primary font-medium text-center -mt-1">
                  {activeFilters.length}개 필터 적용 중
                </p>
              )}
            </div>
          )}

          {/* ─── Zoom & location controls ─── */}
          <div className="absolute right-3 bottom-8 flex flex-col gap-1.5 z-[1000]">
            <button
              onClick={handleZoomIn}
              className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors"
              title="확대"
            >
              <Plus className="size-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors"
              title="축소"
            >
              <Minus className="size-4" />
            </button>
            <div className="h-px" />
            <button
              onClick={handleCurrentLocation}
              className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors"
              title="현재 위치"
            >
              <Navigation className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── AI 사업성 분석 용도 선택 모달 ─── */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setShowAiModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowAiModal(false);
          }}
        >
          <div
            className="bg-card rounded-2xl ring-1 ring-black/[0.08] max-w-lg w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold tracking-tight">AI 사업성 분석 — 용도 선택</h2>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Site summary */}
            <div className="bg-muted/30 rounded-xl px-4 py-3 mb-5 space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">대상 필지</p>
              {(() => {
                const parcels = mapMode === "merge" ? mergedParcels : selectedParcel ? [selectedParcel] : [];
                const totalArea = parcels.reduce((s, p) => s + p.landArea, 0);
                const zonings = [...new Set(parcels.map((p) => p.zoning))].join(", ");
                return (
                  <>
                    {parcels.map((p) => (
                      <p key={p.pnu} className="text-sm font-medium truncate">{p.address}</p>
                    ))}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>총 면적: {convertArea(totalArea, areaUnit)} {unitLabel}</span>
                      <span>용도지역: {zonings}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Building type selection */}
            <div className="mb-5">
              <p className="text-sm font-medium mb-3">건축 용도를 선택하세요</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: "단독/다가구", icon: Home, label: "단독/다가구" },
                  { key: "다세대/연립", icon: Building2, label: "다세대/연립" },
                  { key: "업무시설", icon: Briefcase, label: "업무시설" },
                  { key: "상업시설", icon: Store, label: "상업시설" },
                  { key: "상가주택", icon: Home, label: "상가주택" },
                ] as const).map(({ key, icon: Icon, label }) => {
                  const isSelected = selectedBuildingTypes.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setSelectedBuildingTypes((prev) =>
                          prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
                        )
                      }
                      className={`rounded-xl ring-1 p-3 cursor-pointer text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? "ring-2 ring-primary bg-primary/5"
                          : "ring-black/[0.08] hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`size-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowAiModal(false)}
              >
                취소
              </Button>
              <Button
                className="rounded-xl gap-1.5"
                disabled={selectedBuildingTypes.length === 0}
                onClick={() => {
                  const parcels = mapMode === "merge" ? mergedParcels : selectedParcel ? [selectedParcel] : [];
                  setShowAiModal(false);
                  // MAP→AIA-02 직행: 목록을 거치지 않고 프로젝트 상세로 바로 이동
                  navigate("/analysis/ai/new", {
                    state: { parcels, selectedBuildingTypes, fromMap: true },
                  });
                }}
              >
                <Sparkles className="size-3.5" />
                분석 시작
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/layout/site-header";
import {
  useSearchAddressQuery,
  useMapMarkersQuery,
  useMapMarkersInfoQuery,
  usePriceLandQuery,
  useRtmsAroundQuery,
  useCroodAllDataQuery,
} from "@/features/map/api/queries";
import type {
  SearchResultItem,
  AllDataByCroodDTO,
  LandSpecialInfoObj,
  LandPublicObj,
  LandUsePlanObj,
  NormalJsonObj,
  FloorJsonObj,
  Rtms,
  Sale,
  MapMarkersDTO,
  LandPolygonObj,
  BuildLandPolygonObj,
  BuildBldgPolygonObj,
} from "@conmarket/apis";

/* ─── Types ─── */

interface SelectedLocation {
  pnu: string;
  lat: number;
  lng: number;
  address: string;
  roadAddress?: string;
  pk_build_mapper_group?: string;
}

type AreaUnit = "m2" | "pyeong";
type DetailTab = "land" | "building" | "trade";
type TradeSubTab = "rtms" | "sale";
type MapMode = "default" | "merge" | "measure" | "roadview";

interface MapBounds {
  left_lat: number;
  right_lat: number;
  left_lon: number;
  right_lon: number;
}

/* ─── Constants ─── */

const M2_PER_PYEONG = 3.305785;
const SEOUL_CENTER: [number, number] = [37.5015, 127.0397];

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

function safeJsonParse<T>(str?: string | null): T[] {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

/* ─── GeoJSON → naver.maps paths helper ─── */

function geojsonToPaths(geojsonStr: string): naver.maps.LatLng[][] {
  try {
    const geo = JSON.parse(geojsonStr);
    const coords: number[][][] =
      geo.type === "MultiPolygon"
        ? geo.coordinates.flatMap((poly: number[][][][]) => poly)
        : geo.type === "Polygon"
          ? geo.coordinates
          : [];
    return coords.map((ring: number[][]) =>
      ring.map(([lon, lat]: number[]) => new naver.maps.LatLng(lat, lon)),
    );
  } catch {
    return [];
  }
}

/* ─── Naver Maps Marker HTML ─── */

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

/* ─── 용도별 마커 색상 ─── */
const PROP_TYPES = ["토지", "단독·다가구", "상가·사무실", "공장·창고"] as const;
const PROP_COLORS: Record<string, string> = {
  "토지":       "#16A34A",   // green
  "단독·다가구": "#F59E0B",   // amber
  "상가·사무실": "#8B5CF6",   // violet
  "공장·창고":   "#6366F1",   // indigo
};
const DEFAULT_MARKER_BG = "#64748B"; // slate

function getMarkerBg(type: string) {
  return PROP_COLORS[type] || DEFAULT_MARKER_BG;
}

function markerHtml(price: string, type: string) {
  const bg = getMarkerBg(type);
  return `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="
      background:${bg};color:white;border-radius:6px;
      padding:4px 8px;white-space:nowrap;text-align:center;
      box-shadow:0 1px 4px rgba(0,0,0,0.2);line-height:1.1;
    "><div style="font-size:10px;font-weight:500;opacity:0.85;">${type || "기타"}</div>
      <div style="font-size:12px;font-weight:700;margin-top:1px;">${price}</div>
    </div>
    <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${bg};"></div>
  </div>`;
}

function dotMarkerHtml(type: string) {
  const bg = getMarkerBg(type);
  if (!type) {
    return `<div style="width:10px;height:10px;border-radius:50%;background:${bg}44;border:2px solid ${bg};"></div>`;
  }
  return `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="
      background:${bg};color:white;font-size:10px;font-weight:600;
      padding:3px 7px;border-radius:5px;white-space:nowrap;
      box-shadow:0 1px 3px rgba(0,0,0,0.15);line-height:14px;
    ">${type}</div>
    <div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid ${bg};"></div>
  </div>`;
}

const RECENT_SEARCHES_KEY = "map-recent-searches";
const DEFAULT_RECENT = [
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

/* ─── Helper: extract property type label from marker ─── */
function getMarkerPropertyType(marker: MapMarkersDTO): string {
  const isRtms = marker.data_type === "rtms";
  if (isRtms) {
    if (marker.land_yn === "Y") return "토지";
    if (marker.srbld_yn === "Y") return "단독·다가구";
    if (marker.slh_yn === "Y") return "상가·사무실";
    if (marker.indu_yn === "Y") return "공장·창고";
  } else {
    if (marker.land_sale_yn === "Y") return "토지";
    if (marker.srbld_sale_yn === "Y") return "단독·다가구";
    if (marker.slh_sale_yn === "Y") return "상가·사무실";
    if (marker.indu_sale_yn === "Y") return "공장·창고";
  }
  // fallback: check which obj exists
  if (marker.land_obj) return "토지";
  if (marker.srbld_obj) return "단독·다가구";
  if (marker.slh_obj) return "상가·사무실";
  if (marker.indu_obj) return "공장·창고";
  return "";
}

/* ─── Helper: extract marker price label ─── */
function getMarkerPriceLabel(marker: MapMarkersDTO): string | null {
  const objStr = marker.land_obj || marker.srbld_obj || marker.slh_obj || marker.indu_obj;
  if (!objStr) return null;
  try {
    const parsed = JSON.parse(objStr);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length > 0 && arr[0].price) {
      return toEok(arr[0].price * 10_000);
    }
  } catch { /* ignore */ }
  return null;
}

/* ─── Naver Maps hook ─── */

function useNaverMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: { center: [number, number]; zoom: number },
) {
  const mapRef = useRef<naver.maps.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mapRef;
}

/* ─── Map Page ─── */

export default function MapPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("land");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [mapMode, setMapMode] = useState<MapMode>("default");
  const [mergedLocations, setMergedLocations] = useState<SelectedLocation[]>([]);
  const [tradeSubTab, setTradeSubTab] = useState<TradeSubTab>("rtms");
  const [mapCenter, setMapCenter] = useState<[number, number]>(SEOUL_CENTER);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [emptyClickPos, setEmptyClickPos] = useState<[number, number] | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [clickCoords, setClickCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedBuildingTypes, setSelectedBuildingTypes] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_RECENT;
    } catch {
      return DEFAULT_RECENT;
    }
  });

  // Naver Map
  const naverMapRef = useNaverMap(mapContainerRef, { center: SEOUL_CENTER, zoom: 16 });
  const markersRef = useRef<naver.maps.Marker[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polygonsRef = useRef<any[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clickListenerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idleListenerRef = useRef<any>(null);

  // Filter state
  const [markerViewMode, setMarkerViewMode] = useState<"rtms" | "sale">("sale");
  const [visiblePropTypes, setVisiblePropTypes] = useState<Set<string>>(new Set(PROP_TYPES));

  // ─── Debounce search query ───
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── API Queries ───
  const { data: searchResults, isLoading: isSearching } = useSearchAddressQuery(
    { keyword: debouncedQuery, size: 20 },
    showSearchResults && debouncedQuery.length >= 2,
  );

  // data_type은 rtms/sale 중 하나만 → 선택된 모드만 조회
  const markersParams = useMemo(() => {
    if (!mapBounds) return null;
    const now = new Date();
    const toDate = `${now.getFullYear()}`;
    const fromDate = `${now.getFullYear() - 2}`;
    return {
      ...mapBounds,
      from_dt: fromDate,
      to_dt: toDate,
      icon_type: "all",
      price_type: "all",
      data_type: markerViewMode,
    };
  }, [mapBounds, markerViewMode]);

  const { data: markersRawData } = useMapMarkersQuery(markersParams);

  const markersData = useMemo(() => {
    return { body: markersRawData?.body || [] };
  }, [markersRawData]);

  const { data: markerInfoData, isLoading: isInfoLoading } = useMapMarkersInfoQuery(
    selectedLocation
      ? {
          pnu: selectedLocation.pnu || undefined,
          pk_build_mapper_group: selectedLocation.pk_build_mapper_group || undefined,
        }
      : null,
  );

  const { data: croodData } = useCroodAllDataQuery(clickCoords);

  const allParcels: AllDataByCroodDTO[] = useMemo(() => {
    return markerInfoData?.body || [];
  }, [markerInfoData]);

  const detailData: AllDataByCroodDTO | null = useMemo(() => {
    return allParcels.length > 0 ? allParcels[0] : null;
  }, [allParcels]);

  const subParcels: AllDataByCroodDTO[] = useMemo(() => {
    return allParcels.slice(1);
  }, [allParcels]);

  const { data: priceLandData } = usePriceLandQuery(
    selectedLocation?.pnu || null,
  );

  const { data: rtmsAroundData } = useRtmsAroundQuery(
    selectedLocation
      ? { lat: selectedLocation.lat, lon: selectedLocation.lng, distance: 500, limit_cnt: 5 }
      : null,
  );

  // ─── Parsed detail data ───
  const landInfo = useMemo(() => {
    if (!detailData) return null;
    const arr = safeJsonParse<LandSpecialInfoObj>(detailData.land_special_info_obj);
    return arr[0] || null;
  }, [detailData]);

  const landPublicPrices = useMemo(() => {
    if (!detailData) return [];
    return safeJsonParse<LandPublicObj>(detailData.land_public_price_obj);
  }, [detailData]);

  const landUsePlan = useMemo(() => {
    if (!detailData) return [];
    return safeJsonParse<LandUsePlanObj>(detailData.land_use_plan_obj);
  }, [detailData]);

  const buildingInfo = useMemo(() => {
    if (!detailData) return null;
    const normal = safeJsonParse<NormalJsonObj>(detailData.normal_json_obj);
    return normal[0] || null;
  }, [detailData]);

  const floorInfo = useMemo(() => {
    if (!detailData) return [];
    return safeJsonParse<FloorJsonObj>(detailData.floor_json_obj);
  }, [detailData]);

  // ─── Parsed polygon data (from ALL parcels including 부속 필지) ───
  const landPolygons = useMemo(() => {
    return allParcels.flatMap((p) => safeJsonParse<LandPolygonObj>(p.land_polygon_obj));
  }, [allParcels]);

  const buildLandPolygons = useMemo(() => {
    return allParcels.flatMap((p) => safeJsonParse<BuildLandPolygonObj>(p.build_land_polygon_obj));
  }, [allParcels]);

  const buildBldgPolygons = useMemo(() => {
    return allParcels.flatMap((p) => safeJsonParse<BuildBldgPolygonObj>(p.build_bldg_polygon_obj));
  }, [allParcels]);

  const bldgPublicPrices = useMemo(() => {
    if (!detailData) return [];
    return safeJsonParse<{ yyyy: string; price: number }>(detailData.bldg_public_price_obj);
  }, [detailData]);

  const tradeHistory = useMemo(() => {
    if (allParcels.length === 0) return [];
    const all: Rtms[] = allParcels.flatMap((p) => [
      ...safeJsonParse<Rtms>(p.rtms_land),
      ...safeJsonParse<Rtms>(p.rtms_srbld),
      ...safeJsonParse<Rtms>(p.rtms_slh),
      ...safeJsonParse<Rtms>(p.rtms_indu),
    ]);
    return all.sort((a, b) => b.deal_ymd.localeCompare(a.deal_ymd)).slice(0, 30);
  }, [allParcels]);

  const saleListings = useMemo(() => {
    if (allParcels.length === 0) return [];
    const all: Sale[] = allParcels.flatMap((p) => [
      ...safeJsonParse<Sale>(p.sale_land),
      ...safeJsonParse<Sale>(p.sale_srbld),
      ...safeJsonParse<Sale>(p.sale_slh),
      ...safeJsonParse<Sale>(p.sale_indu),
    ]);
    return all;
  }, [allParcels]);

  const nearbyTrades = useMemo(() => {
    if (!rtmsAroundData?.body) return [];
    return rtmsAroundData.body.slice(0, 5).map((item) => {
      let parsed: { price?: number; yyyymm?: string; land_extent?: number; land_use_nm?: string } = {};
      try { parsed = JSON.parse(item.obj_data); } catch { /* */ }
      return { ...item, parsed };
    });
  }, [rtmsAroundData]);

  const estimatedPricePerM2 = useMemo(() => {
    if (!priceLandData?.body?.[0]) return 0;
    return parseFloat(priceLandData.body[0].price_m2) * 10_000; // 만원 → 원
  }, [priceLandData]);

  const landArea = useMemo(() => {
    if (landInfo) return landInfo.land_extent;
    if (detailData?.land_extent) return parseFloat(detailData.land_extent);
    return 0;
  }, [landInfo, detailData]);

  const officialPrice = useMemo(() => {
    if (landPublicPrices.length > 0) {
      const sorted = [...landPublicPrices].sort((a, b) => b.yyyy.localeCompare(a.yyyy));
      return sorted[0].price;
    }
    return 0;
  }, [landPublicPrices]);

  // ─── Handle click coords → resolve to location ───
  useEffect(() => {
    if (!croodData?.body?.[0] || !clickCoords) return;
    const data = croodData.body[0];
    if (data.type === "없음") {
      setEmptyClickPos([clickCoords.lat, clickCoords.lon]);
      setClickCoords(null);
      return;
    }
    const landSpecial = safeJsonParse<LandSpecialInfoObj>(data.land_special_info_obj);
    const pnu = landSpecial[0]?.pnu || "";
    setSelectedLocation({
      pnu,
      lat: clickCoords.lat,
      lng: clickCoords.lon,
      address: data.address || "",
      roadAddress: data.address_doro || undefined,
      pk_build_mapper_group: data.pk_build_mapper_group || undefined,
    });
    setMapCenter([clickCoords.lat, clickCoords.lon]);
    setMapZoom(17);
    setEmptyClickPos(null);
    setDetailTab("land");
    setClickCoords(null);
  }, [croodData, clickCoords]);

  // ─── Compute active filter chips ───

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

  // ─── Naver Maps: idle event → update bounds ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || typeof naver === "undefined" || !naver.maps) return;

    const updateBounds = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bounds = (map as any).getBounds();
      const sw = bounds.getSW();
      const ne = bounds.getNE();
      setMapBounds({
        left_lat: sw.lat(),
        right_lat: ne.lat(),
        left_lon: sw.lng(),
        right_lon: ne.lng(),
      });
    };

    // Initial bounds
    updateBounds();

    if (idleListenerRef.current) {
      naver.maps.Event.removeListener(idleListenerRef.current);
    }
    idleListenerRef.current = naver.maps.Event.addListener(map, "idle", updateBounds);

    return () => {
      try {
        if (idleListenerRef.current && typeof naver !== "undefined" && naver.maps) {
          naver.maps.Event.removeListener(idleListenerRef.current);
        }
      } catch { /* */ }
      idleListenerRef.current = null;
    };
  }, [naverMapRef]);

  // ─── Naver Maps: click handler ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || typeof naver === "undefined" || !naver.maps) return;
    if (clickListenerRef.current) {
      naver.maps.Event.removeListener(clickListenerRef.current);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clickListenerRef.current = naver.maps.Event.addListener(map, "click", (e: any) => {
      const lat = e.coord.lat();
      const lng = e.coord.lng();
      setClickCoords({ lat, lon: lng });
    });
    return () => {
      try {
        if (clickListenerRef.current && typeof naver !== "undefined" && naver.maps) {
          naver.maps.Event.removeListener(clickListenerRef.current);
        }
      } catch { /* */ }
      clickListenerRef.current = null;
    };
  }, [naverMapRef]);

  // ─── Naver Maps: manage markers from API data ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || typeof naver === "undefined" || !naver.maps) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Selected location marker — only show point marker when no polygons are available
    const hasPolygons = landPolygons.length > 0 || buildLandPolygons.length > 0 || buildBldgPolygons.length > 0;
    if (selectedLocation && !hasPolygons) {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(selectedLocation.lat, selectedLocation.lng),
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

    // API markers
    const markers = markersData?.body || [];
    if (mapMode === "default") {
      markers.forEach((m) => {
        const lat = parseFloat(m.lat);
        const lon = parseFloat(m.lon);
        if (isNaN(lat) || isNaN(lon)) return;

        // Skip if it's the selected location
        if (selectedLocation && Math.abs(lat - selectedLocation.lat) < 0.0001 && Math.abs(lon - selectedLocation.lng) < 0.0001) return;

        const propType = getMarkerPropertyType(m);

        // Filter by visible property types
        if (propType && !visiblePropTypes.has(propType)) return;

        const priceLabel = getMarkerPriceLabel(m);

        let iconContent: string;
        if (priceLabel) {
          iconContent = markerHtml(priceLabel, propType);
        } else {
          iconContent = dotMarkerHtml(propType);
        }

        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(lat, lon),
          map,
          icon: {
            content: iconContent,
            size: new naver.maps.Size(80, 42),
            anchor: new naver.maps.Point(40, 42),
          },
          clickable: true,
        });

        naver.maps.Event.addListener(marker, "click", () => {
          const pnu = m.pnu || "";
          setSelectedLocation({
            pnu,
            lat,
            lng: lon,
            address: "",
            pk_build_mapper_group: m.pk_build_mapper_group || undefined,
          });

          setMapCenter([lat, lon]);
          setMapZoom(17);
          setEmptyClickPos(null);
          setDetailTab("land");
        });

        markersRef.current.push(marker);
      });
    }

    return () => {
      try {
        markersRef.current.forEach((m) => { try { m.setMap(null); } catch { /* */ } });
      } catch { /* */ }
      markersRef.current = [];
    };
  }, [selectedLocation, mapMode, naverMapRef, markersData, landPolygons, buildLandPolygons, buildBldgPolygons, visiblePropTypes]);

  // ─── Naver Maps: render polygons for selected parcel ───
  useEffect(() => {
    const map = naverMapRef.current;
    if (!map || typeof naver === "undefined" || !naver.maps) return;

    // Clear previous polygons
    polygonsRef.current.forEach((p) => { try { p.setMap(null); } catch { /* */ } });
    polygonsRef.current = [];

    if (!selectedLocation || !detailData) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Maps = naver.maps as any;

    // Land polygons (토지 경계) — yellow fill
    landPolygons.forEach((lp) => {
      if (!lp.geojson) return;
      const paths = geojsonToPaths(lp.geojson);
      paths.forEach((path) => {
        const polygon = new Maps.Polygon({
          map,
          paths: [path],
          fillColor: "#FBBF24",
          fillOpacity: 0.25,
          strokeColor: "#F59E0B",
          strokeWeight: 2,
          strokeOpacity: 0.8,
          zIndex: 50,
        });
        polygonsRef.current.push(polygon);
      });
    });

    // Build land polygons (건축물 대지 경계) — orange fill
    buildLandPolygons.forEach((blp) => {
      if (!blp.geojson) return;
      const paths = geojsonToPaths(blp.geojson);
      paths.forEach((path) => {
        const polygon = new Maps.Polygon({
          map,
          paths: [path],
          fillColor: "#F97316",
          fillOpacity: 0.2,
          strokeColor: "#EA580C",
          strokeWeight: 2,
          strokeOpacity: 0.7,
          strokeStyle: "shortdash",
          zIndex: 51,
        });
        polygonsRef.current.push(polygon);
      });
    });

    // Building polygons (건물 윤곽) — red fill
    buildBldgPolygons.forEach((bbp) => {
      if (!bbp.geojson) return;
      const paths = geojsonToPaths(bbp.geojson);
      paths.forEach((path) => {
        const polygon = new Maps.Polygon({
          map,
          paths: [path],
          fillColor: "#EF4444",
          fillOpacity: 0.3,
          strokeColor: "#DC2626",
          strokeWeight: 2,
          strokeOpacity: 0.9,
          zIndex: 52,
        });
        polygonsRef.current.push(polygon);
      });
    });

    return () => {
      polygonsRef.current.forEach((p) => { try { p.setMap(null); } catch { /* */ } });
      polygonsRef.current = [];
    };
  }, [selectedLocation, detailData, landPolygons, buildLandPolygons, buildBldgPolygons, naverMapRef]);

  // ─── Update address from detail data when clicking marker without address ───
  useEffect(() => {
    if (selectedLocation && !selectedLocation.address && detailData?.address) {
      setSelectedLocation((prev) =>
        prev ? { ...prev, address: detailData.address, roadAddress: detailData.address_doro } : prev,
      );
    }
  }, [detailData, selectedLocation]);

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
      try { infoWindow.close(); } catch { /* */ }
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

  const handleSearch = useCallback(() => {
    if (searchQuery.trim().length >= 2) {
      setShowSearchResults(true);
    }
  }, [searchQuery]);

  const addRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((s) => s !== term)].slice(0, 5);
      try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }, []);

  const handleSelectSearchResult = useCallback((result: SearchResultItem) => {
    const pnu = result.pnu_list?.split(",")[0] || "";
    setSelectedLocation({
      pnu,
      lat: result.lat,
      lng: result.lon,
      address: result.full_jibun_address,
      roadAddress: result.full_doro_address || undefined,
      pk_build_mapper_group: result.pk_build_mapper_group || undefined,
    });
    setShowSearchResults(false);
    setSearchQuery(result.full_jibun_address);
    setMapCenter([result.lat, result.lon]);
    setMapZoom(17);
    setEmptyClickPos(null);
    setDetailTab("land");
    addRecentSearch(result.full_jibun_address);
  }, [addRecentSearch]);

  const handleClearSelection = useCallback(() => {
    setSelectedLocation(null);
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
      setMergedLocations([]);
    } else if (selectedLocation) {
      setMapMode("merge");
      setMergedLocations([selectedLocation]);
    }
  }, [mapMode, selectedLocation]);

  // Display address
  const displayAddress = selectedLocation?.address || detailData?.address || "";
  const displayRoadAddress = selectedLocation?.roadAddress || detailData?.address_doro || "";

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <SiteHeader />

      {/* ─── Main Content: Left Panel + Map ─── */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* ─── Left Panel ─── */}
        <div className="w-[380px] shrink-0 bg-card flex flex-col overflow-hidden shadow-[2px_0_8px_rgba(0,0,0,0.06)] z-10">

            {/* ─── Search Bar (always visible when no parcel selected) ─── */}
            {!selectedLocation && (
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

                    {showSearchResults && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm overflow-hidden z-50 max-h-80 overflow-y-auto" role="listbox">
                        {isSearching ? (
                          <div className="py-6 flex justify-center">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : searchResults?.results && searchResults.results.length > 0 ? (
                          searchResults.results.map((result, idx) => (
                            <button
                              key={`${result.id}-${idx}`}
                              onClick={() => handleSelectSearchResult(result)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                              role="option"
                              aria-selected={false}
                            >
                              <div className="flex items-center justify-center size-8 rounded-full bg-muted shrink-0">
                                <MapPin className="size-3.5 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{result.full_jibun_address}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {result.bldg_nm ? `${result.bldg_nm} · ` : ""}{result.dong || result.sigungu}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : debouncedQuery.length >= 2 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">검색 결과가 없습니다</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* ─── Panel Content ─── */}
            {!selectedLocation ? (
              /* ── Search / Empty State ── */
              <div className="flex-1 overflow-y-auto">
                {/* Recent searches */}
                <div className="px-5 py-5">
                  <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    최근 검색
                  </h3>
                  <div className="space-y-0.5">
                    {recentSearches.map((term) => (
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

                {/* Nearby markers list */}
                {markersData?.body && markersData.body.length > 0 && (
                  <div className="px-5 py-5">
                    <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                      주변 필지
                    </h3>
                    <div className="space-y-2">
                      {markersData.body.slice(0, 10).map((marker) => {
                        const lat = parseFloat(marker.lat);
                        const lon = parseFloat(marker.lon);
                        const priceLabel = getMarkerPriceLabel(marker);
                        return (
                          <button
                            key={marker.pk_mapper_master}
                            onClick={() => {
                              setSelectedLocation({
                                pnu: marker.pnu || "",
                                lat,
                                lng: lon,
                                address: "",
                                pk_build_mapper_group: marker.pk_build_mapper_group || undefined,
                              });
                    
                              setMapCenter([lat, lon]);
                              setMapZoom(17);
                              setEmptyClickPos(null);
                              setDetailTab("land");
                            }}
                            className="w-full rounded-2xl ring-1 ring-black/[0.08] px-4 py-3.5 text-left hover:shadow-sm hover:-translate-y-0.5 transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center size-9 rounded-full bg-primary/[0.06] shrink-0 mt-0.5">
                                <MapPin className="size-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                  {marker.pnu || `마커 ${marker.pk_mapper_master}`}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                                    {marker.data_type === "rtms" ? "실거래" : "매물"}
                                  </span>
                                  {priceLabel && (
                                    <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{priceLabel}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                      onClick={() => { setMapMode("default"); setMergedLocations([]); setSelectedLocation(null); setSearchQuery(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      종료
                    </button>
                  </div>

                  <div className="space-y-2">
                    {mergedLocations.map((p, idx) => (
                      <div
                        key={p.pnu || idx}
                        className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2.5"
                      >
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {idx === 0 ? "기준" : `합필${idx}`}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{p.address || p.pnu}</p>
                        </div>
                        {idx > 0 && (
                          <button
                            onClick={() => setMergedLocations((prev) => prev.filter((_, i) => i !== idx))}
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
                    disabled
                  >
                    <Plus className="size-3.5" />
                    지도에서 필지 추가 선택
                  </Button>

                  <Separator />

                  <div className="space-y-1">
                    <h3 className="text-xs text-muted-foreground font-medium mb-2">합산 정보</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard label="선택 필지" value={`${mergedLocations.length}개`} />
                      <StatCard label="합산 면적" value={`${convertArea(landArea, areaUnit)} ${unitLabel}`} />
                    </div>
                  </div>
                </div>

                {mergedLocations.length > 0 && (
                  <div className="p-3 ring-1 ring-black/[0.06] bg-card flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 rounded-xl gap-1.5 text-xs"
                      onClick={() =>
                        navigate("/analysis/manual", {
                          state: { parcels: mergedLocations },
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
              /* ── Default Detail Panel ── */
              <>
                {/* ─ Sticky header ─ */}
                <div className={`shrink-0 bg-card transition-shadow ${showStickyHeader ? "shadow-sm" : ""}`}>
                  <div className="flex items-center justify-between gap-2 px-4 h-12">
                    <button
                      onClick={handleClearSelection}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <p className={`flex-1 text-sm font-medium truncate text-center transition-opacity duration-200 ${showStickyHeader ? "opacity-100" : "opacity-0"}`}>
                      {displayAddress}
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

                  {isInfoLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      {/* ── Address info ── */}
                      <div className="px-5 pt-5 pb-4" ref={addressRef}>
                        <h2 className="text-xl font-semibold -tracking-tight leading-snug">
                          {displayAddress || "주소 조회 중..."}
                        </h2>
                        {displayRoadAddress && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {displayRoadAddress}
                          </p>
                        )}

                        {/* Quick stat pills */}
                        {landInfo && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{landInfo.jimok_nm}</span>
                            {landUsePlan[0] && (
                              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{landUsePlan[0].use_lawd_nm}</span>
                            )}
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{landInfo.land_shape_nm}</span>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{landInfo.land_road_contact_nm}</span>
                          </div>
                        )}
                      </div>

                      {/* ── 부속 필지 정보 ── */}
                      {subParcels.length > 0 && (
                        <div className="px-5 pb-3">
                          <div className="rounded-xl ring-1 ring-black/[0.08] overflow-hidden">
                            <div className="px-3.5 py-2.5 bg-muted/30 flex items-center gap-2">
                              <LandPlot className="size-3.5 text-muted-foreground" />
                              <span className="text-xs font-semibold">부속 필지 {subParcels.length}건</span>
                            </div>
                            {subParcels.map((sp, idx) => {
                              const spLand = safeJsonParse<LandSpecialInfoObj>(sp.land_special_info_obj);
                              const spArea = spLand[0]?.land_extent ?? (sp.land_extent ? parseFloat(sp.land_extent) : 0);
                              return (
                                <div
                                  key={sp.pnu || idx}
                                  className={`flex items-center justify-between px-3.5 py-2.5 ${idx % 2 === 0 ? "" : "bg-muted/20"}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{sp.address || sp.pnu || `필지 ${idx + 2}`}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {sp.type === "build" ? "대지" : "토지"}
                                      {spLand[0]?.jimok_nm ? ` · ${spLand[0].jimok_nm}` : ""}
                                    </p>
                                  </div>
                                  {spArea > 0 && (
                                    <span className="text-xs font-medium tabular-nums shrink-0 ml-2">
                                      {convertArea(spArea, areaUnit)} {unitLabel}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── Hero: Estimated Value ── */}
                      <div className="px-5 pb-5">
                        <div className="rounded-2xl bg-muted/50 ring-1 ring-black/[0.08] p-4">
                          <p className="text-xs text-muted-foreground font-medium mb-1">추정 시세</p>
                          <p className="text-3xl font-bold tracking-tight">
                            {estimatedPricePerM2 > 0
                              ? toEok(estimatedPricePerM2 * landArea)
                              : officialPrice > 0
                                ? toEok(officialPrice * landArea * 1.8)
                                : "—"
                            }
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {officialPrice > 0 && (
                              <>
                                <span>공시지가 총액 {toEok(officialPrice * landArea)}</span>
                                <span>·</span>
                                <span>{fmt(Math.round(officialPrice))}원/m²</span>
                              </>
                            )}
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
                            {/* Key metrics grid */}
                            <div className="rounded-xl ring-1 ring-black/[0.08] overflow-hidden mb-5">
                              <div className="grid grid-cols-2 divide-x divide-border">
                                <div className="px-3.5 py-3">
                                  <p className="text-xs text-muted-foreground">토지면적</p>
                                  <p className="text-sm font-semibold mt-0.5">{convertArea(landArea, areaUnit)} {unitLabel}</p>
                                </div>
                                <div className="px-3.5 py-3">
                                  <p className="text-xs text-muted-foreground">공시지가</p>
                                  <p className="text-sm font-semibold mt-0.5">
                                    {officialPrice > 0 ? `${fmt(Math.round(officialPrice))}원/m²` : "—"}
                                  </p>
                                </div>
                              </div>
                              {buildingInfo && (
                                <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                                  <div className="px-3.5 py-3">
                                    <p className="text-xs text-muted-foreground">건폐율</p>
                                    <p className="text-sm font-semibold mt-0.5">{buildingInfo.coverage_rate?.toFixed(1)}%</p>
                                  </div>
                                  <div className="px-3.5 py-3">
                                    <p className="text-xs text-muted-foreground">용적률</p>
                                    <p className="text-sm font-semibold mt-0.5">{buildingInfo.floor_area_rate?.toFixed(1)}%</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Basic info */}
                            {landInfo && (
                              <section className="py-5 border-t border-border">
                                <h3 className="text-base font-semibold mb-4">기본 현황</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                                  {[
                                    { icon: LandPlot, label: "지목", value: landInfo.jimok_nm },
                                    { icon: MapPin, label: "도로접면", value: landInfo.land_road_contact_nm },
                                    { icon: Layers, label: "지형 고저", value: landInfo.land_height_nm },
                                    { icon: Building2, label: "지형 형상", value: landInfo.land_shape_nm },
                                    { icon: ArrowLeftRight, label: "토지이용", value: landInfo.land_use_nm },
                                    { icon: LandPlot, label: "PNU", value: landInfo.pnu?.slice(-8) || "" },
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
                            )}

                            {/* 용도지역 */}
                            {landUsePlan.length > 0 && (
                              <section className="py-5 border-t border-border">
                                <h3 className="text-base font-semibold mb-2">토지이용계획</h3>
                                <p className="text-sm text-muted-foreground mb-3">도시계획 규제 및 건축 가능 범위</p>
                                <div className="space-y-0">
                                  {landUsePlan.map((plan, idx) => (
                                    <InfoRow key={idx} label={plan.contact_nm || "용도지역"} value={plan.use_lawd_nm} />
                                  ))}
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
                            )}

                            {/* 공시지가 추이 */}
                            {landPublicPrices.length > 0 && (
                              <section className="py-5 border-t border-border">
                                <h3 className="text-base font-semibold mb-3">공시지가 추이</h3>
                                <div className="space-y-1.5">
                                  {(() => {
                                    const sorted = [...landPublicPrices].sort((a, b) => b.yyyy.localeCompare(a.yyyy)).slice(0, 5);
                                    const maxP = Math.max(...sorted.map((s) => s.price));
                                    return sorted.map((item, idx) => {
                                      const pct = maxP > 0 ? (item.price / maxP) * 100 : 0;
                                      const isCurrent = idx === 0;
                                      return (
                                        <div key={item.yyyy} className="flex items-center gap-2">
                                          <span className={`text-xs w-9 text-right tabular-nums ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                                            {item.yyyy}
                                          </span>
                                          <div className="flex-1 h-7 bg-muted/30 rounded-md overflow-hidden relative">
                                            <div
                                              className={`h-full rounded-md ${isCurrent ? "bg-primary/15" : "bg-muted/60"}`}
                                              style={{ width: `${pct}%` }}
                                            />
                                            <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-xs tabular-nums ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                                              {fmt(Math.round(item.price))}원
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </section>
                            )}
                          </>
                        ) : detailTab === "building" ? (
                          /* ── 건축물 정보 탭 ── */
                          buildingInfo ? (
                            <>
                              {/* Key building metrics */}
                              <div className="rounded-xl ring-1 ring-black/[0.08] overflow-hidden mb-5">
                                <div className="grid grid-cols-2 divide-x divide-border">
                                  <div className="px-3.5 py-3">
                                    <p className="text-xs text-muted-foreground">건축면적</p>
                                    <p className="text-sm font-semibold mt-0.5">{convertArea(buildingInfo.build_extent || 0, areaUnit)} {unitLabel}</p>
                                  </div>
                                  <div className="px-3.5 py-3">
                                    <p className="text-xs text-muted-foreground">연면적</p>
                                    <p className="text-sm font-semibold mt-0.5">{convertArea(buildingInfo.total_floor_area || 0, areaUnit)} {unitLabel}</p>
                                  </div>
                                </div>
                                <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                                  <div className="px-3.5 py-3">
                                    <p className="text-xs text-muted-foreground">건폐율</p>
                                    <p className="text-sm font-semibold mt-0.5">{buildingInfo.coverage_rate?.toFixed(1)}%</p>
                                  </div>
                                  <div className="px-3.5 py-3">
                                    <p className="text-xs text-muted-foreground">용적률</p>
                                    <p className="text-sm font-semibold mt-0.5">{buildingInfo.floor_area_rate?.toFixed(1)}%</p>
                                  </div>
                                </div>
                              </div>

                              {/* Building info grid */}
                              <section className="py-5 border-t border-border">
                                <h3 className="text-base font-semibold mb-4">건축물 현황</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                                  {[
                                    { icon: Building2, label: "건물명", value: buildingInfo.bldg_nm || "—" },
                                    { icon: Layers, label: "대장 구분", value: buildingInfo.bldg_div_nm || "—" },
                                    { icon: LandPlot, label: "주용도", value: buildingInfo.main_use_nm || "—" },
                                    { icon: Building2, label: "구조", value: buildingInfo.strc_nm || "—" },
                                    { icon: Building2, label: "규모", value: `지상${buildingInfo.up_floor_num || 0}층 / 지하${buildingInfo.down_floor_num || 0}층` },
                                    { icon: TrendingUp, label: "사용승인일", value: buildingInfo.gen_dt ? `${buildingInfo.gen_dt.slice(0, 4)}-${buildingInfo.gen_dt.slice(4, 6)}-${buildingInfo.gen_dt.slice(6, 8)}` : "—" },
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

                              {/* Floor breakdown */}
                              {floorInfo.length > 0 && (
                                <section className="py-5 border-t border-border">
                                  <h3 className="text-base font-semibold mb-3">층별 개요</h3>
                                  <div className="rounded-xl overflow-hidden">
                                    {floorInfo.map((f, idx) => (
                                      <div
                                        key={idx}
                                        className={`flex items-center justify-between px-3 py-2.5 ${idx % 2 === 0 ? "bg-muted/30" : ""}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm font-medium w-16">{f.floor_num_nm}</span>
                                          <span className="text-xs text-muted-foreground">{f.main_use_nm}</span>
                                        </div>
                                        <span className="text-sm font-medium tabular-nums">
                                          {convertArea(f.extent || 0, areaUnit)} {unitLabel}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </section>
                              )}

                              {/* Building public price */}
                              {bldgPublicPrices.length > 0 && (
                                <section className="py-5 border-t border-border">
                                  <h3 className="text-base font-semibold mb-3">건물 공시가격</h3>
                                  <div className="space-y-0">
                                    {bldgPublicPrices
                                      .sort((a, b) => b.yyyy.localeCompare(a.yyyy))
                                      .slice(0, 4)
                                      .map((item, idx) => (
                                        <InfoRow
                                          key={item.yyyy}
                                          label={`${item.yyyy}년`}
                                          value={toEok(item.price)}
                                          accent={idx === 0}
                                        />
                                      ))}
                                  </div>
                                </section>
                              )}

                              {/* Estimate */}
                              <section className="py-5 border-t border-border">
                                <h3 className="text-base font-semibold mb-3">추정 시세</h3>
                                <div className="grid grid-cols-2 gap-2">
                                  <StatCard
                                    label="토지 추정시세"
                                    value={estimatedPricePerM2 > 0
                                      ? toEok(estimatedPricePerM2 * landArea)
                                      : officialPrice > 0
                                        ? toEok(officialPrice * landArea * 1.8)
                                        : "—"
                                    }
                                  />
                                  <StatCard
                                    label="건물 포함 추정"
                                    value={officialPrice > 0
                                      ? toEok(officialPrice * landArea * 2.3)
                                      : "—"
                                    }
                                  />
                                </div>
                              </section>
                            </>
                          ) : (
                            <div className="py-12 text-center">
                              <Building2 className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">건축물 정보가 없습니다</p>
                            </div>
                          )
                        ) : (
                          /* ── 거래 정보 탭 ── */
                          <>
                            {/* Sub-tab toggle: 실거래 / 매물 */}
                            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-0.5 mb-5">
                              {([
                                { key: "rtms" as TradeSubTab, label: "실거래", count: tradeHistory.length },
                                { key: "sale" as TradeSubTab, label: "매물", count: saleListings.length },
                              ]).map(({ key, label, count }) => (
                                <button
                                  key={key}
                                  onClick={() => setTradeSubTab(key)}
                                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    tradeSubTab === key
                                      ? "bg-foreground text-background shadow-sm"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {label}
                                  {count > 0 && (
                                    <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                                      tradeSubTab === key ? "bg-background/20" : "bg-muted-foreground/10"
                                    }`}>
                                      {count}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>

                            {tradeSubTab === "rtms" ? (
                              <>
                                {/* Trade history */}
                                <section className="pb-5">
                                  <h3 className="text-base font-semibold mb-3">실거래 이력</h3>
                                  {tradeHistory.length > 0 ? (
                                    <div className="rounded-xl overflow-hidden">
                                      {tradeHistory.map((trade, idx) => {
                                        const priceWon = trade.price * 10_000;
                                        const area = trade.land_extent || trade.build_extent || 0;
                                        const pricePerM2 = area > 0 ? Math.round(priceWon / area) : 0;
                                        const tradeType = trade.req_gbn || "매매";
                                        const dateStr = trade.deal_ymd
                                          ? `${trade.deal_ymd.slice(0, 4)}.${trade.deal_ymd.slice(4, 6)}`
                                          : "";
                                        return (
                                          <div
                                            key={idx}
                                            className={`flex items-center justify-between px-3 py-3 ${idx % 2 === 0 ? "bg-muted/30" : ""}`}
                                          >
                                            <div>
                                              <p className="text-sm font-medium">{dateStr}</p>
                                              <p className="text-xs text-muted-foreground">{tradeType} · {convertArea(area, areaUnit)}{unitLabel}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-sm font-semibold">{toEok(priceWon)}</p>
                                              {pricePerM2 > 0 && (
                                                <p className="text-xs text-muted-foreground tabular-nums">
                                                  {fmt(pricePerM2)}원/m²
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground py-6 text-center">실거래 이력이 없습니다</p>
                                  )}
                                </section>

                                {/* Nearby trades */}
                                <section className="py-5 border-t border-border">
                                  <h3 className="text-base font-semibold mb-1">인근 유사 거래</h3>
                                  <p className="text-xs text-muted-foreground mb-3">반경 500m 이내 최근 거래</p>
                                  {nearbyTrades.length > 0 ? (
                                    <div className="space-y-2">
                                      {nearbyTrades.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="rounded-xl ring-1 ring-black/[0.08] px-3.5 py-3"
                                        >
                                          <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium truncate">{item.pnu?.slice(-8) || `거래 ${idx + 1}`}</span>
                                            <span className="text-sm font-semibold">
                                              {item.parsed.price ? toEok(item.parsed.price * 10_000) : "—"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{item.parsed.yyyymm || ""}</span>
                                            {item.parsed.land_use_nm && <span>{item.parsed.land_use_nm}</span>}
                                            <span className="ml-auto">{item.distance}m</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground py-6 text-center">인근 유사 거래가 없습니다</p>
                                  )}
                                </section>
                              </>
                            ) : (
                              <>
                                {/* Listings */}
                                <section className="pb-5">
                                  <h3 className="text-base font-semibold mb-1">매물 목록</h3>
                                  <p className="text-xs text-muted-foreground mb-3">현재 등록된 매물 정보</p>
                                  {saleListings.length > 0 ? (
                                    <div className="space-y-2">
                                      {saleListings.map((listing, idx) => (
                                        <div
                                          key={idx}
                                          className="rounded-xl ring-1 ring-black/[0.08] px-3.5 py-3"
                                        >
                                          <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium">{listing.realestate_type_nm || listing.trade_type || "매물"}</span>
                                            <span className="text-sm font-semibold text-primary">
                                              {toEok(listing.price * 10_000)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {listing.supply_extent > 0 && <span>{convertArea(listing.supply_extent, areaUnit)}{unitLabel}</span>}
                                            {listing.private_extent > 0 && <span>전용 {convertArea(listing.private_extent, areaUnit)}{unitLabel}</span>}
                                            <span className="ml-auto">{listing.reg_date || ""}</span>
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
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* ─── CTA Buttons (sticky bottom) ─── */}
                <div className="p-3 ring-1 ring-black/[0.06] bg-card flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 rounded-xl gap-1.5 text-xs"
                    onClick={() =>
                      navigate("/analysis/manual", {
                        state: { pnu: selectedLocation.pnu, parcel: selectedLocation },
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

          {/* ─── Top-left: 합필 + 매물/실거래 ─── */}
          <div className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5">
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

            <div className="flex items-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm p-0.5">
              {([
                { key: "sale" as const, label: "매물" },
                { key: "rtms" as const, label: "실거래" },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMarkerViewMode(key)}
                  className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
                    markerViewMode === key
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Top-center: 용도별 필터 ─── */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 z-[1000] flex items-center gap-1">
            {PROP_TYPES.map((pt) => {
              const active = visiblePropTypes.has(pt);
              const color = PROP_COLORS[pt];
              return (
                <button
                  key={pt}
                  onClick={() =>
                    setVisiblePropTypes((prev) => {
                      const next = new Set(prev);
                      if (next.has(pt)) next.delete(pt);
                      else next.add(pt);
                      return next;
                    })
                  }
                  className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl text-xs font-medium transition-all ${
                    active ? "shadow-sm" : "opacity-40"
                  }`}
                  style={{
                    background: "white",
                    color: active ? color : "#9ca3af",
                    border: `1.5px solid ${active ? color : "#d1d5db"}`,
                  }}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: active ? color : "#d1d5db" }}
                  />
                  {pt}
                </button>
              );
            })}
          </div>

          {/* ─── Top-right: View mode controls ─── */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-[1000]">
            <button className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors" title="레이어">
              <Layers className="size-4" />
            </button>
            <button className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors" title="거리뷰">
              <Eye className="size-4" />
            </button>
            <button className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors" title="측정">
              <Ruler className="size-4" />
            </button>
          </div>

          {/* ─── Zoom & location controls ─── */}
          <div className="absolute right-3 bottom-8 flex flex-col gap-1.5 z-[1000]">
            <button onClick={handleZoomIn} className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors" title="확대">
              <Plus className="size-4" />
            </button>
            <button onClick={handleZoomOut} className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors" title="축소">
              <Minus className="size-4" />
            </button>
            <div className="h-px" />
            <button onClick={handleCurrentLocation} className="size-9 flex items-center justify-center bg-card rounded-xl ring-1 ring-black/[0.08] shadow-sm hover:bg-muted/50 transition-colors" title="현재 위치">
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold tracking-tight">AI 사업성 분석 — 용도 선택</h2>
              <button onClick={() => setShowAiModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="size-5" />
              </button>
            </div>

            <div className="bg-muted/30 rounded-xl px-4 py-3 mb-5 space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">대상 필지</p>
              {(() => {
                const locations = mapMode === "merge" ? mergedLocations : selectedLocation ? [selectedLocation] : [];
                return (
                  <>
                    {locations.map((p) => (
                      <p key={p.pnu} className="text-sm font-medium truncate">{p.address || p.pnu}</p>
                    ))}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>총 면적: {convertArea(landArea, areaUnit)} {unitLabel}</span>
                    </div>
                  </>
                );
              })()}
            </div>

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

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowAiModal(false)}>
                취소
              </Button>
              <Button
                className="rounded-xl gap-1.5"
                disabled={selectedBuildingTypes.length === 0}
                onClick={() => {
                  const locations = mapMode === "merge" ? mergedLocations : selectedLocation ? [selectedLocation] : [];
                  setShowAiModal(false);
                  navigate("/analysis/ai/new", {
                    state: { parcels: locations, selectedBuildingTypes, fromMap: true },
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

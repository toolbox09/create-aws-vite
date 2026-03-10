import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Check,
  Building2,
  Star,
  Ruler,
  Users,
  Banknote,
  ArrowRight,
  Share2,
  FileText,
  Layers,
  ParkingCircle,
  TrendingUp,
  Palette,
  Mountain,
  Box,
  PenTool,
  ShieldCheck,
  LandPlot,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  Home,
  CalendarDays,
  HardHat,
  Hammer,
  Wrench,
  Paintbrush,
  Zap,
  Eye,
  ClipboardCheck,
  FileBarChart,
  UserCheck,
  Calendar,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type BidField = "설계" | "시공" | "감리";
type BidStatus = "입찰대기" | "입찰공고중" | "업체선정중" | "계약진행중" | "종료";
type UserRole = "owner" | "architect-submitted" | "architect-none" | "guest";

interface Participant {
  id: number;
  name: string;
  portfolioImage: string;
  region: string;
  career: number;
  projectCount: number;
  bidPrice: number;
  rating: number;
  keywords: string[];
}

interface Certification {
  label: string;
  verified: boolean;
  type?: string;
  detail?: string;
}

/* ─── Mock Data per Category ─── */

const CURRENT_ROLE: UserRole = "owner";

/* 설계 */
const BID_DESIGN = {
  id: 1,
  status: "입찰공고중" as BidStatus,
  field: "설계" as BidField,
  bidType: "공개" as const,
  subScope: "본설계",
  address: "서울특별시 강남구 역삼동 123-4",
  title: "서울특별시 강남구 역삼동 신축 단독주택",
  buildingUse: "단독주택",
  businessUse: "실거주",
  landArea: 198,
  buildingArea: 118.8,
  floors: { above: 3, below: 1 },
  parking: { type: "자주식", count: 2 },
  totalBuildCost: 80000,
  feeMin: 3000,
  feeMax: 5000,
  feeLabel: "설계비",
  recruitStart: "2026.02.20",
  recruitEnd: "2026.03.18",
  dDay: 9,
  currentStage: 1,
  deliverables: ["기본설계도서", "실시설계도서", "구조계산서", "투시도", "3D 모델링"],
  styles: ["모던", "미니멀"],
  designElements: ["테라스", "중정", "루프탑"],
  exteriors: ["노출콘크리트", "징크", "목재"],
  referenceImages: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
  ],
  certs: [
    { label: "토지 소유", verified: true, type: "등기부등본" },
    { label: "건축 가능 여부", verified: true, type: "건축사 확인서" },
    { label: "건축허가", verified: false },
  ] as Certification[],
  landInfo: {
    mainParcel: "서울특별시 강남구 역삼동 123-4",
    mergedParcels: ["서울특별시 강남구 역삼동 123-5", "서울특별시 강남구 역삼동 123-6"],
  },
  poster: {
    name: "김건축",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    intro: "강남 역삼동에 가족을 위한 모던 단독주택을 짓고자 합니다. 자연과 조화를 이루는 따뜻한 공간을 원합니다.",
    joinDate: "2025년 12월",
  },
  // 설계 전용
  construction: null,
  supervision: null,
};

/* 시공 */
const BID_CONSTRUCTION = {
  ...BID_DESIGN,
  id: 2,
  field: "시공" as BidField,
  subScope: "신축",
  title: "서울특별시 마포구 상수동 근린생활시설 신축공사",
  address: "서울특별시 마포구 상수동 33-2",
  buildingUse: "근린생활",
  businessUse: "상업",
  landArea: 330,
  buildingArea: 264,
  floors: { above: 5, below: 1 },
  parking: { type: "기계식", count: 8 },
  totalBuildCost: 250000,
  feeMin: 200000,
  feeMax: 280000,
  feeLabel: "공사비",
  referenceImages: [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
  ],
  certs: [
    { label: "토지 소유", verified: true, type: "등기부등본" },
    { label: "건축허가", verified: true, type: "건축허가증" },
    { label: "설계도서 확보", verified: true, type: "실시설계도서" },
  ] as Certification[],
  poster: {
    name: "박도급",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    intro: "마포구 상수동에 5층 규모 근린생활시설을 신축하고자 합니다. 품질 좋은 시공사를 찾고 있습니다.",
    joinDate: "2025년 11월",
  },
  deliverables: [] as string[],
  styles: [] as string[],
  designElements: [] as string[],
  exteriors: [] as string[],
  construction: {
    structureType: "철근콘크리트 (RC)",
    constructionMethods: ["현장타설", "PC공법"],
    majorMaterials: ["레미콘 (25-24-15)", "고강도 철근 (SD500)", "단열재 (비드법 2종)", "알루미늄 커튼월"],
    interiorScopes: ["천장마감", "바닥마감", "벽체마감", "조명설치"],
    mepScopes: ["전기설비", "급배수설비", "소방설비", "냉난방 (EHP)", "환기설비"],
    desiredDuration: 18,
    hasDesignDocs: true,
    specialRequirements: "LEED 인증 목표, 소음·진동 최소화 공법 적용 희망",
  },
  supervision: null,
};

/* 감리 */
const BID_SUPERVISION = {
  ...BID_DESIGN,
  id: 3,
  field: "감리" as BidField,
  subScope: "상주감리",
  title: "인천 연수구 송도동 다세대주택 건축감리",
  address: "인천광역시 연수구 송도동 100-5",
  buildingUse: "다세대주택",
  businessUse: "임대",
  landArea: 450,
  buildingArea: 360,
  floors: { above: 7, below: 2 },
  parking: { type: "자주식", count: 20 },
  totalBuildCost: 350000,
  feeMin: 8000,
  feeMax: 12000,
  feeLabel: "감리비",
  referenceImages: [
    "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1513467535987-fd81bc7d600f?w=600&h=400&fit=crop",
  ],
  certs: [
    { label: "토지 소유", verified: true, type: "등기부등본" },
    { label: "건축허가", verified: true, type: "건축허가증" },
    { label: "설계도서 확보", verified: true, type: "실시설계도서" },
    { label: "시공계약 확보", verified: false },
  ] as Certification[],
  poster: {
    name: "이위탁",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
    intro: "송도동 7층 다세대주택 공사 감리를 맡길 경험 있는 감리업체를 찾습니다. 상주감리 우대합니다.",
    joinDate: "2026년 1월",
  },
  deliverables: [] as string[],
  styles: [] as string[],
  designElements: [] as string[],
  exteriors: [] as string[],
  construction: null,
  supervision: {
    supervisionType: "상주감리",
    supervisionScopes: ["구조감리", "건축감리", "기계설비감리", "전기감리", "소방감리"],
    inspectionItems: ["기초공사 검측", "철근배근 검측", "콘크리트 타설 검측", "방수공사 검측", "마감공사 검측"],
    reportFrequency: "주 1회",
    siteVisitFrequency: "매일 (상주)",
    residentCount: 2,
    expectedConstructionStart: "2026.05.01",
    expectedConstructionEnd: "2027.11.30",
    linkedConstructionContract: "마포건설(주) — 공사계약 #C-2026-045",
    specialRequirements: "BIM 기반 검측 보고서, 드론 촬영 월간 보고 포함 희망",
  },
};

type BidData = typeof BID_DESIGN | typeof BID_CONSTRUCTION | typeof BID_SUPERVISION;

const BID_MAP: Record<BidField, BidData> = {
  "설계": BID_DESIGN,
  "시공": BID_CONSTRUCTION,
  "감리": BID_SUPERVISION,
};

const STAGES: { label: string; status: BidStatus }[] = [
  { label: "대기", status: "입찰대기" },
  { label: "입찰중", status: "입찰공고중" },
  { label: "심사중", status: "업체선정중" },
  { label: "계약중", status: "계약진행중" },
  { label: "마감", status: "종료" },
];

const PARTICIPANTS_DESIGN: Participant[] = [
  {
    id: 1, name: "아크 건축사사무소",
    portfolioImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop",
    region: "서울 강남구", career: 12, projectCount: 47, bidPrice: 4200, rating: 4.8,
    keywords: ["모던건축 전문", "주택 다수 실적"],
  },
  {
    id: 2, name: "리움 디자인 건축",
    portfolioImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop",
    region: "서울 서초구", career: 8, projectCount: 32, bidPrice: 3800, rating: 4.9,
    keywords: ["디자인 수상 경력", "친환경 설계"],
  },
  {
    id: 3, name: "도시공간 건축",
    portfolioImage: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop",
    region: "서울 마포구", career: 15, projectCount: 63, bidPrice: 4500, rating: 4.7,
    keywords: ["종합 설계 가능", "BIM 활용"],
  },
];

const PARTICIPANTS_CONSTRUCTION: Participant[] = [
  {
    id: 4, name: "대한종합건설(주)",
    portfolioImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    region: "서울 송파구", career: 25, projectCount: 180, bidPrice: 240000, rating: 4.6,
    keywords: ["RC구조 전문", "근생시설 다수"],
  },
  {
    id: 5, name: "미래건설 주식회사",
    portfolioImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
    region: "서울 강서구", career: 18, projectCount: 95, bidPrice: 255000, rating: 4.7,
    keywords: ["친환경 인증", "LEED 경험"],
  },
];

const PARTICIPANTS_SUPERVISION: Participant[] = [
  {
    id: 6, name: "한국건축감리(주)",
    portfolioImage: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&h=300&fit=crop",
    region: "인천 연수구", career: 20, projectCount: 120, bidPrice: 9500, rating: 4.8,
    keywords: ["상주감리 전문", "BIM 검측"],
  },
  {
    id: 7, name: "세종감리기술단",
    portfolioImage: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
    region: "서울 영등포구", career: 15, projectCount: 88, bidPrice: 10200, rating: 4.5,
    keywords: ["다세대 경험 다수", "드론 검측"],
  },
];

const PARTICIPANTS_MAP: Record<BidField, Participant[]> = {
  "설계": PARTICIPANTS_DESIGN,
  "시공": PARTICIPANTS_CONSTRUCTION,
  "감리": PARTICIPANTS_SUPERVISION,
};

const PARTICIPANT_LABEL: Record<BidField, string> = {
  "설계": "건축사",
  "시공": "시공사",
  "감리": "감리사",
};

const SORT_OPTIONS = [
  { value: "recommend", label: "추천순" },
  { value: "career", label: "업력 높은순" },
  { value: "priceLow", label: "제안가 낮은순" },
  { value: "priceHigh", label: "제안가 높은순" },
  { value: "projects", label: "프로젝트 수 많은순" },
];

/* ─── Lightbox ─── */

function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
      >
        <ChevronLeft className="size-5" />
      </button>

      <img
        src={images[currentIndex]}
        alt={`참고 이미지 ${currentIndex + 1}`}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white/80">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

/* ─── Image Grid (Airbnb 1+4 style) ─── */

function ImageGrid({ images, onImageClick }: { images: string[]; onImageClick: (idx: number) => void }) {
  return (
    <div className="group relative grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-2xl overflow-hidden">
      <div
        className="md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto overflow-hidden cursor-pointer"
        onClick={() => onImageClick(0)}
      >
        <img
          src={images[0]}
          alt="메인 이미지"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      {images.slice(1, 5).map((src, i) => (
        <div
          key={i}
          className="hidden md:block aspect-[4/3] overflow-hidden cursor-pointer"
          onClick={() => onImageClick(i + 1)}
        >
          <img
            src={src}
            alt={`참고 이미지 ${i + 2}`}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.05]"
            loading="lazy"
          />
        </div>
      ))}
      <button className="absolute right-4 bottom-4 rounded-lg bg-card px-3.5 py-2 text-xs font-medium ring-1 ring-black/[0.08] shadow-sm transition-all hover:shadow-md">
        모든 사진 보기
      </button>
    </div>
  );
}

/* ─── Milestone Stepper ─── */

function MilestoneStepper({ currentStage }: { currentStage: number }) {
  return (
    <div className="py-6" role="progressbar" aria-valuenow={currentStage + 1} aria-valuemin={1} aria-valuemax={5}>
      <h3 className="text-base font-semibold mb-5">진행 단계</h3>
      <div className="flex items-center">
        {STAGES.map((stage, i) => {
          const isCompleted = i < currentStage;
          const isCurrent = i === currentStage;
          return (
            <div key={stage.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`size-3.5 rounded-full transition-all ${
                    isCompleted || isCurrent
                      ? "bg-primary"
                      : "bg-transparent ring-2 ring-muted-foreground/30"
                  }`}
                  aria-label={`${stage.label}: ${isCompleted ? "완료" : isCurrent ? "현재" : "미래"}`}
                />
                <span
                  className={`text-[11px] whitespace-nowrap ${
                    isCompleted || isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className="flex-1 h-[2px] mx-1.5 mt-[-18px]">
                  <div
                    className={`h-full ${
                      isCompleted ? "bg-primary" : isCurrent ? "bg-gradient-to-r from-primary to-muted" : "border-t-2 border-dashed border-muted-foreground/20"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Info Item (icon + label + value) ─── */

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ─── Chip Group ─── */

function ChipGroup({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-medium mb-1.5">{label}</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Certification Card ─── */

function CertCard({ cert }: { cert: Certification }) {
  return (
    <div className="flex items-center gap-3">
      {cert.verified ? (
        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15">
          <Check className="size-4 text-emerald-600" />
        </div>
      ) : (
        <div className="flex size-7 items-center justify-center rounded-full bg-muted">
          <ShieldCheck className="size-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm ${cert.verified ? "font-medium" : "text-muted-foreground"}`}
          aria-label={`${cert.label}: ${cert.verified ? "인증 완료" : "미인증"}`}
        >
          {cert.label}
        </span>
        {cert.verified && cert.type && (
          <p className="text-xs text-muted-foreground">{cert.type}</p>
        )}
        {cert.verified && cert.detail && (
          <p className="text-xs text-muted-foreground">{cert.detail}</p>
        )}
      </div>
      <span className={`text-[11px] font-medium ${cert.verified ? "text-emerald-600" : "text-muted-foreground"}`}>
        {cert.verified ? "인증 완료" : "미인증"}
      </span>
    </div>
  );
}

/* ─── Participant Card (Owner View) ─── */

function ParticipantCardOwner({ p, bidId, field, bidStatus }: { p: Participant; bidId: number; field: BidField; bidStatus: BidStatus }) {
  const priceDisplay = field === "시공"
    ? `${(p.bidPrice / 10000).toFixed(1)}억원`
    : `${p.bidPrice.toLocaleString()}만원`;

  return (
    <div className="flex gap-4 py-5">
      <Link to={`/partners/${p.id}`} className="w-[120px] h-[90px] shrink-0 overflow-hidden rounded-xl">
        <img
          src={p.portfolioImage}
          alt={`${p.name} 포트폴리오`}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.05]"
          loading="lazy"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/partners/${p.id}`} className="text-sm font-semibold hover:underline underline-offset-4">
              {p.name}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              {p.region} &middot; 업력 {p.career}년 &middot; 프로젝트 {p.projectCount}건
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs shrink-0">
            <Star className="size-3 fill-foreground text-foreground" />
            <span className="font-semibold">{p.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {p.keywords.map((kw) => (
            <span key={kw} className="text-xs text-muted-foreground">{kw}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-sm font-semibold">{priceDisplay}</p>
          <div className="flex gap-2">
            <Link to={`/bids/${bidId}/proposals/${p.id}`}>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                제안 보기
              </Button>
            </Link>
            {bidStatus === "업체선정중" && (
              <Link to={`/contracts/new?architectId=${p.id}&bidId=${bidId}&type=${field === "시공" ? "construction" : field === "감리" ? "supervision" : "design"}`}>
                <Button size="sm" className="h-8 rounded-lg text-xs">
                  계약 요청
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Participant Card (Architect View — own) ─── */

function ParticipantCardSelf({ p, field }: { p: Participant; field: BidField }) {
  const priceDisplay = field === "시공"
    ? `${(p.bidPrice / 10000).toFixed(1)}억원`
    : `${p.bidPrice.toLocaleString()}만원`;

  return (
    <div className="flex gap-4 py-5 bg-primary/[0.03] -mx-2 px-2 rounded-xl">
      <div className="w-[120px] h-[90px] shrink-0 overflow-hidden rounded-xl">
        <img src={p.portfolioImage} alt={`${p.name} 포트폴리오`} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{p.name}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">내 제안</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {p.region} &middot; 업력 {p.career}년 &middot; 프로젝트 {p.projectCount}건
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold mt-2">{priceDisplay}</p>
      </div>
    </div>
  );
}

/* ─── Participant Card (Architect View — anonymous others) ─── */

function ParticipantCardAnonymous({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="w-[120px] h-[90px] shrink-0 overflow-hidden rounded-xl bg-muted flex items-center justify-center">
        <Users className="size-6 text-muted-foreground/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">참여사 {String.fromCharCode(65 + index)}</p>
        <div className="flex gap-4 mt-1 text-xs text-muted-foreground/50">
          <span>***</span>
          <span>***</span>
          <span>***</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Construction Requirements Section
   ═══════════════════════════════════════════════ */

function ConstructionRequirements({ data }: { data: NonNullable<typeof BID_CONSTRUCTION.construction> }) {
  return (
    <section className="py-6" aria-labelledby="construction-req-title">
      <h3 id="construction-req-title" className="text-base font-semibold mb-5">시공 요구사항</h3>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <HardHat className="size-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">구조 유형</p>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{data.structureType}</span>
          </div>
        </div>

        <ChipGroup icon={<Hammer className="size-5" />} label="공사 공법" items={data.constructionMethods} />
        <ChipGroup icon={<Box className="size-5" />} label="주요 자재" items={data.majorMaterials} />
        <ChipGroup icon={<Paintbrush className="size-5" />} label="인테리어 범위" items={data.interiorScopes} />
        <ChipGroup icon={<Zap className="size-5" />} label="설비 범위 (MEP)" items={data.mepScopes} />

        <div className="flex items-start gap-3">
          <Timer className="size-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">희망 공사기간</p>
            <span className="text-sm text-muted-foreground">{data.desiredDuration}개월</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="size-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">설계도서 확보 여부</p>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${data.hasDesignDocs ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>
              {data.hasDesignDocs ? "확보 완료" : "미확보"}
            </span>
          </div>
        </div>

        {data.specialRequirements && (
          <div className="flex items-start gap-3">
            <Wrench className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">특수 요구사항</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.specialRequirements}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Supervision Requirements Section
   ═══════════════════════════════════════════════ */

function SupervisionRequirements({ data }: { data: NonNullable<typeof BID_SUPERVISION.supervision> }) {
  return (
    <section className="py-6" aria-labelledby="supervision-req-title">
      <h3 id="supervision-req-title" className="text-base font-semibold mb-5">감리 요구사항</h3>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <Eye className="size-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">감리 유형</p>
            <span className="rounded-full bg-blue-500/10 text-blue-700 px-3 py-1 text-xs font-medium">{data.supervisionType}</span>
          </div>
        </div>

        <ChipGroup icon={<ClipboardCheck className="size-5" />} label="감리 범위" items={data.supervisionScopes} />
        <ChipGroup icon={<FileBarChart className="size-5" />} label="검측 항목" items={data.inspectionItems} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
          <InfoItem icon={<FileText className="size-5" />} label="보고 주기" value={data.reportFrequency} />
          <InfoItem icon={<Calendar className="size-5" />} label="현장 방문 빈도" value={data.siteVisitFrequency} />
          <InfoItem icon={<UserCheck className="size-5" />} label="상주 인원" value={`${data.residentCount}명`} />
          <InfoItem icon={<CalendarDays className="size-5" />} label="예상 공사기간" value={`${data.expectedConstructionStart} ~ ${data.expectedConstructionEnd}`} />
        </div>

        {data.linkedConstructionContract && (
          <div className="flex items-start gap-3">
            <HardHat className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">연계 시공계약</p>
              <p className="text-sm text-muted-foreground">{data.linkedConstructionContract}</p>
            </div>
          </div>
        )}

        {data.specialRequirements && (
          <div className="flex items-start gap-3">
            <Wrench className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">특수 요구사항</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.specialRequirements}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════ */

export default function BidDetailPage() {
  const [searchParams] = useSearchParams();
  const fieldParam = searchParams.get("field") as BidField | null;
  const field: BidField = fieldParam && BID_MAP[fieldParam] ? fieldParam : "설계";

  const BID = BID_MAP[field];
  const PARTICIPANTS = PARTICIPANTS_MAP[field];
  const participantLabel = PARTICIPANT_LABEL[field];

  const [liked, setLiked] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("recommend");

  const statusDot = BID.status === "입찰공고중" || BID.status === "업체선정중";
  const certDone = BID.certs.filter((c) => c.verified).length;
  const certTotal = BID.certs.length;
  const certsSorted = [...BID.certs].sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));

  const participantCountText =
    PARTICIPANTS.length >= 3
      ? `참여 ${participantLabel} ${PARTICIPANTS.length}명`
      : PARTICIPANTS.length > 0
        ? `참여 ${participantLabel} 3명 미만`
        : `아직 참여한 ${participantLabel}가 없습니다`;

  function openLightbox(idx: number) { setLightboxIndex(idx); }
  function closeLightbox() { setLightboxIndex(null); }

  const feeDisplay = field === "시공"
    ? `${(BID.feeMin / 10000).toFixed(0)}~${(BID.feeMax / 10000).toFixed(0)}억원`
    : `${BID.feeMin.toLocaleString()}~${BID.feeMax.toLocaleString()}만원`;

  const subScopeLabel: Record<BidField, string> = {
    "설계": "설계 구분",
    "시공": "시공 구분",
    "감리": "감리 유형",
  };

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      {lightboxIndex !== null && (
        <Lightbox
          images={BID.referenceImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + BID.referenceImages.length) % BID.referenceImages.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % BID.referenceImages.length)}
        />
      )}

      <div className="mx-auto max-w-[1120px] px-6 pt-6 pb-20">

        {/* ═══ Back Link ═══ */}
        <Link
          to="/bids"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-3.5" />
          목록으로
        </Link>

        {/* ═══ Category Switch (for mockup demo) ═══ */}
        <div className="flex items-center gap-2 mb-5">
          {(["설계", "시공", "감리"] as BidField[]).map((f) => (
            <Link
              key={f}
              to={`/bids/1?field=${f}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                field === f
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </Link>
          ))}
          <span className="text-xs text-muted-foreground ml-2">← 분야별 목업 전환</span>
        </div>

        {/* ═══ 1. Title Bar ═══ */}
        <div className="flex items-start justify-between gap-4 mb-5 animate-fade-up">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {BID.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className={`size-1.5 rounded-full bg-primary ${statusDot ? "animate-pulse" : ""}`} />
                <span>{BID.status}</span>
              </div>
              <span>&middot;</span>
              <span>{BID.bidType}경쟁</span>
              <span>&middot;</span>
              <span>{BID.field}</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {BID.address}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              <Share2 className="size-4" />
              <span className="hidden sm:inline">공유</span>
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              aria-label={liked ? "관심 공고 해제" : "관심 공고 등록"}
              aria-pressed={liked}
            >
              <Heart className={`size-4 ${liked ? "fill-primary text-primary" : ""}`} />
              <span className="hidden sm:inline">저장</span>
            </button>
          </div>
        </div>

        {/* ═══ 2. Image Grid ═══ */}
        <div className="mb-8 animate-fade-up stagger-1">
          <ImageGrid images={BID.referenceImages} onImageClick={openLightbox} />
        </div>

        {/* ═══ 3. Two-column Layout ═══ */}
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── LEFT: Content ── */}
          <div className="flex-1 min-w-0">

            {/* Summary line */}
            <div className="flex items-center justify-between pb-6">
              <div>
                <h2 className="text-lg font-semibold">
                  {BID.buildingUse} &middot; 지상 {BID.floors.above}층 / 지하 {BID.floors.below}층
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  대지 {BID.landArea}m² &middot; 건축 {BID.buildingArea}m² &middot; 주차 {BID.parking.type} {BID.parking.count}대
                </p>
              </div>
              {BID.status === "입찰공고중" && BID.dDay > 0 && (
                <div className="flex flex-col items-center shrink-0">
                  <span className={`text-2xl font-bold tracking-tight ${BID.dDay <= 3 ? "text-red-500" : "text-primary"}`}>
                    D-{BID.dDay}
                  </span>
                  <span className="text-[10px] text-muted-foreground">마감까지</span>
                </div>
              )}
            </div>

            <Separator />

            {/* ── 건축주 Profile ── */}
            <div className="flex items-center gap-4 py-6">
              <img
                src={BID.poster.profileImage}
                alt={BID.poster.name}
                className="size-14 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold">
                  {field === "시공" ? "도급인" : field === "감리" ? "위탁인" : "건축주"} {BID.poster.name}님의 프로젝트
                </h3>
                <p className="text-sm text-muted-foreground">
                  가입일: {BID.poster.joinDate} &middot; 인증 {certDone}/{certTotal}
                </p>
              </div>
            </div>

            <Separator />

            {/* ── Description ── */}
            <div className="py-6 space-y-3">
              <p className="text-sm leading-[1.7]">{BID.poster.intro}</p>
              <p className="text-sm leading-[1.7] text-muted-foreground">
                모집기간: {BID.recruitStart} ~ {BID.recruitEnd}
              </p>
            </div>

            <Separator />

            {/* ── Milestone Stepper ── */}
            <MilestoneStepper currentStage={BID.currentStage} />

            <Separator />

            {/* ── 기본 정보 (분야별) ── */}
            <section className="py-6" aria-labelledby="basic-info-title">
              <h3 id="basic-info-title" className="text-base font-semibold mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                <InfoItem icon={<Target className="size-5" />} label="입찰 분야" value={BID.field} />
                <InfoItem icon={<PenTool className="size-5" />} label={subScopeLabel[field]} value={BID.subScope} />
                <InfoItem icon={<MapPin className="size-5" />} label="부지 소재지" value={BID.address} />
                <InfoItem icon={<Users className="size-5" />} label="입찰 방식" value={`${BID.bidType}입찰`} />
                <InfoItem icon={<Home className="size-5" />} label="사업 용도" value={BID.businessUse} />
                <InfoItem icon={<Building2 className="size-5" />} label="건축 용도" value={BID.buildingUse} />
                <InfoItem icon={<Ruler className="size-5" />} label="대지 면적" value={`${BID.landArea.toLocaleString()}m² (${(BID.landArea * 0.3025).toFixed(1)}평)`} />
                <InfoItem icon={<Layers className="size-5" />} label="건축 면적" value={`${BID.buildingArea.toLocaleString()}m² (${(BID.buildingArea * 0.3025).toFixed(1)}평)`} />
                <InfoItem icon={<TrendingUp className="size-5" />} label="층수" value={`지상 ${BID.floors.above}층 / 지하 ${BID.floors.below}층`} />
                <InfoItem icon={<ParkingCircle className="size-5" />} label="주차 계획" value={`${BID.parking.type} ${BID.parking.count}대`} />
                <InfoItem icon={<CalendarDays className="size-5" />} label="모집 유효 기간" value={`${BID.recruitStart} ~ ${BID.recruitEnd}`} />
                <InfoItem icon={<Banknote className="size-5" />} label="총 건축 사업비" value={`${(BID.totalBuildCost / 10000).toLocaleString()}억원`} />
                <InfoItem icon={<Banknote className="size-5" />} label={`희망 ${BID.feeLabel}`} value={feeDisplay} />

                {/* 시공 전용: 희망 공사기간 */}
                {field === "시공" && BID.construction && (
                  <InfoItem icon={<Timer className="size-5" />} label="희망 공사기간" value={`${(BID.construction as NonNullable<typeof BID_CONSTRUCTION.construction>).desiredDuration}개월`} />
                )}

                {/* 감리 전용: 예상 공사기간 */}
                {field === "감리" && BID.supervision && (
                  <InfoItem icon={<Calendar className="size-5" />} label="예상 공사기간" value={`${(BID.supervision as NonNullable<typeof BID_SUPERVISION.supervision>).expectedConstructionStart} ~ ${(BID.supervision as NonNullable<typeof BID_SUPERVISION.supervision>).expectedConstructionEnd}`} />
                )}
              </div>
            </section>

            <Separator />

            {/* ── 요구사항 (설계 분야) ── */}
            {field === "설계" && (
              <>
                <section className="py-6" aria-labelledby="requirements-title">
                  <h3 id="requirements-title" className="text-base font-semibold mb-5">설계 요구사항</h3>
                  <div className="space-y-5">
                    <ChipGroup icon={<FileText className="size-5" />} label="요구 성과품" items={BID.deliverables} />
                    <ChipGroup icon={<Palette className="size-5" />} label="건축 스타일" items={BID.styles} />
                    <ChipGroup icon={<Mountain className="size-5" />} label="디자인 요소" items={BID.designElements} />
                    <ChipGroup icon={<Box className="size-5" />} label="외장재 선호" items={BID.exteriors} />
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* ── 요구사항 (시공 분야) ── */}
            {field === "시공" && BID.construction && (
              <>
                <ConstructionRequirements data={BID.construction} />
                <Separator />
              </>
            )}

            {/* ── 요구사항 (감리 분야) ── */}
            {field === "감리" && BID.supervision && (
              <>
                <SupervisionRequirements data={BID.supervision} />
                <Separator />
              </>
            )}

            {/* ── 신뢰 인증 현황 ── */}
            <section className="py-6" aria-labelledby="cert-title">
              <div className="flex items-center justify-between mb-4">
                <h3 id="cert-title" className="text-base font-semibold">신뢰 인증 현황</h3>
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{certDone}</span> / {certTotal} 완료
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted mb-5">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(certDone / certTotal) * 100}%` }}
                />
              </div>
              <div className="space-y-3">
                {certsSorted.map((cert) => (
                  <CertCard key={cert.label} cert={cert} />
                ))}
              </div>
            </section>

            <Separator />

            {/* ── 토지 정보 ── */}
            <section className="py-6" aria-labelledby="land-info-title">
              <h3 id="land-info-title" className="text-base font-semibold mb-4">토지 정보</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <LandPlot className="size-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">기준 필지</p>
                    <p className="text-sm font-medium">{BID.landInfo.mainParcel}</p>
                  </div>
                </div>
                {BID.landInfo.mergedParcels.length > 0 && (
                  <div className="ml-8 space-y-1.5 mt-1">
                    <p className="text-xs text-muted-foreground">합필 필지</p>
                    {BID.landInfo.mergedParcels.map((addr) => (
                      <p key={addr} className="text-sm text-muted-foreground">{addr}</p>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* ── 참여사 목록 ── */}
            <section className="py-6" aria-labelledby="participants-title">
              <div className="flex items-center justify-between mb-2">
                <h3 id="participants-title" className="text-base font-semibold">
                  {participantCountText}
                </h3>
                {CURRENT_ROLE === "owner" && PARTICIPANTS.length > 0 && (
                  <Link
                    to="/partners"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    전체 파트너 보기
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </div>

              {CURRENT_ROLE === "owner" && PARTICIPANTS.length > 0 && (
                <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1" role="tablist">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      role="tab"
                      aria-selected={sortBy === opt.value}
                      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        sortBy === opt.value
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {PARTICIPANTS.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {CURRENT_ROLE === "owner" &&
                    PARTICIPANTS.map((p) => <ParticipantCardOwner key={p.id} p={p} bidId={BID.id} field={field} bidStatus={BID.status} />)}

                  {CURRENT_ROLE === "architect-submitted" && (
                    <>
                      <ParticipantCardSelf p={PARTICIPANTS[0]} field={field} />
                      {PARTICIPANTS.slice(1).map((_, i) => (
                        <ParticipantCardAnonymous key={i} index={i} />
                      ))}
                    </>
                  )}

                  {(CURRENT_ROLE === "architect-none" || CURRENT_ROLE === "guest") && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {CURRENT_ROLE === "guest"
                        ? "로그인 후 확인 가능합니다"
                        : `참여 ${participantLabel} ${PARTICIPANTS.length >= 3 ? `${PARTICIPANTS.length}명` : "3명 미만"}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  아직 제안을 제출한 {participantLabel}가 없습니다
                </div>
              )}
            </section>
          </div>

          {/* ── RIGHT: Sticky Bid Card ── */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-20">
              <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-6 space-y-5">
                {/* Price */}
                <div>
                  {field === "시공" ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight">
                        {(BID.feeMin / 10000).toFixed(0)}~{(BID.feeMax / 10000).toFixed(0)}
                      </span>
                      <span className="text-sm text-muted-foreground">억원</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight">
                        {BID.feeMin.toLocaleString()}~{BID.feeMax.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">만원</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">희망 {BID.feeLabel} 범위</p>
                </div>

                {/* Info rows */}
                <div className="rounded-xl ring-1 ring-black/[0.08] overflow-hidden text-sm">
                  <div className="grid grid-cols-2">
                    <div className="p-3 ring-1 ring-black/[0.08]">
                      <p className="text-[10px] text-muted-foreground font-medium mb-0.5">모집 시작</p>
                      <p className="font-medium">{BID.recruitStart}</p>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-muted-foreground font-medium mb-0.5">모집 마감</p>
                      <p className="font-medium">{BID.recruitEnd}</p>
                    </div>
                  </div>
                  <div className="p-3 ring-1 ring-black/[0.08]">
                    <p className="text-[10px] text-muted-foreground font-medium mb-0.5">참여 {participantLabel}</p>
                    <p className="font-medium">
                      {PARTICIPANTS.length >= 3 ? `${PARTICIPANTS.length}사 참여중` : PARTICIPANTS.length > 0 ? "3명 미만 참여중" : "아직 없음"}
                    </p>
                  </div>
                </div>

                {/* CTA — 상태/역할별 */}
                {BID.status === "입찰대기" && CURRENT_ROLE === "owner" && (
                  <Link to={`/bids/${BID.id}/edit`} className="block">
                    <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold">
                      공고 수정
                    </Button>
                  </Link>
                )}

                {BID.status === "입찰공고중" && (
                  <>
                    {CURRENT_ROLE === "owner" && (
                      <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold">
                        공고 관리
                      </Button>
                    )}
                    {CURRENT_ROLE === "architect-none" && (
                      <Link to={`/bids/${BID.id}/proposals/new`} className="block">
                        <Button className="w-full h-12 rounded-xl text-sm font-semibold">
                          입찰 참여하기
                        </Button>
                      </Link>
                    )}
                    {CURRENT_ROLE === "architect-submitted" && (
                      <div className="space-y-2">
                        <Link to={`/bids/${BID.id}/proposals/edit`} className="block">
                          <Button variant="outline" className="w-full h-10 rounded-xl text-sm font-semibold">
                            제안 수정
                          </Button>
                        </Link>
                        <Button variant="destructive" className="w-full h-10 rounded-xl text-sm font-semibold">
                          제안 철회
                        </Button>
                      </div>
                    )}
                    {CURRENT_ROLE === "guest" && (
                      <Link to="/login" className="block">
                        <Button className="w-full h-12 rounded-xl text-sm font-semibold">
                          로그인 후 참여
                        </Button>
                      </Link>
                    )}
                  </>
                )}

                {BID.status === "업체선정중" && CURRENT_ROLE === "owner" && (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-muted-foreground">참여사 목록에서 계약 요청</p>
                    <Button variant="destructive" className="w-full h-10 rounded-xl text-sm font-semibold">
                      공고 종료
                    </Button>
                  </div>
                )}

                {BID.status === "계약진행중" && CURRENT_ROLE === "owner" && (
                  <div className="space-y-2">
                    <Link to={`/contracts/${BID.id}`} className="block">
                      <Button className="w-full h-12 rounded-xl text-sm font-semibold">
                        계약서 확인
                      </Button>
                    </Link>
                    <Button variant="destructive" className="w-full h-10 rounded-xl text-sm font-semibold">
                      공고 종료
                    </Button>
                  </div>
                )}

                {(CURRENT_ROLE === "architect-submitted" && (BID.status === "업체선정중" || BID.status === "계약진행중")) && (
                  <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold">
                    <MessageCircle className="size-4 mr-1.5" />
                    채팅하기
                  </Button>
                )}

                {BID.status === "입찰공고중" && (
                  <p className="text-xs text-center text-muted-foreground">
                    마감까지 <span className={`font-semibold ${BID.dDay <= 3 ? "text-red-500" : "text-primary"}`}>D-{BID.dDay}</span>
                  </p>
                )}

                <Separator />

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold tracking-tight">{BID.landArea}</p>
                    <p className="text-[10px] text-muted-foreground">대지면적(m²)</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-tight">{BID.buildingArea}</p>
                    <p className="text-[10px] text-muted-foreground">건축면적(m²)</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-tight">{(BID.totalBuildCost / 10000).toFixed(0)}억</p>
                    <p className="text-[10px] text-muted-foreground">총건축비</p>
                  </div>
                </div>
              </div>

              {/* Report link */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <button className="underline underline-offset-4 hover:text-foreground transition-colors">
                  이 공고 신고하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

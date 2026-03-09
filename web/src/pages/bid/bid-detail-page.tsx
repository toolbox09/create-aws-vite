import { useState } from "react";
import { Link } from "react-router-dom";
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

/* ─── Mock Data ─── */

const CURRENT_ROLE: UserRole = "owner";

const BID = {
  id: 1,
  status: "입찰공고중" as BidStatus,
  field: "설계" as BidField,
  bidType: "공개" as const,
  designScope: "본설계",
  address: "서울특별시 강남구 역삼동 123-4",
  title: "서울특별시 강남구 역삼동 신축 단독주택",
  buildingUse: "단독주택",
  businessUse: "실거주",
  landArea: 198,
  buildingArea: 118.8,
  floors: { above: 3, below: 1 },
  parking: { type: "자주식", count: 2 },
  totalBuildCost: 80000,
  designFeeMin: 3000,
  designFeeMax: 5000,
  recruitStart: "2026.02.20",
  recruitEnd: "2026.03.18",
  dDay: 9,
  currentStage: 1,
  // 설계 분야 전용
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
    { label: "토지 소유", verified: true, type: "등기부등본", detail: undefined },
    { label: "건축 가능 여부", verified: true, type: "건축사 확인서", detail: undefined },
    { label: "건축허가", verified: false, type: undefined, detail: undefined },
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
};

const STAGES: { label: string; status: BidStatus }[] = [
  { label: "대기", status: "입찰대기" },
  { label: "입찰중", status: "입찰공고중" },
  { label: "심사중", status: "업체선정중" },
  { label: "계약중", status: "계약진행중" },
  { label: "마감", status: "종료" },
];

const PARTICIPANTS: Participant[] = [
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
              {/* Node */}
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
              {/* Line */}
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

function ParticipantCardOwner({ p }: { p: Participant }) {
  return (
    <div className="flex gap-4 py-5">
      {/* Portfolio thumbnail */}
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
          <p className="text-sm font-semibold">
            {p.bidPrice.toLocaleString()}만원
          </p>
          <div className="flex gap-2">
            <Link to={`/bids/${BID.id}/proposals/${p.id}`}>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                제안 보기
              </Button>
            </Link>
            {BID.status === "업체선정중" && (
              <Link to={`/contracts/new?architectId=${p.id}&bidId=${BID.id}`}>
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

function ParticipantCardSelf({ p }: { p: Participant }) {
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
        <p className="text-sm font-semibold mt-2">{p.bidPrice.toLocaleString()}만원</p>
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
   Page
   ═══════════════════════════════════════════════ */

export default function BidDetailPage() {
  const [liked, setLiked] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("recommend");

  const statusDot = BID.status === "입찰공고중" || BID.status === "업체선정중";
  const certDone = BID.certs.filter((c) => c.verified).length;
  const certTotal = BID.certs.length;
  const certsSorted = [...BID.certs].sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));

  const participantCountText =
    PARTICIPANTS.length >= 3
      ? `참여 건축사 ${PARTICIPANTS.length}명`
      : PARTICIPANTS.length > 0
        ? "참여 건축사 3명 미만"
        : "아직 참여한 건축사가 없습니다";

  function openLightbox(idx: number) { setLightboxIndex(idx); }
  function closeLightbox() { setLightboxIndex(null); }

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
                <h3 className="text-base font-semibold">건축주 {BID.poster.name}님의 프로젝트</h3>
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
                {BID.field === "설계" && (
                  <InfoItem icon={<PenTool className="size-5" />} label="설계 구분" value={BID.designScope} />
                )}
                <InfoItem icon={<MapPin className="size-5" />} label="부지 소재지" value={BID.address} />
                <InfoItem icon={<Users className="size-5" />} label="입찰 방식" value={`${BID.bidType}입찰`} />
                <InfoItem icon={<Home className="size-5" />} label="사업 용도" value={BID.businessUse} />
                <InfoItem icon={<Building2 className="size-5" />} label="건축 용도" value={BID.buildingUse} />
                <InfoItem icon={<Ruler className="size-5" />} label="대지 면적" value={`${BID.landArea.toLocaleString()}m² (${(BID.landArea * 0.3025).toFixed(1)}평)`} />
                <InfoItem icon={<Layers className="size-5" />} label="건축 면적" value={`${BID.buildingArea.toLocaleString()}m² (${(BID.buildingArea * 0.3025).toFixed(1)}평)`} />
                <InfoItem icon={<TrendingUp className="size-5" />} label="층수" value={`지상 ${BID.floors.above}층 / 지하 ${BID.floors.below}층`} />
                <InfoItem icon={<ParkingCircle className="size-5" />} label="주차 계획" value={`${BID.parking.type} ${BID.parking.count}대`} />
                <InfoItem icon={<CalendarDays className="size-5" />} label="모집 유효 기간" value={`${BID.recruitStart} ~ ${BID.recruitEnd}`} />

                {/* 분야별 추가 정보 */}
                {BID.field === "설계" && (
                  <>
                    <InfoItem icon={<Banknote className="size-5" />} label="총 건축 사업비" value={`${(BID.totalBuildCost / 10000).toLocaleString()}억원`} />
                    <InfoItem icon={<Banknote className="size-5" />} label="희망 설계비" value={`${BID.designFeeMin.toLocaleString()} ~ ${BID.designFeeMax.toLocaleString()}만원`} />
                  </>
                )}
              </div>
            </section>

            <Separator />

            {/* ── 요구사항 (설계 분야) ── */}
            {BID.field === "설계" && (
              <>
                <section className="py-6" aria-labelledby="requirements-title">
                  <h3 id="requirements-title" className="text-base font-semibold mb-5">요구사항</h3>
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
              {/* Header */}
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

              {/* Sort bar (owner view) */}
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

              {/* Participant list */}
              {PARTICIPANTS.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {CURRENT_ROLE === "owner" &&
                    PARTICIPANTS.map((p) => <ParticipantCardOwner key={p.id} p={p} />)}

                  {CURRENT_ROLE === "architect-submitted" && (
                    <>
                      <ParticipantCardSelf p={PARTICIPANTS[0]} />
                      {PARTICIPANTS.slice(1).map((_, i) => (
                        <ParticipantCardAnonymous key={i} index={i} />
                      ))}
                    </>
                  )}

                  {(CURRENT_ROLE === "architect-none" || CURRENT_ROLE === "guest") && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {CURRENT_ROLE === "guest"
                        ? "로그인 후 확인 가능합니다"
                        : `참여 건축사 ${PARTICIPANTS.length >= 3 ? `${PARTICIPANTS.length}명` : "3명 미만"}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  아직 제안을 제출한 건축사가 없습니다
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
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">
                      {BID.designFeeMin.toLocaleString()}~{BID.designFeeMax.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">만원</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">희망 설계비 범위</p>
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
                    <p className="text-[10px] text-muted-foreground font-medium mb-0.5">참여 건축사</p>
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

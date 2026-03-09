import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Ruler,
  Building2,
  ArrowRight,
  HardHat,
  Clock,
  Pencil,
  X,
  SquareStack,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Mock Data ─── */

const PROJECT = {
  title: "판교 단독주택 '숲의 집'",
  intro:
    "자연과 건축의 경계를 허물다 — 판교의 완만한 구릉지에 자리한 이 주택은 주변 숲과 하나 되는 공간을 목표로 설계되었습니다. 내부 어디에서나 초록의 풍경이 시선에 닿도록 개구부를 배치하고, 자연 소재를 적극 활용하여 시간이 갈수록 주변 환경에 녹아드는 집을 만들고자 했습니다.",
  heroImage:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop",
  firmName: "아크 건축사사무소",
  firmId: 1,
  location: "경기도 성남시 분당구 판교동",
  usage: "단독주택",
  completionYear: "2024",
  landArea: "330.5",
  buildingArea: "165.2",
  totalFloorArea: "264.8",
  floorsAbove: 2,
  floorsBelow: 1,
  constructorName: "한울건설",
  constructionPeriod: 10,
  designPeriod: 8,
};

const GALLERY: { id: number; src: string; caption: string }[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=900&fit=crop",
    caption: "남측 전경 - 자연과 조화를 이루는 외관 디자인",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&h=900&fit=crop",
    caption: "거실 내부 - 높은 천장과 대형 창을 통한 자연채광",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&h=900&fit=crop",
    caption: "2층 테라스에서 바라본 정원 풍경",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&h=900&fit=crop",
    caption: "주방 및 다이닝 공간 - 아일랜드 키친 중심 동선",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1400&h=900&fit=crop",
    caption: "야간 외관 - 조명 계획을 통한 건축적 연출",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&h=900&fit=crop",
    caption: "지하 1층 다목적실 - 홈시어터 겸용 공간",
  },
];

/* All images for lightbox: hero + gallery */
const ALL_IMAGES = [
  { src: PROJECT.heroImage, caption: PROJECT.title },
  ...GALLERY.map((g) => ({ src: g.src, caption: g.caption })),
];

const INFO_ITEMS: { label: string; value: string; icon?: React.ReactNode }[] = [
  {
    label: "위치",
    value: PROJECT.location,
    icon: <MapPin className="size-5 text-muted-foreground" />,
  },
  {
    label: "건축 용도",
    value: PROJECT.usage,
    icon: <Building2 className="size-5 text-muted-foreground" />,
  },
  {
    label: "준공연도",
    value: `${PROJECT.completionYear}년`,
    icon: <Calendar className="size-5 text-muted-foreground" />,
  },
  {
    label: "대지면적",
    value: `${PROJECT.landArea}m²`,
    icon: <Ruler className="size-5 text-muted-foreground" />,
  },
  {
    label: "건축면적",
    value: `${PROJECT.buildingArea}m²`,
    icon: <SquareStack className="size-5 text-muted-foreground" />,
  },
  { label: "연면적", value: `${PROJECT.totalFloorArea}m²` },
  { label: "지상층수", value: `${PROJECT.floorsAbove}층` },
  {
    label: "지하층수",
    value: PROJECT.floorsBelow === 0 ? "없음" : `${PROJECT.floorsBelow}층`,
  },
  {
    label: "시공사명",
    value: PROJECT.constructorName,
    icon: <HardHat className="size-5 text-muted-foreground" />,
  },
  {
    label: "시공기간",
    value: `${PROJECT.constructionPeriod}개월`,
    icon: <Clock className="size-5 text-muted-foreground" />,
  },
  {
    label: "설계기간",
    value: `${PROJECT.designPeriod}개월`,
    icon: <Pencil className="size-5 text-muted-foreground" />,
  },
];

/* ─── Lightbox ─── */

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: { src: string; caption: string }[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  const goPrev = useCallback(
    () => setIndex((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length],
  );
  const goNext = useCallback(
    () => setIndex((i) => (i < images.length - 1 ? i + 1 : 0)),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goPrev, goNext]);

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const current = images[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="닫기"
      >
        <X className="size-6" />
      </button>

      {/* Previous */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="이전 이미지"
      >
        <ChevronLeft className="size-6" />
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="다음 이미지"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Image */}
      <div
        className="flex max-h-[85vh] max-w-[90vw] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.caption}
          className="max-h-[75vh] max-w-full rounded object-contain"
        />

        {/* Caption + position */}
        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-medium text-white/60">
            {index + 1} / {images.length}
          </span>
          {current.caption && (
            <p className="max-w-lg text-sm leading-[1.7] text-white/80">
              {current.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function PortfolioDetailPage() {
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    index: number;
  }>({ open: false, index: 0 });

  const openLightbox = useCallback((index: number) => {
    setLightbox({ open: true, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      {/* ═══ Hero ═══ */}
      <section className="relative w-full">
        <div
          className="aspect-[16/9] max-h-[560px] w-full cursor-pointer overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          <img
            src={PROJECT.heroImage}
            alt={PROJECT.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Back link */}
        <Link
          to={`/partners/${PROJECT.firmId}`}
          className="absolute left-6 top-6 flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-black/50"
        >
          <ChevronLeft className="size-3.5" />
          파트너 상세
        </Link>

        {/* Title overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-8">
          <div className="mx-auto max-w-[960px] px-6">
            <Badge variant="secondary" className="mb-3 rounded-lg text-[11px]">
              {PROJECT.usage}
            </Badge>
            <h1 className="text-2xl font-semibold -tracking-tight text-white md:text-3xl lg:text-4xl">
              {PROJECT.title}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {PROJECT.location} · {PROJECT.completionYear}년 준공
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Intro + Info Card ═══ */}
      <div className="mx-auto max-w-[960px] px-6 -mt-6 relative z-10">
        <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] p-6 shadow-xs">
          {/* Intro / description */}
          {PROJECT.intro && (
            <p className="mb-5 text-sm leading-[1.7] text-muted-foreground">
              {PROJECT.intro}
            </p>
          )}

          <Separator className="mb-5" />

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
            {INFO_ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-3 py-2">
                {item.icon && (
                  <span className="mt-0.5 shrink-0">{item.icon}</span>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          {/* Firm link */}
          <Link
            to={`/partners/${PROJECT.firmId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            소속 파트너스: {PROJECT.firmName}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* ═══ Image Gallery ═══ */}
      {GALLERY.length > 0 && (
        <section className="mx-auto max-w-[960px] px-6 py-12">
          <h2 className="mb-6 text-lg font-semibold -tracking-tight">
            프로젝트 갤러리
          </h2>
          <div className="space-y-8">
            {GALLERY.map((img, idx) => (
              <figure key={img.id} className="group">
                <div
                  className="cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => openLightbox(idx + 1)}
                >
                  <img
                    src={img.src}
                    alt={img.caption}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <figcaption className="mt-3 text-sm text-muted-foreground">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      <Separator className="mx-auto max-w-[960px]" />

      {/* ═══ Back to Partner ═══ */}
      <div className="mx-auto max-w-[960px] px-6 py-12">
        <Link
          to={`/partners/${PROJECT.firmId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-3.5" />
          {PROJECT.firmName} 상세 페이지로 돌아가기
        </Link>
      </div>

      {/* ═══ Lightbox ═══ */}
      {lightbox.open && (
        <Lightbox
          images={ALL_IMAGES}
          initialIndex={lightbox.index}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}

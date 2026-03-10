import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/site-header";
import { usePortfolioDetailQuery } from "@/features/partner/api/queries";

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const current = images[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" aria-label="닫기">
        <X className="size-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" aria-label="이전 이미지">
        <ChevronLeft className="size-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" aria-label="다음 이미지">
        <ChevronRight className="size-6" />
      </button>
      <div className="flex max-h-[85vh] max-w-[90vw] flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.caption} className="max-h-[75vh] max-w-full rounded object-contain" />
        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-medium text-white/60">{index + 1} / {images.length}</span>
          {current.caption && <p className="max-w-lg text-sm leading-[1.7] text-white/80">{current.caption}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function PortfolioDetailPage() {
  const { id, portfolioId } = useParams();
  const partnerId = Number(id) || 0;
  const pfId = Number(portfolioId) || 0;

  const { data, isPending, isError } = usePortfolioDetailQuery(partnerId, pfId);

  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  const openLightbox = useCallback((index: number) => {
    setLightbox({ open: true, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox((prev) => ({ ...prev, open: false }));
  }, []);

  if (isPending) {
    return (
      <div className="min-h-svh bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-svh bg-background">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <p className="text-muted-foreground">포트폴리오 정보를 불러올 수 없습니다</p>
          <Link to={`/partners/${partnerId}`}><Button variant="outline" className="rounded-xl">파트너 상세로 돌아가기</Button></Link>
        </div>
      </div>
    );
  }

  const allImages = [
    ...(data.heroImage ? [{ src: data.heroImage, caption: data.title }] : []),
    ...data.images.map((img) => ({ src: img.url, caption: img.caption ?? "" })),
  ];

  const infoItems: { label: string; value: string; icon?: React.ReactNode }[] = [
    { label: "위치", value: data.location, icon: <MapPin className="size-5 text-muted-foreground" /> },
    { label: "건축 용도", value: data.usage.label, icon: <Building2 className="size-5 text-muted-foreground" /> },
    { label: "준공연도", value: `${data.completionYear}년`, icon: <Calendar className="size-5 text-muted-foreground" /> },
    ...(data.landArea ? [{ label: "대지면적", value: `${data.landArea}m²`, icon: <Ruler className="size-5 text-muted-foreground" /> }] : []),
    ...(data.buildingArea ? [{ label: "건축면적", value: `${data.buildingArea}m²`, icon: <SquareStack className="size-5 text-muted-foreground" /> }] : []),
    ...(data.totalFloorArea ? [{ label: "연면적", value: `${data.totalFloorArea}m²` }] : []),
    ...(data.floorsAbove ? [{ label: "지상층수", value: `${data.floorsAbove}층` }] : []),
    ...(data.floorsBelow ? [{ label: "지하층수", value: `${data.floorsBelow}층` }] : []),
    ...(data.constructorName ? [{ label: "시공사명", value: data.constructorName, icon: <HardHat className="size-5 text-muted-foreground" /> }] : []),
    ...(data.constructionPeriodMonths ? [{ label: "시공기간", value: `${data.constructionPeriodMonths}개월`, icon: <Clock className="size-5 text-muted-foreground" /> }] : []),
    ...(data.designPeriodMonths ? [{ label: "설계기간", value: `${data.designPeriodMonths}개월`, icon: <Pencil className="size-5 text-muted-foreground" /> }] : []),
  ];

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      {/* ═══ Hero ═══ */}
      {data.heroImage && (
        <section className="relative w-full">
          <div className="aspect-[16/9] max-h-[560px] w-full cursor-pointer overflow-hidden" onClick={() => openLightbox(0)}>
            <img src={data.heroImage} alt={data.title} className="h-full w-full object-cover" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <Link to={`/partners/${data.partnerId}`} className="absolute left-6 top-6 flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-black/50">
            <ChevronLeft className="size-3.5" />파트너 상세
          </Link>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-8">
            <div className="mx-auto max-w-[960px] px-6">
              <Badge variant="secondary" className="mb-3 rounded-lg text-[11px]">{data.usage.label}</Badge>
              <h1 className="text-2xl font-semibold -tracking-tight text-white md:text-3xl lg:text-4xl">{data.title}</h1>
              <p className="mt-2 text-sm text-white/70">{data.location} · {data.completionYear}년 준공</p>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Intro + Info Card ═══ */}
      <div className={`mx-auto max-w-[960px] px-6 ${data.heroImage ? "-mt-6 relative z-10" : "pt-8"}`}>
        <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] p-6 shadow-xs">
          {data.intro && <p className="mb-5 text-sm leading-[1.7] text-muted-foreground">{data.intro}</p>}

          <Separator className="mb-5" />

          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3 py-2">
                {item.icon && <span className="mt-0.5 shrink-0">{item.icon}</span>}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="mt-0.5 text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          <Link to={`/partners/${data.partnerId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
            소속 파트너스: {data.partnerName}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* ═══ Image Gallery ═══ */}
      {data.images.length > 0 && (
        <section className="mx-auto max-w-[960px] px-6 py-12">
          <h2 className="mb-6 text-lg font-semibold -tracking-tight">프로젝트 갤러리</h2>
          <div className="space-y-8">
            {data.images.map((img, idx) => (
              <figure key={img.id} className="group">
                <div className="cursor-pointer overflow-hidden rounded-2xl" onClick={() => openLightbox(data.heroImage ? idx + 1 : idx)}>
                  <img src={img.url} alt={img.caption ?? ""} className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]" loading="lazy" />
                </div>
                {img.caption && <figcaption className="mt-3 text-sm text-muted-foreground">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <Separator className="mx-auto max-w-[960px]" />

      <div className="mx-auto max-w-[960px] px-6 py-12">
        <Link to={`/partners/${data.partnerId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
          <ChevronLeft className="size-3.5" />{data.partnerName} 상세 페이지로 돌아가기
        </Link>
      </div>

      {lightbox.open && allImages.length > 0 && (
        <Lightbox images={allImages} initialIndex={lightbox.index} onClose={closeLightbox} />
      )}
    </div>
  );
}

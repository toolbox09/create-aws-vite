import { useState } from "react";
import { Play, X } from "lucide-react";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types & Mock Data ─── */

interface Video {
  id: number;
  category: string;
  title: string;
  thumbnail: string;
  duration: string;
  date: string;
}

const CATEGORY_TABS = ["전체", "인터뷰", "가이드", "꿀팁"] as const;

const VIDEOS: Video[] = [
  {
    id: 1,
    category: "인터뷰",
    title: "건축사 인터뷰: 좋은 건축주가 좋은 집을 만든다",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=340&fit=crop",
    duration: "12:34",
    date: "2026.02.20",
  },
  {
    id: 2,
    category: "가이드",
    title: "건축 첫걸음: 토지 매입부터 설계까지 전 과정",
    thumbnail:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=340&fit=crop",
    duration: "18:45",
    date: "2026.02.15",
  },
  {
    id: 3,
    category: "꿀팁",
    title: "건축비 500만원 절약하는 실전 노하우 5가지",
    thumbnail:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop",
    duration: "8:22",
    date: "2026.02.10",
  },
  {
    id: 4,
    category: "인터뷰",
    title: "시공사 대표가 말하는 건축주와의 소통법",
    thumbnail:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=340&fit=crop",
    duration: "15:10",
    date: "2026.02.05",
  },
  {
    id: 5,
    category: "가이드",
    title: "건축허가 완전정복: 서류 준비부터 승인까지",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=340&fit=crop",
    duration: "22:18",
    date: "2026.01.28",
  },
  {
    id: 6,
    category: "꿀팁",
    title: "건축 계약 전 반드시 확인해야 할 체크리스트",
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=340&fit=crop",
    duration: "10:55",
    date: "2026.01.20",
  },
];

const PER_PAGE = 9;

/* ─── Page ─── */

export default function GuideVideoPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORY_TABS)[number]>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  const filtered =
    selectedCategory === "전체"
      ? VIDEOS
      : VIDEOS.filter((v) => v.category === selectedCategory);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  function handleCategoryChange(cat: (typeof CATEGORY_TABS)[number]) {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* ── Title ── */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">가이드 영상</h1>
          <p className="text-sm text-muted-foreground">
            건축 전문가가 알려주는 영상 콘텐츠
          </p>
        </div>

        {/* ── Segmented Control Tabs ── */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mb-8">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleCategoryChange(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedCategory === tab
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Video Grid ── */}
        {paged.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((video) => (
              <button
                key={video.id}
                onClick={() => setModalVideo(video)}
                className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm hover:shadow-sm hover:-translate-y-0.5 transition-all text-left"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-sm">
                      <Play className="size-5 text-foreground ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">
                    {video.duration}
                  </span>
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {video.category}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{video.date}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">영상이 없습니다</p>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Video Modal ── */}
      {modalVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setModalVideo(null)}
        >
          <div
            className="relative w-full max-w-[860px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalVideo(null)}
              className="absolute -top-10 right-0 flex size-8 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video rounded-2xl bg-zinc-900 flex flex-col items-center justify-center gap-4 overflow-hidden">
              <div className="flex size-20 items-center justify-center rounded-full bg-white/10">
                <Play className="size-10 text-white ml-1" />
              </div>
              <p className="text-white/60 text-sm font-medium">
                {modalVideo.title}
              </p>
              <p className="text-white/40 text-xs">
                영상 재생 준비 중...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

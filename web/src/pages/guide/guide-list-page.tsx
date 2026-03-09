import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

/* ─── Types & Mock Data ─── */

interface Guide {
  id: number;
  category: string;
  title: string;
  summary: string;
  thumbnail: string;
}

const CATEGORIES = [
  "전체",
  "건축 절차",
  "법규 기초",
  "비용 이해",
  "용어 사전",
  "설계 가이드",
  "인허가",
  "시공 기초",
];

const GUIDES: Guide[] = [
  {
    id: 1,
    category: "건축 절차",
    title: "건축주가 알아야 할 건축 프로세스 A to Z",
    summary:
      "토지 매입부터 준공까지, 건축의 전체 흐름을 한눈에 파악할 수 있는 가이드입니다.",
    thumbnail:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=340&fit=crop",
  },
  {
    id: 2,
    category: "법규 기초",
    title: "건폐율과 용적률, 쉽게 이해하기",
    summary:
      "건축법의 기본 중의 기본! 건폐율과 용적률의 개념과 계산 방법을 알려드립니다.",
    thumbnail:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=340&fit=crop",
  },
  {
    id: 3,
    category: "비용 이해",
    title: "건축비용 산정 가이드: 평당 단가의 진실",
    summary:
      "건축비용은 어떻게 구성되는지, 평당 단가만으로 비용을 판단하면 안 되는 이유를 설명합니다.",
    thumbnail:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop",
  },
  {
    id: 4,
    category: "용어 사전",
    title: "초보 건축주를 위한 필수 건축 용어 30선",
    summary:
      "건축사와 대화할 때 꼭 알아야 할 핵심 용어들을 쉽게 정리했습니다.",
    thumbnail:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=340&fit=crop",
  },
  {
    id: 5,
    category: "설계 가이드",
    title: "좋은 건축설계를 위한 건축주의 체크리스트",
    summary:
      "설계 의뢰 전 준비해야 할 사항과 좋은 설계를 받기 위한 소통 방법을 안내합니다.",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=340&fit=crop",
  },
  {
    id: 6,
    category: "인허가",
    title: "건축허가 vs 건축신고, 차이점 완벽 정리",
    summary:
      "어떤 경우에 허가가 필요하고, 신고만으로 가능한 건축은 무엇인지 정리합니다.",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=340&fit=crop",
  },
];

const PER_PAGE = 9;

/* ─── Page ─── */

export default function GuideListPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered =
    selectedCategory === "전체"
      ? GUIDES
      : GUIDES.filter((g) => g.category === selectedCategory);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* ── Title ── */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">건축 가이드</h1>
          <p className="text-sm text-muted-foreground">
            초보 건축주를 위한 건축 지식 콘텐츠
          </p>
        </div>

        {/* ── Category Filter Chips ── */}
        <div className="overflow-x-auto pb-2 mb-8">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Card Grid ── */}
        {paged.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((guide) => (
              <Link
                key={guide.id}
                to={`/guide/articles/${guide.id}`}
                className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm hover:shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={guide.thumbnail}
                    alt={guide.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {guide.category}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {guide.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <p className="text-muted-foreground">
              해당 카테고리에 가이드가 없습니다
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => handleCategoryChange("전체")}
            >
              전체 보기
            </Button>
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
    </div>
  );
}

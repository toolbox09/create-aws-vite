import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Building2,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface Portfolio {
  id: number;
  title: string;
  image: string;
  region: string;
  buildingUse: string;
  completionYear: number;
}

/* ─── Mock Data ─── */

const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: 1,
    title: "강남구 역삼동 모던 단독주택 설계",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=375&fit=crop",
    region: "서울 강남구",
    buildingUse: "단독주택",
    completionYear: 2024,
  },
  {
    id: 2,
    title: "판교 테크노밸리 근린생활시설 리모델링 프로젝트",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=375&fit=crop",
    region: "경기 성남시",
    buildingUse: "근린생활",
    completionYear: 2023,
  },
  {
    id: 3,
    title: "해운대 오션뷰 다세대주택",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=375&fit=crop",
    region: "부산 해운대구",
    buildingUse: "다세대주택",
    completionYear: 2025,
  },
  {
    id: 4,
    title: "마포구 상수동 복합문화공간",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=375&fit=crop",
    region: "서울 마포구",
    buildingUse: "근린생활",
    completionYear: 2024,
  },
  {
    id: 5,
    title: "송도 스마트 오피스텔 신축",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=375&fit=crop",
    region: "인천 연수구",
    buildingUse: "오피스텔",
    completionYear: 2023,
  },
  {
    id: 6,
    title: "유성구 전원주택 단지 설계",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=375&fit=crop",
    region: "대전 유성구",
    buildingUse: "단독주택",
    completionYear: 2022,
  },
];

const ITEMS_PER_PAGE = 12;

/* ─── Page ─── */

export default function PortfolioListPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [portfolios, setPortfolios] = useState(MOCK_PORTFOLIOS);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(portfolios.length / ITEMS_PER_PAGE));
  const paginated = portfolios.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    setPortfolios((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
    setPage(1);
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">포트폴리오 관리</h1>
            <p className="text-sm text-muted-foreground">
              나의 건축 포트폴리오를 관리하세요
            </p>
          </div>
          <Link to="/portfolios/new">
            <Button className="rounded-xl gap-1.5">
              <Plus className="size-4" />
              새 포트폴리오
            </Button>
          </Link>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="mb-5 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">
              <span className="font-semibold text-primary">{selected.size}</span>개 선택됨
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-3.5" />
              선택 삭제
            </Button>
          </div>
        )}

        {/* Card Grid or Empty State */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((portfolio) => {
              const isSelected = selected.has(portfolio.id);
              return (
                <div
                  key={portfolio.id}
                  className="group relative flex flex-col overflow-hidden bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm hover:shadow-sm hover:-translate-y-0.5 transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={portfolio.image}
                      alt={portfolio.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Checkbox overlay on hover or selected */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSelect(portfolio.id);
                      }}
                      className={`absolute left-3 top-3 flex size-6 items-center justify-center rounded-lg transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-black/30 text-white opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isSelected && <Check className="size-4" />}
                    </button>
                  </div>

                  {/* Content */}
                  <Link
                    to={`/portfolios/${portfolio.id}/edit`}
                    className="flex flex-1 flex-col gap-3 p-5"
                  >
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                      {portfolio.title}
                    </h3>

                    <div className="mt-auto flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <span>{portfolio.region}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="size-3 shrink-0" />
                        <span>{portfolio.buildingUse}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3 shrink-0" />
                        <span>{portfolio.completionYear}년 준공</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <p className="text-muted-foreground">등록된 포트폴리오가 없습니다</p>
            <Link to="/portfolios/new">
              <Button className="rounded-xl gap-1.5">
                <Plus className="size-4" />
                첫 포트폴리오 등록
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-lg size-8"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-lg size-8"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

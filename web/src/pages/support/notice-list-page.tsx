import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface Notice {
  id: number;
  title: string;
  date: string;
  pinned: boolean;
}

/* ─── Mock Data ─── */

const MOCK_NOTICES: Notice[] = [
  { id: 1, title: "[긴급] 시스템 점검 안내 (3/15 02:00~04:00)", date: "2026.03.05", pinned: true },
  { id: 2, title: "2026년 서비스 이용약관 개정 안내", date: "2026.02.28", pinned: true },
  { id: 3, title: "설 연휴 고객센터 운영 안내", date: "2026.02.20", pinned: true },
  { id: 4, title: "신규 AI 분석 리포트 기능 출시 안내", date: "2026.03.01", pinned: false },
  { id: 5, title: "파트너 검색 기능 개선 업데이트", date: "2026.02.25", pinned: false },
  { id: 6, title: "2월 정기 점검 완료 안내", date: "2026.02.15", pinned: false },
  { id: 7, title: "모바일 앱 v2.3.0 업데이트 안내", date: "2026.02.10", pinned: false },
  { id: 8, title: "개인정보 처리방침 변경 안내", date: "2026.02.01", pinned: false },
];

const ITEMS_PER_PAGE = 10;

/* ─── Page ─── */

export default function NoticeListPage() {
  const [page, setPage] = useState(1);

  const pinnedNotices = MOCK_NOTICES.filter((n) => n.pinned);
  const regularNotices = MOCK_NOTICES.filter((n) => !n.pinned);

  const totalPages = Math.max(1, Math.ceil(regularNotices.length / ITEMS_PER_PAGE));
  const paginatedRegular = regularNotices.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">공지사항</h1>
          <p className="text-sm text-muted-foreground mt-1">
            서비스 관련 주요 소식을 확인하세요
          </p>
        </div>

        {/* Notice List Card */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center px-5 py-3 text-xs font-medium text-muted-foreground bg-muted/30">
            <span className="flex-1">제목</span>
            <span className="w-[100px] text-right shrink-0">등록일</span>
          </div>

          {/* Pinned Notices */}
          {pinnedNotices.map((notice) => (
            <Link
              key={notice.id}
              to={`/support/notices/${notice.id}`}
              className="flex items-center gap-3 px-5 py-4 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors"
            >
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary shrink-0">
                <Pin className="size-3" />
                중요
              </span>
              <span className="flex-1 text-sm font-bold truncate">
                {notice.title}
              </span>
              <span className="w-[100px] text-right text-xs text-muted-foreground shrink-0">
                {notice.date}
              </span>
            </Link>
          ))}

          {/* Regular Notices */}
          {paginatedRegular.map((notice) => (
            <Link
              key={notice.id}
              to={`/support/notices/${notice.id}`}
              className="flex items-center px-5 py-4 hover:bg-muted/50 transition-colors"
            >
              <span className="flex-1 text-sm truncate">{notice.title}</span>
              <span className="w-[100px] text-right text-xs text-muted-foreground shrink-0">
                {notice.date}
              </span>
            </Link>
          ))}

          {/* Empty state */}
          {paginatedRegular.length === 0 && pinnedNotices.length === 0 && (
            <div className="py-20 text-center text-sm text-muted-foreground">
              등록된 공지사항이 없습니다
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-lg"
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
              size="icon-sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-lg"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

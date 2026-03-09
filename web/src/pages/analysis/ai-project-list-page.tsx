import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl, SearchInput } from "@/components/ui/filters";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types & Constants ─── */

type AnalysisStatus = "분석중" | "성공" | "실패";

interface AiProject {
  id: number;
  projectNo: string;
  status: AnalysisStatus;
  name: string;
  address: string;
  landArea: number;
  achievedFar: number;
  analysisDate: string;
}

const STATUS_TABS = ["전체", "분석중", "성공", "실패"] as const;

const STATUS_DOT_COLOR: Record<AnalysisStatus, string> = {
  분석중: "bg-blue-500",
  성공: "bg-emerald-500",
  실패: "bg-red-500",
};

const PER_PAGE = 10;

/* ─── Mock Data ─── */

const PROJECTS: AiProject[] = [
  { id: 1, projectNo: "AIA-2026-001", status: "성공", name: "서울 강남구 역삼동 123-4", address: "서울특별시 강남구 역삼동 123-4", landArea: 264.3, achievedFar: 249.8, analysisDate: "2026-03-01" },
  { id: 2, projectNo: "AIA-2026-002", status: "성공", name: "서울 서초구 반포동 45-7", address: "서울특별시 서초구 반포동 45-7", landArea: 198.5, achievedFar: 199.2, analysisDate: "2026-02-28" },
  { id: 3, projectNo: "AIA-2026-003", status: "분석중", name: "경기 성남시 분당구 정자동 89-2", address: "경기도 성남시 분당구 정자동 89-2", landArea: 331.7, achievedFar: 0, analysisDate: "2026-03-05" },
  { id: 4, projectNo: "AIA-2026-004", status: "실패", name: "서울 마포구 연남동 567-3", address: "서울특별시 마포구 연남동 567-3", landArea: 152.1, achievedFar: 0, analysisDate: "2026-02-25" },
  { id: 5, projectNo: "AIA-2026-005", status: "성공", name: "인천 연수구 송도동 12-8", address: "인천광역시 연수구 송도동 12-8", landArea: 495.0, achievedFar: 298.5, analysisDate: "2026-02-20" },
  { id: 6, projectNo: "AIA-2026-006", status: "성공", name: "서울 용산구 한남동 234-1", address: "서울특별시 용산구 한남동 234-1", landArea: 378.2, achievedFar: 279.6, analysisDate: "2026-02-15" },
  { id: 7, projectNo: "AIA-2026-007", status: "분석중", name: "경기 수원시 팔달구 인계동 55-9", address: "경기도 수원시 팔달구 인계동 55-9", landArea: 220.8, achievedFar: 0, analysisDate: "2026-03-04" },
  { id: 8, projectNo: "AIA-2026-008", status: "성공", name: "부산 해운대구 우동 301-5", address: "부산광역시 해운대구 우동 301-5", landArea: 412.6, achievedFar: 289.1, analysisDate: "2026-02-10" },
];

/* ─── Page ─── */

export default function AiProjectListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // MAP→AIA-02 직행으로 변경되어 이 페이지로의 직접 진입은 없음
  // extraProjects는 폴링으로 목록 갱신 시 사용
  const [extraProjects] = useState<AiProject[]>([]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
    setDebounceTimer(timer);
  }

  const allProjects = useMemo(() => [...extraProjects, ...PROJECTS], [extraProjects]);

  const filtered = useMemo(() => {
    return allProjects.filter((p) => {
      if (statusFilter !== "전체" && p.status !== statusFilter) return false;
      if (debouncedSearch && !p.name.includes(debouncedSearch) && !p.address.includes(debouncedSearch)) return false;
      return true;
    });
  }, [allProjects, statusFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (paged.every((p) => selectedIds.has(p.id))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paged.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paged.forEach((p) => next.add(p.id));
        return next;
      });
    }
  }

  function handleDelete() {
    toast.success(`${selectedIds.size}개 프로젝트가 삭제되었습니다`);
    setSelectedIds(new Set());
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        {/* Header */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">AI 사업성 분석</h1>
          <p className="text-sm text-muted-foreground">
            AI가 대지를 분석하여 최적의 건축 계획을 제안합니다
          </p>
        </div>

        {/* Filters row */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status tabs — segmented control */}
          <SegmentedControl options={STATUS_TABS} value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} size="md" />

          {/* Search + Delete */}
          <div className="flex items-center gap-3">
            <SearchInput placeholder="주소 검색" value={search} onChange={handleSearchChange} className="w-[240px]" />
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={selectedIds.size === 0}
              onClick={handleDelete}
            >
              <Trash2 className="mr-1.5 size-4" />
              삭제
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paged.length > 0 && paged.every((p) => selectedIds.has(p.id))}
                      onChange={toggleSelectAll}
                      className="size-4 rounded accent-[#F26118]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">프로젝트 번호</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">상태</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">프로젝트명</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">대지면적(m²)</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">달성 용적률(%)</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">분석일</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      검색 결과가 없습니다
                    </td>
                  </tr>
                ) : (
                  paged.map((project, idx) => (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/analysis/ai/${project.id}`)}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        idx % 2 === 1 ? "bg-muted/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(project.id)}
                          onChange={() => toggleSelect(project.id)}
                          className="size-4 rounded accent-[#F26118]"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {project.projectNo}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span
                            className={`inline-block size-1.5 rounded-full ${STATUS_DOT_COLOR[project.status]}${
                              project.status === "분석중" ? " animate-pulse" : ""
                            }`}
                          />
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{project.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {project.landArea.toLocaleString("ko-KR", { minimumFractionDigits: 1 })}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {project.achievedFar > 0
                          ? project.achievedFar.toLocaleString("ko-KR", { minimumFractionDigits: 1 })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{project.analysisDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{filtered.length}</span>건
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="rounded-xl min-w-[36px]"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface Architect {
  id: number;
  registrationNo: string;
  firmName: string;
  primaryPermitRegion: string;
  region: string;
  yearsInBusiness: number;
  permitCount: number;
}

type SortKey = "registrationNo" | "firmName" | "primaryPermitRegion" | "yearsInBusiness" | "permitCount";
type SortDir = "asc" | "desc";
type QuickSort = "default" | "yearsInBusiness" | "permitCount";

/* ─── Constants ─── */

const REGIONS = [
  "전체",
  "수도권", "대전·충청", "대구·경북", "부산·울산·경남", "광주·전라",
  "강원영서", "강원영동", "제주도", "기타",
];

const PAGE_SIZE = 20;

/* ─── Mock Data ─── */

const ARCHITECTS: Architect[] = [
  { id: 1, registrationNo: "2018-서울-0342", firmName: "아크 건축사사무소", primaryPermitRegion: "서울", region: "서울", yearsInBusiness: 12, permitCount: 87 },
  { id: 2, registrationNo: "2020-서울-0518", firmName: "리움 디자인 건축", primaryPermitRegion: "서울", region: "서울", yearsInBusiness: 8, permitCount: 52 },
  { id: 3, registrationNo: "2010-경기-0127", firmName: "한빛 종합건설", primaryPermitRegion: "경기", region: "경기", yearsInBusiness: 20, permitCount: 156 },
  { id: 4, registrationNo: "2015-서울-0291", firmName: "도시공간 건축사사무소", primaryPermitRegion: "서울", region: "서울", yearsInBusiness: 15, permitCount: 103 },
  { id: 5, registrationNo: "2022-부산-0085", firmName: "블루프린트 건축", primaryPermitRegion: "부산", region: "부산", yearsInBusiness: 6, permitCount: 28 },
  { id: 6, registrationNo: "2012-인천-0163", firmName: "정우 건축사사무소", primaryPermitRegion: "인천", region: "인천", yearsInBusiness: 18, permitCount: 134 },
  { id: 7, registrationNo: "2023-대전-0041", firmName: "세움 건축설계", primaryPermitRegion: "대전", region: "대전", yearsInBusiness: 4, permitCount: 15 },
  { id: 8, registrationNo: "2008-경기-0094", firmName: "태양 종합건설", primaryPermitRegion: "경기", region: "경기", yearsInBusiness: 22, permitCount: 198 },
  { id: 9, registrationNo: "2019-대구-0207", firmName: "대경 건축사사무소", primaryPermitRegion: "대구", region: "대구", yearsInBusiness: 9, permitCount: 41 },
  { id: 10, registrationNo: "2016-광주-0158", firmName: "빛고을 건축", primaryPermitRegion: "광주", region: "광주", yearsInBusiness: 14, permitCount: 76 },
];

/* ─── Table Header ─── */

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: "registrationNo", label: "등록번호", className: "w-[160px]" },
  { key: "firmName", label: "사무소명" },
  { key: "primaryPermitRegion", label: "주 인허가 지역", className: "w-[120px]" },
  { key: "yearsInBusiness", label: "업력", className: "w-[80px] text-right" },
  { key: "permitCount", label: "인허가건수", className: "w-[100px] text-right" },
];

/* ─── Page ─── */

export default function PublicArchitectSearchPage() {
  const navigate = useNavigate();

  /* Filters */
  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [minYears, setMinYears] = useState("");
  const [maxYears, setMaxYears] = useState("");
  const [minPermits, setMinPermits] = useState("");
  const [maxPermits, setMaxPermits] = useState("");

  /* Sort & pagination */
  const [sortKey, setSortKey] = useState<SortKey>("firmName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [quickSort, setQuickSort] = useState<QuickSort>("default");
  const [currentPage, setCurrentPage] = useState(1);

  /* Validation */
  const yearsRangeError =
    minYears !== "" && maxYears !== "" && Number(minYears) > Number(maxYears);
  const permitsRangeError =
    minPermits !== "" && maxPermits !== "" && Number(minPermits) > Number(maxPermits);
  const hasValidationError = yearsRangeError || permitsRangeError;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setQuickSort("default");
    setCurrentPage(1);
  }

  function handleQuickSort(value: QuickSort) {
    setQuickSort(value);
    if (value === "yearsInBusiness") {
      setSortKey("yearsInBusiness");
      setSortDir("desc");
    } else if (value === "permitCount") {
      setSortKey("permitCount");
      setSortDir("desc");
    } else {
      setSortKey("firmName");
      setSortDir("asc");
    }
    setCurrentPage(1);
  }

  function resetFilters() {
    setCompanyName("");
    setRegNumber("");
    setSelectedRegion("전체");
    setMinYears("");
    setMaxYears("");
    setMinPermits("");
    setMaxPermits("");
    setCurrentPage(1);
  }

  function handleSearch() {
    setCurrentPage(1);
  }

  /* Filtering */
  const filtered = useMemo(() => {
    return ARCHITECTS.filter((a) => {
      if (companyName && !a.firmName.includes(companyName)) return false;
      if (regNumber && !a.registrationNo.includes(regNumber)) return false;
      if (selectedRegion !== "전체" && a.primaryPermitRegion !== selectedRegion) return false;
      if (minYears && a.yearsInBusiness < Number(minYears)) return false;
      if (maxYears && a.yearsInBusiness > Number(maxYears)) return false;
      if (minPermits && a.permitCount < Number(minPermits)) return false;
      if (maxPermits && a.permitCount > Number(maxPermits)) return false;
      return true;
    });
  }, [companyName, regNumber, selectedRegion, minYears, maxYears, minPermits, maxPermits]);

  /* Sorting */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === "number" ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal), "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function getSortDirection(key: SortKey): "ascending" | "descending" | "none" {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1100px] px-6 py-8">
        {/* ═══ Tab Navigation ═══ */}
        <div className="mb-6">
          <div className="inline-flex bg-muted rounded-xl p-1">
            <Link
              to="/partners"
              className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              파트너스 검색
            </Link>
            <span className="px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background shadow-sm">
              공개 건축사 검색
            </span>
          </div>
        </div>

        {/* ═══ Title ═══ */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">공개 건축사 검색</h1>
          <p className="text-sm text-muted-foreground">
            등록된 건축사사무소 정보를 검색하고 비교해보세요
          </p>
        </div>

        {/* ═══ Filter Section ═══ */}
        <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] p-6 shadow-sm mb-6">
          {/* Row 1: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                사무소명
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="사무소명 입력"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                등록번호
              </label>
              <Input
                placeholder="등록번호 입력"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="h-9 text-sm rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                지역
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: 2 range inputs + buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                업력 (년)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="최소"
                  value={minYears}
                  onChange={(e) => setMinYears(e.target.value)}
                  className={`h-9 text-sm rounded-xl ${yearsRangeError ? "border-destructive ring-destructive" : ""}`}
                  min={0}
                />
                <span className="text-muted-foreground text-sm shrink-0">~</span>
                <Input
                  type="number"
                  placeholder="최대"
                  value={maxYears}
                  onChange={(e) => setMaxYears(e.target.value)}
                  className={`h-9 text-sm rounded-xl ${yearsRangeError ? "border-destructive ring-destructive" : ""}`}
                  min={0}
                />
              </div>
              {yearsRangeError && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3" />
                  최소값이 최대값보다 클 수 없습니다
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                인허가건수
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="최소"
                  value={minPermits}
                  onChange={(e) => setMinPermits(e.target.value)}
                  className={`h-9 text-sm rounded-xl ${permitsRangeError ? "border-destructive ring-destructive" : ""}`}
                  min={0}
                />
                <span className="text-muted-foreground text-sm shrink-0">~</span>
                <Input
                  type="number"
                  placeholder="최대"
                  value={maxPermits}
                  onChange={(e) => setMaxPermits(e.target.value)}
                  className={`h-9 text-sm rounded-xl ${permitsRangeError ? "border-destructive ring-destructive" : ""}`}
                  min={0}
                />
              </div>
              {permitsRangeError && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3" />
                  최소값이 최대값보다 클 수 없습니다
                </p>
              )}
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleSearch}
                className="h-9 rounded-xl flex-1"
                disabled={hasValidationError}
              >
                <Search className="size-4 mr-1.5" />
                검색
              </Button>
              <Button variant="outline" onClick={resetFilters} className="h-9 rounded-xl">
                <RotateCcw className="size-4 mr-1.5" />
                초기화
              </Button>
            </div>
          </div>
        </div>

        {/* ═══ Results Summary Bar ═══ */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            검색 결과{" "}
            <span className="font-semibold text-foreground">{sorted.length}</span>건
          </p>
          <select
            value={quickSort}
            onChange={(e) => handleQuickSort(e.target.value as QuickSort)}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="default">기본순</option>
            <option value="yearsInBusiness">업력순</option>
            <option value="permitCount">인허가수순</option>
          </select>
        </div>

        {/* ═══ Desktop Table ═══ */}
        <div className="hidden md:block rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    aria-sort={getSortDirection(col.key)}
                    className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold ${col.className ?? ""}`}
                  >
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {col.label}
                      <ArrowUpDown
                        className={`size-3.5 ${
                          sortKey === col.key ? "text-foreground" : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? (
                paged.map((a, idx) => (
                  <tr
                    key={a.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate(`/public-architects/${a.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/public-architects/${a.id}`);
                      }
                    }}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                      idx % 2 === 1 ? "bg-muted/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {a.registrationNo}
                    </td>
                    <td className="px-4 py-3 font-medium">{a.firmName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="rounded-lg text-[11px] font-normal">
                        {a.primaryPermitRegion}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {a.yearsInBusiness}년
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {a.permitCount}건
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        검색 조건에 맞는 건축사가 없습니다. 검색 조건을 변경해 보세요
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={resetFilters}
                      >
                        <RotateCcw className="size-3.5 mr-1.5" />
                        필터 초기화
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ═══ Mobile Cards ═══ */}
        <div className="md:hidden space-y-3">
          {paged.length > 0 ? (
            paged.map((a) => (
              <Link
                key={a.id}
                to={`/public-architects/${a.id}`}
                className="block rounded-2xl bg-card ring-1 ring-black/[0.08] p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">{a.firmName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {a.registrationNo}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-lg text-[11px] font-normal shrink-0">
                    {a.primaryPermitRegion}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    업력 <span className="font-medium text-foreground">{a.yearsInBusiness}년</span>
                  </span>
                  <span className="text-muted-foreground">
                    인허가 <span className="font-medium text-foreground">{a.permitCount}건</span>
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                검색 조건에 맞는 건축사가 없습니다. 검색 조건을 변경해 보세요
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={resetFilters}
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                필터 초기화
              </Button>
            </div>
          )}
        </div>

        {/* ═══ Pagination ═══ */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-8">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

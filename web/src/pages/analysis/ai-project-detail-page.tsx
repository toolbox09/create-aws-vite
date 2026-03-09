import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type ProjectStatus = "분석중" | "성공" | "실패";

interface LandInfo {
  label: string;
  value: string;
}

interface SubProject {
  id: number;
  purpose: string;
  purposeColor: string;
  far: number;
  salesRevenue: string;
  rentalRevenue: string;
  grossArea: number;
  exclusiveRatio: number;
  isHighestFar: boolean;
}

/* ─── Mock Data ─── */

const DEFAULT_PROJECT = {
  id: 1,
  address: "서울특별시 강남구 역삼동 123-4",
  pnu: "1168010100-0123-0004",
  status: "성공" as ProjectStatus,
  analysisDate: "2026-03-01",
};

const LAND_INFO: LandInfo[] = [
  { label: "용도지역", value: "제2종일반주거지역" },
  { label: "용도지구", value: "미관지구" },
  { label: "대지면적", value: "264.3 m²" },
  { label: "지목", value: "대" },
  { label: "건폐율", value: "60%" },
  { label: "용적률", value: "250%" },
];

const SUB_PROJECTS: SubProject[] = [
  {
    id: 1,
    purpose: "단독/다가구",
    purposeColor: "bg-orange-500/10 text-orange-600 border-orange-200",
    far: 199.2,
    salesRevenue: "18억 5,200만",
    rentalRevenue: "월 1,420만",
    grossArea: 526.8,
    exclusiveRatio: 72.5,
    isHighestFar: false,
  },
  {
    id: 2,
    purpose: "다세대/연립",
    purposeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    far: 249.8,
    salesRevenue: "24억 3,800만",
    rentalRevenue: "월 1,980만",
    grossArea: 660.2,
    exclusiveRatio: 68.3,
    isHighestFar: true,
  },
  {
    id: 3,
    purpose: "근린생활",
    purposeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    far: 238.5,
    salesRevenue: "21억 7,600만",
    rentalRevenue: "월 2,350만",
    grossArea: 630.4,
    exclusiveRatio: 65.1,
    isHighestFar: false,
  },
  {
    id: 4,
    purpose: "오피스텔",
    purposeColor: "bg-violet-500/10 text-violet-600 border-violet-200",
    far: 245.1,
    salesRevenue: "22억 9,400만",
    rentalRevenue: "월 2,150만",
    grossArea: 648.0,
    exclusiveRatio: 58.7,
    isHighestFar: false,
  },
];

/* ─── Status dot helpers ─── */

const STATUS_CONFIG: Record<ProjectStatus, { dot: string; text: string; label: string }> = {
  분석중: { dot: "bg-blue-500 animate-pulse", text: "text-blue-600", label: "분석중" },
  성공: { dot: "bg-emerald-500", text: "text-emerald-600", label: "분석 완료" },
  실패: { dot: "bg-red-500", text: "text-red-600", label: "분석 실패" },
};

/* ─── Page ─── */

export default function AiProjectDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // MAP-01에서 직접 진입 시 state로 필지 정보 전달
  const mapState = location.state as {
    parcels?: { address: string; pnu?: string; landArea?: number; zoning?: string }[];
    selectedBuildingTypes?: string[];
    fromMap?: boolean;
  } | null;

  const isFromMap = mapState?.fromMap && id === "new";

  // 프로젝트 상태 관리 (MAP에서 진입 시 분석중, 기존 프로젝트는 mock 데이터 사용)
  const [status, setStatus] = useState<ProjectStatus>(
    isFromMap ? "분석중" : DEFAULT_PROJECT.status
  );

  const project = isFromMap && mapState?.parcels?.[0]
    ? {
        id: Date.now(),
        address: mapState.parcels[0].address,
        pnu: mapState.parcels[0].pnu ?? "0000000000-0000-0000",
        status,
        analysisDate: new Date().toISOString().slice(0, 10),
      }
    : { ...DEFAULT_PROJECT, status };

  const landInfo: LandInfo[] = isFromMap && mapState?.parcels?.[0]
    ? [
        { label: "용도지역", value: mapState.parcels[0].zoning ?? "제2종일반주거지역" },
        { label: "용도지구", value: "-" },
        { label: "대지면적", value: `${(mapState.parcels[0].landArea ?? 264.3).toFixed(1)} m²` },
        { label: "지목", value: "대" },
        { label: "건폐율", value: "60%" },
        { label: "용적률", value: "250%" },
      ]
    : LAND_INFO;

  // MAP 진입 시 토스트 표시
  useEffect(() => {
    if (isFromMap) {
      toast.success("AI 분석이 시작되었습니다 (약 10분 소요)", {
        description: `${project.address} · 분석 진행 중`,
      });
      // Clear navigation state so refresh won't re-trigger
      window.history.replaceState({}, "");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 폴링: 분석중 상태일 때 10초마다 상태 조회 (mock: 30초 후 성공으로 전환)
  useEffect(() => {
    if (status !== "분석중") return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      // Mock: 30초 후 분석 완료 시뮬레이션
      if (Date.now() - startTime > 30_000) {
        setStatus("성공");
        toast.success("분석이 완료되었습니다", {
          description: project.address,
        });
        clearInterval(interval);
      }
    }, 10_000); // 10초 폴링

    return () => clearInterval(interval);
  }, [status, project.address]);

  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Back link */}
        <Link
          to="/analysis/ai"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          프로젝트 목록
        </Link>

        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{project.address}</h1>
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${statusCfg.text}`}>
              <span className={`inline-block size-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>PNU: <span className="font-mono">{project.pnu}</span></span>
            <span>분석일: {project.analysisDate}</span>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="flex gap-8">
          {/* Left column — main content */}
          <div className="flex-1 min-w-0">
            {/* Land Overview */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">토지 개요</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {landInfo.map((info) => (
                  <div
                    key={info.label}
                    className={`bg-card rounded-2xl ring-1 ring-black/[0.08] p-4${
                      info.label === "대지면적" ? " col-span-2" : ""
                    }`}
                  >
                    <p className="mb-1 text-xs text-muted-foreground">{info.label}</p>
                    <p className={`font-semibold${
                      info.label === "대지면적" ? " text-xl" : " text-sm"
                    }`}>
                      {info.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-8" />

            {/* Sub-projects or analyzing state */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">용도별 분석 결과</h2>

              {status === "분석중" ? (
                /* ─── Analyzing state: skeleton cards + progress indicator ─── */
                <div className="space-y-6">
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-5 py-4">
                    <Loader2 className="size-5 text-blue-500 animate-spin shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">AI 분석이 진행중입니다 (약 10분 소요)</p>
                      <p className="text-xs text-blue-600 mt-0.5">이 페이지를 떠나도 분석은 계속 진행됩니다. 목록 또는 마이페이지에서 다시 확인할 수 있습니다.</p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(mapState?.selectedBuildingTypes ?? ["단독/다가구", "다세대/연립", "근린생활", "오피스텔"]).map(
                      (type) => (
                        <div
                          key={type}
                          className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-5 space-y-4"
                        >
                          <Badge variant="outline" className="text-xs">
                            {type}
                          </Badge>
                          <div className="space-y-3">
                            <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
                            <div className="grid grid-cols-2 gap-3">
                              <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
                              <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
                              <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
                              <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
                            </div>
                            <div className="h-9 w-full rounded-xl bg-muted/40 animate-pulse" />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : status === "실패" ? (
                /* ─── Failed state ─── */
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-red-50">
                    <span className="text-2xl text-red-400">✕</span>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">분석에 실패했습니다</p>
                    <p className="text-xs text-muted-foreground">새로운 분석을 시도해 주세요.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => navigate("/map")}
                  >
                    지도에서 새 분석 시작
                  </Button>
                </div>
              ) : (
                /* ─── Success state: sub-project cards ─── */
                <div className="grid gap-5 sm:grid-cols-2">
                  {SUB_PROJECTS.map((sub) => (
                    <div
                      key={sub.id}
                      className="relative overflow-hidden bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      {sub.isHighestFar && (
                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#F26118]/10 px-2.5 py-1 text-xs font-semibold text-[#F26118]">
                          <Trophy className="size-3.5" />
                          최고 용적률
                        </div>
                      )}

                      <div className="p-5 space-y-4">
                        <Badge variant="outline" className={`text-xs ${sub.purposeColor}`}>
                          {sub.purpose}
                        </Badge>

                        <div>
                          <p className="text-xs text-muted-foreground">용적률</p>
                          <p className="text-3xl font-bold tabular-nums tracking-tight">
                            {sub.far.toFixed(1)}
                            <span className="ml-1 text-base font-medium text-muted-foreground">%</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">분양수익</p>
                            <p className="text-sm font-semibold">{sub.salesRevenue}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">임대수익</p>
                            <p className="text-sm font-semibold">{sub.rentalRevenue}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">연면적</p>
                            <p className="text-sm font-semibold">{sub.grossArea.toFixed(1)} m²</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">전용률</p>
                            <p className="text-sm font-semibold">{sub.exclusiveRatio.toFixed(1)}%</p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl"
                          onClick={() => navigate(`/analysis/ai/1/report/${sub.id}`)}
                        >
                          상세 보기
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column — sticky summary card */}
          <aside className="hidden w-[340px] shrink-0 lg:block">
            <div className="sticky top-20 space-y-6 rounded-2xl bg-card p-5 ring-1 ring-black/[0.08]">
              {/* Project status */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">프로젝트 상태</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${statusCfg.text}`}>
                  <span className={`inline-block size-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Analysis date */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">분석일</p>
                <p className="text-sm font-semibold">{project.analysisDate}</p>
              </div>

              <Separator />

              {/* Key land stats */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  주요 토지 지표
                </p>
                {landInfo
                  .filter((i) => ["대지면적", "건폐율", "용적률"].includes(i.label))
                  .map((info) => (
                    <div key={info.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{info.label}</span>
                      <span className="font-semibold">{info.value}</span>
                    </div>
                  ))}
              </div>

              <Separator />

              {/* CTA */}
              <Button
                className="w-full rounded-xl"
                size="sm"
                onClick={() => navigate("/map")}
              >
                새 분석 실행
              </Button>

              {/* Back link */}
              <Link
                to="/analysis/ai"
                className="block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

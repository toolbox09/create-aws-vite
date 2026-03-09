import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, ArrowRight, Building, MapPin } from "lucide-react";
import SiteHeader from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SegmentedControl } from "@/components/ui/filters";

/* ─── Types & Data ─── */

type ProjectStatus = "진행중" | "완료";
type FilterStatus = "전체" | ProjectStatus;

interface Project {
  id: number;
  title: string;
  status: ProjectStatus;
  address: string;
  buildingUse: string;
  partnerName: string;
  contractAmount: string;
  startDate: string;
  progress: number;
  currentMilestone: string;
  nextMilestone: string | null;
}

const mockProjects: Project[] = [
  { id: 1, title: "역삼동 단독주택 설계", status: "진행중", address: "서울 강남구 역삼동 123-45", buildingUse: "단독주택", partnerName: "아크 건축사사무소", contractAmount: "1.2억", startDate: "2026.01.15", progress: 35, currentMilestone: "건축 허가", nextMilestone: "실시 설계" },
  { id: 2, title: "판교 상가주택 설계", status: "진행중", address: "경기 성남시 분당구 판교동 45-6", buildingUse: "근린생활", partnerName: "모던 건축", contractAmount: "2.1억", startDate: "2026.02.01", progress: 15, currentMilestone: "설계 심의", nextMilestone: "건축 허가" },
  { id: 3, title: "분당 다세대주택 설계", status: "진행중", address: "경기 성남시 분당구 정자동 88", buildingUse: "다세대주택", partnerName: "한울 건축사사무소", contractAmount: "1.8억", startDate: "2026.02.20", progress: 10, currentMilestone: "계약 체결", nextMilestone: "설계 심의" },
  { id: 4, title: "용인 전원주택 설계", status: "완료", address: "경기 용인시 수지구 죽전동 12-3", buildingUse: "단독주택", partnerName: "자연 건축", contractAmount: "9,500만", startDate: "2025.08.10", progress: 100, currentMilestone: "사용 승인", nextMilestone: null },
  { id: 5, title: "서초동 근린생활시설 설계", status: "완료", address: "서울 서초구 서초동 1234", buildingUse: "근린생활", partnerName: "도시 건축사사무소", contractAmount: "3.5억", startDate: "2025.06.05", progress: 100, currentMilestone: "사용 승인", nextMilestone: null },
];

const filterOptions = ["전체", "진행중", "완료"] as const;

/* ─── Page ─── */

export default function ProjectListPage() {
  const [filter, setFilter] = useState<FilterStatus>("전체");

  const filtered =
    filter === "전체"
      ? mockProjects
      : mockProjects.filter((p) => p.status === filter);

  const activeCount = mockProjects.filter((p) => p.status === "진행중").length;
  const isEmpty = mockProjects.length === 0;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main
        className="mx-auto"
        style={{ maxWidth: "var(--page-max)", padding: "var(--section-gap) var(--page-px)" }}
      >
        {/* Page heading */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold -tracking-tight">내 프로젝트</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              진행 중인 프로젝트 <span className="font-semibold text-foreground">{activeCount}</span>건
            </p>
          </div>
          <Link to="/bids/new">
            <Button className="h-10 rounded-xl gap-1.5">공고 등록</Button>
          </Link>
        </div>

        <Separator className="my-6" />

        {/* Filter + count */}
        <div className="flex items-center justify-between">
          <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />
          <span className="text-sm text-muted-foreground">{filtered.length}건</span>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FolderOpen className="size-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">등록된 프로젝트가 없습니다</p>
            <Button className="mt-4 rounded-xl" asChild>
              <Link to="/bids/new">입찰 공고 등록하기</Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FolderOpen className="size-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">해당 상태의 프로젝트가 없습니다</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block rounded-2xl bg-card ring-1 ring-black/[0.12] hover:shadow-sm transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Partner avatar */}
                    <div className="size-12 shrink-0 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {project.partnerName.charAt(0)}
                      </span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold -tracking-tight truncate group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3.5" />
                              {project.address}
                            </span>
                          </div>
                        </div>

                        {/* Right: status + amount */}
                        <div className="shrink-0 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className={`size-1.5 rounded-full ${project.status === "진행중" ? "bg-green-500 animate-pulse" : "bg-zinc-400"}`} />
                            <span className="text-xs text-muted-foreground">{project.status}</span>
                          </div>
                          <p className="text-lg font-bold -tracking-tight mt-1">{project.contractAmount}</p>
                        </div>
                      </div>

                      {/* Partner + date */}
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <Building className="size-3.5" />
                        <span>{project.partnerName}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{project.startDate} 시작</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress section */}
                  <div className="mt-4 ml-16">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{project.currentMilestone}</span>
                        {project.nextMilestone && (
                          <>
                            <ArrowRight className="size-3 text-muted-foreground/40" />
                            <span className="text-sm text-muted-foreground">{project.nextMilestone}</span>
                          </>
                        )}
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${project.status === "진행중" ? "bg-primary" : "bg-zinc-400"}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

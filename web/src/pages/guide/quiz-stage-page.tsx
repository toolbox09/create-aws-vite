import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Lock, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/layout/site-header";
import { Separator } from "@/components/ui/separator";

/* ─── Types & Mock Data ─── */

interface Stage {
  id: number;
  title: string;
  status: "completed" | "current" | "locked";
  score?: number;
}

const STAGES: Stage[] = [
  { id: 1, title: "건축 기초 용어", status: "completed", score: 90 },
  { id: 2, title: "건축 절차 이해", status: "completed", score: 85 },
  { id: 3, title: "법규 기초", status: "completed", score: 75 },
  { id: 4, title: "비용 구조 이해", status: "current" },
  { id: 5, title: "설계 프로세스", status: "locked" },
  { id: 6, title: "인허가 절차", status: "locked" },
  { id: 7, title: "시공 기초", status: "locked" },
  { id: 8, title: "감리와 검사", status: "locked" },
  { id: 9, title: "친환경 건축", status: "locked" },
  { id: 10, title: "건축 마스터", status: "locked" },
];

const GRADES = [
  { name: "건축 초보", icon: "🌱", minStage: 0 },
  { name: "건축 입문", icon: "📐", minStage: 2 },
  { name: "건축 중급", icon: "🏗️", minStage: 5 },
  { name: "건축 고급", icon: "🏛️", minStage: 8 },
  { name: "건축 마스터", icon: "👑", minStage: 10 },
];

const TABS = [
  { label: "1분 퀴즈", href: "/guide/quiz" },
  { label: "건축 가이드", href: "/guide/articles" },
  { label: "가이드 영상", href: "/guide/videos" },
] as const;

/* ─── Stage Node ─── */

function StageNode({ stage }: { stage: Stage }) {
  const isCompleted = stage.status === "completed";
  const isCurrent = stage.status === "current";

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative">
        {isCurrent && (
          <span className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping" />
        )}
        <div
          className={`relative flex size-14 items-center justify-center rounded-full font-bold text-sm transition-all ${
            isCompleted
              ? "bg-emerald-500 text-white"
              : isCurrent
                ? "bg-orange-500 text-white ring-4 ring-orange-200"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {isCompleted ? (
            <Check className="size-6" />
          ) : isCurrent ? (
            <ChevronRight className="size-6" />
          ) : (
            <Lock className="size-4" />
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-center w-20 leading-tight">
        {stage.title}
      </span>
      {isCompleted && stage.score !== undefined && (
        <span className="text-[11px] font-semibold text-emerald-600">
          {stage.score}점
        </span>
      )}
      {isCurrent && (
        <Link
          to="/guide/quiz/play"
          className="text-[11px] font-semibold text-orange-600 hover:underline"
        >
          도전하기
        </Link>
      )}
    </div>
  );
}

/* ─── Connector Line ─── */

function Connector({ completed }: { completed: boolean }) {
  return (
    <div className="flex items-center self-start mt-7 shrink-0">
      <div
        className={`h-0.5 w-8 ${
          completed ? "bg-emerald-400" : "border-t-2 border-dashed border-muted-foreground/30"
        }`}
      />
    </div>
  );
}

/* ─── Page ─── */

export default function QuizStagePage() {
  const [activeTab] = useState(0);
  const completedCount = STAGES.filter((s) => s.status === "completed").length;
  const currentGrade = GRADES[1]; // 건축 입문

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* ── Tab Nav ── */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mb-8">
          {TABS.map((tab, i) => (
            <Link
              key={tab.href}
              to={tab.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                i === activeTab
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* ── Profile Header ── */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
              김
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold">김건축님</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  📐 {currentGrade.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden max-w-[240px]">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(completedCount / 10) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {completedCount}/10 스테이지 ({Math.round((completedCount / 10) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stage Map ── */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6 mb-8">
          <h3 className="text-base font-bold mb-6">스테이지 맵</h3>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start gap-0 min-w-max px-4">
              {STAGES.map((stage, i) => (
                <div key={stage.id} className="flex items-start">
                  <StageNode stage={stage} />
                  {i < STAGES.length - 1 && (
                    <Connector completed={stage.status === "completed"} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* ── Grade Info ── */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6">
          <h3 className="text-base font-bold mb-4">등급 안내</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {GRADES.map((grade) => {
              const isCurrent = grade.name === currentGrade.name;
              return (
                <div
                  key={grade.name}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                    isCurrent
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-muted/50"
                  }`}
                >
                  <span className="text-2xl">{grade.icon}</span>
                  <span
                    className={`text-sm font-semibold ${
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {grade.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {grade.minStage === 0
                      ? "시작"
                      : grade.minStage === 10
                        ? "전체 완료"
                        : `${grade.minStage}스테이지 이상`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

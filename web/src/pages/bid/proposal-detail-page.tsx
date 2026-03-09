import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  MessageCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Mock Data ─── */

const PROPOSAL = {
  office: {
    name: "아크 건축사사무소",
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    address: "서울 강남구",
    career: 12,
    projects: 47,
    usage: "주거용",
  },
  bidReference: "서울 강남구 역삼동 123-4 단독주택 본설계",
  fee: 4200,
  opinion:
    "모던 건축을 기반으로 자연 채광과 통풍을 극대화한 설계를 제안합니다. 중정을 중심으로 각 실의 프라이버시를 확보하면서도 가족 간의 소통이 자연스럽게 이루어지는 공간 구성을 목표로 합니다. 지하 1층은 주차장과 다용도실로 활용하고, 1층은 거실과 주방을 오픈 플랜으로 구성하여 넓은 생활 공간을 확보합니다.",
  files: [
    { name: "설계안_초안.pdf", size: "2.4 MB" },
    { name: "참고_포트폴리오.pdf", size: "8.1 MB" },
  ],
  status: "심사중" as const,
};

/* ═══════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════ */

export default function ProposalDetailPage() {
  const { bidId, proposalId } = useParams();
  void proposalId; // Will be used for data fetching

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 pt-6 pb-20">
        {/* ═══ Back Link ═══ */}
        <Link
          to={`/bids/${bidId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" />
          입찰 공고로 돌아가기
        </Link>

        {/* ═══ Title ═══ */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            입찰 제안서
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {PROPOSAL.bidReference}
          </p>
        </div>

        {/* ═══ Two-column Layout ═══ */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ── LEFT: Content ── */}
          <div className="flex-1 min-w-0">
            {/* ── 사무소 프로필 (Airbnb host style) ── */}
            <div className="flex items-center gap-4 pb-6">
              <img
                src={PROPOSAL.office.profileImage}
                alt={PROPOSAL.office.name}
                className="size-14 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold">
                  {PROPOSAL.office.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {PROPOSAL.office.address} &middot; 업력{" "}
                  {PROPOSAL.office.career}년 &middot; 프로젝트{" "}
                  {PROPOSAL.office.projects}건 &middot;{" "}
                  {PROPOSAL.office.usage}
                </p>
              </div>
            </div>
            <Link
              to="/partners/1"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4 mb-6"
            >
              사무소 상세 보기
            </Link>

            <Separator />

            {/* ── 제안 설계비용 ── */}
            <div className="py-6">
              <h3 className="text-base font-semibold mb-3">제안 설계비용</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">
                  {PROPOSAL.fee.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">만원</span>
              </div>
            </div>

            <Separator />

            {/* ── 설계 의견 ── */}
            <div className="py-6">
              <h3 className="text-base font-semibold mb-3">설계 의견</h3>
              <p className="text-sm leading-[1.7]">{PROPOSAL.opinion}</p>
            </div>

            <Separator />

            {/* ── 첨부 파일 ── */}
            {PROPOSAL.files.length > 0 && (
              <div className="py-6">
                <h3 className="text-base font-semibold mb-4">첨부 파일</h3>
                <div className="space-y-3">
                  {PROPOSAL.files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-3 py-2"
                    >
                      <FileText className="size-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.size}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="size-4" />
                        다운로드
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sticky Action Card ── */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-20">
              <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-6 space-y-5">
                {/* Fee display */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">
                      {PROPOSAL.fee.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">만원</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    제안 설계비용
                  </p>
                </div>

                <Separator />

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl text-sm font-semibold"
                  >
                    <MessageCircle className="size-4" />
                    채팅 문의
                  </Button>
                  <Button className="w-full h-12 rounded-xl text-sm font-semibold">
                    <FileCheck className="size-4" />
                    계약 요청
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

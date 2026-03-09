import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type InquiryStatus = "접수" | "답변완료";

interface Inquiry {
  id: number;
  title: string;
  category: string;
  date: string;
  status: InquiryStatus;
  content: string;
  answer?: string;
  answerDate?: string;
}

/* ─── Mock Data ─── */

const STATUS_STYLES: Record<InquiryStatus, { dot: string; text: string }> = {
  접수: { dot: "bg-amber-500", text: "text-amber-600" },
  답변완료: { dot: "bg-emerald-500", text: "text-emerald-600" },
};

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 5,
    title: "입찰 등록 시 오류가 발생합니다",
    category: "서비스 오류",
    date: "2026.03.05",
    status: "접수",
    content: "입찰 등록 페이지에서 이미지를 업로드한 후 '등록' 버튼을 클릭하면 '서버 오류'라는 메시지가 표시되며 등록이 되지 않습니다. 크롬 브라우저 최신 버전을 사용하고 있습니다.",
  },
  {
    id: 4,
    title: "계약서 서명 절차에 대해 문의드립니다",
    category: "결제/계약",
    date: "2026.03.02",
    status: "접수",
    content: "업체 선정 후 계약서 서명을 진행하려고 하는데, 전자서명 절차가 어떻게 되는지 안내 부탁드립니다. 공동인증서가 필요한가요?",
  },
  {
    id: 3,
    title: "건축사 자격 인증이 반려되었습니다",
    category: "회원/계정",
    date: "2026.02.25",
    status: "답변완료",
    content: "건축사 자격증을 업로드했는데 인증이 반려되었습니다. 사유가 '서류 불명확'으로 표시되는데, 어떤 부분이 문제인지 알 수 있을까요?",
    answer: "안녕하세요, 고객님. 업로드해 주신 자격증 이미지가 해상도가 낮아 자격번호 확인이 어려웠습니다. 300dpi 이상의 스캔본 또는 선명한 사진으로 다시 업로드해 주시면 재심사 진행하겠습니다. 감사합니다.",
    answerDate: "2026.02.26",
  },
  {
    id: 2,
    title: "포트폴리오 이미지 업로드 제한 문의",
    category: "서비스 이용",
    date: "2026.02.20",
    status: "답변완료",
    content: "포트폴리오에 이미지를 20장 이상 등록하고 싶은데 제한이 있나요? 프로젝트 규모가 커서 사진이 많습니다.",
    answer: "안녕하세요, 고객님. 현재 포트폴리오당 이미지는 최대 20장까지 등록 가능합니다. 하나의 프로젝트를 여러 포트폴리오로 나누어 등록하시거나, 대표 이미지를 선별하여 등록해 주시기 바랍니다. 향후 업데이트에서 업로드 제한 확대를 검토하겠습니다.",
    answerDate: "2026.02.21",
  },
  {
    id: 1,
    title: "결제 취소 후 환불 일정 문의",
    category: "결제/계약",
    date: "2026.02.15",
    status: "답변완료",
    content: "2월 14일에 결제 취소를 요청했는데, 환불이 언제 처리되나요?",
    answer: "안녕하세요, 고객님. 결제 취소 요청이 정상 접수되었으며, 카드 결제의 경우 취소일로부터 영업일 기준 3~5일 이내에 환불 처리됩니다. 체크카드의 경우 즉시 계좌로 입금됩니다. 추가 문의사항이 있으시면 말씀해 주세요.",
    answerDate: "2026.02.16",
  },
];

const ITEMS_PER_PAGE = 10;

/* ─── Page ─── */

export default function InquiryListPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(MOCK_INQUIRIES.length / ITEMS_PER_PAGE));
  const paginated = MOCK_INQUIRIES.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">고객 문의 내역</h1>
            <p className="text-sm text-muted-foreground mt-1">
              등록하신 문의와 답변을 확인하세요
            </p>
          </div>
          <Link to="/support/inquiry/new">
            <Button className="rounded-xl gap-1.5">
              <Plus className="size-4" />
              문의하기
            </Button>
          </Link>
        </div>

        {/* Inquiry List */}
        {paginated.length > 0 ? (
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:flex items-center px-5 py-3 text-xs font-medium text-muted-foreground bg-muted/30">
              <span className="w-[60px] shrink-0 text-center">번호</span>
              <span className="flex-1">제목</span>
              <span className="w-[90px] shrink-0 text-center">카테고리</span>
              <span className="w-[90px] shrink-0 text-center">등록일</span>
              <span className="w-[90px] shrink-0 text-center">답변상태</span>
              <span className="w-[32px] shrink-0" />
            </div>

            <div className="divide-y divide-black/[0.06]">
              {paginated.map((inquiry) => {
                const isExpanded = expandedId === inquiry.id;
                const statusStyle = STATUS_STYLES[inquiry.status];

                return (
                  <div key={inquiry.id}>
                    {/* Row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                      className="w-full flex items-center gap-2 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="hidden sm:block w-[60px] shrink-0 text-center text-sm text-muted-foreground tabular-nums">
                        {inquiry.id}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">
                        {inquiry.title}
                      </span>
                      <span className="hidden sm:block w-[90px] shrink-0 text-center text-xs text-muted-foreground">
                        {inquiry.category}
                      </span>
                      <span className="hidden sm:block w-[90px] shrink-0 text-center text-xs text-muted-foreground">
                        {inquiry.date}
                      </span>
                      <span className="w-[90px] shrink-0 flex items-center justify-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
                        <span className={`text-xs font-medium ${statusStyle.text}`}>
                          {inquiry.status}
                        </span>
                      </span>
                      <ChevronDown
                        className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 sm:pl-[80px]">
                        <div className="rounded-xl bg-muted/30 p-4 space-y-4">
                          {/* 문의 내용 */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                              문의 내용
                            </p>
                            <p className="text-sm leading-[1.7]">{inquiry.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{inquiry.date}</p>
                          </div>

                          {/* 답변 */}
                          {inquiry.answer ? (
                            <div className="rounded-xl bg-background p-4 ring-1 ring-black/[0.06]">
                              <p className="text-xs font-semibold text-primary mb-1.5">
                                답변
                              </p>
                              <p className="text-sm leading-[1.7]">{inquiry.answer}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {inquiry.answerDate}
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-background p-4 ring-1 ring-black/[0.06] text-center">
                              <p className="text-sm text-muted-foreground">
                                아직 답변이 등록되지 않았습니다
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm py-20 text-center">
            <MessageSquarePlus className="size-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-4">등록된 문의가 없습니다</p>
            <Link to="/support/inquiry/new">
              <Button className="rounded-xl">문의하기</Button>
            </Link>
          </div>
        )}

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

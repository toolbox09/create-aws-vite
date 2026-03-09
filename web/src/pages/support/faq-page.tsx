import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type FaqCategory = "전체" | "회원" | "입찰" | "결제" | "서비스 이용";

interface FaqItem {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
}

/* ─── Mock Data ─── */

const CATEGORIES: FaqCategory[] = ["전체", "회원", "입찰", "결제", "서비스 이용"];

const CATEGORY_STYLES: Record<string, string> = {
  회원: "bg-blue-500/10 text-blue-600",
  입찰: "bg-primary/10 text-primary",
  결제: "bg-emerald-500/10 text-emerald-600",
  "서비스 이용": "bg-amber-500/10 text-amber-600",
};

const MOCK_FAQS: FaqItem[] = [
  {
    id: 1,
    category: "회원",
    question: "회원가입은 어떻게 하나요?",
    answer: "홈페이지 우측 상단의 '회원가입' 버튼을 클릭하여 가입할 수 있습니다. 이메일 인증 후 기본 프로필 정보를 입력하면 가입이 완료됩니다. 건축주와 건축사 유형 중 선택하여 가입하실 수 있습니다.",
  },
  {
    id: 2,
    category: "회원",
    question: "비밀번호를 잊어버렸어요. 어떻게 재설정하나요?",
    answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하세요. 가입 시 사용한 이메일 주소를 입력하면 비밀번호 재설정 링크가 발송됩니다. 링크는 24시간 동안 유효합니다.",
  },
  {
    id: 3,
    category: "입찰",
    question: "입찰 공고는 어떻게 등록하나요?",
    answer: "입찰 공고 페이지에서 '입찰 등록' 버튼을 클릭합니다. 프로젝트 기본 정보(위치, 용도, 규모), 설계 범위, 희망 설계비 범위, 모집 기간 등을 입력한 후 등록하면 됩니다. 등록 전 토지소유 확인 인증을 완료하시면 신뢰도가 높아집니다.",
  },
  {
    id: 4,
    category: "입찰",
    question: "입찰에 참여하려면 어떤 자격이 필요한가요?",
    answer: "건축사 자격증 보유자 또는 건축사사무소 등록 업체만 참여할 수 있습니다. 회원가입 시 '건축사' 유형으로 가입하고, 자격증 사본을 업로드하여 인증을 완료해야 합니다. 인증 심사는 영업일 기준 1~2일 소요됩니다.",
  },
  {
    id: 5,
    category: "결제",
    question: "설계비 결제는 어떻게 이루어지나요?",
    answer: "계약 체결 후 에스크로 방식으로 설계비가 관리됩니다. 건축주가 설계비를 선입금하면, 각 단계별 성과품 제출 및 검수 완료 시 건축사에게 단계별로 지급됩니다. 신용카드, 계좌이체, 가상계좌 결제를 지원합니다.",
  },
  {
    id: 6,
    category: "결제",
    question: "환불 정책은 어떻게 되나요?",
    answer: "계약 체결 전 입금한 예치금은 전액 환불 가능합니다. 계약 체결 후에는 진행 단계에 따라 환불 금액이 달라지며, 상호 협의 또는 분쟁 조정 절차를 통해 처리됩니다. 자세한 내용은 이용약관 제18조를 참고해 주세요.",
  },
  {
    id: 7,
    category: "서비스 이용",
    question: "AI 분석 리포트는 어떤 기능인가요?",
    answer: "AI 분석 리포트는 프로젝트의 위치, 규모, 용도 등의 데이터를 바탕으로 예상 건축비, 인허가 소요 기간, 유사 프로젝트 사례 등을 자동으로 분석해주는 기능입니다. 분석 메뉴에서 프로젝트를 생성하고 기본 정보를 입력하면 리포트가 생성됩니다.",
  },
  {
    id: 8,
    category: "서비스 이용",
    question: "포트폴리오는 어떻게 등록하나요?",
    answer: "마이페이지 > 포트폴리오 관리에서 '새 포트폴리오 등록'을 클릭합니다. 프로젝트명, 위치, 용도, 규모, 설명, 이미지(최대 20장)를 입력하면 됩니다. 등록된 포트폴리오는 파트너 검색 시 공개되어 건축주가 참고할 수 있습니다.",
  },
];

const ITEMS_PER_PAGE = 10;

/* ─── Page ─── */

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FaqCategory>("전체");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  function toggleItem(id: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = MOCK_FAQS.filter((faq) => {
    if (category !== "전체" && faq.category !== category) return false;
    if (search && !faq.question.includes(search) && !faq.answer.includes(search)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">자주 묻는 질문 (FAQ)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            궁금한 점을 빠르게 찾아보세요
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="질문을 검색해 보세요"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl h-11 pl-10"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
                setOpenIds(new Set());
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm overflow-hidden divide-y divide-black/[0.06]">
          {paginated.length > 0 ? (
            paginated.map((faq) => (
              <div key={faq.id}>
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium shrink-0 ${
                      CATEGORY_STYLES[faq.category] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {faq.category}
                  </span>
                  <span className="flex-1 text-sm font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      openIds.has(faq.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIds.has(faq.id) && (
                  <div className="px-5 pb-4 pl-[72px]">
                    <p className="text-sm text-muted-foreground leading-[1.8]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다
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

        {/* Bottom Banner */}
        <div className="mt-8 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <MessageCircle className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">원하는 답변을 찾지 못하셨나요?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                1:1 문의를 통해 자세한 도움을 받으실 수 있습니다
              </p>
            </div>
          </div>
          <Link to="/support/inquiry/new">
            <Button className="rounded-xl">1:1 문의하기</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

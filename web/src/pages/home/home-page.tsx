import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LandPlot,
  ClipboardList,
  FolderKanban,
  MapPin,
  Briefcase,
  Building2,
  CheckCircle,
  Search,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/site-header";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "1,240+", label: "건축주 이용 중" },
  { value: "3초", label: "AI 사업성 분석" },
  { value: "14.2%", label: "평균 수익률" },
  { value: "680+", label: "분석 완료(건)" },
];

const featureCards = [
  {
    icon: LandPlot,
    label: "땅은 있는데 뭘 지을지 모를 때",
    title: "AI 사업성 분석\n지금 바로 해보기",
    desc: "주소 입력 3초 만에 — 용도지역, 건폐율/용적률, 예상 임대 수익, 최적 건축 유형까지 한 번에 리포트가 나옵니다.",
    cta: "AI 사업성 분석 시작",
    href: "/map",
  },
  {
    icon: ClipboardList,
    label: "설계사·시공사를 찾고 있을 때",
    title: "공개 입찰로\n투명하게 선정하기",
    desc: "검증된 파트너사에게 공고를 보내고 비교 제안을 받으세요. 무자격 업체 없이 자격증 확인된 전문가만 참여합니다.",
    cta: "입찰 공고 내기",
    href: "/bids/new",
  },
  {
    icon: FolderKanban,
    label: "이미 공사가 진행 중일 때",
    title: "일정·비용·품질을\n한 화면에서 관리",
    desc: "기획부터 준공까지 10가지 이상의 시스템. 건축주·설계사·시공사가 같이 보는 실시간 대시보드입니다.",
    cta: "프로젝트 관리 알기",
    href: "/mypage?tab=projects",
  },
];

const processSteps = [
  {
    step: "01",
    icon: MapPin,
    title: "토지 분석",
    desc: "주소를 입력하면 AI가 용도지역·용적률·수익성을 분석합니다. 입지분석 리포트, 예상 분양가/임대료, 최적용도까지 AI가 제안합니다.",
    linkLabel: "지도",
    href: "/map",
  },
  {
    step: "02",
    icon: Briefcase,
    title: "설계·입찰",
    desc: "비교 제안, 검증, 계약까지 입찰시스템으로 투명하게 해결합니다.",
    linkLabel: "입찰등록",
    href: "/bids/new",
  },
  {
    step: "03",
    icon: Building2,
    title: "시공·관리",
    desc: "공사 일정관리, 시나리오 검토, 변경·기간 연장 필요시 건축사와 빠른 소통",
    linkLabel: "프로젝트관리",
    href: "/mypage?tab=projects",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "준공·완성",
    desc: "사용승인, 건물 등기, 일정 페어리보고서, 총공사비 정산서, 하자관리까지 전부 관리합니다.",
    linkLabel: "완료",
    href: null,
  },
];

const analysisExamples = [
  {
    address: "강남구 역삼동 000-00",
    zone: "제3종일반주거지역",
    landType: "대",
    area: "330.5m²",
    returnRate: "14.2%",
    estimate: "+107억",
    payback: "4.8년",
  },
  {
    address: "성동구 성수동2가 200-15",
    zone: "준공업지역",
    landType: "대",
    area: "210.3m²",
    returnRate: "17.8%",
    estimate: "+88억",
    payback: "3.9년",
  },
  {
    address: "마포구 합정동 382-9",
    zone: "제2종일반주거지역",
    landType: "대",
    area: "285.2m²",
    returnRate: "11.4%",
    estimate: "+42억",
    payback: "5.6년",
  },
  {
    address: "은평구 진관동 168-3",
    zone: "제1종일반주거지역",
    landType: "대",
    area: "420.7m²",
    returnRate: "7.2%",
    estimate: "+8억",
    payback: "14억 추정시세",
  },
];

const faqs = [
  {
    q: "AI 사업성 분석은 어떤 근거로 계산하나요?",
    a: "공시지가, 실거래가, 용도지역별 건폐율/용적률, 주변 시세, 임대료 데이터 등을 종합하여 AI가 수익성을 산출합니다. 국토교통부 공개 데이터와 자체 수집 데이터를 결합해 높은 정확도를 제공합니다.",
  },
  {
    q: "설계사나 시공사 선정도 도와주나요?",
    a: "네, 콘마켓의 공개 입찰 시스템을 통해 검증된 설계사·시공사로부터 비교 제안을 받을 수 있습니다. 자격면허가 확인된 전문가만 참여하므로 안심하고 선정할 수 있습니다.",
  },
  {
    q: "건축을 처음 해보는데 사용할 수 있나요?",
    a: "물론입니다. 콘마켓은 건축 경험이 없는 건축주를 위해 설계되었습니다. 단계별 가이드와 AI 분석으로 처음이어도 쉽게 진행할 수 있습니다.",
  },
  {
    q: "이용 요금은 얼마인가요?",
    a: "AI 사업성 분석은 무료로 제공됩니다. 입찰 공고, 프로젝트 관리 등 고급 기능은 플랜에 따라 요금이 달라집니다. 자세한 내용은 요금 안내 페이지를 참고해 주세요.",
  },
  {
    q: "등기부등본 소유주 인증은 왜 필요한가요?",
    a: "토지 소유주 확인을 통해 허위 분석 요청을 방지하고, 정확한 데이터 기반의 맞춤 분석을 제공하기 위함입니다. 개인정보는 암호화되어 안전하게 보관됩니다.",
  },
];

const footerSolutions = [
  { label: "필지 분석", href: "/map" },
  { label: "AI 사업성 분석", href: "/map" },
  { label: "비교견적 시스템(입찰)", href: "/bids" },
  { label: "프로젝트 관리", href: "/mypage?tab=projects" },
];

const footerPartners = [
  { label: "건축사 찾기", href: "/partners" },
  { label: "파트너사 등록", href: "/partners" },
  { label: "자격면허 인증", href: "/partners" },
];

const footerSupport = [
  { label: "공지·업데이트", href: "/support" },
  { label: "건축 가이드", href: "/guide" },
  { label: "문의·FAQ", href: "/support" },
  { label: "이용약관", href: "/support" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = () => {
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ============================================================ */}
      {/*  1. Hero                                                      */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        <div
          className="mx-auto w-full pt-24 pb-20 md:pt-32 md:pb-28 px-6"
          style={{ maxWidth: 1120 }}
        >
          <div className="mx-auto max-w-2xl text-center">
            {/* Label */}
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary -tracking-tight mb-6">
              AI 기반 건축주 플랫폼
            </span>

            {/* Heading */}
            <h1 className="text-3xl font-bold -tracking-tight md:text-5xl leading-[1.3] mt-2">
              내 땅에 뭘 지어야
              <br />
              가장 많이 남을까?
            </h1>

            {/* Sub */}
            <p className="mt-5 text-base text-muted-foreground leading-[1.7] md:text-lg max-w-xl mx-auto">
              주소 하나 입력하면 AI가 용도지역·용적률·수익성을 분석합니다.
              <br className="hidden md:block" />
              설계사·시공사 선정부터 준공까지, 건축주 혼자 감당하지 않아도 됩니다.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex items-center gap-2 rounded-2xl bg-card ring-1 ring-black/[0.08] p-2 shadow-sm max-w-xl mx-auto">
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="예) 서울 강남구 역삼동 123-4 또는 내 토지 주소 입력"
                  className="flex-1 border-0 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <Button
                className="rounded-xl shrink-0"
                onClick={handleSearch}
              >
                분석하기
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-success" />
                분석기 1.0 기술
              </span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-success" />
                프라이빗 빌링로
              </span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-success" />
                분석건 만족도
              </span>
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold -tracking-tight text-foreground md:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  2. Features                                                  */}
      {/* ============================================================ */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div
          className="mx-auto w-full px-6"
          style={{ maxWidth: 1120 }}
        >
          {/* Header */}
          <div className="max-w-lg">
            <span className="text-xs font-semibold text-primary -tracking-tight">
              어떤 상황이세요?
            </span>
            <h2 className="mt-3 text-2xl font-bold -tracking-tight md:text-3xl leading-[1.3]">
              시작점이 달라도
              <br />
              콘마켓이 맞춰드립니다
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-[1.7] md:text-base">
              땅을 막 매입했든, 수년째 고민 중이든, 아직 토지 물색 중이든 — 지금
              상황에 맞는 기능으로 바로 연결해드립니다.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.cta}
                  className="flex flex-col bg-card rounded-2xl ring-1 ring-black/[0.08] p-6 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">{card.label}</p>
                  <h3 className="mt-2 text-lg font-semibold -tracking-tight leading-[1.4] whitespace-pre-line">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground leading-[1.7]">
                    {card.desc}
                  </p>
                  <Link
                    to={card.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {card.cta}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3. Process                                                   */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div
          className="mx-auto w-full px-6"
          style={{ maxWidth: 1120 }}
        >
          {/* Header */}
          <div className="max-w-lg">
            <span className="text-xs font-semibold text-primary -tracking-tight">
              콘마켓 이용 흐름
            </span>
            <h2 className="mt-3 text-2xl font-bold -tracking-tight md:text-3xl leading-[1.3]">
              기획부터 준공까지,
              <br />
              4단계로 끝납니다
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-[1.7] md:text-base">
              복잡한 건축 과정을 콘마켓 하나로 쉽게 들립니다.
            </p>
          </div>

          {/* Steps */}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative bg-card rounded-2xl ring-1 ring-black/[0.08] p-6"
                >
                  <span className="text-xs font-semibold text-primary/60">
                    Step {step.step}
                  </span>
                  <div className="mt-3 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold -tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-[1.7]">
                    {step.desc}
                  </p>
                  {step.href ? (
                    <Link
                      to={step.href}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {step.linkLabel}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : (
                    <span className="mt-4 inline-block text-sm font-semibold text-muted-foreground">
                      {step.linkLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4. Analysis Examples                                         */}
      {/* ============================================================ */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div
          className="mx-auto w-full px-6"
          style={{ maxWidth: 1120 }}
        >
          {/* Header */}
          <div className="max-w-lg">
            <span className="text-xs font-semibold text-primary -tracking-tight">
              실제 분석 사례
            </span>
            <h2 className="mt-3 text-2xl font-bold -tracking-tight md:text-3xl leading-[1.3]">
              이런 땅들이 분석됐습니다
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-[1.7] md:text-base">
              콘마켓 AI가 분석한 실제 필지 데이터입니다. 클릭하면 상세 분석
              화면으로 이동합니다.
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {analysisExamples.map((ex) => (
              <Link
                key={ex.address}
                to="/map"
                className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6 hover:shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold -tracking-tight">
                      {ex.address}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ex.zone} · {ex.landType} {ex.area}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    시세반영가
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    <div>
                      <p className="text-lg font-bold -tracking-tight">
                        {ex.returnRate}
                      </p>
                      <p className="text-[11px] text-muted-foreground">수익률</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-info" />
                    <div>
                      <p className="text-lg font-bold -tracking-tight">
                        {ex.estimate}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        추정시세
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-bold -tracking-tight">
                        {ex.payback}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        투자회수
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA link */}
          <div className="mt-8 text-center">
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              지도에서 더 많은 필지 분석 보기
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5. FAQ                                                       */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div
          className="mx-auto w-full px-6"
          style={{ maxWidth: 1120 }}
        >
          <h2 className="text-2xl font-bold -tracking-tight md:text-3xl text-center leading-[1.3]">
            자주 묻는 질문
          </h2>

          <div className="mx-auto mt-10 max-w-2xl divide-y divide-border">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-sm font-semibold -tracking-tight leading-[1.7]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <p className="pb-5 text-sm text-muted-foreground leading-[1.7]">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  6. Bottom CTA                                                */}
      {/* ============================================================ */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div
          className="mx-auto w-full text-center px-6"
          style={{ maxWidth: 1120 }}
        >
          <span className="text-xs font-semibold text-primary -tracking-tight">
            지금 바로 시작
          </span>
          <h2 className="mt-3 text-2xl font-bold -tracking-tight md:text-3xl leading-[1.3]">
            내 땅 주소 하나로
            <br />
            오늘 분석 완료
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground leading-[1.7] md:text-base">
            가입 절차, 신용카드, 결제, 복잡한 입력 없이 AI가 3초 안에 사업성
            분석을 드립니다.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button className="rounded-xl" size="lg" asChild>
              <Link to="/map">무료로 분석하기</Link>
            </Button>
            <Button variant="outline" className="rounded-xl" size="lg" asChild>
              <Link to="/chat">AI에게 먼저 물어보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  7. Footer                                                    */}
      {/* ============================================================ */}
      <footer className="border-t border-border bg-card py-14">
        <div
          className="mx-auto w-full px-6"
          style={{ maxWidth: 1120 }}
        >
          <div className="grid gap-10 md:grid-cols-4">
            {/* Logo + Description */}
            <div className="md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2">
                <img src="/logo.svg" alt="콘마켓" className="h-6" />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground leading-[1.7]">
                건축주를 위한 B2B 플랫폼, AI가 설계부터 관리 및 분석까지
              </p>
            </div>

            {/* Column 1 */}
            <div>
              <h4 className="text-sm font-semibold -tracking-tight">
                솔루션 안내
              </h4>
              <ul className="mt-4 space-y-2.5">
                {footerSolutions.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-sm font-semibold -tracking-tight">
                파트너사 안내
              </h4>
              <ul className="mt-4 space-y-2.5">
                {footerPartners.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-sm font-semibold -tracking-tight">
                고객 지원
              </h4>
              <ul className="mt-4 space-y-2.5">
                {footerSupport.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 콘마켓. 본 사이트의 모든 콘텐츠는 저작권법의 보호를
              받습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Phone,
  Globe,
  MessageCircle,
  Calendar,
  Award,
  Users,
  Building,
  Share,
  Bookmark,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

const CERT_STYLES = {
  설계: "text-primary bg-primary/8",
  시공: "text-blue-600 bg-blue-500/8",
  감리: "text-emerald-600 bg-emerald-500/8",
} as const;

type CertType = "설계" | "시공" | "감리";

/* ─── Mock Data ─── */

const P = {
  name: "아크 건축사사무소",
  region: "서울 강남구",
  address: "서울특별시 강남구 논현로 512, 3층",
  profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&h=500&fit=crop",
  certs: ["설계", "감리"] as CertType[],
  usage: ["단독주택", "다세대주택", "근린생활"],
  portfolioCount: 47,
  reviewCount: 23,
  rating: 4.8,
  years: 12,
  founded: "2014년",
  ceo: "김건축",
  employees: 8,
  phone: "02-1234-5678",
  website: "https://example.com",
  intro: "사람과 공간의 조화를 추구합니다. 12년간 47건의 프로젝트를 성공적으로 완수하며, 건축주의 라이프스타일을 깊이 이해하고 이를 공간에 담아내는 설계를 전문으로 합니다.",
  brandStory: "'좋은 건축은 좋은 대화에서 시작된다'는 철학 아래, 건축주와의 소통을 가장 중요하게 생각합니다. 작은 주택 한 채도 그 안에 살아갈 사람의 이야기를 담아야 한다고 믿습니다.",
};

const BRAND_STORY_BLOCKS = [
  {
    type: "hero" as const,
    quote: "좋은 건축은 좋은 대화에서 시작됩니다",
    subtitle: "아크 건축사사무소의 이야기",
  },
  {
    type: "image-text" as const,
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
    title: "시작은 한 채의 작은 집이었습니다",
    text: "2014년, 경기도 외곽의 30평 단독주택 설계를 시작으로 아크 건축사사무소는 문을 열었습니다. 당시 건축주는 은퇴 후 조용한 삶을 꿈꾸는 부부였고, 그분들의 '하루'를 듣는 것에서 설계가 시작되었습니다. 아침에 일어나 커피를 내리고 창밖을 바라보는 시간, 오후에 텃밭에서 흙을 만지는 시간 — 그 일상의 리듬이 집의 동선이 되고, 창의 위치가 되었습니다.",
    imagePosition: "left" as const,
  },
  {
    type: "philosophy" as const,
    title: "우리의 철학",
    text: "건축은 단순히 벽과 지붕을 세우는 일이 아닙니다. 그 안에서 살아갈 사람의 꿈, 습관, 취향, 그리고 아직 발견하지 못한 가능성까지 담아내는 일입니다. 아크는 모든 프로젝트에서 '왜 이 공간이 필요한가'라는 질문에서 출발합니다.",
    values: [
      { label: "대화", desc: "건축주의 일상을 듣고, 말로 표현하지 못한 욕구까지 발견합니다" },
      { label: "정직", desc: "예산, 일정, 한계를 솔직하게 공유합니다" },
      { label: "디테일", desc: "1cm의 차이가 10년의 만족을 만든다고 믿습니다" },
    ],
  },
  {
    type: "image-text" as const,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
    title: "47번의 프로젝트, 47개의 이야기",
    text: "모든 프로젝트는 다릅니다. 같은 평수의 같은 용도라도, 사는 사람이 다르면 완전히 다른 집이 됩니다. 판교의 '숲의 집'은 두 아이의 놀이터가 되는 마당을 중심으로, 제주의 세컨하우스는 바람의 방향을 읽어 현무암 담장의 높이를 정했습니다. 12년간 한 건도 같은 설계를 반복한 적이 없다는 것이 저희의 자부심입니다.",
    imagePosition: "right" as const,
  },
  {
    type: "process" as const,
    title: "아크의 설계 프로세스",
    steps: [
      { number: "01", title: "첫 만남 · 경청", desc: "건축주의 삶을 듣습니다. 평소 좋아하는 공간, 불편했던 경험, 미래의 계획까지." },
      { number: "02", title: "대지 분석 · 해석", desc: "땅의 방향, 경사, 주변 환경을 읽고 최적의 배치를 구상합니다." },
      { number: "03", title: "설계 · 조율", desc: "3D 모델링과 실물 크기 목업으로 공간감을 미리 경험할 수 있도록 합니다." },
      { number: "04", title: "시공 · 관리", desc: "매주 현장 리포트를 공유하고, 건축주가 모든 과정에 참여할 수 있도록 합니다." },
    ],
  },
  {
    type: "image-text" as const,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
    title: "건축주와 함께 늙어가는 집",
    text: "집은 완공되는 순간이 끝이 아니라 시작입니다. 아크는 준공 후에도 계절마다 점검 서비스를 제공하고, 가족 구성이 변할 때 리모델링 컨설팅을 진행합니다. 10년 전 설계한 집의 건축주가 '이 집에서 아이가 자랐다'고 말씀해주실 때, 그것이 건축의 가치라고 생각합니다.",
    imagePosition: "left" as const,
  },
];

const PORTFOLIOS = [
  { id: 1, title: "판교 단독주택 '숲의 집'", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", usage: "단독주택", year: 2024, area: "264m²", description: "자연 속 여유로운 삶을 담은 3층 단독주택. 남향 배치와 넓은 테라스가 특징입니다." },
  { id: 2, title: "서초 다세대주택 리모델링", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop", usage: "다세대주택", year: 2023, area: "520m²", description: "노후 다세대주택의 구조 보강과 외관 리뉴얼. 에너지 효율 30% 개선." },
  { id: 3, title: "강남 근생 빌딩 신축", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop", usage: "근린생활", year: 2023, area: "890m²", description: "상업 + 주거 복합 건물. 1~2층 상가, 3~5층 주거 공간으로 설계." },
  { id: 4, title: "용인 전원주택 '하늘마루'", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop", usage: "단독주택", year: 2022, area: "198m²", description: "전원생활을 위한 2층 목조주택. 넓은 마당과 텃밭 공간 포함." },
  { id: 5, title: "분당 상가주택", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop", usage: "근린생활", year: 2022, area: "450m²", description: "역세권 상가주택 신축. 임대 수익과 거주 공간을 동시에 확보." },
  { id: 6, title: "제주 세컨하우스", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop", usage: "단독주택", year: 2021, area: "165m²", description: "제주 자연을 품은 세컨하우스. 현무암과 노출콘크리트의 조화." },
];

const KEYWORDS = [
  { label: "전문적이에요", count: 18 },
  { label: "소통이 좋아요", count: 15 },
  { label: "약속을 잘 지켜요", count: 12 },
  { label: "친절해요", count: 10 },
  { label: "믿음이 가요", count: 8 },
];

const REVIEWS = [
  { id: 1, author: "김**", date: "2024.11", project: "판교 단독주택", keywords: ["전문적이에요", "소통이 좋아요"], text: "처음 집을 짓는 거라 걱정이 많았는데, 설계 단계부터 정말 꼼꼼하게 설명해주시고 매주 진행 상황을 공유해주셔서 안심하고 맡길 수 있었습니다." },
  { id: 2, author: "이**", date: "2024.08", project: "서초 다세대주택", keywords: ["약속을 잘 지켜요", "전문적이에요"], text: "일정과 예산 모두 약속대로 진행되어 믿음이 갔습니다. 설계 변경이 있을 때도 빠르게 대안을 제시해주셔서 좋았습니다." },
  { id: 3, author: "박**", date: "2024.03", project: "용인 전원주택", keywords: ["친절해요", "소통이 좋아요"], text: "건축에 대해 잘 모르는 저에게 어려운 용어 없이 쉽게 설명해주셨습니다. 완성된 집에 매우 만족하고 있습니다." },
];

const QUALIFICATIONS = [
  { label: "건축사 자격증", desc: "대한건축사협회 등록" },
  { label: "설계 인증", desc: "플랫폼 심사 완료" },
  { label: "감리 인증", desc: "플랫폼 심사 완료" },
  { label: "사업자 등록", desc: "국세청 확인 완료" },
  { label: "보험 가입", desc: "건축사 배상책임보험" },
];

const COMPANY_INFO = [
  { icon: Building, label: "설립", value: P.founded },
  { icon: Users, label: "인력", value: `${P.employees}명` },
  { icon: MapPin, label: "소재지", value: P.address },
  { icon: Calendar, label: "업력", value: `${P.years}년` },
  { icon: Award, label: "대표", value: P.ceo },
  { icon: Globe, label: "전문 용도", value: P.usage.join(", ") },
];

/* ─── Page ─── */

const SECTION_TABS = [
  { id: "story", label: "브랜드 스토리" },
  { id: "portfolio", label: "포트폴리오" },
  { id: "credentials", label: "자격·인증" },
  { id: "gallery", label: "갤러리" },
  { id: "company", label: "사무소 정보" },
  { id: "reviews", label: "리뷰" },
] as const;

type SectionId = (typeof SECTION_TABS)[number]["id"];

export default function PartnerDetailPage() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("story");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabBarRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);

  const setSectionRef = useCallback(
    (sectionId: string) => (el: HTMLElement | null) => {
      sectionRefs.current[sectionId] = el;
    },
    [],
  );

  // IntersectionObserver to track which section is in view
  useEffect(() => {
    // header (72px) + tab bar (~44px) + small buffer
    const topOffset = 130;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        // Pick the topmost intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id as SectionId);
        }
      },
      {
        rootMargin: `-${topOffset}px 0px -50% 0px`,
        threshold: 0,
      },
    );

    for (const tab of SECTION_TABS) {
      const el = sectionRefs.current[tab.id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  function scrollToSection(sectionId: SectionId) {
    const el = sectionRefs.current[sectionId];
    if (!el) return;
    const topOffset = 130;
    const top = el.getBoundingClientRect().top + window.scrollY - topOffset;
    isClickScrolling.current = true;
    setActiveSection(sectionId);
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        {/* ═══ 2-column: Left sticky profile + Right scrolling content ═══ */}
        <div className="flex gap-12 pt-8 pb-16">
          {/* ── Left column: sticky profile ── */}
          <div className="hidden lg:block w-[420px] shrink-0">
            <div className="sticky top-20">
              {/* Hero image */}
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={P.coverImage}
                  alt={P.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Title + meta */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  {P.certs.map((c) => (
                    <span
                      key={c}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${CERT_STYLES[c]}`}
                    >
                      <Award className="size-3" />
                      {c}
                    </span>
                  ))}
                </div>
                <h1 className="text-[22px] font-semibold tracking-tight">
                  {P.name}
                </h1>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  <span>{P.region}</span>
                  <span className="opacity-30">·</span>
                  <span>업력 {P.years}년</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm">
                  <Star className="size-4 fill-foreground text-foreground" />
                  <span className="font-semibold">{P.rating}</span>
                  <span className="text-muted-foreground">
                    · 리뷰 {P.reviewCount}개
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-muted-foreground leading-[1.7]">
                {P.intro}
              </p>

              {/* Action buttons */}
              <div className="mt-4 flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:text-muted-foreground">
                  <Share className="size-4" />
                  공유하기
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:text-muted-foreground"
                >
                  <Bookmark className={`size-4 ${liked ? "fill-foreground" : ""}`} />
                  저장
                </button>
              </div>

              {/* CTA Card */}
              <div className="mt-6 rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={P.profileImage}
                    alt={P.ceo}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{P.ceo} 대표</p>
                    <p className="text-xs text-muted-foreground">
                      {P.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{P.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="size-4 text-muted-foreground" />
                    <a
                      href={P.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      홈페이지 방문
                    </a>
                  </div>
                </div>

                <Button className="w-full h-12 rounded-xl text-base font-semibold">
                  <MessageCircle className="size-4 mr-2" />
                  1:1 문의
                </Button>

              </div>
            </div>
          </div>

          {/* ── Right column: scrolling content ── */}
          <div className="min-w-0 flex-1">
            {/* ── Section tab nav (sticky within right column) ── */}
            <div
              ref={tabBarRef}
              className="sticky z-40 -mx-1 mb-6 bg-background/95 backdrop-blur-sm"
              style={{ top: "var(--header-height)" }}
            >
              <nav className="flex gap-0.5 overflow-x-auto scrollbar-none border-b border-black/[0.06] pb-0">
                {SECTION_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      activeSection === tab.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {activeSection === tab.id && (
                      <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* ═══ Brand Story (Wadiz-style) ═══ */}
            <section id="story" ref={setSectionRef("story")}>
              {BRAND_STORY_BLOCKS.map((block, idx) => {
                if (block.type === "hero") {
                  return (
                    <div key={idx} className="py-10 text-center">
                      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                        Brand Story
                      </p>
                      <blockquote className="text-2xl font-semibold tracking-tight leading-snug">
                        "{block.quote}"
                      </blockquote>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {block.subtitle}
                      </p>
                    </div>
                  );
                }

                if (block.type === "image-text") {
                  const isLeft = block.imagePosition === "left";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-6 py-8`}
                    >
                      <div className="md:w-1/2 shrink-0">
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img
                            src={block.image}
                            alt={block.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <div className="md:w-1/2 flex flex-col justify-center">
                        <h3 className="text-lg font-semibold tracking-tight mb-3">
                          {block.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-[1.8]">
                          {block.text}
                        </p>
                      </div>
                    </div>
                  );
                }

                if (block.type === "philosophy") {
                  return (
                    <div key={idx} className="py-8">
                      <h3 className="text-lg font-semibold tracking-tight mb-3">
                        {block.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-[1.8] mb-6">
                        {block.text}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        {block.values.map((v) => (
                          <div
                            key={v.label}
                            className="rounded-2xl ring-1 ring-black/[0.08] p-5"
                          >
                            <p className="text-base font-semibold mb-1.5">
                              {v.label}
                            </p>
                            <p className="text-xs text-muted-foreground leading-[1.6]">
                              {v.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (block.type === "process") {
                  return (
                    <div key={idx} className="py-8">
                      <h3 className="text-lg font-semibold tracking-tight mb-6">
                        {block.title}
                      </h3>
                      <div className="space-y-0">
                        {block.steps.map((s, si) => (
                          <div key={si} className="flex gap-5 py-5">
                            <span className="text-2xl font-bold tracking-tight text-muted-foreground/30 shrink-0 w-10">
                              {s.number}
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{s.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground leading-[1.7]">
                                {s.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </section>

            <Separator className="my-8" />

            {/* Portfolio list (Airbnb service menu style) */}
            <section id="portfolio" ref={setSectionRef("portfolio")}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight">
                  포트폴리오
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {PORTFOLIOS.length}건
                  </span>
                </h2>
                <Link
                  to={`/partners/${id}/portfolio`}
                  className="flex items-center gap-1 text-sm font-semibold underline underline-offset-2 hover:text-muted-foreground"
                >
                  전체보기
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="space-y-0">
                {PORTFOLIOS.map((pf, idx) => (
                  <div key={pf.id}>
                    <Link
                      to={`/partners/${id}/portfolio/${pf.id}`}
                      className="group flex gap-5 py-5"
                    >
                      <div className="w-[200px] shrink-0 aspect-[4/3] overflow-hidden rounded-xl">
                        <img
                          src={pf.image}
                          alt={pf.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <p className="text-base font-semibold tracking-tight group-hover:underline">
                          {pf.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pf.usage} · {pf.area} · {pf.year}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground leading-[1.6] line-clamp-2">
                          {pf.description}
                        </p>
                      </div>
                    </Link>
                    {idx < PORTFOLIOS.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-8" />

            {/* Partner qualifications (Airbnb host credentials style) */}
            <section id="credentials" ref={setSectionRef("credentials")}>
              <div className="flex items-start gap-5 mb-6">
                <img
                  src={P.profileImage}
                  alt={P.ceo}
                  className="size-14 rounded-full object-cover shrink-0"
                />
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {P.ceo} 대표의 자격 및 인증
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {P.name} · {P.founded} 설립 · 업력 {P.years}년
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {QUALIFICATIONS.map((q) => (
                  <div key={q.label} className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{q.label}</p>
                      <p className="text-xs text-muted-foreground">{q.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm text-muted-foreground leading-[1.7]">
                {P.brandStory}
              </p>
            </section>

            <Separator className="my-8" />

            {/* Specialty gallery (3-column image grid) */}
            <section id="gallery" ref={setSectionRef("gallery")}>
              <h2 className="text-xl font-semibold tracking-tight mb-5">
                전문 분야 갤러리
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {PORTFOLIOS.slice(0, 6).map((pf) => (
                  <div key={pf.id} className="aspect-square overflow-hidden rounded-xl">
                    <img
                      src={pf.image}
                      alt={pf.title}
                      className="h-full w-full object-cover hover:scale-[1.03] transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-8" />

            {/* Company info (icon grid, Airbnb amenities style) */}
            <section id="company" ref={setSectionRef("company")}>
              <h2 className="text-xl font-semibold tracking-tight mb-5">
                사무소 정보
              </h2>
              <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                {COMPANY_INFO.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <Icon className="size-6 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-sm text-muted-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-8" />

            {/* Reviews */}
            <section id="reviews" ref={setSectionRef("reviews")}>
              <div className="flex items-baseline gap-2 mb-5">
                <h2 className="text-xl font-semibold tracking-tight">리뷰</h2>
                <span className="flex items-center gap-1 text-sm">
                  <Star className="size-4 fill-foreground text-foreground" />
                  <span className="font-semibold">{P.rating}</span>
                  <span className="text-muted-foreground">({P.reviewCount})</span>
                </span>
              </div>

              {/* Keyword chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {KEYWORDS.map((kw) => (
                  <span
                    key={kw.label}
                    className="rounded-full ring-1 ring-black/[0.08] px-3.5 py-1.5 text-sm"
                  >
                    {kw.label}
                    <span className="ml-1.5 text-muted-foreground">{kw.count}</span>
                  </span>
                ))}
              </div>

              {/* Review list */}
              <div>
                {REVIEWS.map((r, idx) => (
                  <div key={r.id}>
                    <div className="py-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {r.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.project} · {r.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {r.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {r.text}
                      </p>
                    </div>
                    {idx < REVIEWS.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

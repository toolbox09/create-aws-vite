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
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";
import { usePartnerDetailQuery, useFavoriteMutation } from "@/features/partner/api/queries";

/* ─── Types ─── */

const CERT_STYLES: Record<string, string> = {
  설계: "text-primary bg-primary/8",
  시공: "text-blue-600 bg-blue-500/8",
  감리: "text-emerald-600 bg-emerald-500/8",
};

/* ─── Page ─── */

const SECTION_TABS = [
  { id: "story", label: "브랜드 스토리" },
  { id: "portfolio", label: "포트폴리오" },
  { id: "credentials", label: "자격·인증" },
  { id: "company", label: "사무소 정보" },
  { id: "reviews", label: "리뷰" },
] as const;

type SectionId = (typeof SECTION_TABS)[number]["id"];

export default function PartnerDetailPage() {
  const { id } = useParams();
  const partnerId = Number(id) || 0;
  const { data, isPending, isError } = usePartnerDetailQuery(partnerId);
  const favMutation = useFavoriteMutation();

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

  useEffect(() => {
    const topOffset = 130;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id as SectionId);
        }
      },
      { rootMargin: `-${topOffset}px 0px -50% 0px`, threshold: 0 },
    );

    for (const tab of SECTION_TABS) {
      const el = sectionRefs.current[tab.id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [data]);

  function scrollToSection(sectionId: SectionId) {
    const el = sectionRefs.current[sectionId];
    if (!el) return;
    const topOffset = 130;
    const top = el.getBoundingClientRect().top + window.scrollY - topOffset;
    isClickScrolling.current = true;
    setActiveSection(sectionId);
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => { isClickScrolling.current = false; }, 800);
  }

  if (isPending) {
    return (
      <div className="min-h-svh bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-svh bg-background">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <p className="text-muted-foreground">파트너 정보를 불러올 수 없습니다</p>
          <Link to="/partners"><Button variant="outline" className="rounded-xl">목록으로 돌아가기</Button></Link>
        </div>
      </div>
    );
  }

  const P = data.partner;
  const liked = P.isFavorited === true;

  const COMPANY_INFO = [
    { icon: Building, label: "설립", value: `${P.foundedYear}년` },
    { icon: Users, label: "인력", value: P.employeeCount ? `${P.employeeCount}명` : "-" },
    { icon: MapPin, label: "소재지", value: P.address },
    { icon: Calendar, label: "업력", value: `${P.years}년` },
    { icon: Award, label: "대표", value: P.ceoName },
    { icon: Globe, label: "전문 용도", value: P.usages.map((u) => u.label).join(", ") },
  ];

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        <div className="flex gap-12 pt-8 pb-16">
          {/* ── Left column: sticky profile ── */}
          <div className="hidden lg:block w-[420px] shrink-0">
            <div className="sticky top-20">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                {P.coverImage ? (
                  <img src={P.coverImage} alt={P.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  {P.certs.map((c) => (
                    <span key={c.code} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${CERT_STYLES[c.label] ?? "bg-muted"}`}>
                      <Award className="size-3" />
                      {c.label}
                    </span>
                  ))}
                </div>
                <h1 className="text-[22px] font-semibold tracking-tight">{P.name}</h1>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  <span>{P.sido.label}</span>
                  <span className="opacity-30">·</span>
                  <span>업력 {P.years}년</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm">
                  <Star className="size-4 fill-foreground text-foreground" />
                  <span className="font-semibold">{P.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">· 리뷰 {P.reviewCount}개</span>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-[1.7]">{P.intro}</p>

              <div className="mt-4 flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:text-muted-foreground">
                  <Share className="size-4" />공유하기
                </button>
                <button
                  onClick={() => favMutation.mutate(partnerId)}
                  className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:text-muted-foreground"
                >
                  <Bookmark className={`size-4 ${liked ? "fill-foreground" : ""}`} />저장
                </button>
              </div>

              <div className="mt-6 rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  {P.profileImage ? (
                    <img src={P.profileImage} alt={P.ceoName} className="size-12 rounded-full object-cover" />
                  ) : (
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center font-semibold">{P.ceoName.charAt(0)}</div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{P.ceoName} 대표</p>
                    <p className="text-xs text-muted-foreground">{P.name}</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  {P.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{P.phone}</span>
                    </div>
                  )}
                  {P.websiteUrl && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="size-4 text-muted-foreground" />
                      <a href={P.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                        홈페이지 방문
                      </a>
                    </div>
                  )}
                </div>

                <Button className="w-full h-12 rounded-xl text-base font-semibold">
                  <MessageCircle className="size-4 mr-2" />1:1 문의
                </Button>
              </div>
            </div>
          </div>

          {/* ── Right column: scrolling content ── */}
          <div className="min-w-0 flex-1">
            <div ref={tabBarRef} className="sticky z-40 -mx-1 mb-6 bg-background/95 backdrop-blur-sm" style={{ top: "var(--header-height)" }}>
              <nav className="flex gap-0.5 overflow-x-auto scrollbar-none border-b border-black/[0.06] pb-0">
                {SECTION_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors ${activeSection === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab.label}
                    {activeSection === tab.id && <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-foreground" />}
                  </button>
                ))}
              </nav>
            </div>

            {/* ═══ Brand Story ═══ */}
            <section id="story" ref={setSectionRef("story")}>
              {data.brandStoryContent ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.brandStoryContent }} />
              ) : (
                <div className="py-10 text-center">
                  <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">Brand Story</p>
                  <blockquote className="text-2xl font-semibold tracking-tight leading-snug">"{P.intro}"</blockquote>
                  <p className="mt-3 text-sm text-muted-foreground">{P.name}의 이야기</p>
                </div>
              )}
            </section>

            <Separator className="my-8" />

            {/* ═══ Portfolio ═══ */}
            <section id="portfolio" ref={setSectionRef("portfolio")}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight">
                  포트폴리오
                  <span className="ml-2 text-base font-normal text-muted-foreground">{data.portfolios.length}건</span>
                </h2>
              </div>

              {data.portfolios.length > 0 ? (
                <div className="space-y-0">
                  {data.portfolios.map((pf, idx) => (
                    <div key={pf.id}>
                      <Link to={`/partners/${id}/portfolio/${pf.id}`} className="group flex gap-5 py-5">
                        <div className="w-[200px] shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                          {pf.thumbnail ? (
                            <img src={pf.thumbnail} alt={pf.title} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" loading="lazy" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <p className="text-base font-semibold tracking-tight group-hover:underline">{pf.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {pf.usage.label} · {pf.landArea ? `${pf.landArea}m²` : ""} · {pf.year}
                          </p>
                          {pf.description && (
                            <p className="mt-2 text-sm text-muted-foreground leading-[1.6] line-clamp-2">{pf.description}</p>
                          )}
                        </div>
                      </Link>
                      {idx < data.portfolios.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">등록된 포트폴리오가 없습니다</p>
              )}
            </section>

            <Separator className="my-8" />

            {/* ═══ Qualifications ═══ */}
            <section id="credentials" ref={setSectionRef("credentials")}>
              <div className="flex items-start gap-5 mb-6">
                {P.profileImage ? (
                  <img src={P.profileImage} alt={P.ceoName} className="size-14 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center font-semibold shrink-0">{P.ceoName.charAt(0)}</div>
                )}
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{P.ceoName} 대표의 자격 및 인증</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{P.name} · {P.foundedYear}년 설립 · 업력 {P.years}년</p>
                </div>
              </div>

              {data.qualifications.length > 0 ? (
                <div className="space-y-3.5">
                  {data.qualifications.map((q) => (
                    <div key={q.id} className="flex items-start gap-3">
                      <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">{q.label}</p>
                        {q.description && <p className="text-xs text-muted-foreground">{q.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">등록된 자격 정보가 없습니다</p>
              )}
            </section>

            <Separator className="my-8" />

            {/* ═══ Company Info ═══ */}
            <section id="company" ref={setSectionRef("company")}>
              <h2 className="text-xl font-semibold tracking-tight mb-5">사무소 정보</h2>
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

            {/* ═══ Reviews ═══ */}
            <section id="reviews" ref={setSectionRef("reviews")}>
              <div className="flex items-baseline gap-2 mb-5">
                <h2 className="text-xl font-semibold tracking-tight">리뷰</h2>
                <span className="flex items-center gap-1 text-sm">
                  <Star className="size-4 fill-foreground text-foreground" />
                  <span className="font-semibold">{P.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({P.reviewCount})</span>
                </span>
              </div>

              {data.reviewTagSummary.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {data.reviewTagSummary.map((kw) => (
                    <span key={kw.id} className="rounded-full ring-1 ring-black/[0.08] px-3.5 py-1.5 text-sm">
                      {kw.label}
                      <span className="ml-1.5 text-muted-foreground">{kw.count}</span>
                    </span>
                  ))}
                </div>
              )}

              {data.reviews.length > 0 ? (
                <div>
                  {data.reviews.map((r, idx) => (
                    <div key={r.id}>
                      <div className="py-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                            {r.author.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{r.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.portfolioTitle ? `${r.portfolioTitle} · ` : ""}{r.date}
                            </p>
                          </div>
                        </div>
                        {r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {r.tags.map((tag) => (
                              <span key={tag.code} className="rounded-full bg-muted px-2.5 py-1 text-xs">{tag.label}</span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                      </div>
                      {idx < data.reviews.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">등록된 리뷰가 없습니다</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

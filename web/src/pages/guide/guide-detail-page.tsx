import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SiteHeader from "@/components/layout/site-header";
import { Separator } from "@/components/ui/separator";

/* ─── Mock Data ─── */

const ARTICLES: Record<
  string,
  {
    title: string;
    category: string;
    date: string;
    views: number;
  }
> = {
  "1": {
    title: "건축주가 알아야 할 건축 프로세스 A to Z",
    category: "건축 절차",
    date: "2026.02.15",
    views: 1243,
  },
  "2": {
    title: "건폐율과 용적률, 쉽게 이해하기",
    category: "법규 기초",
    date: "2026.02.10",
    views: 2105,
  },
  "3": {
    title: "건축비용 산정 가이드: 평당 단가의 진실",
    category: "비용 이해",
    date: "2026.01.28",
    views: 3421,
  },
  "4": {
    title: "초보 건축주를 위한 필수 건축 용어 30선",
    category: "용어 사전",
    date: "2026.01.20",
    views: 1890,
  },
  "5": {
    title: "좋은 건축설계를 위한 건축주의 체크리스트",
    category: "설계 가이드",
    date: "2026.01.15",
    views: 987,
  },
  "6": {
    title: "건축허가 vs 건축신고, 차이점 완벽 정리",
    category: "인허가",
    date: "2026.01.08",
    views: 2567,
  },
};

const RELATED = [
  {
    id: 2,
    title: "건폐율과 용적률, 쉽게 이해하기",
    category: "법규 기초",
    thumbnail:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=340&fit=crop",
  },
  {
    id: 5,
    title: "좋은 건축설계를 위한 건축주의 체크리스트",
    category: "설계 가이드",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=340&fit=crop",
  },
];

/* ─── Page ─── */

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const article = ARTICLES[id ?? "1"] ?? ARTICLES["1"];

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link to="/guide/articles" className="hover:text-foreground transition-colors">
            건축 가이드
          </Link>
          <ChevronRight className="size-3.5" />
          <span>{article.category}</span>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {article.title}
          </span>
        </nav>

        {/* ── Article Header ── */}
        <div className="max-w-[768px] mx-auto mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
            {article.category}
          </span>
          <h1 className="text-2xl font-bold tracking-tight leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{article.date}</span>
            <span className="opacity-30">·</span>
            <span>조회 {article.views.toLocaleString()}</span>
          </div>
        </div>

        <Separator className="mb-10" />

        {/* ── Article Body ── */}
        <article className="max-w-[768px] mx-auto space-y-8 mb-16">
          <section className="space-y-4">
            <h2 className="text-xl font-bold">건축, 어디서부터 시작해야 할까?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              건축은 단순히 건물을 짓는 행위가 아닙니다. 토지 선정부터 설계,
              인허가, 시공, 감리, 준공까지 수많은 단계를 거치는 복합적인
              프로세스입니다. 초보 건축주에게는 이 전체 흐름을 이해하는 것이
              가장 중요합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">전체 건축 프로세스 개요</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              건축 프로세스는 크게 5단계로 나눌 수 있습니다. 각 단계에서
              건축주가 해야 할 일과 주의사항을 알아보겠습니다.
            </p>

            <div className="bg-primary/5 rounded-xl p-5 space-y-2">
              <p className="text-sm font-semibold text-primary">
                알아두면 좋은 정보
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                건축 프로세스 전체를 이해하면 각 단계에서 어떤 전문가와
                협업해야 하는지, 어떤 서류가 필요한지를 미리 준비할 수
                있습니다.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold">1단계: 토지 선정 및 매입</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              건축의 시작은 토지 선정입니다. 토지의 용도지역, 건폐율,
              용적률 등을 확인하고, 실제 건축이 가능한 땅인지 사전조사를
              진행해야 합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold">2단계: 설계 및 인허가</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              건축사를 선정하고 기본설계와 실시설계를 진행합니다. 설계가
              완료되면 관할 관청에 건축허가를 신청합니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground pl-2">
              <li>건축사 선정 및 계약</li>
              <li>기본설계 (평면, 입면, 배치)</li>
              <li>실시설계 (상세 도면, 구조계산)</li>
              <li>건축허가 신청 및 승인</li>
              <li>착공신고</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold">3단계: 시공</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              시공사를 선정하고 본격적인 공사를 진행합니다. 이 단계에서
              감리자의 역할이 매우 중요합니다. 설계도면대로 시공이
              이루어지는지 확인하고, 품질과 안전을 관리합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold">4단계: 준공 및 사용승인</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              공사가 완료되면 사용승인(준공검사)을 받아야 합니다. 이후
              건물의 보존등기를 하면 법적으로 건물의 소유권이 확정됩니다.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold">5단계: 입주 및 유지관리</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              준공 후 입주하게 되며, 이후 건물의 유지관리가 시작됩니다.
              하자 보수 기간(보통 1~3년)을 잘 활용하여 문제가 발생하면
              시공사에 보수를 요청할 수 있습니다.
            </p>
          </section>
        </article>

        <Separator className="mb-10" />

        {/* ── Related Guides ── */}
        <div className="max-w-[768px] mx-auto">
          <h2 className="text-lg font-bold mb-5">관련 가이드</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {RELATED.map((guide) => (
              <Link
                key={guide.id}
                to={`/guide/articles/${guide.id}`}
                className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm hover:shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={guide.thumbnail}
                    alt={guide.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {guide.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                    {guide.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

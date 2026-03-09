import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Bookmark,
  User,
  Lock,
  MapPin,
  Briefcase,
  FileText,
  Sparkles,
  Heart,
  Send,
  Handshake,
  BarChart3,
  Plus,
  Map,
  AlertTriangle,
  Check,
  UserMinus,
  Bell,
  Globe,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type MenuId =
  | "dashboard"
  | "projects"
  | "bids"
  | "saved-bids"
  | "saved-partners"
  | "personal"
  | "security"
  | "notifications"
  | "payment"
  | "preferences"
  | "withdraw";

interface NavItem {
  id: MenuId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

/* ─── Nav Config ─── */

const NAV_GROUPS: NavGroup[] = [
  {
    label: "활동",
    items: [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
      { id: "projects", label: "내 프로젝트", icon: FolderKanban },
      { id: "bids", label: "입찰 현황", icon: ClipboardList },
      { id: "saved-bids", label: "관심 공고", icon: Bookmark },
      { id: "saved-partners", label: "관심 건축사", icon: Heart },
    ],
  },
  {
    label: "설정",
    items: [
      { id: "personal", label: "개인정보", icon: User },
      { id: "security", label: "로그인 및 보안", icon: Lock },
      { id: "notifications", label: "알림", icon: Bell },
      { id: "payment", label: "결제 수단", icon: CreditCard },
      { id: "preferences", label: "환경 설정", icon: Globe },
      { id: "withdraw", label: "회원 탈퇴", icon: UserMinus },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

/* ─── Mock Data ─── */

type BidStatus = "입찰대기" | "입찰공고중" | "업체선정중" | "계약진행중" | "종료";

const BID_STATUS_DOT: Record<BidStatus, string> = {
  입찰대기: "bg-blue-500",
  입찰공고중: "bg-emerald-500",
  업체선정중: "bg-amber-500",
  계약진행중: "bg-violet-500",
  종료: "bg-muted-foreground/40",
};

const ACTIVITIES = [
  { id: 1, icon: Send, text: "아크 건축사사무소에서 새 제안을 보냈습니다", target: "판교 단독주택 설계", time: "2시간 전", link: "/bids/1" },
  { id: 2, icon: ClipboardList, text: "입찰 공고에 새 참여자가 있습니다", target: "판교 단독주택 설계", time: "5시간 전", link: "/bids/1" },
  { id: 3, icon: BarChart3, text: "AI 사업성 분석이 완료되었습니다", target: "역삼동 근린생활시설", time: "1일 전", link: "/analysis/ai/3" },
  { id: 4, icon: Handshake, text: "계약이 체결되었습니다", target: "서초 다세대주택 리모델링", time: "2일 전", link: "/contracts/1" },
];

const ACTIVE_BIDS = [
  { id: 1, title: "판교 단독주택 설계", status: "입찰공고중" as BidStatus, participants: 7, date: "2026.03.01" },
  { id: 2, title: "서초 다세대주택 리모델링", status: "입찰공고중" as BidStatus, participants: 4, date: "2026.02.28" },
  { id: 3, title: "강남 근생 빌딩 감리", status: "업체선정중" as BidStatus, participants: 12, date: "2026.02.15" },
];

const BID_LIST = [
  { id: 1, title: "판교 단독주택 설계", designType: "신축", region: "경기 성남시", usage: "단독주택", status: "입찰공고중" as BidStatus, participants: 7, date: "2026.03.01" },
  { id: 2, title: "서초 다세대주택 리모델링", designType: "리모델링", region: "서울 서초구", usage: "다세대주택", status: "입찰공고중" as BidStatus, participants: 4, date: "2026.02.28" },
  { id: 3, title: "강남 근생 빌딩 감리", designType: "신축", region: "서울 강남구", usage: "근린생활", status: "업체선정중" as BidStatus, participants: 12, date: "2026.02.15" },
  { id: 4, title: "마포 상가 인테리어", designType: "리모델링", region: "서울 마포구", usage: "근린생활", status: "종료" as BidStatus, participants: 9, date: "2026.02.10" },
  { id: 5, title: "용산 오피스텔 설계", designType: "신축", region: "서울 용산구", usage: "오피스텔", status: "종료" as BidStatus, participants: 15, date: "2026.01.20" },
  { id: 6, title: "분당 타운하우스 설계", designType: "신축", region: "경기 성남시", usage: "공동주택", status: "입찰공고중" as BidStatus, participants: 3, date: "2026.03.05" },
];

const SAVED_BIDS = [
  { id: 1, title: "송파 단독주택 신축", location: "서울 송파구", usage: "단독주택", status: "입찰공고중" as BidStatus, participants: 5 },
  { id: 2, title: "일산 상가주택 설계", location: "경기 고양시", usage: "상가주택", status: "입찰공고중" as BidStatus, participants: 8 },
  { id: 3, title: "강동 근생 리모델링", location: "서울 강동구", usage: "근린생활", status: "업체선정중" as BidStatus, participants: 12 },
  { id: 4, title: "위례 타운하우스", location: "경기 성남시", usage: "공동주택", status: "종료" as BidStatus, participants: 15 },
];

const SAVED_PARTNERS = [
  { id: 1, name: "아크 건축사사무소", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", region: "서울 강남구", fields: ["설계"], portfolioCount: 47, intro: "모던 건축을 전문으로 하는 사무소입니다." },
  { id: 2, name: "리움 디자인 건축", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", region: "서울 서초구", fields: ["설계", "감리"], portfolioCount: 32, intro: "친환경 설계를 지향하며 디자인 수상 경력을 보유하고 있습니다." },
  { id: 3, name: "도시공간 건축사사무소", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", region: "서울 마포구", fields: ["설계", "시공", "감리"], portfolioCount: 63, intro: "종합 설계부터 시공, 감리까지 원스톱 서비스를 제공합니다." },
];

const WITHDRAW_REASONS = [
  "사용 빈도가 낮아서",
  "원하는 서비스를 찾지 못해서",
  "다른 서비스를 이용하려고",
  "개인정보 보호를 위해",
  "기타",
];

/* ═══════════════════════════════════════════════
   Content: Dashboard (Cleaned up)
   ═══════════════════════════════════════════════ */

function DashboardContent() {
  return (
    <div>
      <h2 className="text-[32px] font-bold -tracking-tight">안녕하세요, 김건축님</h2>
      <p className="text-base text-muted-foreground mt-2 mb-10">오늘의 활동 현황을 확인하세요</p>

      {/* ── Overview Stats (simple inline) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/30 rounded-xl ring-1 ring-black/[0.08] overflow-hidden mb-10">
        {[
          { label: "진행중 프로젝트", value: "1", icon: Briefcase },
          { label: "진행중 입찰", value: "3", icon: FileText },
          { label: "진행중 계약", value: "1", icon: Handshake },
          { label: "AI 분석", value: "2", icon: BarChart3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-background p-5">
              <Icon className="size-5 text-muted-foreground mb-3" />
              <p className="text-2xl font-bold -tracking-tight tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link to="/bids/new">
          <Button variant="outline" className="h-10 rounded-xl gap-2 text-sm">
            <Plus className="size-4" />
            입찰 등록
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="h-10 rounded-xl gap-2 text-sm">
            <Map className="size-4" />
            토지 찾기
          </Button>
        </Link>
        <Link to="/analysis/ai">
          <Button variant="outline" className="h-10 rounded-xl gap-2 text-sm">
            <Sparkles className="size-4" />
            AI 분석
          </Button>
        </Link>
      </div>

      {/* ── Active Bids ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">진행중 입찰</h3>
          <Link to="/mypage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            모두 보기
          </Link>
        </div>
        <Separator className="mb-1" />
        {ACTIVE_BIDS.map((bid) => (
          <Link
            key={bid.id}
            to={`/bids/${bid.id}`}
            className="flex items-center justify-between py-4 hover:bg-muted/30 -mx-3 px-3 rounded-xl transition-colors"
          >
            <div>
              <p className="text-base font-medium">{bid.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{bid.participants}사 참여 · {bid.date}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <span className={`size-2 rounded-full ${BID_STATUS_DOT[bid.status]}`} />
              {bid.status}
            </div>
          </Link>
        ))}
      </section>

      {/* ── Activity ── */}
      <section>
        <h3 className="text-lg font-semibold mb-2">최근 활동</h3>
        <Separator className="mb-1" />
        {ACTIVITIES.map((activity) => {
          const Icon = activity.icon;
          return (
            <Link
              key={activity.id}
              to={activity.link}
              className="flex items-center gap-4 py-4 hover:bg-muted/30 -mx-3 px-3 rounded-xl transition-colors"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted shrink-0">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.text}</p>
                <p className="text-sm text-primary font-medium mt-0.5 truncate">{activity.target}</p>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{activity.time}</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Projects
   ═══════════════════════════════════════════════ */

type ProjectStatus = "진행중" | "완료" | "대기";

const PROJECT_STATUS_DOT: Record<ProjectStatus, string> = {
  진행중: "bg-emerald-500",
  완료: "bg-muted-foreground/40",
  대기: "bg-amber-500",
};

const MY_PROJECTS = [
  { id: 1, title: "판교 단독주택 신축", partner: "아크 건축사사무소", status: "진행중" as ProjectStatus, phase: "설계 진행", progress: 45, startDate: "2026.01.15", region: "경기 성남시" },
  { id: 2, title: "서초 다세대주택 리모델링", partner: "리움 디자인 건축", status: "진행중" as ProjectStatus, phase: "인허가", progress: 70, startDate: "2025.11.20", region: "서울 서초구" },
  { id: 3, title: "강남 근생 빌딩 신축", partner: "도시공간 건축사사무소", status: "대기" as ProjectStatus, phase: "계약 완료", progress: 10, startDate: "2026.03.01", region: "서울 강남구" },
  { id: 4, title: "마포 상가 인테리어", partner: "아크 건축사사무소", status: "완료" as ProjectStatus, phase: "완료", progress: 100, startDate: "2025.06.10", region: "서울 마포구" },
];

function ProjectsContent() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");

  const filtered = MY_PROJECTS.filter((p) => {
    if (statusFilter === "active") return p.status !== "완료";
    if (statusFilter === "completed") return p.status === "완료";
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[32px] font-bold -tracking-tight">내 프로젝트</h2>
      </div>

      <div className="flex items-center gap-1 mb-6">
        {[
          { value: "all" as const, label: "전체" },
          { value: "active" as const, label: "진행중" },
          { value: "completed" as const, label: "완료" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === f.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Separator className="mb-1" />

      {filtered.length > 0 ? filtered.map((project) => (
        <Link
          key={project.id}
          to={`/projects/${project.id}`}
          className="flex items-center gap-4 py-5 border-b border-border/30 last:border-b-0 hover:bg-muted/30 -mx-3 px-3 rounded-xl transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-base font-medium truncate">{project.title}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`size-2 rounded-full ${PROJECT_STATUS_DOT[project.status]}`} />
                <span className="text-xs text-muted-foreground">{project.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{project.partner}</span>
              <span>·</span>
              <span>{project.region}</span>
              <span>·</span>
              <span>{project.phase}</span>
            </div>
            {/* Progress bar */}
            {project.status !== "완료" && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{project.progress}%</span>
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground shrink-0">{project.startDate}</span>
        </Link>
      )) : (
        <div className="py-16 text-center">
          <FolderKanban className="size-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">프로젝트가 없습니다</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Bids
   ═══════════════════════════════════════════════ */

function BidsContent() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");

  const filtered = BID_LIST.filter((bid) => {
    if (statusFilter === "active") return bid.status !== "종료";
    if (statusFilter === "closed") return bid.status === "종료";
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[32px] font-bold -tracking-tight">입찰 현황</h2>
        <Link to="/bids/new">
          <Button className="h-10 rounded-xl gap-2 text-sm">
            <Plus className="size-4" />
            입찰 등록
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-1 mb-6">
        {[
          { value: "all" as const, label: "전체" },
          { value: "active" as const, label: "진행중" },
          { value: "closed" as const, label: "종료" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === f.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Separator className="mb-1" />

      {filtered.length > 0 ? filtered.map((bid) => (
        <Link
          key={bid.id}
          to={`/bids/${bid.id}`}
          className="flex items-center gap-4 py-5 border-b border-border/30 last:border-b-0 hover:bg-muted/30 -mx-3 px-3 rounded-xl transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-base font-medium">{bid.title}</p>
              <Badge variant="secondary" className="text-xs rounded-md">{bid.designType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {bid.region} · {bid.usage} · {bid.participants}사 참여
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="inline-flex items-center gap-2 text-sm">
              <span className={`size-2 rounded-full ${BID_STATUS_DOT[bid.status]}`} />
              {bid.status}
            </span>
            <span className="text-sm text-muted-foreground">{bid.date}</span>
          </div>
        </Link>
      )) : (
        <div className="py-20 text-center">
          <p className="text-base text-muted-foreground mb-4">해당 상태의 입찰이 없습니다</p>
          <Link to="/bids/new">
            <Button className="rounded-xl text-sm">입찰 공고 등록하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Saved Bids
   ═══════════════════════════════════════════════ */

function SavedBidsContent() {
  const [hideEnded, setHideEnded] = useState(false);
  const [savedIds, setSavedIds] = useState(SAVED_BIDS.map((b) => b.id));

  const visible = SAVED_BIDS.filter((b) => {
    if (!savedIds.includes(b.id)) return false;
    if (hideEnded && b.status === "종료") return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[32px] font-bold -tracking-tight">관심 공고</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" checked={hideEnded} onChange={(e) => setHideEnded(e.target.checked)} className="rounded" />
          마감 숨기기
        </label>
      </div>
      <Separator className="mb-1" />

      {visible.length > 0 ? visible.map((bid) => (
        <div key={bid.id} className="flex items-center gap-4 py-5 border-b border-border/30 last:border-b-0 hover:bg-muted/30 -mx-3 px-3 rounded-xl transition-colors">
          <button
            onClick={() => setSavedIds((prev) => prev.filter((x) => x !== bid.id))}
            className="shrink-0 text-primary hover:text-primary/70 transition-colors"
            aria-label="관심 해제"
          >
            <Heart className="size-5 fill-current" />
          </button>
          <Link to={`/bids/${bid.id}`} className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-base font-medium">{bid.title}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className={`size-2 rounded-full ${BID_STATUS_DOT[bid.status]}`} />
                {bid.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              <MapPin className="size-3.5 inline mr-1 -mt-px" />
              {bid.location} · {bid.usage} · {bid.participants}사 참여
            </p>
          </Link>
        </div>
      )) : (
        <div className="py-20 text-center">
          <p className="text-base text-muted-foreground mb-4">관심 등록한 공고가 없습니다</p>
          <Link to="/bids"><Button className="rounded-xl text-sm">공고 둘러보기</Button></Link>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Saved Partners
   ═══════════════════════════════════════════════ */

function SavedPartnersContent() {
  const [savedIds, setSavedIds] = useState(SAVED_PARTNERS.map((p) => p.id));
  const visible = SAVED_PARTNERS.filter((p) => savedIds.includes(p.id));

  return (
    <div>
      <h2 className="text-[32px] font-bold -tracking-tight mb-8">관심 건축사</h2>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visible.map((partner) => (
            <div key={partner.id} className="rounded-xl ring-1 ring-black/[0.08] overflow-hidden hover:shadow-sm hover:-translate-y-0.5 transition-all">
              <Link to={`/partners/${partner.id}`} className="block">
                <div className="aspect-[3/2] overflow-hidden">
                  <img src={partner.image} alt={partner.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" loading="lazy" />
                </div>
              </Link>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{partner.region} · 포트폴리오 {partner.portfolioCount}건</p>
                  </div>
                  <button onClick={() => setSavedIds((prev) => prev.filter((x) => x !== partner.id))} className="shrink-0 text-primary hover:text-primary/70 transition-colors" aria-label="관심 해제">
                    <Heart className="size-5 fill-current" />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {partner.fields.map((f) => (
                    <span key={f} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-base text-muted-foreground mb-4">관심 등록한 건축사가 없습니다</p>
          <Link to="/partners"><Button className="rounded-xl text-sm">건축사 찾기</Button></Link>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Personal Info
   ═══════════════════════════════════════════════ */

function PersonalContent() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-[32px] font-bold -tracking-tight">개인정보</h2>
        <span className="text-sm text-muted-foreground bg-muted rounded-full px-3 py-1">수정</span>
      </div>

      {/* Profile card */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        <div className="flex flex-col items-center rounded-xl ring-1 ring-black/[0.08] px-10 py-8 shrink-0">
          <div className="size-24 rounded-full bg-foreground flex items-center justify-center text-background text-3xl font-bold mb-4">김</div>
          <p className="text-xl font-semibold">김건축</p>
          <p className="text-sm text-muted-foreground mt-1">건축주</p>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">프로필 작성 완료하기</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              프로필은 입찰 공고 등록 시 건축사에게 신뢰를 줄 수 있는 중요한 역할을 합니다.
              다른 파트너에게 나를 알릴 수 있도록 프로필 작성을 완료해 주세요.
            </p>
          </div>
          <Button className="rounded-xl text-sm h-10">시작하기</Button>
        </div>
      </div>

      <Separator className="mb-1" />

      {[
        { label: "이름", value: "김건축" },
        { label: "이메일", value: "kim@example.com" },
        { label: "휴대폰", value: "010-1234-5678" },
        { label: "회원 유형", value: "건축주 개인" },
        { label: "소셜 로그인", value: "연동 없음" },
        { label: "가입일", value: "2025년 1월 15일" },
      ].map((field) => (
        <div key={field.label} className="flex items-center justify-between py-5 border-b border-border/30 last:border-b-0">
          <div>
            <p className="text-sm text-muted-foreground">{field.label}</p>
            <p className="text-base mt-0.5">{field.value}</p>
          </div>
          <button className="text-sm font-semibold underline underline-offset-4 text-foreground hover:text-muted-foreground transition-colors">수정</button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Security
   ═══════════════════════════════════════════════ */

function SecurityContent() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const pwValid = newPw.length >= 8 && /[a-zA-Z]/.test(newPw) && /[0-9]/.test(newPw) && /[^a-zA-Z0-9]/.test(newPw);
  const pwMatch = newPw === confirmPw && confirmPw.length > 0;
  const canSubmit = currentPw.length > 0 && pwValid && pwMatch;

  return (
    <div>
      <h2 className="text-[32px] font-bold -tracking-tight mb-8">로그인 및 보안</h2>

      <div className="pb-8 border-b border-border/30">
        <h3 className="text-lg font-semibold mb-1">비밀번호</h3>
        <p className="text-sm text-muted-foreground mb-8">마지막 변경: 2025년 1월 15일</p>
        <div className="space-y-5 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">현재 비밀번호</label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="현재 비밀번호 입력" className="h-12 rounded-xl text-base" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">새 비밀번호</label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="새 비밀번호 입력" className="h-12 rounded-xl text-base" />
            {newPw.length > 0 && !pwValid && <p className="text-sm text-destructive mt-2">8자 이상, 영문·숫자·특수문자 포함</p>}
            {newPw.length > 0 && pwValid && <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2"><Check className="size-4" /> 사용 가능한 비밀번호</p>}
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">새 비밀번호 확인</label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="새 비밀번호 다시 입력" className="h-12 rounded-xl text-base" />
            {confirmPw.length > 0 && !pwMatch && <p className="text-sm text-destructive mt-2">비밀번호가 일치하지 않습니다</p>}
          </div>
          <Button className="h-12 rounded-xl text-sm w-full" disabled={!canSubmit}>비밀번호 변경</Button>
        </div>
      </div>

      <div className="flex items-center justify-between py-6 border-b border-border/30">
        <div>
          <p className="text-base">2단계 인증</p>
          <p className="text-sm text-muted-foreground mt-0.5">사용 안함</p>
        </div>
        <button className="text-sm font-semibold underline underline-offset-4 text-foreground hover:text-muted-foreground transition-colors">설정</button>
      </div>
      <div className="flex items-center justify-between py-6">
        <div>
          <p className="text-base">로그인 기기</p>
          <p className="text-sm text-muted-foreground mt-0.5">1대 로그인 중</p>
        </div>
        <button className="text-sm font-semibold underline underline-offset-4 text-foreground hover:text-muted-foreground transition-colors">관리</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Notifications
   ═══════════════════════════════════════════════ */

function NotificationsContent() {
  const [emailBid, setEmailBid] = useState(true);
  const [emailProposal, setEmailProposal] = useState(true);
  const [emailContract, setEmailContract] = useState(false);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [pushBid, setPushBid] = useState(true);
  const [pushProposal, setPushProposal] = useState(true);
  const [pushChat, setPushChat] = useState(true);

  function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-foreground" : "bg-muted"}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    );
  }

  return (
    <div>
      <h2 className="text-[32px] font-bold -tracking-tight mb-2">알림</h2>
      <p className="text-base text-muted-foreground mb-8">알림 수신 방법과 항목을 설정합니다</p>

      {/* Email */}
      <h3 className="text-lg font-semibold mb-2">이메일 알림</h3>
      <Separator className="mb-1" />
      {[
        { label: "입찰 현황 알림", desc: "입찰 공고의 상태 변경, 마감 임박 알림", checked: emailBid, onChange: setEmailBid },
        { label: "제안서 알림", desc: "새 제안서 수신, 제안서 상태 변경 알림", checked: emailProposal, onChange: setEmailProposal },
        { label: "계약 알림", desc: "계약 체결, 진행 상황 알림", checked: emailContract, onChange: setEmailContract },
        { label: "마케팅 및 소식", desc: "신규 기능, 이벤트, 뉴스레터", checked: emailMarketing, onChange: setEmailMarketing },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between py-5 border-b border-border/30 last:border-b-0">
          <div>
            <p className="text-base">{item.label}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
          <Toggle checked={item.checked} onChange={item.onChange} />
        </div>
      ))}

      {/* Push */}
      <h3 className="text-lg font-semibold mt-10 mb-2">푸시 알림</h3>
      <Separator className="mb-1" />
      {[
        { label: "입찰 알림", desc: "새 참여자, 상태 변경 푸시 알림", checked: pushBid, onChange: setPushBid },
        { label: "제안서 알림", desc: "새 제안서 수신 푸시 알림", checked: pushProposal, onChange: setPushProposal },
        { label: "채팅 메시지", desc: "새 채팅 메시지 수신 푸시 알림", checked: pushChat, onChange: setPushChat },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between py-5 border-b border-border/30 last:border-b-0">
          <div>
            <p className="text-base">{item.label}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
          <Toggle checked={item.checked} onChange={item.onChange} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Payment
   ═══════════════════════════════════════════════ */

function PaymentContent() {
  return (
    <div>
      <h2 className="text-[32px] font-bold -tracking-tight mb-2">결제 수단</h2>
      <p className="text-base text-muted-foreground mb-8">결제 수단을 등록하고 관리합니다</p>

      <Separator className="mb-1" />

      {/* Empty state */}
      <div className="py-16 text-center">
        <CreditCard className="size-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-base text-muted-foreground mb-1">등록된 결제 수단이 없습니다</p>
        <p className="text-sm text-muted-foreground mb-6">계약 진행 시 사용할 결제 수단을 등록해 주세요</p>
        <Button className="rounded-xl text-sm h-10">결제 수단 추가</Button>
      </div>

      <Separator className="mb-6" />

      <h3 className="text-lg font-semibold mb-2">결제 내역</h3>
      <Separator className="mb-1" />
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">결제 내역이 없습니다</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Preferences
   ═══════════════════════════════════════════════ */

function PreferencesContent() {
  return (
    <div>
      <h2 className="text-[32px] font-bold -tracking-tight mb-2">환경 설정</h2>
      <p className="text-base text-muted-foreground mb-8">서비스 이용 환경을 설정합니다</p>

      <Separator className="mb-1" />

      {[
        { label: "언어", value: "한국어" },
        { label: "지역", value: "대한민국" },
        { label: "통화", value: "KRW (₩)" },
        { label: "면적 단위", value: "m² (제곱미터)" },
        { label: "테마", value: "시스템 설정에 따름" },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between py-5 border-b border-border/30 last:border-b-0">
          <div>
            <p className="text-base">{item.label}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{item.value}</p>
          </div>
          <button className="text-sm font-semibold underline underline-offset-4 text-foreground hover:text-muted-foreground transition-colors">변경</button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content: Withdraw
   ═══════════════════════════════════════════════ */

function WithdrawContent() {
  const [agreed, setAgreed] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  return (
    <div>
      <h2 className="text-[32px] font-bold -tracking-tight mb-8">회원 탈퇴</h2>

      <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200/50 p-6 mb-10">
        <div className="flex items-start gap-4">
          <AlertTriangle className="size-6 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-amber-900 mb-3">탈퇴 시 유의사항</h3>
            <ul className="space-y-2 text-sm text-amber-800 leading-relaxed">
              <li>· 탈퇴 즉시 모든 개인정보가 파기됩니다.</li>
              <li>· 작성한 공고, 제안, 프로젝트 등의 데이터는 복구할 수 없습니다.</li>
              <li>· 진행중인 계약이 있는 경우 탈퇴가 제한될 수 있습니다.</li>
              <li>· 법적 의무 보관 항목은 비식별 처리 후 보관됩니다.</li>
              <li>· 동일 이메일로 재가입이 제한될 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">
        탈퇴 사유 <span className="text-muted-foreground font-normal text-sm">(선택)</span>
      </h3>
      <div className="space-y-2 mb-8">
        {WITHDRAW_REASONS.map((r) => (
          <label key={r} className={`flex items-center gap-3 rounded-xl px-5 py-4 cursor-pointer transition-all ${reason === r ? "bg-muted ring-1 ring-black/[0.08]" : "hover:bg-muted/50"}`}>
            <input type="radio" name="withdraw-reason" value={r} checked={reason === r} onChange={(e) => setReason(e.target.value)} className="rounded-full" />
            <span className="text-sm">{r}</span>
          </label>
        ))}
      </div>
      {reason === "기타" && (
        <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} maxLength={500} placeholder="사유를 입력해주세요" className="mb-8 w-full rounded-xl border border-input bg-background px-5 py-4 text-sm resize-none h-28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      )}

      <label className="flex items-start gap-3 cursor-pointer select-none mb-8">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="rounded mt-0.5" />
        <span className="text-sm leading-relaxed">위 유의사항을 모두 확인하였으며, 회원 탈퇴에 동의합니다.</span>
      </label>

      <Button variant="destructive" className="h-12 rounded-xl w-full sm:w-auto sm:px-12 text-sm" disabled={!agreed}>탈퇴하기</Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════ */

export default function MyPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as MenuId | null;
  const [activeMenu, setActiveMenu] = useState<MenuId>(tabParam && ALL_NAV_ITEMS.some((i) => i.id === tabParam) ? tabParam : "dashboard");

  useEffect(() => {
    if (tabParam && ALL_NAV_ITEMS.some((i) => i.id === tabParam)) {
      setActiveMenu(tabParam);
    }
  }, [tabParam]);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard": return <DashboardContent />;
      case "projects": return <ProjectsContent />;
      case "bids": return <BidsContent />;
      case "saved-bids": return <SavedBidsContent />;
      case "saved-partners": return <SavedPartnersContent />;
      case "personal": return <PersonalContent />;
      case "security": return <SecurityContent />;
      case "notifications": return <NotificationsContent />;
      case "payment": return <PaymentContent />;
      case "preferences": return <PreferencesContent />;
      case "withdraw": return <WithdrawContent />;
    }
  };

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        <div className="flex gap-0 min-h-[calc(100svh-64px)]">
          {/* ── Left Sidebar ── */}
          <aside className="hidden md:block w-[280px] shrink-0 pr-12 pt-12">
            <h1 className="text-[32px] font-bold -tracking-tight mb-8">프로필</h1>

            <nav className="space-y-6">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeMenu === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveMenu(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                            isActive
                              ? "bg-muted font-semibold text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <Icon className="size-5 shrink-0" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* ── Mobile Nav ── */}
          <div className="md:hidden w-full pt-6 pb-2">
            <h1 className="text-2xl font-bold -tracking-tight mb-4">프로필</h1>
            <div className="flex gap-1 overflow-x-auto pb-3 -mx-2 px-2">
              {ALL_NAV_ITEMS.map((item) => {
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <Separator />
          </div>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0 pt-12 pb-20 md:border-l md:border-border/30 md:pl-12">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

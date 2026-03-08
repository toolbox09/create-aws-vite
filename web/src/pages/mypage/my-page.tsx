import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Bookmark,
  Users,
  User,
  Lock,
  UserX,
  MapPin,
  ChevronDown,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/mock-auth";

/* ─── Types ─── */

type MenuId =
  | "dashboard"
  | "bids"
  | "saved-bids"
  | "saved-partners"
  | "account"
  | "password"
  | "withdraw";

interface MenuItem {
  id: MenuId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

/* ─── Menu Config ─── */

const MENU_GROUPS: MenuGroup[] = [
  {
    label: "활동",
    items: [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
      { id: "bids", label: "입찰 현황", icon: ClipboardList },
      { id: "saved-bids", label: "관심 공고", icon: Bookmark },
      { id: "saved-partners", label: "관심 건축사", icon: Users },
    ],
  },
  {
    label: "계정",
    items: [
      { id: "account", label: "계정 정보", icon: User },
      { id: "password", label: "비밀번호 변경", icon: Lock },
    ],
  },
  {
    label: "기타",
    items: [{ id: "withdraw", label: "회원 탈퇴", icon: UserX }],
  },
];

/* ─── Mock Data ─── */

const SUMMARY_STATS = [
  { label: "진행중 입찰", value: "3건" },
  { label: "받은 제안", value: "12건" },
  { label: "관심 공고", value: "5건" },
  { label: "진행중 프로젝트", value: "1건" },
];

type BidStatus = "입찰중" | "심사중" | "마감";

const BID_STATUS_STYLE: Record<BidStatus, string> = {
  입찰중: "bg-emerald-500",
  심사중: "bg-amber-500",
  마감: "bg-muted-foreground/40",
};

const RECENT_BIDS = [
  { id: 1, title: "판교 단독주택 설계", status: "입찰중" as BidStatus, participants: 7, deadline: "2026.03.20" },
  { id: 2, title: "서초 다세대주택 리모델링", status: "입찰중" as BidStatus, participants: 4, deadline: "2026.03.25" },
  { id: 3, title: "강남 근생 빌딩 감리", status: "심사중" as BidStatus, participants: 12, deadline: "2026.03.10" },
  { id: 4, title: "마포 상가 인테리어", status: "마감" as BidStatus, participants: 9, deadline: "2026.02.28" },
];

const NOTIFICATIONS = [
  { id: 1, text: "아크 건축사사무소에서 새 제안을 보냈습니다.", time: "2시간 전", unread: true },
  { id: 2, text: "입찰 공고 '판교 단독주택 설계'에 새 참여자가 있습니다.", time: "5시간 전", unread: true },
  { id: 3, text: "서초 다세대주택 리모델링 입찰이 곧 마감됩니다.", time: "1일 전", unread: false },
  { id: 4, text: "강남 근생 빌딩 감리 심사가 완료되었습니다.", time: "2일 전", unread: false },
];

const BID_LIST = [
  { id: 1, title: "판교 단독주택 설계", region: "경기 성남시", usage: "단독주택", status: "입찰중" as BidStatus, participants: 7, date: "2026.03.01" },
  { id: 2, title: "서초 다세대주택 리모델링", region: "서울 서초구", usage: "다세대주택", status: "입찰중" as BidStatus, participants: 4, date: "2026.02.28" },
  { id: 3, title: "강남 근생 빌딩 감리", region: "서울 강남구", usage: "근린생활", status: "심사중" as BidStatus, participants: 12, date: "2026.02.15" },
  { id: 4, title: "마포 상가 인테리어", region: "서울 마포구", usage: "근린생활", status: "마감" as BidStatus, participants: 9, date: "2026.02.10" },
  { id: 5, title: "용산 오피스텔 설계", region: "서울 용산구", usage: "오피스텔", status: "마감" as BidStatus, participants: 15, date: "2026.01.20" },
  { id: 6, title: "분당 타운하우스 설계", region: "경기 성남시", usage: "공동주택", status: "입찰중" as BidStatus, participants: 3, date: "2026.03.05" },
];

const SAVED_BIDS = [
  { id: 1, title: "송파 단독주택 신축", location: "서울 송파구", status: "입찰중" as BidStatus },
  { id: 2, title: "일산 상가주택 설계", location: "경기 고양시", status: "입찰중" as BidStatus },
  { id: 3, title: "강동 근생 리모델링", location: "서울 강동구", status: "심사중" as BidStatus },
  { id: 4, title: "위례 타운하우스", location: "경기 성남시", status: "마감" as BidStatus },
  { id: 5, title: "하남 단독주택 설계", location: "경기 하남시", status: "입찰중" as BidStatus },
  { id: 6, title: "과천 공동주택 감리", location: "경기 과천시", status: "심사중" as BidStatus },
];

/* ─── Content Components ─── */

function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">안녕하세요, 김건축님</h2>
        <p className="text-sm text-muted-foreground mt-0.5">오늘의 활동 현황입니다</p>
      </div>

      {/* Inline stat bar — compressed, no cards */}
      <div className="flex items-center divide-x divide-border/60">
        {SUMMARY_STATS.map(({ label, value }) => (
          <div key={label} className="flex-1 px-5 first:pl-0 last:pr-0">
            <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent bids table */}
      <section>
        <h3 className="text-sm font-semibold tracking-tight mb-3">최근 입찰 현황</h3>
        <div className="border border-border/60 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border/60">
                <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">공고명</th>
                <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">상태</th>
                <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium text-center">참여수</th>
                <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium text-right">마감일</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_BIDS.map((bid) => (
                <tr
                  key={bid.id}
                  className="group border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="relative px-4 py-2.5 font-medium">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[2px] rounded-full bg-foreground opacity-0 group-hover:h-5 group-hover:opacity-100 transition-all" />
                    {bid.title}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <span className={`size-1.5 rounded-full ${BID_STATUS_STYLE[bid.status]}`} />
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-muted-foreground tabular-nums">{bid.participants}사</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{bid.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notifications — simple list */}
      <section>
        <h3 className="text-sm font-semibold tracking-tight mb-3">최근 알림</h3>
        <div className="space-y-0 border border-border/60 rounded-lg overflow-hidden divide-y divide-border/40">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              {n.unread && (
                <span className="mt-1.5 size-1.5 rounded-full bg-blue-500 shrink-0" />
              )}
              {!n.unread && <span className="mt-1.5 size-1.5 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-relaxed ${n.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {n.text}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BidsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight">입찰 현황</h2>
      <div className="border border-border/60 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border/60">
              <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">공고명</th>
              <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">지역</th>
              <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">용도</th>
              <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">상태</th>
              <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium text-center">참여수</th>
              <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium text-right">등록일</th>
            </tr>
          </thead>
          <tbody>
            {BID_LIST.map((bid) => (
              <tr
                key={bid.id}
                className="group border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="relative px-4 py-2.5 font-medium">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[2px] rounded-full bg-foreground opacity-0 group-hover:h-5 group-hover:opacity-100 transition-all" />
                  {bid.title}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{bid.region}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{bid.usage}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className={`size-1.5 rounded-full ${BID_STATUS_STYLE[bid.status]}`} />
                    {bid.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center text-muted-foreground tabular-nums">{bid.participants}사</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{bid.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SavedBidsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight">관심 공고</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SAVED_BIDS.map((bid) => (
          <div
            key={bid.id}
            className="group border border-border/60 rounded-lg p-4 space-y-2.5 hover:border-border transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`size-1.5 rounded-full ${BID_STATUS_STYLE[bid.status]}`} />
                {bid.status}
              </span>
              {/* Corner bookmark indicator */}
              <span className="size-0 border-t-[10px] border-r-[10px] border-t-primary border-r-transparent opacity-60" />
            </div>
            <h3 className="text-sm font-medium">{bid.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" />
              {bid.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight">계정 정보</h2>
      <div className="space-y-6">
        <div className="border border-border/60 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider">기본정보</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "이름", value: "김건축" },
              { label: "이메일", value: "kim@example.com" },
              { label: "휴대폰", value: "010-1234-5678" },
              { label: "가입일", value: "2025년 1월 15일" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border/60 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider">회원 유형</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">유형</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">건축주 개인</p>
                <Badge variant="secondary" className="text-[10px]">인증완료</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 border border-border/60 rounded-lg">
      <p className="text-muted-foreground text-sm">{title} 페이지 준비 중입니다.</p>
    </div>
  );
}

/* ─── Sidebar ─── */

function Sidebar({
  activeMenu,
  onMenuChange,
}: {
  activeMenu: MenuId;
  onMenuChange: (id: MenuId) => void;
}) {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full">
      {/* Branding */}
      <div className="px-4 py-4">
        <Link to="/" className="text-sm font-bold tracking-tight text-foreground">
          콘마켓 <span className="font-medium text-muted-foreground">내 프로젝트</span>
        </Link>
      </div>

      {/* Profile — minimal */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-semibold shrink-0">
            {user?.name.charAt(0) ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "사용자"}</p>
            <p className="text-[11px] text-muted-foreground truncate">건축주 개인</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-4 overflow-y-auto">
        {MENU_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wider px-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onMenuChange(item.id)}
                    className={`group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                      isActive
                        ? "text-foreground font-medium bg-muted/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-foreground" />
                    )}
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

/* ─── Mobile Sidebar (dropdown selector) ─── */

function MobileSidebar({
  activeMenu,
  onMenuChange,
}: {
  activeMenu: MenuId;
  onMenuChange: (id: MenuId) => void;
}) {
  const [open, setOpen] = useState(false);
  const allItems = MENU_GROUPS.flatMap((g) => g.items);
  const activeItem = allItems.find((item) => item.id === activeMenu);
  const ActiveIcon = activeItem?.icon ?? LayoutDashboard;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-border/60 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <ActiveIcon className="size-4" />
          {activeItem?.label ?? "대시보드"}
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-border/60 bg-background shadow-lg p-1.5 max-h-80 overflow-y-auto">
          {MENU_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wider px-3 py-1.5">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onMenuChange(item.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                      isActive
                        ? "text-foreground font-medium bg-muted/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuId>("dashboard");
  const { logout } = useAuthStore();

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;
      case "bids":
        return <BidsContent />;
      case "saved-bids":
        return <SavedBidsContent />;
      case "account":
        return <AccountContent />;
      case "saved-partners":
        return <PlaceholderContent title="관심 건축사" />;
      case "password":
        return <PlaceholderContent title="비밀번호 변경" />;
      case "withdraw":
        return <PlaceholderContent title="회원 탈퇴" />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar — full height, border-only separation */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-border/60 sticky top-0 h-screen">
        <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar — compact, admin-style */}
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-sm px-6">
          {/* Mobile: branding */}
          <Link to="/" className="md:hidden text-sm font-bold tracking-tight text-foreground">
            콘마켓
          </Link>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              서비스 홈
              <ExternalLink className="size-3" />
            </Link>
            <span className="h-3 w-px bg-border" />
            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="size-3" />
              로그아웃
            </button>
          </div>
        </header>

        {/* Mobile sidebar selector */}
        <div className="md:hidden px-4 pt-4">
          <MobileSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        </div>

        {/* Content area */}
        <main className="flex-1 min-w-0 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

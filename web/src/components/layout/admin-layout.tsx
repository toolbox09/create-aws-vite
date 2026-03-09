import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Building2,
  Users,
  FileText,
  Headphones,
  LogOut,
  ExternalLink,
} from "lucide-react";

const MENU_ITEMS = [
  { label: "라이센스 심사", icon: Shield, path: "/admin/license" },
  { label: "사업자변경 심사", icon: Building2, path: "/admin/business-change" },
  { label: "회원 관리", icon: Users, path: "/admin/members" },
  { label: "콘텐츠 관리", icon: FileText, path: "/admin/content" },
  { label: "고객 지원", icon: Headphones, path: "/admin/support" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — same background as content, border-only separation */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border/60">
        <div className="px-4 py-4">
          <Link to="/admin/license" className="text-sm font-bold tracking-tight text-foreground">
            콘마켓 <span className="font-medium text-muted-foreground">관리자</span>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-1 space-y-0.5">
          {MENU_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? "text-foreground font-medium bg-muted/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-foreground" />
                )}
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar — minimal */}
        <header className="sticky top-0 z-30 flex h-10 items-center justify-end gap-3 border-b border-border/60 bg-background/80 backdrop-blur-sm px-6">
          <span className="text-xs text-muted-foreground">관리자</span>
          <span className="h-3 w-px bg-border" />
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            서비스 홈
            <ExternalLink className="size-3" />
          </Link>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="size-3" />
            로그아웃
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

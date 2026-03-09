import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/mock-auth";

const navItems = [
  { href: "/map", label: "지도" },
  { href: "/partners", label: "건축사 찾기" },
  { href: "/bids", label: "입찰공고" },
  { href: "/projects", label: "내 프로젝트", authOnly: true },
];

export default function SiteHeader() {
  const { pathname } = useLocation();
  const { isLoggedIn, user, logout, toggleLogin } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-xs" style={{ height: "var(--header-height)" }}>
      <div className="flex h-full items-center justify-between" style={{ padding: "0 var(--page-px)" }}>
        {/* Left — Logo + Nav (left-aligned, Linear/GitHub style) */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.svg" alt="콘마켓" className="h-7" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems
              .filter((item) => !item.authOnly || isLoggedIn)
              .map(({ href, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    pathname === href || pathname === href.split("?")[0] || pathname.startsWith(href.split("?")[0] + "/")
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              ))}
          </nav>
        </div>

        {/* Right — Utilities */}
        <div className="flex items-center gap-1">
          {isLoggedIn && (
            <>
              <Link
                to="/notifications"
                className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
              </Link>
              <Link
                to="/chat"
                className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageSquare className="size-[18px]" />
              </Link>
            </>
          )}

          {isLoggedIn && user ? (
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {user.name.charAt(0)}
                </span>
                <span className="hidden text-sm font-medium sm:inline">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-card py-1 ring-1 ring-black/[0.08] shadow-sm">
                  <div className="px-4 py-2.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    to="/mypage"
                    className="block px-4 py-2 text-sm transition-colors hover:bg-muted"
                    onClick={() => setDropdownOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                <Link to="/auth/login">로그인</Link>
              </Button>
              <Button size="sm" className="rounded-xl" asChild>
                <Link to="/auth/signup">회원가입</Link>
              </Button>
            </div>
          )}

          <button
            onClick={() => {
              toggleLogin();
              toast(
                isLoggedIn
                  ? "로그아웃 되었습니다"
                  : "김건축님으로 로그인 되었습니다",
                { icon: isLoggedIn ? "👋" : "👤" },
              );
            }}
            className="ml-2 text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          >
            DEV
          </button>
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileCheck,
  Clock,
  FileText,
  Bell,
  BellOff,
  MessageSquare,
  Briefcase,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface Notification {
  id: number;
  type: "contract" | "deadline" | "document" | "system" | "chat" | "bid" | "alert";
  title: string;
  summary: string;
  time: string;
  read: boolean;
  href: string;
}

/* ─── Mock Data ─── */

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "contract",
    title: "계약서 서명 완료",
    summary: "강남구 오피스 리모델링 프로젝트 계약서가 서명 완료되었습니다.",
    time: "방금 전",
    read: false,
    href: "/contracts/1",
  },
  {
    id: 2,
    type: "bid",
    title: "새 제안서가 접수되었습니다",
    summary: "서초동 상가 신축 공사 입찰에 새로운 제안서가 도착했습니다.",
    time: "3분 전",
    read: false,
    href: "/bids/2",
  },
  {
    id: 3,
    type: "deadline",
    title: "입찰 마감 임박",
    summary: "용산구 주택 리모델링 입찰이 내일 마감됩니다.",
    time: "2시간 전",
    read: false,
    href: "/bids/3",
  },
  {
    id: 4,
    type: "chat",
    title: "새 채팅 메시지",
    summary: "김건축사님이 메시지를 보냈습니다: 도면 검토 완료했습니다.",
    time: "3일 전",
    read: false,
    href: "/chat/4",
  },
  {
    id: 5,
    type: "document",
    title: "성과품이 등록되었습니다",
    summary: "마포구 카페 인테리어 프로젝트 최종 도면이 업로드되었습니다.",
    time: "3일 전",
    read: true,
    href: "/projects/5",
  },
  {
    id: 6,
    type: "system",
    title: "시스템 점검 안내",
    summary: "3월 15일 02:00~04:00 서버 점검이 예정되어 있습니다.",
    time: "2주 전",
    read: true,
    href: "/notices",
  },
  {
    id: 7,
    type: "alert",
    title: "프로젝트 일정 변경",
    summary: "송파구 아파트 설계 프로젝트 착수일이 변경되었습니다.",
    time: "2주 전",
    read: true,
    href: "/projects/7",
  },
  {
    id: 8,
    type: "contract",
    title: "계약 응답 요청",
    summary: "종로구 한옥 보수 프로젝트 계약서 검토를 요청합니다.",
    time: "2025.12.01",
    read: true,
    href: "/contracts/8",
  },
];

const TYPE_ICONS: Record<Notification["type"], React.ElementType> = {
  contract: FileCheck,
  deadline: Clock,
  document: FileText,
  system: Bell,
  chat: MessageSquare,
  bid: Briefcase,
  alert: AlertCircle,
};

const ITEMS_PER_PAGE = 20;

/* ─── Component ─── */

export default function NotificationListPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [currentPage, setCurrentPage] = useState(1);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalPages = Math.max(1, Math.ceil(notifications.length / ITEMS_PER_PAGE));
  const paged = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: number, href: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    navigate(href);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Segmented Control */}
        <div className="mb-6 inline-flex bg-muted rounded-xl p-1">
          <button className="px-5 py-1.5 text-sm font-medium bg-foreground text-background rounded-lg shadow-sm">
            알림
          </button>
          <Link
            to="/chat"
            className="px-5 py-1.5 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground transition-colors"
          >
            채팅
          </Link>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllRead}
          >
            모두 읽음
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to="/notifications/settings">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>

        <Separator className="mb-4" />

        {/* Notification List */}
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <BellOff className="size-12 mb-4 opacity-40" />
            <p className="text-sm">알림이 없습니다</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm divide-y divide-black/[0.06]">
            {paged.map((n) => {
              const Icon = TYPE_ICONS[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id, n.href)}
                  className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50 first:rounded-t-2xl last:rounded-b-2xl ${
                    !n.read ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm truncate ${
                        !n.read ? "font-bold text-foreground" : "text-foreground"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {n.summary}
                    </p>
                  </div>

                  {/* Time & Unread Dot */}
                  <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {n.time}
                    </span>
                    {!n.read && (
                      <span className="block h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

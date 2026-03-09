import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface ChatRoom {
  channelId: string;
  partnerName: string;
  partnerInitials: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

/* ─── Mock Data ─── */

const CHAT_ROOMS: ChatRoom[] = [
  {
    channelId: "ch-001",
    partnerName: "아크 건축사사무소",
    partnerInitials: "아크",
    lastMessage: "네, 내일 오전 10시에 현장 미팅 가능합니다. 주소 보내드릴게요.",
    timestamp: "방금 전",
    unreadCount: 3,
  },
  {
    channelId: "ch-002",
    partnerName: "리움 디자인 건축",
    partnerInitials: "리움",
    lastMessage: "설계 도면 초안을 첨부해 드렸습니다. 확인 부탁드립니다.",
    timestamp: "3분 전",
    unreadCount: 1,
  },
  {
    channelId: "ch-003",
    partnerName: "한빛 종합건설",
    partnerInitials: "한빛",
    lastMessage: "견적서 수정본 보내드렸습니다. 검토 후 연락주세요.",
    timestamp: "2시간 전",
    unreadCount: 0,
  },
  {
    channelId: "ch-004",
    partnerName: "도시공간 건축",
    partnerInitials: "도시",
    lastMessage: "감사합니다. 다음 주에 착공 일정 조율하겠습니다.",
    timestamp: "어제",
    unreadCount: 128,
  },
  {
    channelId: "ch-005",
    partnerName: "블루프린트 건축",
    partnerInitials: "블루",
    lastMessage: "포트폴리오 자료 정리해서 보내드리겠습니다.",
    timestamp: "3월 5일",
    unreadCount: 0,
  },
];

/* ─── Chat Room Row ─── */

function ChatRoomRow({ room }: { room: ChatRoom }) {
  const displayBadge =
    room.unreadCount > 99
      ? "99+"
      : room.unreadCount > 0
        ? String(room.unreadCount)
        : null;

  return (
    <Link
      to={`/chat/${room.channelId}`}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/50"
    >
      {/* Avatar */}
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
        {room.partnerInitials.charAt(0)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold truncate">
            {room.partnerName}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {room.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-muted-foreground truncate">
            {room.lastMessage}
          </p>
          {displayBadge && (
            <span className="flex shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 min-w-[20px] h-5 text-[11px] font-semibold text-white">
              {displayBadge}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Empty State ─── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-muted-foreground">아직 채팅 내역이 없습니다</p>
      <p className="mt-1 text-sm text-muted-foreground/70">
        건축사 상세 페이지에서 문의하거나, 입찰에 참여해보세요
      </p>
      <Button asChild className="mt-5 rounded-xl">
        <Link to="/partners">건축사 찾기</Link>
      </Button>
    </div>
  );
}

/* ─── Page ─── */

export default function ChatListPage() {
  const rooms = CHAT_ROOMS;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">채팅</h1>

        {rooms.length > 0 ? (
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm">
            {rooms.map((room, i) => (
              <div key={room.channelId}>
                <ChatRoomRow room={room} />
                {i < rooms.length - 1 && (
                  <Separator className="mx-4" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

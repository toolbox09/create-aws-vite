import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface Message {
  id: string;
  sender: "me" | "other";
  name: string;
  text: string;
  time: string;
  read: boolean;
}

/* ─── Mock Data ─── */

const PARTNER_MAP: Record<string, string> = {
  "ch-001": "아크 건축사사무소",
  "ch-002": "리움 디자인 건축",
  "ch-003": "한빛 종합건설",
  "ch-004": "도시공간 건축",
  "ch-005": "블루프린트 건축",
};

const MOCK_MESSAGES: Message[] = [
  { id: "m1", sender: "other", name: "김건축", text: "안녕하세요, 콘마켓에서 문의 주신 건으로 연락드립니다.", time: "오전 9:00", read: true },
  { id: "m2", sender: "other", name: "김건축", text: "단독주택 설계 관련해서 몇 가지 확인하고 싶은 부분이 있습니다.", time: "오전 9:00", read: true },
  { id: "m3", sender: "me", name: "나", text: "네, 안녕하세요! 답변 감사합니다.", time: "오전 9:15", read: true },
  { id: "m4", sender: "me", name: "나", text: "경기도 용인 쪽에 대지 120평 정도인데, 단독주택 설계 가능하신가요?", time: "오전 9:15", read: true },
  { id: "m5", sender: "other", name: "김건축", text: "네, 충분히 가능합니다. 용도지역이 어떻게 되나요?", time: "오전 9:22", read: true },
  { id: "m6", sender: "me", name: "나", text: "제1종 일반주거지역입니다.", time: "오전 9:30", read: true },
  { id: "m7", sender: "other", name: "김건축", text: "확인 감사합니다. 대지 서류(토지이용계획확인원, 지적도)를 보내주시면 정확한 검토가 가능합니다.", time: "오전 9:35", read: true },
  { id: "m8", sender: "other", name: "김건축", text: "그리고 희망하시는 건축 규모와 예산 범위도 알려주시면 좋겠습니다.", time: "오전 9:35", read: true },
  { id: "m9", sender: "me", name: "나", text: "네, 서류는 오늘 중으로 보내드리겠습니다. 예산은 5억 내외로 생각하고 있어요.", time: "오전 10:02", read: false },
  { id: "m10", sender: "other", name: "김건축", text: "네, 내일 오전 10시에 현장 미팅 가능합니다. 주소 보내드릴게요.", time: "오전 10:10", read: true },
];

/* ─── Helpers ─── */

function shouldShowAvatar(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = messages[index - 1];
  const curr = messages[index];
  return prev.sender !== curr.sender || prev.time !== curr.time;
}

function shouldShowName(messages: Message[], index: number): boolean {
  return messages[index].sender === "other" && shouldShowAvatar(messages, index);
}

/* ─── Message Bubble ─── */

function MessageBubble({
  message,
  showAvatar,
  showName,
}: {
  message: Message;
  showAvatar: boolean;
  showName: boolean;
}) {
  const isMe = message.sender === "me";

  if (isMe) {
    return (
      <div className="flex justify-end gap-2">
        <div className="flex flex-col items-end">
          <div className="rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground max-w-[320px]">
            {message.text}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{message.read ? "\u2713\u2713" : "\u2713"}</span>
            <span>{message.time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {/* Avatar placeholder */}
      <div className="w-9 shrink-0">
        {showAvatar && (
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {message.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {showName && (
          <span className="mb-1 text-xs font-medium text-muted-foreground">
            {message.name}
          </span>
        )}
        <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm max-w-[320px]">
          {message.text}
        </div>
        <span className="mt-1 text-[11px] text-muted-foreground">
          {message.time}
        </span>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function ChatRoomPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const partnerName = PARTNER_MAP[channelId ?? ""] ?? "상대방";

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = inputValue.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "me",
      name: "나",
      text,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col">
        {/* ── Chat Header ── */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="rounded-xl">
              <Link to="/chat">&larr;</Link>
            </Button>
            <span className="text-sm font-semibold">{partnerName}</span>
          </div>
          <Button variant="ghost" size="sm" className="rounded-xl text-lg">
            &hellip;
          </Button>
        </div>

        <Separator />

        {/* ── Message Area ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Date separator */}
          <div className="mb-6 flex items-center justify-center">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              2026년 3월 8일 (일)
            </span>
          </div>

          <div className="space-y-3">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                showAvatar={shouldShowAvatar(messages, i)}
                showName={shouldShowName(messages, i)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input Bar ── */}
        <div className="bg-card ring-1 ring-black/[0.08] px-4 py-3">
          <div className="mx-auto flex max-w-[1120px] items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 rounded-xl text-muted-foreground"
              aria-label="파일 첨부"
            >
              <span className="text-lg">&#128206;</span>
            </Button>

            <textarea
              className="flex-1 resize-none rounded-xl bg-muted px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none min-h-[40px] max-h-[120px]"
              placeholder="메시지를 입력하세요..."
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />

            <Button
              size="sm"
              className="shrink-0 rounded-xl"
              disabled={!inputValue.trim()}
              onClick={handleSend}
            >
              전송
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

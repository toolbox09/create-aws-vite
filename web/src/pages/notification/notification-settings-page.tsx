import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Toggle Switch ─── */

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer"
      } ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

/* ─── Types ─── */

interface CategoryToggle {
  key: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const CATEGORIES: CategoryToggle[] = [
  {
    key: "chat",
    label: "채팅 알림",
    description: "채팅 메시지 수신 시 알림",
    defaultOn: true,
  },
  {
    key: "bid",
    label: "입찰 알림",
    description: "제안 접수, 마감 임박, 지명 초대 등",
    defaultOn: true,
  },
  {
    key: "contract",
    label: "계약/프로젝트 알림",
    description: "계약 응답, 일정 변경, 성과품 등록 등",
    defaultOn: true,
  },
  {
    key: "marketing",
    label: "마케팅 알림",
    description: "이벤트, 프로모션 등 (선택 동의)",
    defaultOn: false,
  },
];

/* ─── Component ─── */

export default function NotificationSettingsPage() {
  const [masterOn, setMasterOn] = useState(true);
  const [categoryStates, setCategoryStates] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(CATEGORIES.map((c) => [c.key, c.defaultOn]))
  );

  function toggleCategory(key: string) {
    setCategoryStates((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to="/notifications">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">알림 설정</h1>
        </div>

        {/* Master Toggle Card */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">전체 알림</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                모든 알림 수신을 한 번에 제어합니다
              </p>
            </div>
            <ToggleSwitch checked={masterOn} onChange={setMasterOn} />
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Category Toggles */}
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className={`flex items-center justify-between rounded-xl px-5 py-4 transition-opacity ${
                !masterOn ? "opacity-50" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">{cat.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {cat.description}
                </p>
              </div>
              <ToggleSwitch
                checked={categoryStates[cat.key]}
                onChange={() => toggleCategory(cat.key)}
                disabled={!masterOn}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

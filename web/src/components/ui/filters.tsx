import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/* ─── useClickOutside ─── */

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [ref, handler]);
}

/* ─── FilterPill (single select) ─── */

export function FilterPill({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const isActive = value !== "전체";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all ${
          isActive
            ? "bg-foreground text-background font-medium"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        {isActive ? value : label}
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 min-w-[160px] rounded-xl bg-card p-1.5 shadow-md ring-1 ring-black/[0.08]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                value === opt ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── FilterPillCheckbox (multi select) ─── */

export function FilterPillCheckbox({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const isActive = selected.size > 0;
  const displayLabel = isActive ? Array.from(selected).join(", ") : label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all ${
          isActive
            ? "bg-foreground text-background font-medium"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="max-w-[120px] truncate">{displayLabel}</span>
        <ChevronDown className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 min-w-[160px] rounded-xl bg-card p-1.5 shadow-md ring-1 ring-black/[0.08]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                selected.has(opt) ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className={`flex size-3.5 shrink-0 items-center justify-center rounded text-[9px] transition-colors ${
                selected.has(opt) ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                {selected.has(opt) && "\u2713"}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SegmentedControl ─── */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  const py = size === "md" ? "py-1.5" : "py-1";
  const px = size === "md" ? "px-4" : "px-3";
  const text = size === "md" ? "text-sm" : "text-xs";

  return (
    <div className="flex items-center gap-0.5 rounded-xl bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-lg ${px} ${py} ${text} font-medium transition-all ${
            value === opt
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── SearchInput ─── */

export function SearchInput({
  placeholder = "검색",
  value,
  onChange,
  className = "",
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-9 text-sm rounded-full bg-muted border-0"
      />
    </div>
  );
}

/* ─── ActiveFilterChips ─── */

export function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: { key: string; label: string }[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}) {
  if (filters.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map(({ key, label }) => (
        <button key={key} onClick={() => onRemove(key)} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted/70">
          {label}
          <X className="size-3 text-muted-foreground" />
        </button>
      ))}
      <button onClick={onClearAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        초기화
      </button>
    </div>
  );
}

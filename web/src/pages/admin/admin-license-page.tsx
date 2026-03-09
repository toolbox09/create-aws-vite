import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/layout/admin-layout";

/* ─── Types & Mock Data ─── */

type ReviewStatus = "심사중" | "승인" | "반려";

interface LicenseApplication {
  id: number;
  applyDate: string;
  officeName: string;
  representative: string;
  licenseNumber: string;
  status: ReviewStatus;
  docs: string[];
  rejectReason?: string;
}

const STATUS_STYLE: Record<ReviewStatus, string> = {
  심사중: "text-blue-600 bg-blue-500/8",
  승인: "text-emerald-600 bg-emerald-500/8",
  반려: "text-red-600 bg-red-500/8",
};

const STATUS_BAR: Record<ReviewStatus, string> = {
  심사중: "bg-blue-500",
  승인: "bg-emerald-500",
  반려: "bg-red-500",
};

const MOCK_DATA: LicenseApplication[] = [
  { id: 1, applyDate: "2026-03-07", officeName: "한빛건축사사무소", representative: "김영호", licenseNumber: "2024-A-0012", status: "심사중", docs: ["건축사 자격증 사본", "사업자등록증", "경력증명서"] },
  { id: 2, applyDate: "2026-03-06", officeName: "푸른설계사무소", representative: "이수진", licenseNumber: "2024-A-0045", status: "심사중", docs: ["건축사 자격증 사본", "사업자등록증"] },
  { id: 3, applyDate: "2026-03-05", officeName: "대한건축설계", representative: "박민수", licenseNumber: "2023-B-0231", status: "승인", docs: ["건축사 자격증 사본", "사업자등록증", "포트폴리오"] },
  { id: 4, applyDate: "2026-03-04", officeName: "서울종합건축", representative: "최정아", licenseNumber: "2024-A-0067", status: "반려", docs: ["건축사 자격증 사본"], rejectReason: "사업자등록증 미첨부" },
  { id: 5, applyDate: "2026-03-03", officeName: "미래건축사무소", representative: "정대현", licenseNumber: "2024-A-0089", status: "심사중", docs: ["건축사 자격증 사본", "사업자등록증", "경력증명서"] },
  { id: 6, applyDate: "2026-03-02", officeName: "하늘건축설계", representative: "강소영", licenseNumber: "2023-B-0178", status: "승인", docs: ["건축사 자격증 사본", "사업자등록증"] },
  { id: 7, applyDate: "2026-03-01", officeName: "새빛종합건축", representative: "윤태호", licenseNumber: "2024-A-0101", status: "반려", docs: ["건축사 자격증 사본", "사업자등록증"], rejectReason: "자격증 유효기간 만료" },
  { id: 8, applyDate: "2026-02-28", officeName: "동아건축사무소", representative: "한지민", licenseNumber: "2024-A-0115", status: "심사중", docs: ["건축사 자격증 사본", "사업자등록증", "포트폴리오"] },
];

/* ─── Filter Select ─── */

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 h-8 rounded-md border border-border/60 bg-background px-3 text-sm whitespace-nowrap hover:bg-muted/30 transition-colors"
      >
        {selected?.label}
        <svg className={`size-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] rounded-md border border-border/60 bg-background shadow-md py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  value === opt.value ? "text-foreground font-medium bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function AdminLicensePage() {
  const [statusFilter, setStatusFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = MOCK_DATA.filter((item) => {
    if (statusFilter !== "전체" && item.status !== statusFilter) return false;
    if (keyword && !item.officeName.includes(keyword) && !item.representative.includes(keyword) && !item.licenseNumber.includes(keyword)) return false;
    return true;
  });

  const selected = MOCK_DATA.find((d) => d.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight">라이센스 심사</h2>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "전체", label: "전체" },
              { value: "심사중", label: "심사중" },
              { value: "승인", label: "승인" },
              { value: "반려", label: "반려" },
            ]}
          />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="사무소명, 대표자, 자격번호"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-8 w-[240px] pl-8 text-sm"
            />
          </div>
        </div>

        {/* Table + Detail side panel */}
        <div className="flex gap-5">
          {/* Table */}
          <div className={`${selected ? "flex-1 min-w-0" : "w-full"} border border-border/60 rounded-lg overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border/60">
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-8">No</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">신청일</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">사무소명</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">대표자</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">자격번호</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                    className={`group cursor-pointer border-b border-border/40 last:border-b-0 transition-colors ${
                      selectedId === item.id ? "bg-muted/40" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.id}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.applyDate}</td>
                    <td className="relative px-4 py-2.5 font-medium">
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all ${
                        selectedId === item.id ? `h-5 ${STATUS_BAR[item.status]}` : "h-0 bg-foreground opacity-0 group-hover:h-5 group-hover:opacity-100"
                      }`} />
                      {item.officeName}
                    </td>
                    <td className="px-4 py-2.5">{item.representative}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground font-mono text-xs">{item.licenseNumber}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                      검색 결과가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Side Panel */}
          {selected && (
            <div className="w-[340px] shrink-0 border border-border/60 rounded-lg p-5 space-y-4 self-start sticky top-16">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold truncate">{selected.officeName}</h3>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${STATUS_STYLE[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">대표자</p>
                    <p className="font-medium">{selected.representative}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">신청일</p>
                    <p className="font-medium tabular-nums">{selected.applyDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">자격번호</p>
                  <p className="font-medium font-mono text-xs tabular-nums">{selected.licenseNumber}</p>
                </div>
              </div>

              {/* Docs */}
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">제출 서류</p>
                <div className="space-y-1">
                  {selected.docs.map((doc) => (
                    <div key={doc} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="size-3 shrink-0" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reject reason */}
              {selected.status === "반려" && selected.rejectReason && (
                <div className="rounded-md bg-red-500/5 border border-red-500/10 p-3">
                  <p className="text-[11px] text-red-600/70 mb-0.5">반려 사유</p>
                  <p className="text-sm text-red-600">{selected.rejectReason}</p>
                </div>
              )}

              {/* Actions */}
              {selected.status === "심사중" && (
                <div className="space-y-3 pt-1">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">반려 사유 (반려 시 필수)</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="반려 사유를 입력하세요"
                      className="w-full rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none resize-none h-20 focus:border-border focus:ring-1 focus:ring-ring/30"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/5">
                      승인
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 text-red-600 hover:bg-red-500/5 hover:text-red-600">
                      반려
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

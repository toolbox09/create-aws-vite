import { useState } from "react";
import { Search, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/layout/admin-layout";

/* ─── Types & Mock Data ─── */

type ReviewStatus = "심사중" | "승인" | "반려";
type MemberType = "CL-C" | "PT";

interface BusinessChangeRequest {
  id: number;
  requestDate: string;
  memberType: MemberType;
  companyName: string;
  changeTarget: string;
  status: ReviewStatus;
  before: string;
  after: string;
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

const MEMBER_TYPE_LABEL: Record<MemberType, string> = {
  "CL-C": "건축주",
  PT: "파트너스",
};

const MOCK_DATA: BusinessChangeRequest[] = [
  { id: 1, requestDate: "2026-03-07", memberType: "PT", companyName: "한빛건축사사무소", changeTarget: "상호변경", status: "심사중", before: "한빛건축사사무소", after: "한빛종합건축", docs: ["사업자등록증(변경)", "변경신고서"] },
  { id: 2, requestDate: "2026-03-06", memberType: "CL-C", companyName: "(주)블루테크", changeTarget: "대표자변경", status: "심사중", before: "김영호", after: "이수진", docs: ["법인등기부등본", "변경등록신청서"] },
  { id: 3, requestDate: "2026-03-05", memberType: "PT", companyName: "대한건축설계", changeTarget: "사업장주소", status: "승인", before: "서울 강남구 역삼동 123", after: "서울 서초구 서초동 456", docs: ["사업자등록증(변경)"] },
  { id: 4, requestDate: "2026-03-04", memberType: "CL-C", companyName: "미래건설(주)", changeTarget: "법인명변경", status: "반려", before: "미래건설(주)", after: "(주)미래종합건설", docs: ["법인등기부등본"], rejectReason: "등기부 상 변경 미확인" },
  { id: 5, requestDate: "2026-03-03", memberType: "PT", companyName: "서울종합건축", changeTarget: "상호변경", status: "승인", before: "서울종합건축", after: "서울플러스건축", docs: ["사업자등록증(변경)", "변경신고서"] },
  { id: 6, requestDate: "2026-03-02", memberType: "CL-C", companyName: "(주)그린홈", changeTarget: "대표자변경", status: "심사중", before: "박민수", after: "최정아", docs: ["법인등기부등본", "변경등록신청서"] },
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

export default function AdminBusinessChangePage() {
  const [statusFilter, setStatusFilter] = useState("전체");
  const [memberTypeFilter, setMemberTypeFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = MOCK_DATA.filter((item) => {
    if (statusFilter !== "전체" && item.status !== statusFilter) return false;
    if (memberTypeFilter !== "전체" && item.memberType !== memberTypeFilter) return false;
    if (keyword && !item.companyName.includes(keyword) && !item.changeTarget.includes(keyword)) return false;
    return true;
  });

  const selected = MOCK_DATA.find((d) => d.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight">사업자 변경 요청</h2>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "전체", label: "상태 전체" },
              { value: "심사중", label: "심사중" },
              { value: "승인", label: "승인" },
              { value: "반려", label: "반려" },
            ]}
          />
          <FilterSelect
            value={memberTypeFilter}
            onChange={setMemberTypeFilter}
            options={[
              { value: "전체", label: "회원유형 전체" },
              { value: "CL-C", label: "건축주 (CL-C)" },
              { value: "PT", label: "파트너스 (PT)" },
            ]}
          />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="상호/법인명 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-8 w-[200px] pl-8 text-sm"
            />
          </div>
        </div>

        {/* Table + Detail */}
        <div className="flex gap-5">
          <div className={`${selected ? "flex-1 min-w-0" : "w-full"} border border-border/60 rounded-lg overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border/60">
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-8">No</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">요청일</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">유형</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">상호/법인명</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">변경 대상</th>
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
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.requestDate}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground">{item.memberType}</span>
                    </td>
                    <td className="relative px-4 py-2.5 font-medium">
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all ${
                        selectedId === item.id ? `h-5 ${STATUS_BAR[item.status]}` : "h-0 bg-foreground opacity-0 group-hover:h-5 group-hover:opacity-100"
                      }`} />
                      {item.companyName}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.changeTarget}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">검색 결과가 없습니다</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Side Panel */}
          {selected && (
            <div className="w-[340px] shrink-0 border border-border/60 rounded-lg p-5 space-y-4 self-start sticky top-16">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold truncate">{selected.companyName}</h3>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${STATUS_STYLE[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="h-px bg-border/60" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">회원유형</p>
                  <p className="font-medium">{MEMBER_TYPE_LABEL[selected.memberType]}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">변경 대상</p>
                  <p className="font-medium">{selected.changeTarget}</p>
                </div>
              </div>

              {/* Before / After — stacked for side panel */}
              <div className="space-y-2">
                <div className="rounded-md border border-border/40 p-3">
                  <p className="text-[11px] text-muted-foreground mb-0.5">변경 전</p>
                  <p className="text-sm font-medium">{selected.before}</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="size-3.5 text-muted-foreground rotate-90" />
                </div>
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-[11px] text-emerald-600/70 mb-0.5">변경 후</p>
                  <p className="text-sm font-medium text-emerald-700">{selected.after}</p>
                </div>
              </div>

              {/* Docs */}
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">첨부 서류</p>
                <div className="space-y-1">
                  {selected.docs.map((doc) => (
                    <div key={doc} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="size-3 shrink-0" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              {selected.status === "반려" && selected.rejectReason && (
                <div className="rounded-md bg-red-500/5 border border-red-500/10 p-3">
                  <p className="text-[11px] text-red-600/70 mb-0.5">반려 사유</p>
                  <p className="text-sm text-red-600">{selected.rejectReason}</p>
                </div>
              )}

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

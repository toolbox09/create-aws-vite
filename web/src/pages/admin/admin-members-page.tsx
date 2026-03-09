import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/layout/admin-layout";

/* ─── Types & Mock Data ─── */

type MemberType = "건축주" | "파트너스";
type MemberStatus = "활성" | "정지";

interface Member {
  id: number;
  joinDate: string;
  type: MemberType;
  name: string;
  email: string;
  status: MemberStatus;
  phone: string;
  company?: string;
  address?: string;
}

const STATUS_STYLE: Record<MemberStatus, string> = {
  활성: "text-emerald-600 bg-emerald-500/8",
  정지: "text-red-600 bg-red-500/8",
};

const MOCK_DATA: Member[] = [
  { id: 1, joinDate: "2026-01-15", type: "건축주", name: "김영호", email: "kim@example.com", status: "활성", phone: "010-1234-5678", company: "(주)블루테크", address: "서울 강남구" },
  { id: 2, joinDate: "2026-01-20", type: "파트너스", name: "이수진", email: "lee@arch.com", status: "활성", phone: "010-2345-6789", company: "한빛건축사사무소", address: "서울 마포구" },
  { id: 3, joinDate: "2026-02-01", type: "건축주", name: "박민수", email: "park@example.com", status: "정지", phone: "010-3456-7890", address: "경기 성남시" },
  { id: 4, joinDate: "2026-02-05", type: "파트너스", name: "최정아", email: "choi@design.com", status: "활성", phone: "010-4567-8901", company: "서울종합건축", address: "서울 서초구" },
  { id: 5, joinDate: "2026-02-10", type: "건축주", name: "정대현", email: "jung@corp.com", status: "활성", phone: "010-5678-9012", company: "미래건설(주)", address: "부산 해운대구" },
  { id: 6, joinDate: "2026-02-15", type: "파트너스", name: "강소영", email: "kang@arch.com", status: "활성", phone: "010-6789-0123", company: "하늘건축설계", address: "대전 유성구" },
  { id: 7, joinDate: "2026-02-20", type: "건축주", name: "윤태호", email: "yoon@example.com", status: "활성", phone: "010-7890-1234", address: "인천 연수구" },
  { id: 8, joinDate: "2026-02-25", type: "파트너스", name: "한지민", email: "han@studio.com", status: "정지", phone: "010-8901-2345", company: "동아건축사무소", address: "광주 서구" },
  { id: 9, joinDate: "2026-03-01", type: "건축주", name: "오승민", email: "oh@example.com", status: "활성", phone: "010-9012-3456", company: "(주)그린홈", address: "서울 송파구" },
  { id: 10, joinDate: "2026-03-05", type: "파트너스", name: "신현우", email: "shin@arch.com", status: "활성", phone: "010-0123-4567", company: "새빛종합건축", address: "경기 수원시" },
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

export default function AdminMembersPage() {
  const [typeFilter, setTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = MOCK_DATA.filter((item) => {
    if (typeFilter !== "전체" && item.type !== typeFilter) return false;
    if (statusFilter !== "전체" && item.status !== statusFilter) return false;
    if (keyword && !item.name.includes(keyword) && !item.email.includes(keyword) && !(item.company || "").includes(keyword)) return false;
    return true;
  });

  const selected = MOCK_DATA.find((d) => d.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight">회원 관리</h2>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "전체", label: "유형 전체" },
              { value: "건축주", label: "건축주" },
              { value: "파트너스", label: "파트너스" },
            ]}
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "전체", label: "상태 전체" },
              { value: "활성", label: "활성" },
              { value: "정지", label: "정지" },
            ]}
          />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름, 이메일, 회사명"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-8 w-[220px] pl-8 text-sm"
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
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">가입일</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">유형</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">이름/회사명</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">이메일</th>
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
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.joinDate}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground">{item.type}</span>
                    </td>
                    <td className="relative px-4 py-2.5 font-medium">
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all ${
                        selectedId === item.id ? "h-5 bg-foreground" : "h-0 bg-foreground opacity-0 group-hover:h-5 group-hover:opacity-100"
                      }`} />
                      {item.name}
                      {item.company && <span className="ml-1.5 text-muted-foreground font-normal text-xs">({item.company})</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.email}</td>
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
                <h3 className="text-sm font-semibold">{selected.name}</h3>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${STATUS_STYLE[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">유형</p>
                    <p className="font-medium">{selected.type}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">가입일</p>
                    <p className="font-medium tabular-nums">{selected.joinDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">이메일</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">전화번호</p>
                  <p className="font-medium tabular-nums">{selected.phone}</p>
                </div>
                {selected.company && (
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">회사/사무소</p>
                    <p className="font-medium">{selected.company}</p>
                  </div>
                )}
                {selected.address && (
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">주소</p>
                    <p className="font-medium">{selected.address}</p>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/60" />

              <div>
                {selected.status === "활성" ? (
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-500/5 hover:text-red-600">
                    정지
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/5">
                    해제
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

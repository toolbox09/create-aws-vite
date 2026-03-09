import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/layout/admin-layout";

/* ─── Types & Mock Data ─── */

type InquiryStatus = "접수" | "답변완료";

interface Inquiry {
  id: number;
  date: string;
  category: string;
  title: string;
  memberName: string;
  status: InquiryStatus;
  content: string;
  answer?: string;
}

const STATUS_STYLE: Record<InquiryStatus, string> = {
  접수: "text-amber-600 bg-amber-500/8",
  답변완료: "text-emerald-600 bg-emerald-500/8",
};

const MOCK_DATA: Inquiry[] = [
  { id: 1, date: "2026-03-07", category: "입찰", title: "입찰 등록 중 오류가 발생합니다", memberName: "김영호", status: "접수", content: "입찰 등록 3단계에서 파일 업로드 시 '서버 오류'라는 메시지가 뜹니다. 여러 차례 시도했으나 동일한 문제가 반복됩니다. 확인 부탁드립니다." },
  { id: 2, date: "2026-03-06", category: "결제", title: "설계비 결제 영수증 재발행 요청", memberName: "이수진", status: "답변완료", content: "2026년 2월 결제한 설계비에 대한 세금계산서 재발행을 요청드립니다.", answer: "안녕하세요. 해당 건에 대한 세금계산서 재발행을 완료하였습니다. 이메일로 발송드렸으니 확인 부탁드립니다." },
  { id: 3, date: "2026-03-05", category: "회원", title: "비밀번호 변경이 안됩니다", memberName: "박민수", status: "접수", content: "마이페이지에서 비밀번호 변경을 시도하면 '기존 비밀번호가 일치하지 않습니다'라는 오류가 발생합니다. 정확하게 입력하고 있는데 문제가 있는 것 같습니다." },
  { id: 4, date: "2026-03-04", category: "계약", title: "계약서 서명 후 수정 가능한가요?", memberName: "최정아", status: "답변완료", content: "전자서명 완료 후 계약서 내용 일부를 수정하고 싶습니다. 가능한지 문의드립니다.", answer: "전자서명이 완료된 계약서는 법적 효력이 있어 직접 수정이 불가합니다. 변경이 필요한 경우 상대방과 합의 후 변경계약서를 별도로 작성해주셔야 합니다." },
  { id: 5, date: "2026-03-03", category: "입찰", title: "입찰 참여 취소 방법 문의", memberName: "정대현", status: "접수", content: "이미 참여한 입찰 건에 대해 참여 취소를 하고 싶습니다. 어떻게 하면 되나요?" },
  { id: 6, date: "2026-03-02", category: "기타", title: "앱 푸시 알림이 오지 않습니다", memberName: "강소영", status: "접수", content: "모바일 앱에서 푸시 알림 설정을 켜놨는데도 알림이 전혀 오지 않습니다. 기기는 iPhone 15 Pro이며 iOS 최신 버전입니다." },
  { id: 7, date: "2026-03-01", category: "결제", title: "환불 진행 상태 확인 요청", memberName: "윤태호", status: "답변완료", content: "2월 20일에 환불 요청한 건이 아직 처리되지 않은 것 같습니다. 현재 진행 상태를 알려주세요.", answer: "확인 결과 2월 28일에 환불 처리가 완료되었습니다. 카드사 사정에 따라 실제 환불까지 영업일 기준 3~5일이 소요될 수 있습니다." },
  { id: 8, date: "2026-02-28", category: "회원", title: "사업자 인증 서류 재제출 방법", memberName: "한지민", status: "접수", content: "사업자 인증 시 잘못된 서류를 제출했습니다. 재제출하려면 어떻게 해야 하나요?" },
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

export default function AdminSupportPage() {
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");

  const filtered = MOCK_DATA.filter((item) => {
    if (categoryFilter !== "전체" && item.category !== categoryFilter) return false;
    if (statusFilter !== "전체" && item.status !== statusFilter) return false;
    if (keyword && !item.title.includes(keyword) && !item.memberName.includes(keyword)) return false;
    return true;
  });

  const selected = MOCK_DATA.find((d) => d.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight">고객 문의 관리</h2>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "전체", label: "카테고리 전체" },
              { value: "입찰", label: "입찰" },
              { value: "결제", label: "결제" },
              { value: "회원", label: "회원" },
              { value: "계약", label: "계약" },
              { value: "기타", label: "기타" },
            ]}
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "전체", label: "상태 전체" },
              { value: "접수", label: "접수" },
              { value: "답변완료", label: "답변완료" },
            ]}
          />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="제목, 회원명 검색"
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
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">등록일</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">카테고리</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-[35%]">제목</th>
                  <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">회원명</th>
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
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.date}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground">{item.category}</span>
                    </td>
                    <td className="relative px-4 py-2.5 font-medium">
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all ${
                        selectedId === item.id ? "h-5 bg-foreground" : "h-0 bg-foreground opacity-0 group-hover:h-5 group-hover:opacity-100"
                      }`} />
                      {item.title}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.memberName}</td>
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
            <div className="w-[380px] shrink-0 border border-border/60 rounded-lg p-5 space-y-4 self-start sticky top-16">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold truncate">{selected.title}</h3>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${STATUS_STYLE[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="h-px bg-border/60" />

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">회원명</p>
                  <p className="font-medium">{selected.memberName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">카테고리</p>
                  <p className="font-medium">{selected.category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">등록일</p>
                  <p className="font-medium tabular-nums">{selected.date}</p>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5">문의 내용</p>
                <div className="rounded-md border border-border/40 bg-muted/20 p-3 text-sm leading-relaxed">
                  {selected.content}
                </div>
              </div>

              {/* Existing answer */}
              {selected.answer && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">답변</p>
                  <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm leading-relaxed">
                    {selected.answer}
                  </div>
                </div>
              )}

              {/* Answer form */}
              {selected.status === "접수" && (
                <div className="space-y-3 pt-1">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">답변 작성</p>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="답변을 입력하세요"
                      className="w-full rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none resize-none h-28 focus:border-border focus:ring-1 focus:ring-ring/30"
                    />
                  </div>
                  <Button size="sm" className="w-full">답변 등록</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Upload,
  X,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  History,
  Eye,
  Check,
  Info,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface PaymentMethod {
  paymentCondition: string;
  progressRate: string;
  paymentAmount: string;
  dueDate: string;
  remark: string;
}

interface DesignDocument {
  category: string;
  spec: string;
  quantity: string;
  remark: string;
}

interface FieldHistory {
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByRole: "건축주" | "건축사";
  updatedAt: string;
}

type ContractStatus = "요청" | "수락" | "편집중" | "편집완료" | "서명요청" | "서명진행" | "체결" | "거부" | "만료";
type EditReason = "서명거부" | "서명만료" | "수정";

/* ─── Constants ─── */

const CONSTRUCTION_TYPES = [
  { value: "new", label: "신축" },
  { value: "extension", label: "증축" },
  { value: "renovation", label: "개축" },
  { value: "reconstruction", label: "재축" },
  { value: "relocation", label: "이전" },
  { value: "majorRepair", label: "대수선" },
  { value: "changeOfUse", label: "용도변경" },
] as const;

const MOCK_CLIENT = {
  name: "이건축주",
  regNumber: "880101-1******",
  address: "서울 강남구 역삼동 123-4",
  contact: "010-1234-5678",
};

const MOCK_ARCHITECT = {
  name: "아크 건축사사무소",
  regNumber: "제2014-123호",
  address: "서울 강남구 역삼로 123",
  contact: "02-1234-5678",
};

const MOCK_BUILDING = {
  name: "역삼동 단독주택 신축공사",
  location: "서울 강남구 역삼동 123-4",
  constructionType: "new" as const,
  landArea: 198,
  buildingUse: "단독주택",
  structureType: "철근콘크리트구조",
  numberOfFloors: "지하 1층, 지상 3층",
  buildingCoverageArea: 118.8,
  totalFloorArea: 356.4,
};

// 기존 저장된 계약 데이터 (수정 모드)
const SAVED_PAYMENTS: PaymentMethod[] = [
  { paymentCondition: "기본설계", progressRate: "20", paymentAmount: "8400000", dueDate: "2026-05-01", remark: "" },
  { paymentCondition: "실시설계", progressRate: "30", paymentAmount: "12600000", dueDate: "2026-07-01", remark: "" },
  { paymentCondition: "인허가", progressRate: "30", paymentAmount: "12600000", dueDate: "2026-09-01", remark: "" },
  { paymentCondition: "준공", progressRate: "20", paymentAmount: "8400000", dueDate: "2026-11-01", remark: "" },
];

const SAVED_DOCUMENTS: DesignDocument[] = [
  { category: "설계도", spec: "A3", quantity: "2부", remark: "" },
  { category: "구조계산서", spec: "A4", quantity: "2부", remark: "" },
  { category: "투시도", spec: "A2", quantity: "1부", remark: "" },
];

const SAVED_FILES = [
  { name: "공사계약서_초안.pdf", size: "2.3MB", id: "f1" },
  { name: "건축허가서_사본.pdf", size: "1.1MB", id: "f2" },
];

const MOCK_HISTORIES: FieldHistory[] = [
  { fieldLabel: "계약 금액", oldValue: "35,000,000", newValue: "42,000,000", changedBy: "이건축주", changedByRole: "건축주", updatedAt: "2026-03-08 14:30" },
  { fieldLabel: "계약 금액", oldValue: "30,000,000", newValue: "35,000,000", changedBy: "아크 건축사사무소", changedByRole: "건축사", updatedAt: "2026-03-07 10:15" },
  { fieldLabel: "기성 3차 기성율", oldValue: "25%", newValue: "30%", changedBy: "아크 건축사사무소", changedByRole: "건축사", updatedAt: "2026-03-06 16:00" },
  { fieldLabel: "특약사항", oldValue: "(없음)", newValue: "공사 지연 시 위약금 조항 추가", changedBy: "이건축주", changedByRole: "건축주", updatedAt: "2026-03-05 11:20" },
];

const MAX_FILES = 10;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

/* ─── Helpers ─── */

function parseNumber(raw: string): number {
  return Number(raw.replace(/[^0-9]/g, "")) || 0;
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function toSquareMeterWithPyeong(m2: number): string {
  const pyeong = Math.round(m2 * 0.3025 * 10) / 10;
  return `${formatNumber(m2)} m² (${pyeong}평)`;
}

const KOREAN_UNITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const KOREAN_PLACES = ["", "십", "백", "천"];
const KOREAN_BIGS = ["", "만", "억", "조"];

function numberToKorean(n: number): string {
  if (n === 0) return "영";
  const str = String(n);
  const len = str.length;
  let result = "";
  for (let i = 0; i < len; i++) {
    const digit = Number(str[i]);
    const pos = len - 1 - i;
    const bigIdx = Math.floor(pos / 4);
    const placeIdx = pos % 4;
    if (digit !== 0) {
      if (digit === 1 && placeIdx > 0) {
        result += KOREAN_PLACES[placeIdx];
      } else {
        result += KOREAN_UNITS[digit] + KOREAN_PLACES[placeIdx];
      }
    }
    if (placeIdx === 0 && bigIdx > 0 && result.length > 0) {
      result += KOREAN_BIGS[bigIdx];
    }
  }
  return result;
}

function formatFullCurrency(amount: number): string {
  if (amount === 0) return "₩ 0";
  const korean = numberToKorean(amount);
  return `일금 ${korean}원정 (₩ ${formatNumber(amount)})`;
}

/* ─── Subcomponents ─── */

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 rounded-xl h-11 border border-input bg-muted/30 px-3">
        <Lock className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="text-sm">{value}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ContractStatus }) {
  const styles: Record<ContractStatus, string> = {
    요청: "bg-amber-500/10 text-amber-600",
    수락: "bg-blue-500/10 text-blue-600",
    편집중: "bg-primary/10 text-primary",
    편집완료: "bg-emerald-500/10 text-emerald-600",
    서명요청: "bg-violet-500/10 text-violet-600",
    서명진행: "bg-violet-500/10 text-violet-600",
    체결: "bg-emerald-500/10 text-emerald-600",
    거부: "bg-red-500/10 text-red-600",
    만료: "bg-zinc-500/10 text-zinc-600",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ReasonBanner({ reason }: { reason: EditReason }) {
  if (reason === "서명거부") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-4 dark:bg-amber-500/10 dark:ring-amber-500/30">
        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">건축사가 서명을 거부했습니다</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
            계약서를 수정한 후 다시 서명을 요청할 수 있습니다. 거부 사유를 확인하고 해당 항목을 수정해주세요.
          </p>
        </div>
      </div>
    );
  }
  if (reason === "서명만료") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-blue-50 ring-1 ring-blue-200 p-4 dark:bg-blue-500/10 dark:ring-blue-500/30">
        <Info className="size-5 text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">서명 기한(14일)이 만료되었습니다</p>
          <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
            계약서를 확인한 후 다시 서명을 요청할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }
  return null;
}

function HistoryDrawer({ histories, onClose }: { histories: FieldHistory[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-background shadow-2xl p-6 overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold">변경 이력</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4">
          {histories.map((h, i) => (
            <div key={i} className="rounded-xl ring-1 ring-black/[0.08] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  h.changedByRole === "건축주" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                }`}>
                  {h.changedByRole}
                </span>
                <span className="text-xs text-muted-foreground">{h.updatedAt}</span>
              </div>
              <p className="text-xs font-medium mb-1">{h.fieldLabel}</p>
              <p className="text-xs text-muted-foreground mb-1">{h.changedBy}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="line-through text-muted-foreground">{h.oldValue}</span>
                <span>→</span>
                <span className="font-semibold">{h.newValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function ContractEditPage() {
  const { id } = useParams();

  // Mock: 서명거부로 인한 재편집 시나리오
  const EDIT_REASON: EditReason = "서명거부";
  const CONTRACT_STATUS: ContractStatus = "편집중";
  const IS_EDITABLE = true;

  const building = MOCK_BUILDING;

  // 기존 저장값으로 초기화
  const [contractedArea, setContractedArea] = useState(String(building.totalFloorArea));
  const [contractAmountRaw, setContractAmountRaw] = useState("42,000,000");
  const [contractDate, setContractDate] = useState("2026-03-15");
  const [paymentPeriod, setPaymentPeriod] = useState("성과품 수령 후 14일 이내");
  const [specialTerms, setSpecialTerms] = useState("공사 지연 시 위약금 조항 추가");

  const [payments, setPayments] = useState<PaymentMethod[]>(SAVED_PAYMENTS);
  const [documents, setDocuments] = useState<DesignDocument[]>(SAVED_DOCUMENTS);
  const [files, setFiles] = useState<typeof SAVED_FILES>(SAVED_FILES);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const contractAmount = parseNumber(contractAmountRaw);
  const rateSum = payments.reduce((s, p) => s + (Number(p.progressRate) || 0), 0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      setContractAmountRaw(raw === "" ? "" : formatNumber(Number(raw)));
    }
  };

  const updatePayment = useCallback((idx: number, field: keyof PaymentMethod, value: string) => {
    setPayments(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "progressRate") {
        const rate = Number(value) || 0;
        next[idx].paymentAmount = String(Math.floor(contractAmount * rate / 100));
      }
      return next;
    });
  }, [contractAmount]);

  const addPaymentRow = () => {
    setPayments(prev => [...prev, { paymentCondition: "", progressRate: "", paymentAmount: "0", dueDate: "", remark: "" }]);
  };

  const removePaymentRow = (idx: number) => {
    setPayments(prev => prev.filter((_, i) => i !== idx));
  };

  const updateDocument = useCallback((idx: number, field: keyof DesignDocument, value: string) => {
    setDocuments(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const addDocumentRow = () => {
    setDocuments(prev => [...prev, { category: "", spec: "", quantity: "", remark: "" }]);
  };

  const removeDocumentRow = (idx: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files;
    if (!picked) return;
    const newFiles: typeof files = [];
    for (let i = 0; i < picked.length; i++) {
      const f = picked[i];
      if (!ACCEPTED_TYPES.includes(f.type)) continue;
      if (files.length + newFiles.length >= MAX_FILES) break;
      newFiles.push({
        name: f.name,
        size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)}KB` : `${(f.size / (1024 * 1024)).toFixed(1)}MB`,
        id: crypto.randomUUID(),
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = "";
  };

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      {historyOpen && <HistoryDrawer histories={MOCK_HISTORIES} onClose={() => setHistoryOpen(false)} />}

      <div className="mx-auto max-w-[860px] px-6 py-8">
        {/* Back */}
        <Link
          to={`/contracts/${id || "CTR-20260308-0001"}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          계약서 상세
        </Link>

        {/* Status Banner */}
        <ReasonBanner reason={EDIT_REASON} />

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold tracking-tight">건축설계 표준계약서</h1>
            <p className="mt-1 text-sm text-muted-foreground">「건축사법」 제23조제1항 근거</p>
            <p className="mt-1 text-xs text-muted-foreground">CTR-20260308-0001 · 수정</p>
          </div>
          <StatusBadge status={CONTRACT_STATUS} />
        </div>

        {/* 편집 모드 안내 */}
        {IS_EDITABLE && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/[0.05] p-4 ring-1 ring-primary/20">
            <Eye className="size-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">양측 편집 모드</p>
              <p className="text-xs text-muted-foreground">건축주와 건축사 모두 계약 내용을 수정할 수 있습니다. 변경 이력이 자동으로 기록됩니다.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg shrink-0 gap-1.5" onClick={() => setHistoryOpen(true)}>
              <History className="size-3.5" />
              이력 ({MOCK_HISTORIES.length})
            </Button>
          </div>
        )}

        <div className="space-y-6">

          {/* ═══ Section 1: 계약 당사자 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">계약 당사자</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-xl ring-1 ring-black/[0.06] p-5 space-y-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">갑 (건축주)</p>
                <ReadonlyField label="성명" value={MOCK_CLIENT.name} />
                <ReadonlyField label="주민(사업자)등록번호" value={MOCK_CLIENT.regNumber} />
                <ReadonlyField label="주소" value={MOCK_CLIENT.address} />
                <ReadonlyField label="연락처" value={MOCK_CLIENT.contact} />
              </div>
              <div className="rounded-xl ring-1 ring-black/[0.06] p-5 space-y-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">을 (건축사)</p>
                <ReadonlyField label="상호" value={MOCK_ARCHITECT.name} />
                <ReadonlyField label="건축사 등록번호" value={MOCK_ARCHITECT.regNumber} />
                <ReadonlyField label="주소" value={MOCK_ARCHITECT.address} />
                <ReadonlyField label="연락처" value={MOCK_ARCHITECT.contact} />
              </div>
            </div>
          </section>

          {/* ═══ Section 2: 건축물 개요 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">건축물 개요</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              {[
                { label: "건물명칭", value: building.name },
                { label: "대지위치", value: building.location },
                { label: "대지면적", value: toSquareMeterWithPyeong(building.landArea) },
                { label: "건축물용도", value: building.buildingUse },
                { label: "건축물구조", value: building.structureType },
                { label: "층수", value: building.numberOfFloors },
                { label: "건축면적", value: toSquareMeterWithPyeong(building.buildingCoverageArea) },
                { label: "연면적", value: toSquareMeterWithPyeong(building.totalFloorArea) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <div className="flex items-center gap-1.5">
                    <Lock className="size-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-5" />

            <div>
              <p className="text-xs text-muted-foreground mb-3">공사 유형</p>
              <div className="flex flex-wrap gap-2">
                {CONSTRUCTION_TYPES.map((ct) => (
                  <div key={ct.value} className="flex items-center gap-1.5">
                    <div className={`size-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      building.constructionType === ct.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}>
                      {building.constructionType === ct.value && <Check className="size-2.5 text-primary-foreground" />}
                    </div>
                    <span className={`text-sm ${building.constructionType === ct.value ? "font-medium" : "text-muted-foreground"}`}>
                      {ct.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ Section 3: 계약 조건 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">계약 조건</h2>
              <button
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <History className="size-3.5" />
                변경 이력
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <Label>계약 면적</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={contractedArea}
                    onChange={(e) => setContractedArea(e.target.value)}
                    className="rounded-xl h-11 pr-16"
                    disabled={!IS_EDITABLE}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    m² ({(Number(contractedArea) * 0.3025).toFixed(1)}평)
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>계약 금액</Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={contractAmountRaw}
                    onChange={handleAmountChange}
                    className="rounded-xl h-11 pr-8"
                    disabled={!IS_EDITABLE}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                </div>
              </div>
            </div>

            {contractAmount > 0 && (
              <div className="rounded-xl bg-muted/50 p-3 mb-5">
                <p className="text-sm text-muted-foreground">{formatFullCurrency(contractAmount)}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>계약일</Label>
                <Input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="rounded-xl h-11"
                  disabled={!IS_EDITABLE}
                />
              </div>
              <div className="space-y-2">
                <Label>대금 지급 기한</Label>
                <Input
                  value={paymentPeriod}
                  onChange={(e) => setPaymentPeriod(e.target.value)}
                  className="rounded-xl h-11"
                  disabled={!IS_EDITABLE}
                  placeholder="예: 성과품 수령 후 14일 이내"
                />
              </div>
            </div>
          </section>

          {/* ═══ Section 4: 기성 지불 일정 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">기성 지불 일정</h2>
              {IS_EDITABLE && (
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addPaymentRow}>
                  <Plus className="size-3.5" />
                  행 추가
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-3 pr-2 font-medium w-8">#</th>
                    <th className="py-3 pr-2 font-medium">기성</th>
                    <th className="py-3 pr-2 font-medium w-20 text-right">기성율(%)</th>
                    <th className="py-3 pr-2 font-medium w-32 text-right">금액(원)</th>
                    <th className="py-3 pr-2 font-medium w-32">지급예정일</th>
                    <th className="py-3 font-medium">비고</th>
                    {IS_EDITABLE && <th className="py-3 w-8" />}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2">
                        <Input
                          value={p.paymentCondition}
                          onChange={(e) => updatePayment(idx, "paymentCondition", e.target.value)}
                          className="rounded-lg h-8 text-sm"
                          disabled={!IS_EDITABLE}
                          placeholder="단계명"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={p.progressRate}
                          onChange={(e) => updatePayment(idx, "progressRate", e.target.value)}
                          className="rounded-lg h-8 w-20 text-right text-sm ml-auto"
                          disabled={!IS_EDITABLE}
                        />
                      </td>
                      <td className="py-2 pr-2 text-right tabular-nums font-medium text-sm">
                        {formatNumber(Number(p.paymentAmount) || 0)}
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="date"
                          value={p.dueDate}
                          onChange={(e) => updatePayment(idx, "dueDate", e.target.value)}
                          className="rounded-lg h-8 text-sm"
                          disabled={!IS_EDITABLE}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          value={p.remark}
                          onChange={(e) => updatePayment(idx, "remark", e.target.value)}
                          className="rounded-lg h-8 text-sm"
                          disabled={!IS_EDITABLE}
                          placeholder="—"
                        />
                      </td>
                      {IS_EDITABLE && (
                        <td className="py-2 pl-1">
                          <button
                            onClick={() => removePaymentRow(idx)}
                            className="text-muted-foreground/50 hover:text-red-500 transition-colors"
                            disabled={payments.length <= 1}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td className="py-3 pr-2" colSpan={2}>합계</td>
                    <td className="py-3 pr-2 text-right">
                      {rateSum !== 100 ? (
                        <span className="text-red-500 flex items-center justify-end gap-1">
                          <AlertTriangle className="size-3.5" />
                          {rateSum}%
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1 text-emerald-600">
                          <Check className="size-3.5" />
                          100%
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-2 text-right tabular-nums">
                      {formatNumber(payments.reduce((s, p) => s + (Number(p.paymentAmount) || 0), 0))}
                    </td>
                    <td colSpan={IS_EDITABLE ? 3 : 2} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {rateSum !== 100 && (
              <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                기성율 합계: {rateSum}% — 100%여야 서명 요청이 가능합니다
              </p>
            )}
          </section>

          {/* ═══ Section 5: 설계 도서 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">설계 도서</h2>
              {IS_EDITABLE && (
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addDocumentRow}>
                  <Plus className="size-3.5" />
                  행 추가
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-3 pr-2 font-medium w-8">#</th>
                    <th className="py-3 pr-2 font-medium">분류</th>
                    <th className="py-3 pr-2 font-medium w-24">규격</th>
                    <th className="py-3 pr-2 font-medium w-20">수량</th>
                    <th className="py-3 font-medium">비고</th>
                    {IS_EDITABLE && <th className="py-3 w-8" />}
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2">
                        <Input
                          value={d.category}
                          onChange={(e) => updateDocument(idx, "category", e.target.value)}
                          className="rounded-lg h-8 text-sm"
                          disabled={!IS_EDITABLE}
                          placeholder="설계도, 계산서 등"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          value={d.spec}
                          onChange={(e) => updateDocument(idx, "spec", e.target.value)}
                          className="rounded-lg h-8 text-sm"
                          disabled={!IS_EDITABLE}
                          placeholder="A3"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          value={d.quantity}
                          onChange={(e) => updateDocument(idx, "quantity", e.target.value)}
                          className="rounded-lg h-8 text-sm"
                          disabled={!IS_EDITABLE}
                          placeholder="2부"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          value={d.remark}
                          onChange={(e) => updateDocument(idx, "remark", e.target.value)}
                          className="rounded-lg h-8 text-sm"
                          disabled={!IS_EDITABLE}
                          placeholder="—"
                        />
                      </td>
                      {IS_EDITABLE && (
                        <td className="py-2 pl-1">
                          <button
                            onClick={() => removeDocumentRow(idx)}
                            className="text-muted-foreground/50 hover:text-red-500 transition-colors"
                            disabled={documents.length <= 1}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ═══ Section 6: 특약사항 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">특약사항</h2>
            <div className="space-y-2">
              <textarea
                maxLength={2000}
                value={specialTerms}
                onChange={(e) => setSpecialTerms(e.target.value)}
                placeholder="당사자 간 합의한 특약사항을 입력하세요"
                rows={5}
                disabled={!IS_EDITABLE}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-3 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground text-right">{specialTerms.length} / 2,000</p>
            </div>
          </section>

          {/* ═══ Section 7: 첨부파일 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">첨부파일</h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!IS_EDITABLE || files.length >= MAX_FILES}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="size-6" />
              <span className="text-sm font-medium">파일 업로드</span>
              <span className="text-xs">PDF, JPG, PNG · 최대 20MB · {files.length}/{MAX_FILES}</span>
            </button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFilePick} className="hidden" />
            {files.length > 0 && (
              <div className="mt-4 divide-y">
                {files.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="size-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.size}</p>
                      </div>
                    </div>
                    {IS_EDITABLE && (
                      <button onClick={() => setFiles(prev => prev.filter(f => f.id !== item.id))} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ═══ UCanSign 안내 ═══ */}
          <section className="rounded-2xl bg-violet-500/[0.05] ring-1 ring-violet-500/20 p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 shrink-0">
                <Shield className="size-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">전자서명 · 유캔사인(UCanSign)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  편집 완료 후 서명을 요청하면, 유캔사인 전자서명 서비스를 통해 계약이 진행됩니다.
                  을(건축사) → 갑(건축주) 순서로 서명하며, 서명 기한은 14일입니다.
                  카카오 인증 또는 이메일로 서명할 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* ═══ Action Buttons ═══ */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl h-11 px-6" asChild>
                <Link to={`/contracts/${id || "CTR-20260308-0001"}`}>취소</Link>
              </Button>
              <Button variant="outline" className="rounded-xl h-11 px-6">
                임시저장
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-11 px-6"
                onClick={() => alert("편집 완료 → isEditable=false")}
              >
                편집 완료
              </Button>
              <Button
                className="rounded-xl h-11 px-6"
                disabled={rateSum !== 100 || IS_EDITABLE}
              >
                서명 재요청 (UCanSign)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

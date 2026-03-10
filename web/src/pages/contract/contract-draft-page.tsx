import { useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Lock, Upload, X, FileText, AlertTriangle,
  Plus, Trash2, History, Eye, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type ContractType = "설계" | "시공" | "감리";

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

interface MaterialItem {
  materialName: string;
  spec: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  remark: string;
}

interface DefectItem {
  category: string;
  periodYears: string;
  remark: string;
}

interface SupervisionTeamMember {
  role: string;
  name: string;
  qualification: string;
  licenseNumber: string;
  deploymentPeriod: string;
  isResident: boolean;
}

interface InspectionPlanItem {
  stage: string;
  inspectionItems: string;
  timing: string;
  reportType: string;
  frequency: string;
}

interface FieldHistory {
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByRole: "건축주" | "건축사" | "시공사" | "감리업체";
  updatedAt: string;
}

type ContractStatus = "요청" | "수락" | "편집중" | "편집완료" | "서명요청" | "서명진행" | "체결" | "거부" | "만료";

/* ─── Constants ─── */

const CONSTRUCTION_TYPES = [
  { value: "new", label: "신축" }, { value: "extension", label: "증축" },
  { value: "renovation", label: "개축" }, { value: "reconstruction", label: "재축" },
  { value: "relocation", label: "이전" }, { value: "majorRepair", label: "대수선" },
  { value: "changeOfUse", label: "용도변경" },
] as const;

const DEFAULT_DESIGN_PAYMENTS: PaymentMethod[] = [
  { paymentCondition: "기본설계", progressRate: "20", paymentAmount: "8400000", dueDate: "2026-05-01", remark: "" },
  { paymentCondition: "실시설계", progressRate: "30", paymentAmount: "12600000", dueDate: "2026-07-01", remark: "" },
  { paymentCondition: "인허가", progressRate: "30", paymentAmount: "12600000", dueDate: "2026-09-01", remark: "" },
  { paymentCondition: "준공", progressRate: "20", paymentAmount: "8400000", dueDate: "2026-11-01", remark: "" },
];

const DEFAULT_CONSTRUCTION_PAYMENTS: PaymentMethod[] = [
  { paymentCondition: "계약금", progressRate: "20", paymentAmount: "60000000", dueDate: "", remark: "착공 시" },
  { paymentCondition: "1차 기성", progressRate: "20", paymentAmount: "60000000", dueDate: "", remark: "골조 완료" },
  { paymentCondition: "2차 기성", progressRate: "20", paymentAmount: "60000000", dueDate: "", remark: "마감 50%" },
  { paymentCondition: "3차 기성", progressRate: "20", paymentAmount: "60000000", dueDate: "", remark: "마감 완료" },
  { paymentCondition: "잔금", progressRate: "20", paymentAmount: "60000000", dueDate: "", remark: "준공 후" },
];

const DEFAULT_SUPERVISION_PAYMENTS: PaymentMethod[] = [
  { paymentCondition: "계약금", progressRate: "30", paymentAmount: "9000000", dueDate: "", remark: "감리 착수 시" },
  { paymentCondition: "중간감리비", progressRate: "40", paymentAmount: "12000000", dueDate: "", remark: "골조 완료 시" },
  { paymentCondition: "잔금", progressRate: "30", paymentAmount: "9000000", dueDate: "", remark: "감리 완료 시" },
];

const DEFAULT_DOCUMENTS: DesignDocument[] = [
  { category: "설계도", spec: "A3", quantity: "2부", remark: "" },
  { category: "구조계산서", spec: "A4", quantity: "2부", remark: "" },
  { category: "투시도", spec: "A2", quantity: "1부", remark: "" },
];

const DEFAULT_MATERIALS: MaterialItem[] = [
  { materialName: "레미콘 25-210-12", spec: "25MPa", unit: "m³", quantity: "50", unitPrice: "80000", amount: "4000000", remark: "" },
  { materialName: "철근 HD13", spec: "HD13", unit: "ton", quantity: "3", unitPrice: "900000", amount: "2700000", remark: "" },
];

const DEFAULT_DEFECT_ITEMS: DefectItem[] = [
  { category: "구조체", periodYears: "5", remark: "" },
  { category: "방수", periodYears: "3", remark: "" },
  { category: "미장", periodYears: "2", remark: "" },
  { category: "도장", periodYears: "1", remark: "" },
];

const DEFAULT_TEAM: SupervisionTeamMember[] = [
  { role: "총괄감리원", name: "", qualification: "건축사", licenseNumber: "", deploymentPeriod: "전체 기간", isResident: true },
  { role: "건축분야감리원", name: "", qualification: "건축기사", licenseNumber: "", deploymentPeriod: "전체 기간", isResident: true },
  { role: "구조분야감리원", name: "", qualification: "구조기술사", licenseNumber: "", deploymentPeriod: "골조 공정", isResident: false },
  { role: "설비분야감리원", name: "", qualification: "설비기사", licenseNumber: "", deploymentPeriod: "설비 공정", isResident: false },
];

const DEFAULT_INSPECTION: InspectionPlanItem[] = [
  { stage: "기초공사", inspectionItems: "배근검측", timing: "콘크리트 타설 전", reportType: "검측보고서", frequency: "시행 시" },
  { stage: "골조공사", inspectionItems: "배근검측, 콘크리트타설", timing: "매층", reportType: "공정보고서", frequency: "주간" },
  { stage: "방수공사", inspectionItems: "방수시공 검측", timing: "시공 전", reportType: "검측보고서", frequency: "시행 시" },
  { stage: "마감공사", inspectionItems: "내외장마감 검측", timing: "마감 전", reportType: "월간보고서", frequency: "월간" },
  { stage: "설비공사", inspectionItems: "배관매립 검측", timing: "매립 전", reportType: "검측보고서", frequency: "시행 시" },
];

const MOCK_CLIENT = { name: "이건축주", regNumber: "880101-1******", address: "서울 강남구 역삼동 123-4", contact: "010-1234-5678" };
const MOCK_ARCHITECT = { name: "아크 건축사사무소", regNumber: "제2014-123호", address: "서울 강남구 역삼로 123", contact: "02-1234-5678" };
const MOCK_CONTRACTOR = { name: "한양건설 주식회사", regNumber: "건설-2018-45678", address: "서울 서초구 서초대로 456", contact: "02-987-6543" };
const MOCK_SUPERVISOR = { name: "대한감리 주식회사", regNumber: "감리-2019-12345", address: "서울 종로구 종로 789", contact: "02-456-7890" };

const MOCK_BUILDING = {
  name: "역삼동 단독주택 신축공사", location: "서울 강남구 역삼동 123-4",
  constructionType: "new" as const, landArea: 198, buildingUse: "단독주택",
  structureType: "철근콘크리트구조", numberOfFloors: "지하 1층, 지상 3층",
  buildingCoverageArea: 118.8, totalFloorArea: 356.4,
};

const MOCK_HISTORIES: FieldHistory[] = [
  { oldValue: "35,000,000", newValue: "42,000,000", changedBy: "이건축주", changedByRole: "건축주", updatedAt: "2026-03-08 14:30" },
];

const MAX_FILES = 10;

/* ─── Helpers ─── */

function parseNumber(raw: string): number { return Number(raw.replace(/[^0-9]/g, "")) || 0; }
function formatNumber(n: number): string { return n.toLocaleString("ko-KR"); }
function toSqmPyeong(m2: number): string { return `${formatNumber(m2)} m² (${(m2 * 0.3025).toFixed(1)}평)`; }

const KOREAN_UNITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const KOREAN_PLACES = ["", "십", "백", "천"];
const KOREAN_BIGS = ["", "만", "억", "조"];
function numberToKorean(n: number): string {
  if (n === 0) return "영";
  const s = String(n); const len = s.length; let r = "";
  for (let i = 0; i < len; i++) {
    const d = Number(s[i]); const pos = len - 1 - i;
    const bi = Math.floor(pos / 4); const pi = pos % 4;
    if (d !== 0) { r += (d === 1 && pi > 0) ? KOREAN_PLACES[pi] : KOREAN_UNITS[d] + KOREAN_PLACES[pi]; }
    if (pi === 0 && bi > 0 && r.length > 0) r += KOREAN_BIGS[bi];
  }
  return r;
}
function formatFullCurrency(amount: number): string {
  if (amount === 0) return "₩ 0";
  return `일금 ${numberToKorean(amount)}원정 (₩ ${formatNumber(amount)})`;
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
    요청: "bg-amber-500/10 text-amber-600", 수락: "bg-blue-500/10 text-blue-600",
    편집중: "bg-primary/10 text-primary", 편집완료: "bg-emerald-500/10 text-emerald-600",
    서명요청: "bg-violet-500/10 text-violet-600", 서명진행: "bg-violet-500/10 text-violet-600",
    체결: "bg-emerald-500/10 text-emerald-600", 거부: "bg-red-500/10 text-red-600",
    만료: "bg-zinc-500/10 text-zinc-600",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />{status}
    </span>
  );
}

function HistoryDrawer({ histories, onClose }: { histories: FieldHistory[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-background shadow-2xl p-6 overflow-y-auto animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold">변경 이력</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        <div className="space-y-4">
          {histories.map((h, i) => (
            <div key={i} className="rounded-xl ring-1 ring-black/[0.08] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.changedByRole === "건축주" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"}`}>{h.changedByRole}</span>
                <span className="text-xs text-muted-foreground">{h.updatedAt}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{h.changedBy}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="line-through text-muted-foreground">₩{formatNumber(parseNumber(h.oldValue))}</span>
                <span>→</span>
                <span className="font-semibold">₩{formatNumber(parseNumber(h.newValue))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function ContractDraftPage() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const contractType: ContractType = typeParam === "시공" || typeParam === "construction" ? "시공"
    : typeParam === "감리" || typeParam === "supervision" ? "감리" : "설계";

  const CONTRACT_STATUS: ContractStatus = "편집중";
  const IS_EDITABLE = true;
  const building = MOCK_BUILDING;

  // 공통 계약 조건
  const [contractedArea, setContractedArea] = useState(String(building.totalFloorArea));
  const [contractAmountRaw, setContractAmountRaw] = useState(
    contractType === "설계" ? "42,000,000" : contractType === "시공" ? "300,000,000" : "30,000,000"
  );
  const [contractDate, setContractDate] = useState("2026-03-15");
  const [paymentPeriod, setPaymentPeriod] = useState("성과품 수령 후 14일 이내");
  const [specialTerms, setSpecialTerms] = useState("");

  // 시공 전용
  const [constructionStartDate, setConstructionStartDate] = useState("2026-04-01");
  const [constructionEndDate, setConstructionEndDate] = useState("2027-03-31");
  const [delayPenaltyRate, setDelayPenaltyRate] = useState("0.1");
  const [materials, setMaterials] = useState<MaterialItem[]>(DEFAULT_MATERIALS);
  const [warrantyPeriod, setWarrantyPeriod] = useState("3");
  const [warrantyRate, setWarrantyRate] = useState("3");
  const [warrantyMethod, setWarrantyMethod] = useState("보증보험");
  const [defectItems, setDefectItems] = useState<DefectItem[]>(DEFAULT_DEFECT_ITEMS);

  // 감리 전용
  const [supervisionStartDate, setSupervisionStartDate] = useState("2026-04-01");
  const [supervisionEndDate, setSupervisionEndDate] = useState("2027-03-31");
  const [contractorName, setContractorName] = useState("한양건설 주식회사");
  const [contractorContact, setContractorContact] = useState("02-987-6543");
  const [teamMembers, setTeamMembers] = useState<SupervisionTeamMember[]>(DEFAULT_TEAM);
  const [inspectionPlan, setInspectionPlan] = useState<InspectionPlanItem[]>(DEFAULT_INSPECTION);

  // 공통
  const defaultPayments = contractType === "시공" ? DEFAULT_CONSTRUCTION_PAYMENTS : contractType === "감리" ? DEFAULT_SUPERVISION_PAYMENTS : DEFAULT_DESIGN_PAYMENTS;
  const [payments, setPayments] = useState<PaymentMethod[]>(defaultPayments);
  const [documents, setDocuments] = useState<DesignDocument[]>(DEFAULT_DOCUMENTS);
  const [files, setFiles] = useState<{ name: string; size: string; id: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const contractAmount = parseNumber(contractAmountRaw);
  const rateSum = payments.reduce((s, p) => s + (Number(p.progressRate) || 0), 0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) setContractAmountRaw(raw === "" ? "" : formatNumber(Number(raw)));
  };

  const updatePayment = useCallback((idx: number, field: keyof PaymentMethod, value: string) => {
    setPayments(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "progressRate") next[idx].paymentAmount = String(Math.floor(contractAmount * (Number(value) || 0) / 100));
      return next;
    });
  }, [contractAmount]);

  const addPaymentRow = () => setPayments(prev => [...prev, { paymentCondition: "", progressRate: "", paymentAmount: "0", dueDate: "", remark: "" }]);
  const removePaymentRow = (idx: number) => setPayments(prev => prev.filter((_, i) => i !== idx));

  // 설계 도서 조작
  const updateDocument = useCallback((idx: number, field: keyof DesignDocument, value: string) => {
    setDocuments(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: value }; return n; });
  }, []);
  const addDocumentRow = () => setDocuments(prev => [...prev, { category: "", spec: "", quantity: "", remark: "" }]);
  const removeDocumentRow = (idx: number) => setDocuments(prev => prev.filter((_, i) => i !== idx));

  // 자재 내역 조작 (시공)
  const updateMaterial = useCallback((idx: number, field: keyof MaterialItem, value: string) => {
    setMaterials(prev => {
      const n = [...prev]; n[idx] = { ...n[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        n[idx].amount = String((Number(n[idx].quantity) || 0) * (Number(n[idx].unitPrice) || 0));
      }
      return n;
    });
  }, []);
  const addMaterialRow = () => setMaterials(prev => [...prev, { materialName: "", spec: "", unit: "", quantity: "", unitPrice: "", amount: "0", remark: "" }]);
  const removeMaterialRow = (idx: number) => setMaterials(prev => prev.filter((_, i) => i !== idx));

  // 하자보증 공종 조작 (시공)
  const addDefectRow = () => setDefectItems(prev => [...prev, { category: "", periodYears: "", remark: "" }]);
  const removeDefectRow = (idx: number) => setDefectItems(prev => prev.filter((_, i) => i !== idx));

  // 감리원 조작 (감리)
  const addTeamRow = () => setTeamMembers(prev => [...prev, { role: "", name: "", qualification: "", licenseNumber: "", deploymentPeriod: "", isResident: false }]);
  const removeTeamRow = (idx: number) => setTeamMembers(prev => prev.filter((_, i) => i !== idx));

  // 검측 계획 조작 (감리)
  const addInspectionRow = () => setInspectionPlan(prev => [...prev, { stage: "", inspectionItems: "", timing: "", reportType: "", frequency: "" }]);
  const removeInspectionRow = (idx: number) => setInspectionPlan(prev => prev.filter((_, i) => i !== idx));

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files; if (!picked) return;
    const nf: typeof files = [];
    for (let i = 0; i < picked.length; i++) {
      const f = picked[i];
      if (files.length + nf.length >= MAX_FILES) break;
      nf.push({ name: f.name, size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)}KB` : `${(f.size / (1024 * 1024)).toFixed(1)}MB`, id: crypto.randomUUID() });
    }
    setFiles(prev => [...prev, ...nf]);
    e.target.value = "";
  };

  const contractTitle = contractType === "시공" ? "건설공사 표준도급계약서" : contractType === "감리" ? "건설공사 감리용역계약서" : "건축설계 표준계약서";
  const contractLaw = contractType === "시공" ? "「건설산업기본법」 제22조 근거" : contractType === "감리" ? "「건축법」 제25조 근거" : "「건축사법」 제23조제1항 근거";
  const partyB = contractType === "시공" ? MOCK_CONTRACTOR : contractType === "감리" ? MOCK_SUPERVISOR : MOCK_ARCHITECT;
  const partyBLabel = contractType === "시공" ? "수급인/시공사" : contractType === "감리" ? "수탁인/감리업체" : "건축사";
  const partyALabel = contractType === "시공" ? "도급인/건축주" : contractType === "감리" ? "위탁인/건축주" : "건축주";
  const regLabel = contractType === "시공" ? "건설업등록번호" : contractType === "감리" ? "감리업등록번호" : "건축사 등록번호";
  const amountLabel = contractType === "시공" ? "계약금액" : contractType === "감리" ? "감리대가" : "계약금액";

  const constructionDays = constructionStartDate && constructionEndDate
    ? Math.max(0, Math.floor((new Date(constructionEndDate).getTime() - new Date(constructionStartDate).getTime()) / 86400000))
    : 0;
  const supervisionDays = supervisionStartDate && supervisionEndDate
    ? Math.max(0, Math.floor((new Date(supervisionEndDate).getTime() - new Date(supervisionStartDate).getTime()) / 86400000))
    : 0;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      {historyOpen && <HistoryDrawer histories={MOCK_HISTORIES} onClose={() => setHistoryOpen(false)} />}

      <div className="mx-auto max-w-[860px] px-6 py-8">
        <Link to="/mypage" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />마이페이지
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{contractTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{contractLaw}</p>
            <p className="mt-1 text-xs text-muted-foreground">CTR-20260308-0001</p>
          </div>
          <StatusBadge status={CONTRACT_STATUS} />
        </div>

        {/* 편집 모드 배너 */}
        {IS_EDITABLE && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/[0.05] p-4 ring-1 ring-primary/20">
            <Eye className="size-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">양측 편집 모드</p>
              <p className="text-xs text-muted-foreground">건축주와 {contractType === "시공" ? "시공사" : contractType === "감리" ? "감리업체" : "건축사"} 모두 계약 내용을 수정할 수 있습니다.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg shrink-0 gap-1.5" onClick={() => setHistoryOpen(true)}>
              <History className="size-3.5" />이력
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {/* ═══ 1. 계약 당사자 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">계약 당사자</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-xl ring-1 ring-black/[0.06] p-5 space-y-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">갑 ({partyALabel})</p>
                <ReadonlyField label="성명" value={MOCK_CLIENT.name} />
                <ReadonlyField label="사업자등록번호" value={MOCK_CLIENT.regNumber} />
                <ReadonlyField label="주소" value={MOCK_CLIENT.address} />
                <ReadonlyField label="연락처" value={MOCK_CLIENT.contact} />
              </div>
              <div className="rounded-xl ring-1 ring-black/[0.06] p-5 space-y-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">을 ({partyBLabel})</p>
                <ReadonlyField label="상호" value={partyB.name} />
                <ReadonlyField label={regLabel} value={partyB.regNumber} />
                <ReadonlyField label="주소" value={partyB.address} />
                <ReadonlyField label="연락처" value={partyB.contact} />
              </div>
            </div>
          </section>

          {/* ═══ 2. 건축물/공사 개요 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">{contractType === "설계" ? "건축물 개요" : "공사 개요"}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              {[
                { label: "건물명칭", value: building.name },
                { label: "대지위치", value: building.location },
                { label: "대지면적", value: toSqmPyeong(building.landArea) },
                { label: "건축물용도", value: building.buildingUse },
                { label: "건축물구조", value: building.structureType },
                { label: "층수", value: building.numberOfFloors },
                { label: "건축면적", value: toSqmPyeong(building.buildingCoverageArea) },
                { label: "연면적", value: toSqmPyeong(building.totalFloorArea) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <div className="flex items-center gap-1.5"><Lock className="size-3 text-muted-foreground/50" /><p className="text-sm font-medium">{value}</p></div>
                </div>
              ))}
            </div>

            {/* 감리: 시공사 정보 */}
            {contractType === "감리" && (
              <>
                <Separator className="my-5" />
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>시공사 상호</Label>
                    <Input value={contractorName} onChange={(e) => setContractorName(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} />
                  </div>
                  <div className="space-y-2">
                    <Label>시공사 연락처</Label>
                    <Input value={contractorContact} onChange={(e) => setContractorContact(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} />
                  </div>
                </div>
              </>
            )}

            <Separator className="my-5" />
            <div>
              <p className="text-xs text-muted-foreground mb-3">공사 유형</p>
              <div className="flex flex-wrap gap-2">
                {CONSTRUCTION_TYPES.map((ct) => (
                  <div key={ct.value} className="flex items-center gap-1.5">
                    <div className={`size-4 rounded border-2 flex items-center justify-center shrink-0 ${building.constructionType === ct.value ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                      {building.constructionType === ct.value && <Check className="size-2.5 text-primary-foreground" />}
                    </div>
                    <span className={`text-sm ${building.constructionType === ct.value ? "font-medium" : "text-muted-foreground"}`}>{ct.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ 3. 계약 조건 ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">계약 조건</h2>
              <button onClick={() => setHistoryOpen(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <History className="size-3.5" />변경 이력
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <Label>{contractType === "설계" ? "계약 면적" : "계약 면적"}</Label>
                <div className="relative">
                  <Input type="number" step="0.1" value={contractedArea} onChange={(e) => setContractedArea(e.target.value)} className="rounded-xl h-11 pr-16" disabled={!IS_EDITABLE} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m² ({(Number(contractedArea) * 0.3025).toFixed(1)}평)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{amountLabel}</Label>
                <div className="relative">
                  <Input type="text" inputMode="numeric" value={contractAmountRaw} onChange={handleAmountChange} className="rounded-xl h-11 pr-8" disabled={!IS_EDITABLE} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                </div>
              </div>
            </div>
            {contractAmount > 0 && (
              <div className="rounded-xl bg-muted/50 p-3 mb-5"><p className="text-sm text-muted-foreground">{formatFullCurrency(contractAmount)}</p></div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2"><Label>계약일</Label><Input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} /></div>
              <div className="space-y-2"><Label>대금 지급 기한</Label><Input value={paymentPeriod} onChange={(e) => setPaymentPeriod(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} placeholder="예: 성과품 수령 후 14일 이내" /></div>
            </div>

            {/* 시공 전용 필드 */}
            {contractType === "시공" && (
              <>
                <Separator className="my-5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-3">
                  <div className="space-y-2"><Label>착공일</Label><Input type="date" value={constructionStartDate} onChange={(e) => setConstructionStartDate(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} /></div>
                  <div className="space-y-2"><Label>준공예정일</Label><Input type="date" value={constructionEndDate} onChange={(e) => setConstructionEndDate(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>공사기간</Label>
                    <div className="rounded-xl h-11 border border-input bg-muted/30 px-3 flex items-center text-sm">{constructionDays > 0 ? `${constructionDays}일 (자동계산)` : "—"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>지체상금율 (%)</Label>
                    <Input type="number" step="0.01" value={delayPenaltyRate} onChange={(e) => setDelayPenaltyRate(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} placeholder="0.1" />
                    <p className="text-xs text-muted-foreground">일 기준, 기본 0.1%</p>
                  </div>
                </div>
              </>
            )}

            {/* 감리 전용 필드 */}
            {contractType === "감리" && (
              <>
                <Separator className="my-5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-3">
                  <div className="space-y-2"><Label>감리 시작일</Label><Input type="date" value={supervisionStartDate} onChange={(e) => setSupervisionStartDate(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} /></div>
                  <div className="space-y-2"><Label>감리 종료예정일</Label><Input type="date" value={supervisionEndDate} onChange={(e) => setSupervisionEndDate(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} /></div>
                </div>
                <div className="space-y-2">
                  <Label>감리기간</Label>
                  <div className="rounded-xl h-11 border border-input bg-muted/30 px-3 flex items-center text-sm">{supervisionDays > 0 ? `${supervisionDays}일 (자동계산)` : "—"}</div>
                </div>
              </>
            )}
          </section>

          {/* ═══ 4. 기성 지불 일정 (공통) ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">{contractType === "감리" ? "감리비 지불 일정" : contractType === "시공" ? "공정별 기성 일정" : "기성 지불 일정"}</h2>
              {IS_EDITABLE && <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addPaymentRow}><Plus className="size-3.5" />행 추가</Button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted-foreground">
                  <th className="py-3 pr-2 font-medium w-8">#</th>
                  <th className="py-3 pr-2 font-medium">{contractType === "감리" ? "감리단계" : "기성"}</th>
                  <th className="py-3 pr-2 font-medium w-20 text-right">{contractType === "감리" ? "비율(%)" : "기성율(%)"}</th>
                  <th className="py-3 pr-2 font-medium w-32 text-right">금액(원)</th>
                  <th className="py-3 pr-2 font-medium w-32">지급예정일</th>
                  <th className="py-3 font-medium">비고</th>
                  {IS_EDITABLE && <th className="py-3 w-8" />}
                </tr></thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2"><Input value={p.paymentCondition} onChange={(e) => updatePayment(idx, "paymentCondition", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input type="number" min={0} max={100} value={p.progressRate} onChange={(e) => updatePayment(idx, "progressRate", e.target.value)} className="rounded-lg h-8 w-20 text-right text-sm ml-auto" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2 text-right tabular-nums font-medium text-sm">{formatNumber(Number(p.paymentAmount) || 0)}</td>
                      <td className="py-2 pr-2"><Input type="date" value={p.dueDate} onChange={(e) => updatePayment(idx, "dueDate", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2"><Input value={p.remark} onChange={(e) => updatePayment(idx, "remark", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} placeholder="—" /></td>
                      {IS_EDITABLE && <td className="py-2 pl-1"><button onClick={() => removePaymentRow(idx)} className="text-muted-foreground/50 hover:text-red-500 transition-colors" disabled={payments.length <= 1}><Trash2 className="size-3.5" /></button></td>}
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t font-semibold">
                  <td className="py-3 pr-2" colSpan={2}>합계</td>
                  <td className="py-3 pr-2 text-right">
                    {rateSum !== 100
                      ? <span className="text-red-500 flex items-center justify-end gap-1"><AlertTriangle className="size-3.5" />{rateSum}%</span>
                      : <span className="flex items-center justify-end gap-1 text-emerald-600"><Check className="size-3.5" />100%</span>
                    }
                  </td>
                  <td className="py-3 pr-2 text-right tabular-nums">{formatNumber(payments.reduce((s, p) => s + (Number(p.paymentAmount) || 0), 0))}</td>
                  <td colSpan={IS_EDITABLE ? 3 : 2} />
                </tr></tfoot>
              </table>
            </div>
            {rateSum !== 100 && <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5"><AlertTriangle className="size-4" />기성율 합계: {rateSum}% — 100%여야 서명 요청이 가능합니다</p>}
          </section>

          {/* ═══ 5A. 설계 도서 (설계 전용) ═══ */}
          {contractType === "설계" && (
            <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold">설계 도서</h2>
                {IS_EDITABLE && <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addDocumentRow}><Plus className="size-3.5" />행 추가</Button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground">
                    <th className="py-3 pr-2 font-medium w-8">#</th><th className="py-3 pr-2 font-medium">분류</th><th className="py-3 pr-2 font-medium w-24">규격</th><th className="py-3 pr-2 font-medium w-20">수량</th><th className="py-3 font-medium">비고</th>{IS_EDITABLE && <th className="py-3 w-8" />}
                  </tr></thead>
                  <tbody>{documents.map((d, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2"><Input value={d.category} onChange={(e) => updateDocument(idx, "category", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={d.spec} onChange={(e) => updateDocument(idx, "spec", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={d.quantity} onChange={(e) => updateDocument(idx, "quantity", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2"><Input value={d.remark} onChange={(e) => updateDocument(idx, "remark", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} placeholder="—" /></td>
                      {IS_EDITABLE && <td className="py-2 pl-1"><button onClick={() => removeDocumentRow(idx)} className="text-muted-foreground/50 hover:text-red-500 transition-colors"><Trash2 className="size-3.5" /></button></td>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ 5B. 자재 내역 (시공 전용) ═══ */}
          {contractType === "시공" && (
            <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold">자재 내역</h2>
                {IS_EDITABLE && <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addMaterialRow}><Plus className="size-3.5" />행 추가</Button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground">
                    <th className="py-3 pr-2 font-medium w-8">#</th><th className="py-3 pr-2 font-medium">자재명</th><th className="py-3 pr-2 font-medium w-20">규격</th><th className="py-3 pr-2 font-medium w-14">단위</th><th className="py-3 pr-2 font-medium w-16 text-right">수량</th><th className="py-3 pr-2 font-medium w-24 text-right">단가</th><th className="py-3 pr-2 font-medium w-28 text-right">금액</th><th className="py-3 font-medium">비고</th>{IS_EDITABLE && <th className="py-3 w-8" />}
                  </tr></thead>
                  <tbody>{materials.map((m, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2"><Input value={m.materialName} onChange={(e) => updateMaterial(idx, "materialName", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={m.spec} onChange={(e) => updateMaterial(idx, "spec", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={m.unit} onChange={(e) => updateMaterial(idx, "unit", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input type="number" value={m.quantity} onChange={(e) => updateMaterial(idx, "quantity", e.target.value)} className="rounded-lg h-8 text-sm text-right" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input type="number" value={m.unitPrice} onChange={(e) => updateMaterial(idx, "unitPrice", e.target.value)} className="rounded-lg h-8 text-sm text-right" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2 text-right tabular-nums font-medium">{formatNumber(Number(m.amount) || 0)}</td>
                      <td className="py-2"><Input value={m.remark} onChange={(e) => updateMaterial(idx, "remark", e.target.value)} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} placeholder="—" /></td>
                      {IS_EDITABLE && <td className="py-2 pl-1"><button onClick={() => removeMaterialRow(idx)} className="text-muted-foreground/50 hover:text-red-500 transition-colors"><Trash2 className="size-3.5" /></button></td>}
                    </tr>
                  ))}</tbody>
                  <tfoot><tr className="border-t font-semibold"><td className="py-3" colSpan={6}>자재비 합계</td><td className="py-3 text-right tabular-nums">₩{formatNumber(materials.reduce((s, m) => s + (Number(m.amount) || 0), 0))}</td><td colSpan={IS_EDITABLE ? 2 : 1} /></tr></tfoot>
                </table>
              </div>
            </section>
          )}

          {/* ═══ 6B. 하자보증 (시공 전용) ═══ */}
          {contractType === "시공" && (
            <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
              <h2 className="text-base font-semibold mb-5">하자보증</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2"><Label>하자보증기간 (년)</Label><Input type="number" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} /><p className="text-xs text-muted-foreground">기본 3년</p></div>
                <div className="space-y-2"><Label>하자보증금율 (%)</Label><Input type="number" step="0.1" value={warrantyRate} onChange={(e) => setWarrantyRate(e.target.value)} className="rounded-xl h-11" disabled={!IS_EDITABLE} /><p className="text-xs text-muted-foreground">기본 3%</p></div>
              </div>
              <div className="space-y-2 mb-5">
                <Label>하자보증 방법</Label>
                <div className="flex flex-wrap gap-2">
                  {["현금보증", "보증보험", "이행보증보험"].map((m) => (
                    <button key={m} type="button" onClick={() => setWarrantyMethod(m)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${warrantyMethod === m ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{m}</button>
                  ))}
                </div>
              </div>
              <Separator className="mb-5" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">공종별 하자보증 세부 (선택)</p>
                {IS_EDITABLE && <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addDefectRow}><Plus className="size-3.5" />공종 추가</Button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-3 pr-2 font-medium w-8">#</th><th className="py-3 pr-2 font-medium">공종</th><th className="py-3 pr-2 font-medium w-24">보증기간(년)</th><th className="py-3 font-medium">비고</th>{IS_EDITABLE && <th className="py-3 w-8" />}</tr></thead>
                  <tbody>{defectItems.map((d, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2"><Input value={d.category} onChange={(e) => { const n = [...defectItems]; n[idx] = { ...n[idx], category: e.target.value }; setDefectItems(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input type="number" value={d.periodYears} onChange={(e) => { const n = [...defectItems]; n[idx] = { ...n[idx], periodYears: e.target.value }; setDefectItems(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2"><Input value={d.remark} onChange={(e) => { const n = [...defectItems]; n[idx] = { ...n[idx], remark: e.target.value }; setDefectItems(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} placeholder="—" /></td>
                      {IS_EDITABLE && <td className="py-2 pl-1"><button onClick={() => removeDefectRow(idx)} className="text-muted-foreground/50 hover:text-red-500 transition-colors"><Trash2 className="size-3.5" /></button></td>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ 5C. 감리원 배치계획 (감리 전용) ═══ */}
          {contractType === "감리" && (
            <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold">감리원 배치계획</h2>
                {IS_EDITABLE && <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addTeamRow}><Plus className="size-3.5" />감리원 추가</Button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground">
                    <th className="py-3 pr-2 font-medium w-8">#</th><th className="py-3 pr-2 font-medium">직급</th><th className="py-3 pr-2 font-medium w-24">성명</th><th className="py-3 pr-2 font-medium">자격</th><th className="py-3 pr-2 font-medium w-28">자격번호</th><th className="py-3 pr-2 font-medium w-24">투입기간</th><th className="py-3 pr-2 font-medium w-14">상주</th>{IS_EDITABLE && <th className="py-3 w-8" />}
                  </tr></thead>
                  <tbody>{teamMembers.map((t, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2"><Input value={t.role} onChange={(e) => { const n = [...teamMembers]; n[idx] = { ...n[idx], role: e.target.value }; setTeamMembers(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={t.name} onChange={(e) => { const n = [...teamMembers]; n[idx] = { ...n[idx], name: e.target.value }; setTeamMembers(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} placeholder="확정 후 기입" /></td>
                      <td className="py-2 pr-2"><Input value={t.qualification} onChange={(e) => { const n = [...teamMembers]; n[idx] = { ...n[idx], qualification: e.target.value }; setTeamMembers(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={t.licenseNumber} onChange={(e) => { const n = [...teamMembers]; n[idx] = { ...n[idx], licenseNumber: e.target.value }; setTeamMembers(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={t.deploymentPeriod} onChange={(e) => { const n = [...teamMembers]; n[idx] = { ...n[idx], deploymentPeriod: e.target.value }; setTeamMembers(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2 text-center">
                        <button type="button" onClick={() => { const n = [...teamMembers]; n[idx] = { ...n[idx], isResident: !n[idx].isResident }; setTeamMembers(n); }}
                          className={`size-4 rounded border-2 flex items-center justify-center ${t.isResident ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                          {t.isResident && <Check className="size-2.5 text-primary-foreground" />}
                        </button>
                      </td>
                      {IS_EDITABLE && <td className="py-2 pl-1"><button onClick={() => removeTeamRow(idx)} className="text-muted-foreground/50 hover:text-red-500 transition-colors"><Trash2 className="size-3.5" /></button></td>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ 6C. 검측 및 보고계획 (감리 전용) ═══ */}
          {contractType === "감리" && (
            <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold">검측 및 보고계획</h2>
                {IS_EDITABLE && <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8" onClick={addInspectionRow}><Plus className="size-3.5" />검측 추가</Button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground">
                    <th className="py-3 pr-2 font-medium w-8">#</th><th className="py-3 pr-2 font-medium">공정</th><th className="py-3 pr-2 font-medium">검측항목</th><th className="py-3 pr-2 font-medium w-24">시기</th><th className="py-3 pr-2 font-medium w-24">보고서</th><th className="py-3 pr-2 font-medium w-20">주기</th>{IS_EDITABLE && <th className="py-3 w-8" />}
                  </tr></thead>
                  <tbody>{inspectionPlan.map((ip, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-2"><Input value={ip.stage} onChange={(e) => { const n = [...inspectionPlan]; n[idx] = { ...n[idx], stage: e.target.value }; setInspectionPlan(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={ip.inspectionItems} onChange={(e) => { const n = [...inspectionPlan]; n[idx] = { ...n[idx], inspectionItems: e.target.value }; setInspectionPlan(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={ip.timing} onChange={(e) => { const n = [...inspectionPlan]; n[idx] = { ...n[idx], timing: e.target.value }; setInspectionPlan(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={ip.reportType} onChange={(e) => { const n = [...inspectionPlan]; n[idx] = { ...n[idx], reportType: e.target.value }; setInspectionPlan(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      <td className="py-2 pr-2"><Input value={ip.frequency} onChange={(e) => { const n = [...inspectionPlan]; n[idx] = { ...n[idx], frequency: e.target.value }; setInspectionPlan(n); }} className="rounded-lg h-8 text-sm" disabled={!IS_EDITABLE} /></td>
                      {IS_EDITABLE && <td className="py-2 pl-1"><button onClick={() => removeInspectionRow(idx)} className="text-muted-foreground/50 hover:text-red-500 transition-colors"><Trash2 className="size-3.5" /></button></td>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ 특약사항 (공통) ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">특약사항</h2>
            <textarea maxLength={2000} value={specialTerms} onChange={(e) => setSpecialTerms(e.target.value)} placeholder="당사자 간 합의한 특약사항을 입력하세요" rows={5} disabled={!IS_EDITABLE}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground text-right">{specialTerms.length} / 2,000</p>
          </section>

          {/* ═══ 첨부파일 (공통) ═══ */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">첨부파일</h2>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!IS_EDITABLE || files.length >= MAX_FILES}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            ><Upload className="size-6" /><span className="text-sm font-medium">파일 업로드</span><span className="text-xs">PDF, JPG, PNG · 최대 20MB · {files.length}/{MAX_FILES}</span></button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFilePick} className="hidden" />
            {files.length > 0 && (
              <div className="mt-4 divide-y">{files.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0"><FileText className="size-5 text-muted-foreground shrink-0" /><div className="min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-muted-foreground">{item.size}</p></div></div>
                  {IS_EDITABLE && <button onClick={() => setFiles(prev => prev.filter(f => f.id !== item.id))} className="text-muted-foreground hover:text-foreground transition-colors shrink-0"><X className="size-4" /></button>}
                </div>
              ))}</div>
            )}
          </section>

          {/* ═══ UCanSign 안내 (공통) ═══ */}
          <section className="rounded-2xl bg-violet-500/[0.05] ring-1 ring-violet-500/20 p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 shrink-0"><FileText className="size-5 text-violet-600" /></div>
              <div>
                <h3 className="text-sm font-semibold mb-1">전자서명 · 유캔사인(UCanSign)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  편집 완료 후 서명을 요청하면, 유캔사인 전자서명 서비스를 통해 계약이 진행됩니다.
                  을({contractType === "시공" ? "시공사" : contractType === "감리" ? "감리업체" : "건축사"}) → 갑(건축주) 순서로 서명하며, 서명 기한은 14일입니다.
                </p>
              </div>
            </div>
          </section>

          {/* ═══ Action Buttons ═══ */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Button variant="outline" className="rounded-xl h-11 px-6">임시저장</Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl h-11 px-6">편집 완료</Button>
              <Button className="rounded-xl h-11 px-6" disabled={rateSum !== 100 || IS_EDITABLE}>서명 요청 (UCanSign)</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

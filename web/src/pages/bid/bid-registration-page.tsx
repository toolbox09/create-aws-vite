import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Check, Upload, MapPin, X, Info,
  PenTool, HardHat, Eye, ArrowRight, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type BidCategory = "설계" | "시공" | "감리";

/* ─── Category Selection Gate ─── */

const CATEGORY_CARDS: {
  category: BidCategory;
  icon: typeof PenTool;
  title: string;
  subtitle: string;
  description: string;
  steps: string[];
  participants: string;
  color: string;
  bgColor: string;
}[] = [
  {
    category: "설계",
    icon: PenTool,
    title: "설계 입찰",
    subtitle: "건축설계 용역",
    description: "건축사사무소를 모집하여 기본설계·실시설계 용역을 위한 입찰을 진행합니다.",
    steps: ["부지 설정", "입찰 정책", "건축 규모", "건축 스타일", "신뢰 인증"],
    participants: "건축사사무소",
    color: "text-primary",
    bgColor: "bg-primary/8",
  },
  {
    category: "시공",
    icon: HardHat,
    title: "시공 입찰",
    subtitle: "건설공사 도급",
    description: "시공사를 모집하여 건축물 신축·증축·리모델링 공사를 위한 입찰을 진행합니다.",
    steps: ["부지 설정", "입찰 정책", "건축 규모", "시공 요구사항", "신뢰 인증"],
    participants: "종합건설사·전문건설사",
    color: "text-violet-600",
    bgColor: "bg-violet-500/8",
  },
  {
    category: "감리",
    icon: Eye,
    title: "감리 입찰",
    subtitle: "건설공사 감리용역",
    description: "감리업체를 모집하여 건축물 시공과정의 품질·안전 감리를 위한 입찰을 진행합니다.",
    steps: ["부지 설정", "입찰 정책", "건축 규모", "감리 요구사항", "신뢰 인증"],
    participants: "건축사사무소·감리전문회사",
    color: "text-blue-600",
    bgColor: "bg-blue-500/8",
  },
];

function CategoryGate({ onSelect }: { onSelect: (cat: BidCategory) => void }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[900px] px-6 py-8">
        <Link to="/bids" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />
          공고 목록
        </Link>

        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">어떤 입찰을 등록하시겠습니까?</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            프로젝트 유형에 따라 입력 항목과 모집 대상이 달라집니다.<br />
            유형 선택 후에는 변경이 어렵습니다. 신중하게 선택해 주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORY_CARDS.map((card, i) => {
            const Icon = card.icon;
            const isHovered = hoveredIndex === i;
            return (
              <button
                key={card.category}
                type="button"
                onClick={() => onSelect(card.category)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative flex flex-col rounded-2xl p-6 text-left ring-1 transition-all duration-200 ${
                  isHovered
                    ? "ring-foreground/20 shadow-md -translate-y-1"
                    : "ring-black/[0.08] shadow-sm hover:ring-black/[0.15]"
                }`}
              >
                {/* Icon */}
                <div className={`mb-4 flex size-12 items-center justify-center rounded-xl ${card.bgColor}`}>
                  <Icon className={`size-6 ${card.color}`} />
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold tracking-tight">{card.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>

                {/* Description */}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  {card.description}
                </p>

                {/* Steps preview */}
                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">진행 단계</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.steps.map((s, j) => (
                      <span key={j} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        <span className="text-[10px] text-muted-foreground/60">{j + 1}</span>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Participant type */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    모집 대상: <span className="font-medium text-foreground">{card.participants}</span>
                  </p>
                </div>

                {/* Hover CTA */}
                <div className={`mt-4 flex items-center gap-1.5 text-sm font-semibold transition-opacity ${isHovered ? "opacity-100" : "opacity-0"} ${card.color}`}>
                  시작하기 <ArrowRight className="size-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Constants ─── */

const STEPS_MAP: Record<BidCategory, { label: string; short: string }[]> = {
  설계: [
    { label: "사업 부지 설정", short: "부지" },
    { label: "입찰 정책", short: "정책" },
    { label: "건축 목적 및 규모", short: "규모" },
    { label: "건축 스타일", short: "스타일" },
    { label: "공고 신뢰 인증", short: "인증" },
  ],
  시공: [
    { label: "사업 부지 설정", short: "부지" },
    { label: "입찰 정책", short: "정책" },
    { label: "건축 목적 및 규모", short: "규모" },
    { label: "시공 요구사항", short: "요구사항" },
    { label: "공고 신뢰 인증", short: "인증" },
  ],
  감리: [
    { label: "사업 부지 설정", short: "부지" },
    { label: "입찰 정책", short: "정책" },
    { label: "건축 목적 및 규모", short: "규모" },
    { label: "감리 요구사항", short: "요구사항" },
    { label: "공고 신뢰 인증", short: "인증" },
  ],
};

// 설계 Step 4
const DESIGN_ELEMENTS = ["다락방", "루프탑", "테라스", "중정", "필로티", "발코니", "옥상정원", "복층"];
const EXTERIOR_MATERIALS = ["노출콘크리트", "징크", "목재", "벽돌", "스톤", "유리커튼월", "알루미늄패널", "스타코"];

// 시공 Step 4
const STRUCTURE_TYPES = ["철근콘크리트(RC)", "철골(S)", "철골철근콘크리트(SRC)", "목조", "조적", "경량철골"];
const CONSTRUCTION_METHODS = ["라멘구조", "벽식구조", "기둥보구조", "프리캐스트(PC)", "모듈러"];
const MAJOR_MATERIALS = ["레미콘", "철근", "시멘트벽돌", "경량기포콘크리트(ALC)", "목재(집성목)", "징크", "적벽돌", "석재"];
const INTERIOR_SCOPES = ["바닥(타일/마루)", "벽체(도장/벽지)", "천장(몰딩/텍스)", "주방(싱크대/가전)", "욕실(위생도기)", "조명(등기구)", "붙박이가구", "창호(단열샤시)"];
const MEP_SCOPES = ["기계설비(냉난방)", "전기설비(조명/콘센트)", "소방설비", "통신설비", "엘리베이터", "태양광"];

// 감리 Step 4
const SUPERVISION_SCOPES = ["건축감리", "구조감리", "기계설비감리", "전기설비감리", "소방감리", "토목감리"];
const INSPECTION_ITEMS = ["기초공사", "골조공사", "방수공사", "단열공사", "마감공사", "설비공사", "창호공사", "소방시설"];
const REPORT_FREQUENCIES = ["일간", "주간", "월간", "공정단계별"];

// 공통
const BUSINESS_PURPOSES = ["주거용", "상업용", "업무용", "공업용", "복합용"];
const BUILDING_USES = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장", "창고"];

const CERT_ITEMS_MAP: Record<BidCategory, { id: string; label: string; desc: string }[]> = {
  설계: [
    { id: "land", label: "토지 소유 확인서", desc: "토지등기부등본 또는 토지대장" },
    { id: "building", label: "건축 가능 여부 확인", desc: "토지이용계획확인서" },
    { id: "permit", label: "건축 허가서", desc: "건축허가 또는 신고필증 (선택)" },
  ],
  시공: [
    { id: "land", label: "토지 소유 확인서", desc: "토지등기부등본 또는 토지대장" },
    { id: "permit", label: "건축 허가서", desc: "건축허가 또는 신고필증" },
    { id: "design_doc", label: "설계도서 확보 확인", desc: "설계도서 보유 확인 (설계 계약서 또는 도면 첨부)" },
  ],
  감리: [
    { id: "land", label: "토지 소유 확인서", desc: "토지등기부등본 또는 토지대장" },
    { id: "permit", label: "건축 허가서", desc: "건축허가 또는 신고필증" },
    { id: "design_doc", label: "설계도서 확보 확인", desc: "설계도서 보유 확인" },
    { id: "construction", label: "시공 계약 확보 확인", desc: "시공 계약 체결 확인서" },
  ],
};

const CATEGORY_HEADER: Record<BidCategory, { label: string; color: string; bgColor: string; icon: typeof PenTool }> = {
  설계: { label: "설계 입찰", color: "text-primary", bgColor: "bg-primary/8", icon: PenTool },
  시공: { label: "시공 입찰", color: "text-violet-600", bgColor: "bg-violet-500/8", icon: HardHat },
  감리: { label: "감리 입찰", color: "text-blue-600", bgColor: "bg-blue-500/8", icon: Eye },
};

/* ─── Progress Bar Stepper ─── */

function ProgressStepper({ steps, current }: { steps: { label: string }[]; current: number }) {
  const total = steps.length;
  const progressPercent = ((current + 1) / total) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">{current + 1} / {total}</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{steps[current].label}</p>
    </div>
  );
}

/* ─── Chip Select (multi) ─── */

function ChipSelect({ options, selected, onToggle }: { options: string[]; selected: Set<string>; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onToggle(opt)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${selected.has(opt) ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Radio Group ─── */

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${value === opt ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Checkbox Group ─── */

function CheckboxGroup({ options, selected, onToggle }: { options: string[]; selected: Set<string>; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onToggle(opt)} className="flex items-center gap-2 text-sm">
          <span className={`flex size-4 shrink-0 items-center justify-center rounded border text-[10px] transition-colors ${selected.has(opt) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
            {selected.has(opt) && <Check className="size-3" />}
          </span>
          <span className={selected.has(opt) ? "font-medium" : "text-muted-foreground"}>{opt}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Category Change Confirm Dialog ─── */

function CategoryChangeDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative mx-4 w-full max-w-[400px] rounded-2xl bg-background p-6 shadow-2xl ring-1 ring-black/[0.08]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10">
            <AlertTriangle className="size-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold">입찰 유형을 변경하시겠습니까?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              유형을 변경하면 현재까지 입력한 내용이 모두 초기화됩니다.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" className="rounded-xl" onClick={onCancel}>취소</Button>
          <Button variant="destructive" className="rounded-xl" onClick={onConfirm}>변경</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function BidRegistrationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Category from URL param or null (show gate)
  const categoryParam = searchParams.get("category") as BidCategory | null;
  const validCategories: BidCategory[] = ["설계", "시공", "감리"];
  const initialCategory = categoryParam && validCategories.includes(categoryParam) ? categoryParam : null;

  const [primaryCategory, setPrimaryCategory] = useState<BidCategory | null>(initialCategory);
  const [showCategoryChangeDialog, setShowCategoryChangeDialog] = useState(false);
  const [step, setStep] = useState(0);

  const passedParcel = (location.state as { parcel?: { address: string; landArea?: number; zoning?: string } })?.parcel;

  // === Step 1: Site ===
  const [addressSearch, setAddressSearch] = useState(passedParcel?.address ?? "");
  const mockParcel = {
    address: passedParcel?.address ?? "서울 강남구 역삼동 123-4",
    area: passedParcel?.landArea ?? 198,
    zoning: passedParcel?.zoning ?? "제2종일반주거지역",
  };

  // === Step 2: Policy ===
  const [designScope, setDesignScope] = useState("본설계");
  const [constructionScope, setConstructionScope] = useState("신축");
  const [supervisionType, setSupervisionType] = useState("비상주감리");
  const [bidType, setBidType] = useState("일반경쟁");
  const [startDate, setStartDate] = useState("2026-03-10");
  const [endDate, setEndDate] = useState("2026-04-10");

  // === Step 3: Purpose & Scale ===
  const [purposes, setPurposes] = useState<Set<string>>(new Set(["주거용"]));
  const [buildingUse, setBuildingUse] = useState("단독주택");
  const [landArea, setLandArea] = useState(passedParcel?.landArea ? String(Math.round(passedParcel.landArea)) : "198");
  const [buildingArea, setBuildingArea] = useState("118.8");
  const [floors, setFloors] = useState("3");
  const [basementFloors, setBasementFloors] = useState("1");
  const [totalBudget, setTotalBudget] = useState("80000");
  const [designBudgetMin, setDesignBudgetMin] = useState("3000");
  const [designBudgetMax, setDesignBudgetMax] = useState("5000");
  const [constructionBudgetMin, setConstructionBudgetMin] = useState("30000");
  const [constructionBudgetMax, setConstructionBudgetMax] = useState("50000");
  const [desiredDuration, setDesiredDuration] = useState("12");
  const [supervisionBudgetMin, setSupervisionBudgetMin] = useState("1500");
  const [supervisionBudgetMax, setSupervisionBudgetMax] = useState("3000");
  const [expectedConstructionPeriod, setExpectedConstructionPeriod] = useState("12");

  // === Step 4: 설계 스타일 ===
  const [designElements, setDesignElements] = useState<Set<string>>(new Set(["테라스", "중정"]));
  const [exteriors, setExteriors] = useState<Set<string>>(new Set(["노출콘크리트"]));

  // === Step 4: 시공 요구사항 ===
  const [structureType, setStructureType] = useState("철근콘크리트(RC)");
  const [constructionMethods, setConstructionMethods] = useState<Set<string>>(new Set(["벽식구조"]));
  const [majorMaterials, setMajorMaterials] = useState<Set<string>>(new Set(["레미콘", "철근"]));
  const [interiorScopes, setInteriorScopes] = useState<Set<string>>(new Set());
  const [mepScopes, setMepScopes] = useState<Set<string>>(new Set());
  const [hasDesignDocuments, setHasDesignDocuments] = useState(true);
  const [constructionSpecialReq, setConstructionSpecialReq] = useState("");

  // === Step 4: 감리 요구사항 ===
  const [supervisionScopes, setSupervisionScopes] = useState<Set<string>>(new Set(["건축감리", "구조감리"]));
  const [inspectionItems, setInspectionItems] = useState<Set<string>>(new Set(["기초공사", "골조공사"]));
  const [reportFrequency, setReportFrequency] = useState("주간");
  const [siteVisitFreq, setSiteVisitFreq] = useState("3");
  const [residentCount, setResidentCount] = useState("1");
  const [constructionStartDate, setConstructionStartDate] = useState("");
  const [constructionEndDate, setConstructionEndDate] = useState("");
  const [supervisionSpecialReq, setSupervisionSpecialReq] = useState("");

  // === Step 5: Certification ===
  const [uploadedCerts, setUploadedCerts] = useState<Set<string>>(new Set());

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  // ── Gate: Show category selection if not chosen ──
  if (!primaryCategory) {
    return (
      <CategoryGate onSelect={(cat) => {
        setPrimaryCategory(cat);
        navigate(`/bids/new?category=${cat}`, { replace: true });
      }} />
    );
  }

  const STEPS = STEPS_MAP[primaryCategory];
  const categoryHeader = CATEGORY_HEADER[primaryCategory];
  const CategoryIcon = categoryHeader.icon;

  function goNext() { if (step < STEPS.length - 1) setStep(step + 1); }
  function goPrev() { if (step > 0) setStep(step - 1); }

  const feeLabel = primaryCategory === "설계" ? "설계비" : primaryCategory === "시공" ? "공사비" : "감리비";

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      {showCategoryChangeDialog && (
        <CategoryChangeDialog
          onConfirm={() => {
            setShowCategoryChangeDialog(false);
            setPrimaryCategory(null);
            setStep(0);
            navigate("/bids/new", { replace: true });
          }}
          onCancel={() => setShowCategoryChangeDialog(false)}
        />
      )}

      <div className="mx-auto max-w-[760px] px-6 py-8">
        <Link to="/bids" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />
          공고 목록
        </Link>

        {/* Category indicator + title */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl ${categoryHeader.bgColor}`}>
              <CategoryIcon className={`size-5 ${categoryHeader.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{categoryHeader.label} 공고 등록</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {primaryCategory === "설계" ? "건축사사무소" : primaryCategory === "시공" ? "시공사" : "감리업체"}를 모집합니다
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCategoryChangeDialog(true)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-black/[0.08] transition-colors hover:text-foreground hover:ring-black/[0.15]"
          >
            유형 변경
          </button>
        </div>

        {/* Progress Bar Stepper */}
        <div className="mb-8 bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
          <ProgressStepper steps={STEPS} current={step} />
        </div>

        {/* Step Content */}
        <div className="mb-8 bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">

          {/* ═══ Step 1: 사업 부지 설정 (공통) ═══ */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">사업 부지 설정</h2>
                <p className="text-sm text-muted-foreground">입찰 대상 부지를 검색하고 선택하세요</p>
              </div>
              <div className="space-y-2">
                <Label>주소 검색</Label>
                <div className="flex gap-2">
                  <Input placeholder="주소를 입력하세요 (예: 역삼동 123-4)" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} className="rounded-xl" />
                  <Button variant="outline" className="shrink-0 rounded-xl">검색</Button>
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="space-y-3">
                <Label>선택된 필지</Label>
                <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{mockParcel.address}</p>
                      <p className="text-xs text-muted-foreground">{mockParcel.zoning}</p>
                    </div>
                    <button className="ml-auto text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">총 면적</span>
                  <span className="font-semibold">{mockParcel.area}m²</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Step 2: 입찰 정책 (분야별 세부 범위) ═══ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">입찰 정책</h2>
                <p className="text-sm text-muted-foreground">세부 범위와 입찰 방식을 설정하세요</p>
              </div>

              {/* 분야별 세부 범위 */}
              {primaryCategory === "설계" && (
                <div className="space-y-2">
                  <Label>설계 범위</Label>
                  <RadioGroup options={["가설계", "본설계"]} value={designScope} onChange={setDesignScope} />
                </div>
              )}
              {primaryCategory === "시공" && (
                <div className="space-y-2">
                  <Label>시공 범위</Label>
                  <RadioGroup options={["신축", "증축", "리모델링", "인테리어"]} value={constructionScope} onChange={setConstructionScope} />
                </div>
              )}
              {primaryCategory === "감리" && (
                <div className="space-y-2">
                  <Label>감리 유형</Label>
                  <RadioGroup options={["상주감리", "비상주감리", "책임감리"]} value={supervisionType} onChange={setSupervisionType} />
                  <div className="rounded-xl bg-muted/50 p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium text-foreground">상주감리:</span> 감리원이 현장에 상주. 대형/다중이용건축물 의무.</p>
                        <p><span className="font-medium text-foreground">비상주감리:</span> 정기 방문 (주 2~3회). 소규모 건축물.</p>
                        <p><span className="font-medium text-foreground">책임감리:</span> 감리전문회사가 설계·시공 전체에 대해 책임.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>입찰 방식</Label>
                <RadioGroup options={["일반경쟁", "제한경쟁", "지명경쟁"]} value={bidType} onChange={setBidType} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>모집 기간</Label>
                <div className="flex items-center gap-3">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
                  <span className="text-sm text-muted-foreground shrink-0">~</span>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* ═══ Step 3: 건축 목적·규모 (분야별 비용 필드 분기) ═══ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">건축 목적 및 규모</h2>
                <p className="text-sm text-muted-foreground">건축 용도와 규모를 설정하세요</p>
              </div>

              <div className="space-y-2">
                <Label>사업 용도</Label>
                <CheckboxGroup options={BUSINESS_PURPOSES} selected={purposes} onToggle={(v) => toggleSet(setPurposes, v)} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>건축 용도</Label>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_USES.map((use) => (
                    <button key={use} type="button" onClick={() => setBuildingUse(use)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${buildingUse === use ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                    >{use}</button>
                  ))}
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>대지면적 (m²)</Label>
                  <Input type="number" value={landArea} onChange={(e) => setLandArea(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>건축면적 (m²)</Label>
                  <Input type="number" value={buildingArea} onChange={(e) => setBuildingArea(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>지상 층수</Label>
                  <Input type="number" value={floors} onChange={(e) => setFloors(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>지하 층수</Label>
                  <Input type="number" value={basementFloors} onChange={(e) => setBasementFloors(e.target.value)} className="rounded-xl" />
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* 분야별 비용 필드 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>총 건축비 (만원)</Label>
                  <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="rounded-xl" />
                </div>

                {primaryCategory === "설계" && (
                  <>
                    <div className="space-y-2">
                      <Label>희망 설계비 최소 (만원)</Label>
                      <Input type="number" value={designBudgetMin} onChange={(e) => setDesignBudgetMin(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>희망 설계비 최대 (만원)</Label>
                      <Input type="number" value={designBudgetMax} onChange={(e) => setDesignBudgetMax(e.target.value)} className="rounded-xl" />
                    </div>
                  </>
                )}

                {primaryCategory === "시공" && (
                  <>
                    <div className="space-y-2">
                      <Label>희망 공사비 최소 (만원)</Label>
                      <Input type="number" value={constructionBudgetMin} onChange={(e) => setConstructionBudgetMin(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>희망 공사비 최대 (만원)</Label>
                      <Input type="number" value={constructionBudgetMax} onChange={(e) => setConstructionBudgetMax(e.target.value)} className="rounded-xl" />
                    </div>
                  </>
                )}

                {primaryCategory === "감리" && (
                  <>
                    <div className="space-y-2">
                      <Label>희망 감리비 최소 (만원)</Label>
                      <Input type="number" value={supervisionBudgetMin} onChange={(e) => setSupervisionBudgetMin(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>희망 감리비 최대 (만원)</Label>
                      <Input type="number" value={supervisionBudgetMax} onChange={(e) => setSupervisionBudgetMax(e.target.value)} className="rounded-xl" />
                    </div>
                  </>
                )}
              </div>

              {primaryCategory === "시공" && (
                <div className="space-y-2">
                  <Label>희망 공사기간 (개월)</Label>
                  <Input type="number" value={desiredDuration} onChange={(e) => setDesiredDuration(e.target.value)} className="rounded-xl max-w-[200px]" />
                </div>
              )}

              {primaryCategory === "감리" && (
                <div className="space-y-2">
                  <Label>예상 공사기간 (개월)</Label>
                  <p className="text-xs text-muted-foreground">감리기간 산정의 기준이 됩니다</p>
                  <Input type="number" value={expectedConstructionPeriod} onChange={(e) => setExpectedConstructionPeriod(e.target.value)} className="rounded-xl max-w-[200px]" />
                </div>
              )}
            </div>
          )}

          {/* ═══ Step 4A: 건축 스타일 (설계) ═══ */}
          {step === 3 && primaryCategory === "설계" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">건축 스타일</h2>
                <p className="text-sm text-muted-foreground">원하는 디자인 요소와 외장재를 선택하세요</p>
              </div>

              <div className="space-y-2">
                <Label>디자인 요소</Label>
                <ChipSelect options={DESIGN_ELEMENTS} selected={designElements} onToggle={(v) => toggleSet(setDesignElements, v)} />
              </div>
              <Separator className="opacity-50" />
              <div className="space-y-2">
                <Label>외장재</Label>
                <ChipSelect options={EXTERIOR_MATERIALS} selected={exteriors} onToggle={(v) => toggleSet(setExteriors, v)} />
              </div>
              <Separator className="opacity-50" />
              <div className="space-y-2">
                <Label>참고 이미지</Label>
                <p className="text-xs text-muted-foreground">원하는 건축 스타일의 참고 이미지를 업로드하세요 (최대 5장)</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <button type="button" className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                    <Upload className="size-6" />
                    <span className="text-xs font-medium">이미지 추가</span>
                  </button>
                </div>
              </div>

              {(designElements.size > 0 || exteriors.size > 0) && (
                <>
                  <Separator className="opacity-50" />
                  <div className="space-y-2">
                    <Label>선택 요약</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[...designElements].map((e) => (
                        <span key={e} className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium">{e}</span>
                      ))}
                      {[...exteriors].map((e) => (
                        <span key={e} className="rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-medium">{e}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ Step 4B: 시공 요구사항 (시공) ═══ */}
          {step === 3 && primaryCategory === "시공" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">시공 요구사항</h2>
                <p className="text-sm text-muted-foreground">구조, 공법, 자재 등 시공 조건을 설정하세요</p>
              </div>

              <div className="space-y-2">
                <Label>구조 유형 *</Label>
                <RadioGroup options={STRUCTURE_TYPES} value={structureType} onChange={setStructureType} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>시공 공법</Label>
                <ChipSelect options={CONSTRUCTION_METHODS} selected={constructionMethods} onToggle={(v) => toggleSet(setConstructionMethods, v)} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>주요 자재</Label>
                <ChipSelect options={MAJOR_MATERIALS} selected={majorMaterials} onToggle={(v) => toggleSet(setMajorMaterials, v)} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>인테리어 범위</Label>
                <ChipSelect options={INTERIOR_SCOPES} selected={interiorScopes} onToggle={(v) => toggleSet(setInteriorScopes, v)} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>설비 범위</Label>
                <ChipSelect options={MEP_SCOPES} selected={mepScopes} onToggle={(v) => toggleSet(setMepScopes, v)} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>설계도서 보유 여부</Label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setHasDesignDocuments(true)}
                    className={`flex-1 rounded-xl p-4 text-left ring-1 transition-all ${hasDesignDocuments ? "ring-primary bg-primary/[0.03]" : "ring-black/[0.08] hover:ring-black/[0.15]"}`}
                  >
                    <p className="text-sm font-medium">보유</p>
                    <p className="text-xs text-muted-foreground mt-0.5">설계 계약 연결 또는 도면 업로드</p>
                  </button>
                  <button type="button" onClick={() => setHasDesignDocuments(false)}
                    className={`flex-1 rounded-xl p-4 text-left ring-1 transition-all ${!hasDesignDocuments ? "ring-primary bg-primary/[0.03]" : "ring-black/[0.08] hover:ring-black/[0.15]"}`}
                  >
                    <p className="text-sm font-medium">미보유</p>
                    <p className="text-xs text-muted-foreground mt-0.5">시공사가 설계 포함 견적 제출</p>
                  </button>
                </div>
              </div>

              {hasDesignDocuments && (
                <>
                  <Separator className="opacity-50" />
                  <div className="space-y-2">
                    <Label>설계도서 업로드</Label>
                    <button type="button" className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                      <Upload className="size-6" />
                      <span className="text-sm font-medium">파일 업로드</span>
                      <span className="text-xs">PDF, DWG · 최대 5개, 각 50MB</span>
                    </button>
                  </div>
                </>
              )}

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>특별 요구사항 (선택)</Label>
                <textarea
                  maxLength={2000}
                  value={constructionSpecialReq}
                  onChange={(e) => setConstructionSpecialReq(e.target.value)}
                  placeholder="공사 관련 특별 요구사항을 입력하세요"
                  rows={4}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{constructionSpecialReq.length} / 2,000</p>
              </div>
            </div>
          )}

          {/* ═══ Step 4C: 감리 요구사항 (감리) ═══ */}
          {step === 3 && primaryCategory === "감리" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">감리 요구사항</h2>
                <p className="text-sm text-muted-foreground">감리 범위, 검측항목, 보고체계를 설정하세요</p>
              </div>

              <div className="space-y-2">
                <Label>감리 범위 *</Label>
                <ChipSelect options={SUPERVISION_SCOPES} selected={supervisionScopes} onToggle={(v) => toggleSet(setSupervisionScopes, v)} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>중점 검측항목</Label>
                <ChipSelect options={INSPECTION_ITEMS} selected={inspectionItems} onToggle={(v) => toggleSet(setInspectionItems, v)} />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>보고 주기 *</Label>
                <RadioGroup options={REPORT_FREQUENCIES} value={reportFrequency} onChange={setReportFrequency} />
              </div>

              <Separator className="opacity-50" />

              {supervisionType === "비상주감리" && (
                <div className="space-y-2">
                  <Label>현장 방문 빈도</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">주</span>
                    <Input type="number" value={siteVisitFreq} onChange={(e) => setSiteVisitFreq(e.target.value)} className="rounded-xl w-20" />
                    <span className="text-sm text-muted-foreground">회</span>
                  </div>
                </div>
              )}

              {supervisionType === "상주감리" && (
                <div className="space-y-2">
                  <Label>상주 감리원 수</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={residentCount} onChange={(e) => setResidentCount(e.target.value)} className="rounded-xl w-20" />
                    <span className="text-sm text-muted-foreground">명</span>
                  </div>
                </div>
              )}

              <Separator className="opacity-50" />

              <div className="space-y-3">
                <Label>공사 일정</Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">착공 예정일</Label>
                    <Input type="date" value={constructionStartDate} onChange={(e) => setConstructionStartDate(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">준공 예정일</Label>
                    <Input type="date" value={constructionEndDate} onChange={(e) => setConstructionEndDate(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>시공 계약 연결 (선택)</Label>
                <div className="rounded-xl ring-1 ring-black/[0.08] p-4">
                  <div className="flex items-start gap-2">
                    <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">시공 계약을 선택하면 공사 정보가 자동으로 연동됩니다.</p>
                      <Button variant="outline" size="sm" className="mt-2 rounded-lg h-8 text-xs">시공 계약 선택</Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>특별 요구사항 (선택)</Label>
                <textarea
                  maxLength={2000}
                  value={supervisionSpecialReq}
                  onChange={(e) => setSupervisionSpecialReq(e.target.value)}
                  placeholder="감리 관련 특별 요구사항을 입력하세요"
                  rows={4}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{supervisionSpecialReq.length} / 2,000</p>
              </div>
            </div>
          )}

          {/* ═══ Step 5: 공고 신뢰 인증 (분야별 인증 항목 분기) ═══ */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">공고 신뢰 인증</h2>
                <p className="text-sm text-muted-foreground">인증 서류를 등록하면 입찰 참여율이 높아집니다</p>
              </div>

              <div className="space-y-4">
                {CERT_ITEMS_MAP[primaryCategory].map((cert) => (
                  <div key={cert.id} className="rounded-xl bg-muted/30 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{cert.label}</p>
                        <p className="text-xs text-muted-foreground">{cert.desc}</p>
                      </div>
                      {uploadedCerts.has(cert.id) && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15">
                          <Check className="size-3 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSet(setUploadedCerts, cert.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-colors ${
                        uploadedCerts.has(cert.id)
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600"
                          : "border-muted text-muted-foreground hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      <Upload className="size-4" />
                      {uploadedCerts.has(cert.id) ? "업로드 완료 (클릭하여 변경)" : "파일 업로드"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-sm text-primary font-medium">
                  인증 서류를 모두 등록하면 '인증 완료' 배지가 표시되어 더 많은 {primaryCategory === "설계" ? "건축사" : primaryCategory === "시공" ? "시공사" : "감리업체"}의 입찰 참여를 유도할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="lg" className="rounded-xl" onClick={goPrev} disabled={step === 0}>
            이전
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="lg" className="rounded-xl flex-1 sm:flex-none sm:min-w-[160px]" onClick={goNext}>
              다음
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-xl flex-1 sm:flex-none sm:min-w-[160px]"
              onClick={() => {
                toast.success("입찰 공고가 등록되었습니다", {
                  description: `${mockParcel.address} · ${primaryCategory} · 희망 ${feeLabel}: ${
                    primaryCategory === "설계" ? `${designBudgetMin}~${designBudgetMax}` :
                    primaryCategory === "시공" ? `${constructionBudgetMin}~${constructionBudgetMax}` :
                    `${supervisionBudgetMin}~${supervisionBudgetMax}`
                  }만원`,
                });
                setTimeout(() => navigate("/bids"), 1200);
              }}
            >
              등록
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

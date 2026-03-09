import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Upload, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Constants ─── */

const STEPS = [
  { label: "사업 부지 설정", short: "부지" },
  { label: "입찰 정책", short: "정책" },
  { label: "건축 목적 및 규모", short: "규모" },
  { label: "건축 스타일", short: "스타일" },
  { label: "공고 신뢰 인증", short: "인증" },
];

const DESIGN_ELEMENTS = ["다락방", "루프탑", "테라스", "중정", "필로티", "발코니", "옥상정원", "복층"];
const EXTERIOR_MATERIALS = ["노출콘크리트", "징크", "목재", "벽돌", "스톤", "유리커튼월", "알루미늄패널", "스타코"];
const BID_CATEGORIES = ["설계", "시공", "감리"];
const BUSINESS_PURPOSES = ["주거용", "상업용", "업무용", "공업용", "복합용"];
const BUILDING_USES = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장", "창고"];
const CERT_ITEMS = [
  { id: "land", label: "토지 소유 확인서", desc: "토지등기부등본 또는 토지대장" },
  { id: "building", label: "건축 가능 여부 확인", desc: "토지이용계획확인서" },
  { id: "permit", label: "건축 허가서", desc: "건축허가 또는 신고필증 (선택)" },
];

/* ─── Progress Bar Stepper (clickable) ─── */

function ProgressStepper({
  steps,
  current,
  onStepClick,
}: {
  steps: typeof STEPS;
  current: number;
  onStepClick: (index: number) => void;
}) {
  const total = steps.length;
  const progressPercent = ((current + 1) / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Track */}
        <div className="relative flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Fraction */}
        <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
          {current + 1} / {total}
        </span>
      </div>
      {/* Step pills – all clickable in edit mode */}
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onStepClick(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              i === current
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Chip Select ─── */

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            selected.has(opt)
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Radio Group ─── */

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            value === opt
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Checkbox Group ─── */

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className="flex items-center gap-2 text-sm"
        >
          <span
            className={`flex size-4 shrink-0 items-center justify-center rounded border text-[10px] transition-colors ${
              selected.has(opt)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {selected.has(opt) && <Check className="size-3" />}
          </span>
          <span className={selected.has(opt) ? "font-medium" : "text-muted-foreground"}>
            {opt}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── Page ─── */

export default function BidEditPage() {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState(0);

  // Step 1: Site
  const [addressSearch, setAddressSearch] = useState("");
  const mockParcel = { address: "서울 강남구 역삼동 123-4", area: 198, zoning: "제2종일반주거지역" };

  // Step 2: Policy
  const [bidCategories, setBidCategories] = useState<Set<string>>(new Set(["설계"]));
  const [designScope, setDesignScope] = useState("본설계");
  const [bidType, setBidType] = useState("일반경쟁");
  const [startDate, setStartDate] = useState("2026-03-10");
  const [endDate, setEndDate] = useState("2026-04-10");

  // Step 3: Purpose & Scale
  const [purposes, setPurposes] = useState<Set<string>>(new Set(["주거용"]));
  const [buildingUse, setBuildingUse] = useState("단독주택");
  const [landArea, setLandArea] = useState("198");
  const [buildingArea, setBuildingArea] = useState("118.8");
  const [floors, setFloors] = useState("3");
  const [basementFloors, setBasementFloors] = useState("1");
  const [totalBudget, setTotalBudget] = useState("80000");
  const [designBudgetMin, setDesignBudgetMin] = useState("3000");
  const [designBudgetMax, setDesignBudgetMax] = useState("5000");

  // Step 4: Style
  const [designElements, setDesignElements] = useState<Set<string>>(new Set(["테라스", "중정"]));
  const [exteriors, setExteriors] = useState<Set<string>>(new Set(["노출콘크리트"]));

  // Step 5: Certification
  const [uploadedCerts, setUploadedCerts] = useState<Set<string>>(new Set());

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function goNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function goPrev() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[760px] px-6 py-8">
        {/* Back link */}
        <Link
          to={`/bids/${id}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          공고 상세
        </Link>

        <h1 className="mb-4 text-2xl font-bold tracking-tight">입찰 공고 수정</h1>

        {/* Edit mode header: bid number + status badge */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">BID-20260308-001</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-amber-500" />
            입찰대기
          </span>
        </div>

        {/* Progress Bar Stepper (clickable) */}
        <div className="mb-8 bg-card rounded-2xl ring-1 ring-black/[0.08] p-5">
          <ProgressStepper steps={STEPS} current={step} onStepClick={setStep} />
        </div>

        {/* Step Content */}
        <div className="mb-8 bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
          {/* Step 1: Site */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">사업 부지 설정</h2>
                <p className="text-sm text-muted-foreground">입찰 대상 부지를 검색하고 선택하세요</p>
              </div>

              <div className="space-y-2">
                <Label>주소 검색</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="주소를 입력하세요 (예: 역삼동 123-4)"
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button variant="outline" className="shrink-0 rounded-xl">
                    검색
                  </Button>
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
                    <button className="ml-auto text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">총 면적</span>
                  <span className="font-semibold">{mockParcel.area}m²</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Policy */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">입찰 정책</h2>
                <p className="text-sm text-muted-foreground">입찰 방식과 기간을 설정하세요</p>
              </div>

              <div className="space-y-2">
                <Label>입찰 분야</Label>
                <CheckboxGroup
                  options={BID_CATEGORIES}
                  selected={bidCategories}
                  onToggle={(v) => toggleSet(setBidCategories, v)}
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>설계 범위</Label>
                <RadioGroup
                  options={["가설계", "본설계"]}
                  value={designScope}
                  onChange={setDesignScope}
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>입찰 방식</Label>
                <RadioGroup
                  options={["일반경쟁", "제한경쟁", "지명경쟁"]}
                  value={bidType}
                  onChange={setBidType}
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>모집 기간</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">~</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Purpose & Scale */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">건축 목적 및 규모</h2>
                <p className="text-sm text-muted-foreground">건축 용도와 규모를 설정하세요</p>
              </div>

              <div className="space-y-2">
                <Label>사업 용도</Label>
                <CheckboxGroup
                  options={BUSINESS_PURPOSES}
                  selected={purposes}
                  onToggle={(v) => toggleSet(setPurposes, v)}
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>건축 용도</Label>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_USES.map((use) => (
                    <button
                      key={use}
                      type="button"
                      onClick={() => setBuildingUse(use)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        buildingUse === use
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {use}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>대지면적 (m²)</Label>
                  <Input
                    type="number"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>건축면적 (m²)</Label>
                  <Input
                    type="number"
                    value={buildingArea}
                    onChange={(e) => setBuildingArea(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>지상 층수</Label>
                  <Input
                    type="number"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>지하 층수</Label>
                  <Input
                    type="number"
                    value={basementFloors}
                    onChange={(e) => setBasementFloors(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>총 건축비 (만원)</Label>
                  <Input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>희망 설계비 최소 (만원)</Label>
                  <Input
                    type="number"
                    value={designBudgetMin}
                    onChange={(e) => setDesignBudgetMin(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>희망 설계비 최대 (만원)</Label>
                  <Input
                    type="number"
                    value={designBudgetMax}
                    onChange={(e) => setDesignBudgetMax(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Style */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">건축 스타일</h2>
                <p className="text-sm text-muted-foreground">원하는 디자인 요소와 외장재를 선택하세요</p>
              </div>

              <div className="space-y-2">
                <Label>디자인 요소</Label>
                <ChipSelect
                  options={DESIGN_ELEMENTS}
                  selected={designElements}
                  onToggle={(v) => toggleSet(setDesignElements, v)}
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>외장재</Label>
                <ChipSelect
                  options={EXTERIOR_MATERIALS}
                  selected={exteriors}
                  onToggle={(v) => toggleSet(setExteriors, v)}
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label>참고 이미지</Label>
                <p className="text-xs text-muted-foreground">원하는 건축 스타일의 참고 이미지를 업로드하세요 (최대 5장)</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Upload className="size-6" />
                    <span className="text-xs font-medium">이미지 추가</span>
                  </button>
                </div>
              </div>

              {/* Selected summary */}
              {(designElements.size > 0 || exteriors.size > 0) && (
                <>
                  <Separator className="opacity-50" />
                  <div className="space-y-2">
                    <Label>선택 요약</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[...designElements].map((e) => (
                        <span key={e} className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium">
                          {e}
                        </span>
                      ))}
                      {[...exteriors].map((e) => (
                        <span key={e} className="rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-medium">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Certification */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold mb-1">공고 신뢰 인증</h2>
                <p className="text-sm text-muted-foreground">
                  인증 서류를 등록하면 입찰 참여율이 높아집니다
                </p>
              </div>

              <div className="space-y-4">
                {CERT_ITEMS.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-xl bg-muted/30 p-4 space-y-3"
                  >
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
                  인증 서류를 모두 등록하면 '인증 완료' 배지가 표시되어 더 많은 건축사의 입찰 참여를 유도할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" className="rounded-xl" asChild>
              <Link to={`/bids/${id}`}>취소</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl"
              onClick={goPrev}
              disabled={step === 0}
            >
              이전
            </Button>
          </div>
          {step < STEPS.length - 1 ? (
            <Button size="lg" className="rounded-xl min-w-[160px]" onClick={goNext}>
              다음
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-xl min-w-[160px]"
              onClick={() => alert("수정 완료 (목업)")}
            >
              수정
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Upload,
  X,
  FileText,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SiteHeader from "@/components/layout/site-header";

/* ─── Constants ─── */

const STAGE_NAMES = [
  "계약체결",
  "설계심의완료",
  "건축허가",
  "착공도서",
  "골조완료",
  "사용승인",
] as const;

const MOCK_CLIENT = {
  name: "이건축주",
  address: "서울 강남구 역삼동 123-4",
  phone: "010-1234-5678",
};

const MOCK_ARCHITECT = {
  name: "아크 건축사사무소",
  address: "서울 강남구 역삼로 123",
  phone: "02-1234-5678",
  bizNumber: "123-45-67890",
};

const MOCK_BUILDING = {
  name: "역삼동 단독주택",
  location: "서울 강남구 역삼동 123-4",
  area: "198 m²",
  usage: "단독주택",
  structure: "철근콘크리트",
  floors: "지상3층/지하1층",
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

type ContractReason = "서명거부" | "서명만료";

/* ─── Helpers ─── */

function parseNumber(raw: string): number {
  return Number(raw.replace(/,/g, "")) || 0;
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function calcMilestoneAmounts(total: number, ratios: number[]): number[] {
  const amounts = ratios.map((r) => Math.floor((total * r) / 100));
  const allocated = amounts.reduce((a, b) => a + b, 0);
  if (ratios.reduce((a, b) => a + b, 0) === 100 && allocated !== total) {
    amounts[amounts.length - 1] += total - allocated;
  }
  return amounts;
}

/* ─── Status Banner ─── */

function StatusBanner({ reason }: { reason: ContractReason }) {
  if (reason === "서명거부") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-4 mb-6 dark:bg-amber-500/10 dark:ring-amber-500/30">
        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          건축사가 서명을 거부했습니다. 계약서를 수정한 후 다시 서명을 요청할 수
          있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl bg-blue-50 ring-1 ring-blue-200 p-4 mb-6 dark:bg-blue-500/10 dark:ring-blue-500/30">
      <Info className="size-5 text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
      <p className="text-sm text-blue-800 dark:text-blue-300">
        서명 기한(14일)이 만료되었습니다. 계약서를 확인한 후 다시 서명을 요청할
        수 있습니다.
      </p>
    </div>
  );
}

/* ─── Readonly Field ─── */

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

/* ─── Attached File Item ─── */

interface AttachedFile {
  file: File;
  id: string;
}

function FileItem({
  item,
  onRemove,
}: {
  item: AttachedFile;
  onRemove: () => void;
}) {
  const sizeMB = (item.file.size / (1024 * 1024)).toFixed(1);
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="size-5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{item.file.name}</p>
          <p className="text-xs text-muted-foreground">{sizeMB} MB</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/* ─── Page ─── */

export default function ContractEditPage() {
  const { contractId: _contractId } = useParams();

  // Mock: show 서명거부 banner
  const reason: ContractReason = "서명거부";

  // Pre-filled from "saved" contract
  const [contractArea, setContractArea] = useState("198.0");
  const [contractAmountRaw, setContractAmountRaw] = useState("42,000,000");
  const [milestoneRatios, setMilestoneRatios] = useState<number[]>([
    10, 15, 40, 20, 10, 5,
  ]);
  const [specialTerms, setSpecialTerms] = useState("기존 특약사항 텍스트");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contractAmount = parseNumber(contractAmountRaw);
  const milestoneAmounts = calcMilestoneAmounts(contractAmount, milestoneRatios);
  const ratioSum = milestoneRatios.reduce((a, b) => a + b, 0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      setContractAmountRaw(raw === "" ? "" : formatNumber(Number(raw)));
    }
  };

  const handleRatioChange = useCallback(
    (idx: number, value: string) => {
      const num = Math.max(0, Math.min(100, Number(value) || 0));
      setMilestoneRatios((prev) => {
        const next = [...prev];
        next[idx] = num;
        return next;
      });
    },
    []
  );

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files;
    if (!picked) return;
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < picked.length; i++) {
      const f = picked[i];
      if (!ACCEPTED_TYPES.includes(f.type)) continue;
      if (f.size > MAX_FILE_SIZE) continue;
      if (files.length + newFiles.length >= MAX_FILES) break;
      newFiles.push({ file: f, id: crypto.randomUUID() });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[860px] px-6 py-8">
        {/* Back link */}
        <Link
          to="/mypage"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          마이페이지
        </Link>

        {/* Status banner */}
        <StatusBanner reason={reason} />

        {/* Document header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            건축설계 표준계약서
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            「건축사법」 제23조제1항 근거
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            CTR-20260308-0001
          </p>
        </div>

        <div className="space-y-6">
          {/* ── Section 1: 계약 당사자 ── */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">계약 당사자</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 갑 */}
              <div className="rounded-xl ring-1 ring-black/[0.06] p-5 space-y-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  갑 (건축주)
                </p>
                <ReadonlyField label="성명" value={MOCK_CLIENT.name} />
                <ReadonlyField label="주소" value={MOCK_CLIENT.address} />
                <ReadonlyField label="연락처" value={MOCK_CLIENT.phone} />
              </div>
              {/* 을 */}
              <div className="rounded-xl ring-1 ring-black/[0.06] p-5 space-y-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  을 (건축사)
                </p>
                <ReadonlyField label="상호" value={MOCK_ARCHITECT.name} />
                <ReadonlyField label="주소" value={MOCK_ARCHITECT.address} />
                <ReadonlyField label="연락처" value={MOCK_ARCHITECT.phone} />
                <ReadonlyField
                  label="사업자등록번호"
                  value={MOCK_ARCHITECT.bizNumber}
                />
              </div>
            </div>
          </section>

          {/* ── Section 2: 건축물 개요 ── */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">건축물 개요</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              {[
                { label: "건물명칭", value: MOCK_BUILDING.name },
                { label: "대지위치", value: MOCK_BUILDING.location },
                { label: "대지면적", value: MOCK_BUILDING.area },
                { label: "건축물용도", value: MOCK_BUILDING.usage },
                { label: "건축물구조", value: MOCK_BUILDING.structure },
                { label: "층수", value: MOCK_BUILDING.floors },
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
          </section>

          {/* ── Section 3: 계약 면적·금액 ── */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">계약 면적·금액</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>계약 면적</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={contractArea}
                    onChange={(e) => setContractArea(e.target.value)}
                    className="rounded-xl h-11 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    m²
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
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    원
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 4: 기성 지불 일정 ── */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">기성 지불 일정</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-3 pr-3 font-medium w-12">순서</th>
                    <th className="py-3 pr-3 font-medium">단계명</th>
                    <th className="py-3 pr-3 font-medium w-24 text-right">
                      비율(%)
                    </th>
                    <th className="py-3 font-medium w-36 text-right">
                      금액(원)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STAGE_NAMES.map((stage, idx) => (
                    <tr
                      key={stage}
                      className={idx % 2 === 1 ? "bg-muted/30" : ""}
                    >
                      <td className="py-3 pr-3 tabular-nums">{idx + 1}</td>
                      <td className="py-3 pr-3">{stage}</td>
                      <td className="py-3 pr-3 text-right">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={milestoneRatios[idx]}
                          onChange={(e) =>
                            handleRatioChange(idx, e.target.value)
                          }
                          className="rounded-xl h-9 w-20 text-right ml-auto"
                        />
                      </td>
                      <td className="py-3 text-right tabular-nums font-medium">
                        {formatNumber(milestoneAmounts[idx])}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td className="py-3 pr-3" colSpan={2}>
                      합계
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {ratioSum !== 100 ? (
                        <span className="text-red-500 flex items-center justify-end gap-1">
                          <AlertTriangle className="size-3.5" />
                          {ratioSum}%
                        </span>
                      ) : (
                        <span>{ratioSum}%</span>
                      )}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {formatNumber(
                        milestoneAmounts.reduce((a, b) => a + b, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {ratioSum !== 100 && (
              <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                합계: {ratioSum}% (100%가 아닙니다)
              </p>
            )}
          </section>

          {/* ── Section 5: 특약사항 ── */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">특약사항</h2>
            <div className="space-y-2">
              <textarea
                maxLength={2000}
                value={specialTerms}
                onChange={(e) => setSpecialTerms(e.target.value)}
                placeholder="당사자 간 합의한 특약사항을 입력하세요"
                rows={5}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-3 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {specialTerms.length} / 2,000
              </p>
            </div>
          </section>

          {/* ── Section 6: 첨부파일 ── */}
          <section className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
            <h2 className="text-base font-semibold mb-5">첨부파일</h2>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= MAX_FILES}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="size-6" />
              <span className="text-sm font-medium">파일 업로드</span>
              <span className="text-xs">
                PDF, JPG, PNG · 최대 20MB · {files.length}/{MAX_FILES}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFilePick}
              className="hidden"
            />

            {files.length > 0 && (
              <div className="mt-4 divide-y">
                {files.map((item) => (
                  <FileItem
                    key={item.id}
                    item={item}
                    onRemove={() => removeFile(item.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Section 7: Action Buttons ── */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-11 px-6"
                asChild
              >
                <Link to="/mypage">취소</Link>
              </Button>
              <Button variant="outline" className="rounded-xl h-11 px-6">
                임시저장
              </Button>
            </div>
            <Button
              className="rounded-xl h-11 px-6"
              disabled={ratioSum !== 100}
            >
              서명 요청
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

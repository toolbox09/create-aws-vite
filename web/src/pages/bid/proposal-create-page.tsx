import { useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Helpers ─── */

function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
}

function parseNumber(formatted: string): string {
  return formatted.replace(/[^0-9]/g, "");
}

/* ─── Types ─── */

interface UploadedFile {
  name: string;
  size: string;
}

/* ─── Page ─── */

export default function ProposalCreatePage() {
  const { bidId } = useParams();

  // Form state
  const [fee, setFee] = useState("");
  const [opinion, setOpinion] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock firm data
  const firm = {
    name: "아크 건축사사무소",
    address: "서울 강남구 역삼로 123",
    career: "12년 (2014년 개업)",
    projects: "47건",
    usage: "주거용",
    url: "https://arc-arch.kr",
  };

  function handleFeeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseNumber(e.target.value);
    setFee(raw);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: UploadedFile[] = Array.from(selected).map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)}KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)}MB`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files;
    if (!dropped.length) return;
    const newFiles: UploadedFile[] = Array.from(dropped).map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)}KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)}MB`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  const charCount = opinion.length;
  const isWarning = charCount >= 2700;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[760px] px-6 py-8">
        {/* Back link */}
        <Link
          to={`/bids/${bidId}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          입찰 공고로 돌아가기
        </Link>

        <h1 className="mb-2 text-2xl font-bold tracking-tight">입찰 제안서 작성</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          서울 강남구 역삼동 123-4 단독주택 본설계
        </p>

        {/* Section 1: 사무소 정보 */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
          <h2 className="text-base font-semibold mb-4">사무소 정보</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">사무소명</p>
              <p className="text-sm font-medium">{firm.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">소재지</p>
              <p className="text-sm font-medium">{firm.address}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">경력</p>
              <p className="text-sm font-medium">{firm.career}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">수행 프로젝트</p>
              <p className="text-sm font-medium">{firm.projects}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">주요 용도</p>
              <p className="text-sm font-medium">{firm.usage}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">홈페이지</p>
              <p className="text-sm font-medium">{firm.url}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground italic">
            사무소 정보는 프로필에서 자동으로 연동되며 이 화면에서 수정할 수 없습니다.
          </p>
        </div>

        <Separator className="my-8 opacity-50" />

        {/* Section 2: 제안 내용 */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] p-6">
          <h2 className="text-base font-semibold mb-4">제안 내용</h2>
          <div className="space-y-6">
            {/* 제안 설계비용 */}
            <div className="space-y-2">
              <Label>제안 설계비용</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="금액을 입력하세요"
                  value={fee ? formatNumber(fee) : ""}
                  onChange={handleFeeChange}
                  className="rounded-xl h-11 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  만원
                </span>
              </div>
            </div>

            {/* 설계 의견 */}
            <div className="space-y-2">
              <Label>설계 의견</Label>
              <textarea
                placeholder="설계에 대한 의견을 작성해주세요"
                value={opinion}
                onChange={(e) => {
                  if (e.target.value.length <= 3000) setOpinion(e.target.value);
                }}
                rows={6}
                className="w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm resize-none"
              />
              <p className={`text-xs text-right ${isWarning ? "text-amber-500" : "text-muted-foreground"}`}>
                {charCount.toLocaleString()} / 3,000자
              </p>
            </div>

            {/* 첨부 파일 */}
            <div className="space-y-2">
              <Label>첨부 파일</Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer"
              >
                <Upload className="size-6" />
                <span className="text-sm font-medium">파일을 드래그하거나 클릭하여 업로드</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" asChild>
            <Link to={`/bids/${bidId}`}>취소</Link>
          </Button>
          <Button className="rounded-xl h-12" onClick={() => alert("제안 제출 (목업)")}>
            제안 제출
          </Button>
        </div>
      </div>
    </div>
  );
}

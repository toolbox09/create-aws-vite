import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface UploadedFile {
  name: string;
  size: string;
}

const INQUIRY_TYPES = [
  "회원/계정",
  "입찰/공고",
  "결제/계약",
  "서비스 오류",
  "기타",
] as const;

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.pdf";
const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

/* ─── Page ─── */

export default function InquiryCreatePage() {
  const [inquiryType, setInquiryType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const remaining = MAX_FILES - files.length;
    const newFiles: UploadedFile[] = Array.from(selected)
      .slice(0, remaining)
      .filter((f) => f.size <= MAX_FILE_SIZE)
      .map((f) => ({
        name: f.name,
        size:
          f.size < 1024 * 1024
            ? `${(f.size / 1024).toFixed(0)}KB`
            : `${(f.size / (1024 * 1024)).toFixed(1)}MB`,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const canSubmit = inquiryType && title.trim() && content.trim();

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">고객 문의</h1>
          <p className="text-sm text-muted-foreground mt-1">
            궁금한 점이나 불편 사항을 남겨주세요
          </p>
        </div>

        {/* FAQ Shortcut Banner */}
        <Link
          to="/support/faq"
          className="flex items-center justify-between gap-3 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm px-5 py-4 mb-6 hover:bg-muted/50 transition-colors group"
        >
          <div>
            <p className="text-sm font-semibold">자주 묻는 질문에서 빠르게 답을 찾아보세요</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              대부분의 궁금증은 FAQ에서 해결할 수 있습니다
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-primary shrink-0 group-hover:gap-2 transition-all">
            FAQ 바로가기
            <ArrowRight className="size-4" />
          </span>
        </Link>

        {/* Form Card */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm">
          <div className="p-6 space-y-6">
            {/* 문의 유형 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">문의 유형</Label>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="flex h-11 w-full rounded-xl bg-background px-3 text-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">문의 유형을 선택해 주세요</option>
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">제목</Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
              <Input
                placeholder="문의 제목을 입력해 주세요"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= TITLE_MAX) setTitle(e.target.value);
                }}
                className="rounded-xl h-11"
              />
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">내용</Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {content.length}/{CONTENT_MAX}
                </span>
              </div>
              <textarea
                placeholder="문의 내용을 자세히 작성해 주세요"
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= CONTENT_MAX) setContent(e.target.value);
                }}
                rows={8}
                className="flex w-full rounded-xl bg-background px-3 py-3 text-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <Separator />

            {/* 첨부파일 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">첨부파일</Label>
                <span className="text-xs text-muted-foreground">
                  최대 {MAX_FILES}개 (JPG, PNG, PDF / 각 10MB 이하)
                </span>
              </div>

              {files.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-4 ring-1 ring-dashed ring-black/[0.15] text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <Upload className="size-4" />
                  파일 선택
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {file.size}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="flex size-6 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
                      >
                        <X className="size-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6">
            <Link to="/support/inquiry">
              <Button variant="outline" className="rounded-xl">
                취소
              </Button>
            </Link>
            <Button className="rounded-xl" disabled={!canSubmit}>
              문의 등록
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

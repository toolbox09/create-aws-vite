import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Mock Data ─── */

const PROJECT = {
  id: 1,
  title: "역삼동 단독주택 설계",
  partnerName: "아크 건축사사무소",
};

const KEYWORD_OPTIONS = [
  "친절해요",
  "믿음이가요",
  "전문적이에요",
  "소통이좋아요",
  "약속을잘지켜요",
];

const MAX_CHARS = 500;

/* ─── Page ─── */

export default function ProjectReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set()
  );
  const [reviewText, setReviewText] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [isEditMode] = useState(false);

  function handleToggleKeyword(keyword: string) {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) {
        next.delete(keyword);
      } else {
        next.add(keyword);
      }
      return next;
    });
    setKeywordError(false);
  }

  function handleSubmit() {
    if (selectedKeywords.size === 0) {
      setKeywordError(true);
      return;
    }
    // Mock submit
    navigate(`/projects/${id}`);
  }

  function handleCancel() {
    navigate(`/projects/${id}`);
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mx-auto max-w-[640px] py-10">
          {/* Title */}
          <h1 className="text-[26px] font-semibold tracking-tight">
            {isEditMode ? "리뷰 수정" : "리뷰 작성"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            프로젝트 파트너에 대한 리뷰를 남겨주세요
          </p>

          <Separator className="my-6" />

          {/* Project info (read-only) */}
          <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-5 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">프로젝트</p>
                <p className="text-sm font-semibold">{PROJECT.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">파트너</p>
                <p className="text-sm font-semibold">{PROJECT.partnerName}</p>
              </div>
            </div>
          </div>

          {/* Keyword voting */}
          <section className="mb-8">
            <h2 className="text-base font-semibold mb-1">이런 점이 좋았어요</h2>
            <p className="text-xs text-muted-foreground mb-4">
              최소 1개 이상 선택해주세요
            </p>

            <div className="flex flex-wrap gap-2">
              {KEYWORD_OPTIONS.map((keyword) => {
                const isSelected = selectedKeywords.has(keyword);
                return (
                  <button
                    key={keyword}
                    onClick={() => handleToggleKeyword(keyword)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-foreground text-background"
                        : "ring-1 ring-black/[0.08] hover:bg-muted"
                    }`}
                  >
                    {keyword}
                  </button>
                );
              })}
            </div>

            {keywordError && (
              <p className="mt-2 text-xs text-red-500">
                최소 1개 이상의 키워드를 선택해주세요
              </p>
            )}
          </section>

          <Separator className="mb-8" />

          {/* Text review */}
          <section className="mb-8">
            <h2 className="text-base font-semibold mb-1">
              후기를 남겨주세요{" "}
              <span className="text-muted-foreground font-normal">(선택)</span>
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              파트너에게 도움이 되는 솔직한 후기를 남겨주세요
            </p>

            <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm overflow-hidden">
              <textarea
                value={reviewText}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setReviewText(e.target.value);
                  }
                }}
                placeholder="프로젝트 진행 과정에서의 경험을 자유롭게 작성해주세요"
                className="w-full resize-none rounded-xl border-0 bg-transparent p-4 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none min-h-[160px]"
                maxLength={MAX_CHARS}
              />
              <div className="flex justify-end px-4 pb-3">
                <span className="text-xs text-muted-foreground">
                  {reviewText.length} / {MAX_CHARS}자
                </span>
              </div>
            </div>
          </section>

          <Separator className="mb-8" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="rounded-xl h-11 px-6"
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              className="rounded-xl h-11 px-6"
              onClick={handleSubmit}
            >
              {isEditMode ? "리뷰 수정" : "리뷰 등록"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

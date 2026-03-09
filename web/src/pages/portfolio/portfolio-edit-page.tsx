import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Constants ─── */

const SIDO_OPTIONS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

const SIGUNGU_MAP: Record<string, string[]> = {
  서울특별시: ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  경기도: ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시"],
  부산광역시: ["해운대구", "부산진구", "동래구", "남구", "북구", "사하구", "금정구", "연제구", "수영구", "사상구"],
};

const BUILDING_USES = ["단독주택", "다세대주택", "근린생활", "오피스텔", "상가", "공장", "창고", "기타"];

/* ─── Detail Image Item ─── */

interface DetailImage {
  id: number;
  url: string;
  caption: string;
}

/* ─── Page ─── */

export default function PortfolioEditPage() {
  const { id } = useParams<{ id: string }>();

  // Section 1: 기본 정보 (pre-filled with mock data)
  const [title, setTitle] = useState("강남구 역삼동 모던 단독주택 설계");
  const [sido, setSido] = useState("서울특별시");
  const [sigungu, setSigungu] = useState("강남구");
  const [buildingUse, setBuildingUse] = useState("단독주택");
  const [completionYear, setCompletionYear] = useState("2024");
  const [mainImage, setMainImage] = useState<string | null>(
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=375&fit=crop",
  );
  const [description, setDescription] = useState(
    "서울 강남구 역삼동에 위치한 모던 스타일의 단독주택 설계 프로젝트입니다. 자연 채광과 개방감을 극대화한 설계로 도심 속 편안한 주거 공간을 구현했습니다.",
  );

  // Section 2: 상세 정보 (pre-filled)
  const [landArea, setLandArea] = useState("198");
  const [buildingArea, setBuildingArea] = useState("118.8");
  const [totalFloorArea, setTotalFloorArea] = useState("356.4");
  const [aboveGroundFloors, setAboveGroundFloors] = useState("3");
  const [undergroundFloors, setUndergroundFloors] = useState("1");
  const [constructorName, setConstructorName] = useState("한빛건설");
  const [constructionPeriod, setConstructionPeriod] = useState("2023.03 ~ 2024.06");
  const [designPeriod, setDesignPeriod] = useState("2022.09 ~ 2023.02");

  // Section 3: 상세 이미지 (pre-filled)
  const [detailImages, setDetailImages] = useState<DetailImage[]>([
    { id: 1, url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop", caption: "외관 전경" },
    { id: 2, url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", caption: "거실 인테리어" },
    { id: 3, url: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop", caption: "옥상 테라스" },
  ]);
  const [nextImageId, setNextImageId] = useState(4);

  const sigunguOptions = sido ? SIGUNGU_MAP[sido] ?? [] : [];

  function handleMainImageUpload() {
    setMainImage("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=375&fit=crop");
  }

  function addDetailImage() {
    if (detailImages.length >= 20) return;
    setDetailImages((prev) => [
      ...prev,
      {
        id: nextImageId,
        url: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&sig=${nextImageId}`,
        caption: "",
      },
    ]);
    setNextImageId((prev) => prev + 1);
  }

  function removeDetailImage(imageId: number) {
    setDetailImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function updateCaption(imageId: number, caption: string) {
    setDetailImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, caption } : img)),
    );
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[760px] px-6 py-8">
        {/* Back link */}
        <Link
          to="/portfolios"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          포트폴리오 목록
        </Link>

        {/* Header with delete button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">포트폴리오 수정</h1>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl gap-1.5"
            onClick={() => {
              if (confirm("정말 삭제하시겠습니까?")) {
                alert(`포트폴리오 ${id} 삭제 (목업)`);
              }
            }}
          >
            <Trash2 className="size-3.5" />
            삭제
          </Button>
        </div>

        {/* Section 1: 기본 정보 */}
        <div className="mb-6 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold">기본 정보</h2>
            <p className="text-xs text-muted-foreground mt-0.5">필수 항목입니다</p>
          </div>

          <div className="space-y-5">
            {/* 제목 */}
            <div className="space-y-2">
              <Label>제목 <span className="text-destructive">*</span></Label>
              <Input
                placeholder="포트폴리오 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            {/* 지역 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>시/도 <span className="text-destructive">*</span></Label>
                <select
                  value={sido}
                  onChange={(e) => {
                    setSido(e.target.value);
                    setSigungu("");
                  }}
                  className="flex h-11 w-full rounded-xl bg-background px-3 py-2 text-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">선택하세요</option>
                  {SIDO_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>시/군/구 <span className="text-destructive">*</span></Label>
                <select
                  value={sigungu}
                  onChange={(e) => setSigungu(e.target.value)}
                  disabled={!sido}
                  className="flex h-11 w-full rounded-xl bg-background px-3 py-2 text-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">선택하세요</option>
                  {sigunguOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 건축 용도 + 준공연도 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>건축 용도 <span className="text-destructive">*</span></Label>
                <select
                  value={buildingUse}
                  onChange={(e) => setBuildingUse(e.target.value)}
                  className="flex h-11 w-full rounded-xl bg-background px-3 py-2 text-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">선택하세요</option>
                  {BUILDING_USES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>준공연도 <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="예: 2024"
                  value={completionYear}
                  onChange={(e) => setCompletionYear(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* 메인 이미지 */}
            <div className="space-y-2">
              <Label>메인 이미지 <span className="text-destructive">*</span></Label>
              {mainImage ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <img
                    src={mainImage}
                    alt="메인 이미지"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setMainImage(null)}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleMainImageUpload}
                  className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Upload className="size-8" />
                  <span className="text-sm font-medium">이미지 업로드</span>
                  <span className="text-xs">권장 비율 16:10</span>
                </button>
              )}
            </div>

            {/* 소개 문구 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>소개 문구 <span className="text-destructive">*</span></Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {description.length}/500
                </span>
              </div>
              <textarea
                placeholder="프로젝트를 소개하는 문구를 작성하세요"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setDescription(e.target.value);
                }}
                rows={4}
                className="flex w-full rounded-xl bg-background px-3 py-2.5 text-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>

        <Separator className="opacity-50 my-6" />

        {/* Section 2: 상세 정보 */}
        <div className="mb-6 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold">상세 정보</h2>
            <p className="text-xs text-muted-foreground mt-0.5">선택 항목입니다</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>대지면적 (m²)</Label>
              <Input
                type="number"
                placeholder="예: 198"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>건축면적 (m²)</Label>
              <Input
                type="number"
                placeholder="예: 118.8"
                value={buildingArea}
                onChange={(e) => setBuildingArea(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>연면적 (m²)</Label>
              <Input
                type="number"
                placeholder="예: 356.4"
                value={totalFloorArea}
                onChange={(e) => setTotalFloorArea(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>지상 층수</Label>
              <Input
                type="number"
                placeholder="예: 3"
                value={aboveGroundFloors}
                onChange={(e) => setAboveGroundFloors(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>지하 층수</Label>
              <Input
                type="number"
                placeholder="예: 1"
                value={undergroundFloors}
                onChange={(e) => setUndergroundFloors(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>시공사명</Label>
              <Input
                placeholder="시공사명을 입력하세요"
                value={constructorName}
                onChange={(e) => setConstructorName(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>시공 기간</Label>
              <Input
                placeholder="예: 2023.03 ~ 2024.06"
                value={constructionPeriod}
                onChange={(e) => setConstructionPeriod(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>설계 기간</Label>
              <Input
                placeholder="예: 2022.09 ~ 2023.02"
                value={designPeriod}
                onChange={(e) => setDesignPeriod(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
        </div>

        <Separator className="opacity-50 my-6" />

        {/* Section 3: 상세 이미지 */}
        <div className="mb-8 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6">
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">상세 이미지</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  선택 항목 (최대 20장)
                </p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {detailImages.length}/20
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {detailImages.map((img) => (
              <div key={img.id} className="space-y-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <img
                    src={img.url}
                    alt={img.caption || "상세 이미지"}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeDetailImage(img.id)}
                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <Input
                  placeholder="캡션 입력"
                  value={img.caption}
                  onChange={(e) => updateCaption(img.id, e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            ))}

            {detailImages.length < 20 && (
              <button
                type="button"
                onClick={addDetailImage}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Plus className="size-6" />
                <span className="text-xs font-medium">이미지 추가</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="lg" className="rounded-xl" asChild>
            <Link to="/portfolios">취소</Link>
          </Button>
          <Button
            size="lg"
            className="rounded-xl min-w-[120px]"
            onClick={() => alert(`포트폴리오 ${id} 저장 완료 (목업)`)}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

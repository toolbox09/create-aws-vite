import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

type TermsTab = "서비스 이용약관" | "개인정보 처리방침" | "위치기반서비스 이용약관";

interface VersionEntry {
  date: string;
  status: "현행" | "이전";
}

/* ─── Mock Data ─── */

const TABS: TermsTab[] = ["서비스 이용약관", "개인정보 처리방침", "위치기반서비스 이용약관"];

const VERSIONS: Record<TermsTab, VersionEntry[]> = {
  "서비스 이용약관": [
    { date: "2026.01.01", status: "현행" },
    { date: "2025.07.01", status: "이전" },
    { date: "2025.01.01", status: "이전" },
  ],
  "개인정보 처리방침": [
    { date: "2026.01.01", status: "현행" },
    { date: "2025.06.01", status: "이전" },
  ],
  "위치기반서비스 이용약관": [
    { date: "2026.01.01", status: "현행" },
    { date: "2025.03.01", status: "이전" },
  ],
};

const TERMS_CONTENT: Record<TermsTab, Record<string, string>> = {
  "서비스 이용약관": {
    "2026.01.01": `<h3>제1조 (목적)</h3>
<p>이 약관은 주식회사 OO(이하 "회사")가 운영하는 건축 설계 입찰 플랫폼 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>

<h3>제2조 (정의)</h3>
<p>1. "서비스"란 회사가 제공하는 건축 설계 입찰 중개, 프로젝트 관리, AI 분석, 전자계약 등 일체의 서비스를 말합니다.</p>
<p>2. "회원"이란 이 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 말합니다.</p>
<p>3. "건축주"란 건축 설계 용역을 의뢰하는 회원을 말합니다.</p>
<p>4. "건축사"란 건축사 자격을 보유하고 설계 용역을 제공하는 회원을 말합니다.</p>

<h3>제3조 (약관의 효력 및 변경)</h3>
<p>1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</p>
<p>2. 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
<p>3. 변경된 약관은 시행일 7일 전부터 서비스 내 공지사항을 통해 고지합니다.</p>

<h3>제4조 (서비스의 제공)</h3>
<p>1. 회사는 다음 각 호의 서비스를 제공합니다.</p>
<p>&nbsp;&nbsp;가. 건축 설계 입찰 공고 등록 및 참여 서비스</p>
<p>&nbsp;&nbsp;나. 건축사 검색 및 매칭 서비스</p>
<p>&nbsp;&nbsp;다. 프로젝트 관리 및 성과품 전달 서비스</p>
<p>&nbsp;&nbsp;라. AI 기반 프로젝트 분석 서비스</p>
<p>&nbsp;&nbsp;마. 전자계약 및 에스크로 결제 서비스</p>

<h3>제5조 (이용계약의 체결)</h3>
<p>1. 이용계약은 회원이 되고자 하는 자가 약관의 내용에 동의한 후 회원가입을 신청하고, 회사가 이를 승낙함으로써 체결됩니다.</p>
<p>2. 회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않을 수 있습니다.</p>
<p>&nbsp;&nbsp;가. 실명이 아니거나 타인의 명의를 이용한 경우</p>
<p>&nbsp;&nbsp;나. 허위 정보를 기재한 경우</p>`,
    "2025.07.01": `<h3>제1조 (목적)</h3>
<p>이 약관은 주식회사 OO(이하 "회사")가 운영하는 건축 설계 입찰 플랫폼 서비스(이하 "서비스")의 이용 조건 및 절차를 규정함을 목적으로 합니다.</p>
<h3>제2조 (정의)</h3>
<p>(이전 버전의 약관 내용입니다. 2025년 7월 1일부터 시행되었으며, 2026년 1월 1일자로 개정되었습니다.)</p>`,
    "2025.01.01": `<h3>제1조 (목적)</h3>
<p>이 약관은 서비스 초기 버전의 이용 약관입니다. 2025년 1월 1일부터 시행되었으며, 이후 개정되었습니다.</p>`,
  },
  "개인정보 처리방침": {
    "2026.01.01": `<h3>제1조 (개인정보의 수집 및 이용 목적)</h3>
<p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
<p>1. 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 부정 이용 방지</p>
<p>2. 서비스 제공: 입찰 중개, 계약 체결, 결제 처리, 콘텐츠 제공</p>

<h3>제2조 (수집하는 개인정보 항목)</h3>
<p>1. 필수항목: 이메일, 비밀번호, 이름, 연락처</p>
<p>2. 선택항목: 회사명, 사업자등록번호, 건축사 자격번호, 프로필 이미지</p>
<p>3. 자동수집항목: IP 주소, 쿠키, 서비스 이용 기록, 방문 기록</p>

<h3>제3조 (개인정보의 보유 및 이용 기간)</h3>
<p>회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</p>
<p>1. 회원 가입 정보: 회원 탈퇴 시까지</p>
<p>2. 전자상거래 기록: 5년 (전자상거래법)</p>
<p>3. 접속 기록: 3개월 (통신비밀보호법)</p>

<h3>제4조 (개인정보의 제3자 제공)</h3>
<p>회사는 원칙적으로 정보주체의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
<p>1. 정보주체가 사전에 동의한 경우</p>
<p>2. 법률에 특별한 규정이 있는 경우</p>`,
    "2025.06.01": `<h3>제1조 (개인정보의 수집 및 이용 목적)</h3>
<p>(이전 버전의 개인정보 처리방침입니다. 2025년 6월 1일부터 시행되었습니다.)</p>`,
  },
  "위치기반서비스 이용약관": {
    "2026.01.01": `<h3>제1조 (목적)</h3>
<p>이 약관은 회사가 제공하는 위치기반서비스에 대해 회사와 개인위치정보주체(이하 "이용자")의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>

<h3>제2조 (이용약관의 효력 및 변경)</h3>
<p>1. 이 약관은 이용자가 본 약관에 동의하고 회사가 정한 절차에 따라 위치기반서비스의 이용자로 등록함으로써 효력이 발생합니다.</p>
<p>2. 회사는 위치정보의 보호 및 이용 등에 관한 법률, 콘텐츠산업 진흥법 등 관련 법률을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>

<h3>제3조 (서비스의 내용)</h3>
<p>회사는 위치정보사업자로부터 수집한 이용자의 위치정보를 이용하여 다음 각 호의 위치기반서비스를 제공합니다.</p>
<p>1. 프로젝트 현장 위치 기반 지도 서비스</p>
<p>2. 주변 건축사 검색 서비스</p>
<p>3. 부동산 관련 정보 제공 서비스</p>

<h3>제4조 (개인위치정보의 이용 또는 제공)</h3>
<p>1. 회사는 개인위치정보를 이용하여 서비스를 제공하고자 하는 경우에는 미리 약관에 명시한 후 개인위치정보주체의 동의를 얻어야 합니다.</p>`,
    "2025.03.01": `<h3>제1조 (목적)</h3>
<p>(이전 버전의 위치기반서비스 이용약관입니다. 2025년 3월 1일부터 시행되었습니다.)</p>`,
  },
};

/* ─── Page ─── */

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<TermsTab>("서비스 이용약관");
  const [selectedVersions, setSelectedVersions] = useState<Record<TermsTab, string>>({
    "서비스 이용약관": "2026.01.01",
    "개인정보 처리방침": "2026.01.01",
    "위치기반서비스 이용약관": "2026.01.01",
  });

  const currentVersion = selectedVersions[activeTab];
  const versions = VERSIONS[activeTab];
  const isCurrentVersion = versions[0].date === currentVersion;
  const content = TERMS_CONTENT[activeTab][currentVersion] ?? "";

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">약관 및 정책</h1>
          <p className="text-sm text-muted-foreground mt-1">
            서비스 이용에 관한 약관과 정책을 확인하세요
          </p>
        </div>

        {/* Segmented Control */}
        <div className="inline-flex bg-muted rounded-xl p-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Version Selector */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={currentVersion}
            onChange={(e) =>
              setSelectedVersions((prev) => ({
                ...prev,
                [activeTab]: e.target.value,
              }))
            }
            className="h-9 rounded-lg bg-background px-3 text-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {versions.map((v) => (
              <option key={v.date} value={v.date}>
                시행일: {v.date}
                {v.status === "현행" ? " (현행)" : ""}
              </option>
            ))}
          </select>
          {isCurrentVersion && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              현행
            </span>
          )}
        </div>

        {/* Past version notice */}
        {!isCurrentVersion && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 px-4 py-3 mb-4">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              이 약관은 현재 시행 중인 약관이 아닙니다. 현행 약관은{" "}
              <button
                onClick={() =>
                  setSelectedVersions((prev) => ({
                    ...prev,
                    [activeTab]: versions[0].date,
                  }))
                }
                className="font-semibold underline underline-offset-4"
              >
                여기
              </button>
              에서 확인하세요.
            </p>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm">
          <div
            className="p-6 prose prose-sm max-w-none text-sm leading-[1.8] [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 first:[&_h3]:mt-0 [&_p]:mb-2 [&_p]:text-foreground"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Version History */}
        <div className="mt-8">
          <h2 className="text-base font-semibold mb-4">개정 이력</h2>
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center px-5 py-3 text-xs font-medium text-muted-foreground bg-muted/30">
              <span className="flex-1">시행일</span>
              <span className="w-[80px] text-center shrink-0">상태</span>
              <span className="w-[60px] text-center shrink-0" />
            </div>

            <Separator />

            <div className="divide-y divide-black/[0.06]">
              {versions.map((v) => (
                <div key={v.date} className="flex items-center px-5 py-3">
                  <span className="flex-1 text-sm">{v.date}</span>
                  <span className="w-[80px] text-center shrink-0">
                    {v.status === "현행" ? (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        현행
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">이전</span>
                    )}
                  </span>
                  <span className="w-[60px] text-center shrink-0">
                    <button
                      onClick={() =>
                        setSelectedVersions((prev) => ({
                          ...prev,
                          [activeTab]: v.date,
                        }))
                      }
                      className={`text-xs font-medium transition-colors ${
                        currentVersion === v.date
                          ? "text-muted-foreground"
                          : "text-primary hover:underline underline-offset-4"
                      }`}
                      disabled={currentVersion === v.date}
                    >
                      보기
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

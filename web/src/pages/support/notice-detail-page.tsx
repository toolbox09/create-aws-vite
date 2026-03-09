import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Pin, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Mock Data ─── */

interface NoticeDetail {
  id: number;
  title: string;
  date: string;
  pinned: boolean;
  content: string;
  attachments: { name: string; size: string }[];
}

const MOCK_NOTICES: NoticeDetail[] = [
  {
    id: 1,
    title: "[긴급] 시스템 점검 안내 (3/15 02:00~04:00)",
    date: "2026.03.05",
    pinned: true,
    content: `<h3>안녕하세요, 서비스 운영팀입니다.</h3>
<p>보다 나은 서비스 제공을 위해 아래와 같이 시스템 점검을 실시합니다.</p>
<h4>점검 일시</h4>
<p>2026년 3월 15일 (토) 02:00 ~ 04:00 (약 2시간)</p>
<h4>점검 내용</h4>
<p>서버 인프라 업그레이드 및 보안 패치 적용</p>
<h4>영향 범위</h4>
<p>점검 시간 동안 서비스 전체 이용이 일시적으로 제한됩니다. 입찰 마감이 점검 시간과 겹치는 경우 자동으로 2시간 연장됩니다.</p>
<p>이용에 불편을 드려 죄송합니다. 안정적인 서비스를 위해 최선을 다하겠습니다.</p>`,
    attachments: [
      { name: "시스템_점검_안내문.pdf", size: "1.2MB" },
    ],
  },
  {
    id: 2,
    title: "2026년 서비스 이용약관 개정 안내",
    date: "2026.02.28",
    pinned: true,
    content: `<h3>서비스 이용약관 개정 안내</h3>
<p>2026년 3월 1일부터 시행되는 서비스 이용약관 개정 사항을 안내드립니다.</p>
<h4>주요 변경 사항</h4>
<p>1. 전자계약 서비스 관련 조항 신설 (제15조)</p>
<p>2. 분쟁 해결 절차 개선 (제22조)</p>
<p>3. 개인정보 처리 위탁 업체 변경 (별첨)</p>
<p>변경된 약관은 마이페이지 > 약관 및 정책에서 확인하실 수 있습니다.</p>`,
    attachments: [
      { name: "이용약관_개정_신구대조표.pdf", size: "845KB" },
      { name: "개인정보처리방침_변경안.pdf", size: "1.5MB" },
    ],
  },
  {
    id: 3,
    title: "설 연휴 고객센터 운영 안내",
    date: "2026.02.20",
    pinned: true,
    content: `<h3>설 연휴 고객센터 운영 안내</h3>
<p>설 연휴 기간 동안 고객센터 운영 시간이 변경됩니다.</p>
<h4>운영 변경 기간</h4>
<p>2026년 2월 27일 (금) ~ 3월 2일 (월)</p>
<p>해당 기간 동안 1:1 문의 답변이 지연될 수 있으며, 긴급 문의는 이메일(support@service.kr)로 연락해 주세요.</p>`,
    attachments: [],
  },
  {
    id: 4,
    title: "신규 AI 분석 리포트 기능 출시 안내",
    date: "2026.03.01",
    pinned: false,
    content: `<h3>AI 분석 리포트 기능이 출시되었습니다</h3>
<p>프로젝트 데이터를 기반으로 AI가 자동 분석 리포트를 생성해 드립니다.</p>
<p>분석 > AI 분석 리포트 메뉴에서 이용하실 수 있습니다.</p>`,
    attachments: [],
  },
  {
    id: 5,
    title: "파트너 검색 기능 개선 업데이트",
    date: "2026.02.25",
    pinned: false,
    content: `<h3>파트너 검색 기능이 개선되었습니다</h3>
<p>지역, 전문 분야, 경력 등 다양한 필터를 활용한 정밀 검색이 가능합니다.</p>
<p>파트너 포트폴리오 비교 기능도 함께 추가되었습니다.</p>`,
    attachments: [],
  },
  {
    id: 6,
    title: "2월 정기 점검 완료 안내",
    date: "2026.02.15",
    pinned: false,
    content: `<p>2월 정기 점검이 정상적으로 완료되었습니다. 이용해 주셔서 감사합니다.</p>`,
    attachments: [],
  },
  {
    id: 7,
    title: "모바일 앱 v2.3.0 업데이트 안내",
    date: "2026.02.10",
    pinned: false,
    content: `<h3>모바일 앱 업데이트 안내</h3>
<p>v2.3.0 주요 변경사항:</p>
<p>1. 입찰 알림 기능 개선</p>
<p>2. 다크모드 지원</p>
<p>3. 성능 최적화</p>`,
    attachments: [],
  },
  {
    id: 8,
    title: "개인정보 처리방침 변경 안내",
    date: "2026.02.01",
    pinned: false,
    content: `<p>개인정보 처리방침이 변경되었습니다. 자세한 내용은 약관 및 정책 페이지에서 확인하실 수 있습니다.</p>`,
    attachments: [],
  },
];

/* ─── Page ─── */

export default function NoticeDetailPage() {
  const { id } = useParams();
  const noticeId = Number(id);

  const currentIndex = MOCK_NOTICES.findIndex((n) => n.id === noticeId);
  const notice = MOCK_NOTICES[currentIndex];

  if (!notice) {
    return (
      <div className="min-h-svh bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-[1120px] px-6 py-8">
          <p className="text-center text-muted-foreground py-20">
            공지사항을 찾을 수 없습니다
          </p>
          <div className="text-center">
            <Link to="/support/notices" className="text-sm text-primary hover:underline">
              목록으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const prevNotice = currentIndex > 0 ? MOCK_NOTICES[currentIndex - 1] : null;
  const nextNotice = currentIndex < MOCK_NOTICES.length - 1 ? MOCK_NOTICES[currentIndex + 1] : null;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 py-8">
        {/* Back link */}
        <Link
          to="/support/notices"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          목록으로
        </Link>

        {/* Notice Card */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm">
          {/* Header */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-2">
              {notice.pinned && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  <Pin className="size-3" />
                  중요
                </span>
              )}
              <span className="text-xs text-muted-foreground">{notice.date}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{notice.title}</h1>
          </div>

          <Separator />

          {/* Body */}
          <div
            className="px-6 py-6 prose prose-sm max-w-none text-sm leading-[1.8] [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-0 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4 [&_p]:mb-2 [&_p]:text-foreground"
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />

          {/* Attachments */}
          {notice.attachments.length > 0 && (
            <>
              <Separator />
              <div className="px-6 py-5">
                <h3 className="text-sm font-semibold mb-3">
                  첨부파일 ({notice.attachments.length})
                </h3>
                <div className="space-y-2">
                  {notice.attachments.map((file, i) => (
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
                      <Button variant="outline" size="sm" className="rounded-lg shrink-0 gap-1.5">
                        <Download className="size-3.5" />
                        다운로드
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Prev / Next Navigation */}
        <div className="mt-4 bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm overflow-hidden divide-y divide-black/[0.06]">
          {prevNotice && (
            <Link
              to={`/support/notices/${prevNotice.id}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0 w-[60px]">이전글</span>
              <span className="text-sm truncate">{prevNotice.title}</span>
            </Link>
          )}
          {nextNotice && (
            <Link
              to={`/support/notices/${nextNotice.id}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0 w-[60px]">다음글</span>
              <span className="text-sm truncate">{nextNotice.title}</span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

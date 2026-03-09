import { useState } from "react";
import { Plus, Pencil, Trash2, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/layout/admin-layout";

/* ─── Mock Data ─── */

interface Notice {
  id: number;
  title: string;
  date: string;
  pinned: boolean;
}

interface FaqItem {
  id: number;
  category: string;
  question: string;
  date: string;
}

interface GuideItem {
  id: number;
  title: string;
  type: "가이드" | "영상" | "퀴즈";
  date: string;
}

const MOCK_NOTICES: Notice[] = [
  { id: 1, title: "콘마켓 서비스 이용약관 변경 안내", date: "2026-03-07", pinned: true },
  { id: 2, title: "2026년 3월 정기점검 안내 (3/15 02:00~06:00)", date: "2026-03-05", pinned: true },
  { id: 3, title: "파트너스 수수료 정책 변경 안내", date: "2026-03-01", pinned: false },
  { id: 4, title: "개인정보처리방침 개정 사전 안내", date: "2026-02-25", pinned: false },
  { id: 5, title: "입찰 시스템 기능 개선 완료 안내", date: "2026-02-20", pinned: false },
];

const MOCK_FAQ: FaqItem[] = [
  { id: 1, category: "회원", question: "회원가입은 어떻게 하나요?", date: "2026-03-01" },
  { id: 2, category: "입찰", question: "입찰 등록 절차가 어떻게 되나요?", date: "2026-02-28" },
  { id: 3, category: "결제", question: "설계비 결제는 어떻게 진행되나요?", date: "2026-02-25" },
  { id: 4, category: "계약", question: "계약서는 어떻게 작성하나요?", date: "2026-02-20" },
  { id: 5, category: "기타", question: "서비스 탈퇴는 어떻게 하나요?", date: "2026-02-15" },
];

const MOCK_GUIDES: GuideItem[] = [
  { id: 1, title: "건축 설계 프로세스 이해하기", type: "가이드", date: "2026-03-05" },
  { id: 2, title: "나에게 맞는 건축사 찾는 법", type: "가이드", date: "2026-03-01" },
  { id: 3, title: "건축 허가 절차 완벽 가이드", type: "가이드", date: "2026-02-28" },
  { id: 4, title: "건축비 산정 기초 강의", type: "영상", date: "2026-03-03" },
  { id: 5, title: "인테리어 트렌드 2026", type: "영상", date: "2026-02-27" },
  { id: 6, title: "구조 설계 기초", type: "영상", date: "2026-02-20" },
  { id: 7, title: "건축 용어 퀴즈", type: "퀴즈", date: "2026-03-04" },
  { id: 8, title: "건축법 기초 퀴즈", type: "퀴즈", date: "2026-02-26" },
  { id: 9, title: "설계 도면 읽기 퀴즈", type: "퀴즈", date: "2026-02-22" },
  { id: 10, title: "친환경 건축 퀴즈", type: "퀴즈", date: "2026-02-18" },
  { id: 11, title: "스마트홈 기초 가이드", type: "가이드", date: "2026-02-15" },
  { id: 12, title: "리모델링 체크리스트", type: "가이드", date: "2026-02-10" },
];

/* ─── Tab Button ─── */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-1.5 text-sm transition-colors ${
        active
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground" />
      )}
    </button>
  );
}

const GUIDE_TYPE_STYLE: Record<string, string> = {
  가이드: "text-blue-600 bg-blue-500/8",
  영상: "text-violet-600 bg-violet-500/8",
  퀴즈: "text-amber-600 bg-amber-500/8",
};

/* ─── Page ─── */

const MAIN_TABS = ["공지사항", "FAQ", "건축가이드"] as const;
type MainTab = (typeof MAIN_TABS)[number];

const GUIDE_SUB_TABS = ["가이드", "영상", "퀴즈"] as const;
type GuideSubTab = (typeof GUIDE_SUB_TABS)[number];

export default function AdminContentPage() {
  const [mainTab, setMainTab] = useState<MainTab>("공지사항");
  const [guideSubTab, setGuideSubTab] = useState<GuideSubTab>("가이드");

  const filteredGuides = MOCK_GUIDES.filter((g) => g.type === guideSubTab).slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight">콘텐츠 관리</h2>

        {/* Tabs — underline style */}
        <div className="flex items-center gap-0 border-b border-border/60">
          {MAIN_TABS.map((tab) => (
            <TabButton key={tab} active={mainTab === tab} onClick={() => setMainTab(tab)}>
              {tab}
            </TabButton>
          ))}
        </div>

        {/* 공지사항 */}
        {mainTab === "공지사항" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Plus className="size-3" />
                등록
              </Button>
            </div>
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border/60">
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-[50%]">제목</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">등록일</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">고정</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-16">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_NOTICES.map((item) => (
                    <tr key={item.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium">
                        {item.pinned && <Pin className="inline size-3 mr-1.5 text-foreground" />}
                        {item.title}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.date}</td>
                      <td className="px-4 py-2.5">
                        {item.pinned ? (
                          <span className="text-[11px] text-foreground font-medium">고정</span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/40">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="size-7"><Trash2 className="size-3 text-red-500/60" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ */}
        {mainTab === "FAQ" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Plus className="size-3" />
                등록
              </Button>
            </div>
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border/60">
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">카테고리</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-[50%]">질문</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">등록일</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-16">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_FAQ.map((item) => (
                    <tr key={item.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-medium text-muted-foreground">{item.category}</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium">{item.question}</td>
                      <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.date}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="size-7"><Trash2 className="size-3 text-red-500/60" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 건축가이드 */}
        {mainTab === "건축가이드" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0 border-b border-border/60">
                {GUIDE_SUB_TABS.map((tab) => (
                  <TabButton key={tab} active={guideSubTab === tab} onClick={() => setGuideSubTab(tab)}>
                    {tab}
                  </TabButton>
                ))}
              </div>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Plus className="size-3" />
                등록
              </Button>
            </div>
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border/60">
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-8">No</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-[50%]">제목</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">유형</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium">등록일</th>
                    <th className="px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground font-medium w-16">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuides.map((item) => (
                    <tr key={item.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.id}</td>
                      <td className="px-4 py-2.5 font-medium">{item.title}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${GUIDE_TYPE_STYLE[item.type]}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{item.date}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="size-7"><Trash2 className="size-3 text-red-500/60" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredGuides.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">등록된 항목이 없습니다</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

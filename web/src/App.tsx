import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

const HomePage = lazy(() => import("./pages/home/home-page"));
const MapPage = lazy(() => import("./pages/map/map-page"));
const LoginPage = lazy(() => import("./pages/auth/login-page"));
const PartnerSearchPage = lazy(() => import("./pages/partner/partner-search-page"));
const PartnerDetailPage = lazy(() => import("./pages/partner/partner-detail-page"));
const PortfolioDetailPage = lazy(() => import("./pages/partner/portfolio-detail-page"));
const PublicArchitectSearchPage = lazy(() => import("./pages/partner/public-architect-search-page"));
const AiProjectListPage = lazy(() => import("./pages/analysis/ai-project-list-page"));
const AiProjectDetailPage = lazy(() => import("./pages/analysis/ai-project-detail-page"));
const AiReportPage = lazy(() => import("./pages/analysis/ai-report-page"));
const ManualSimulationPage = lazy(() => import("./pages/analysis/manual-simulation-page"));
const BidRegistrationPage = lazy(() => import("./pages/bid/bid-registration-page"));
const BidListPage = lazy(() => import("./pages/bid/bid-list-page"));
const BidDetailPage = lazy(() => import("./pages/bid/bid-detail-page"));
const SignupPage = lazy(() => import("./pages/auth/signup-page"));
const MyPage = lazy(() => import("./pages/mypage/my-page"));
const ContractDetailPage = lazy(() => import("./pages/contract/contract-detail-page"));
const Ai3dViewerPage = lazy(() => import("./pages/analysis/ai-3d-viewer-page"));
const BidEditPage = lazy(() => import("./pages/bid/bid-edit-page"));
const ProposalCreatePage = lazy(() => import("./pages/bid/proposal-create-page"));
const ProposalEditPage = lazy(() => import("./pages/bid/proposal-edit-page"));
const ProposalDetailPage = lazy(() => import("./pages/bid/proposal-detail-page"));
const ContractDraftPage = lazy(() => import("./pages/contract/contract-draft-page"));
const ContractEditPage = lazy(() => import("./pages/contract/contract-edit-page"));
const ContractSignPage = lazy(() => import("./pages/contract/contract-sign-page"));
const ProjectListPage = lazy(() => import("./pages/project/project-list-page"));
const ProjectDetailPage = lazy(() => import("./pages/project/project-detail-page"));
const ProjectDeliverablesPage = lazy(() => import("./pages/project/project-deliverables-page"));
const ProjectReviewPage = lazy(() => import("./pages/project/project-review-page"));
const PasswordFindPage = lazy(() => import("./pages/auth/password-find-page"));
const PasswordResetPage = lazy(() => import("./pages/auth/password-reset-page"));
const PublicArchitectDetailPage = lazy(() => import("./pages/partner/public-architect-detail-page"));
const PortfolioListPage = lazy(() => import("./pages/portfolio/portfolio-list-page"));
const PortfolioCreatePage = lazy(() => import("./pages/portfolio/portfolio-create-page"));
const PortfolioEditPage = lazy(() => import("./pages/portfolio/portfolio-edit-page"));
const ChatListPage = lazy(() => import("./pages/chat/chat-list-page"));
const ChatRoomPage = lazy(() => import("./pages/chat/chat-room-page"));
const NotificationListPage = lazy(() => import("./pages/notification/notification-list-page"));
const NotificationSettingsPage = lazy(() => import("./pages/notification/notification-settings-page"));
const QuizStagePage = lazy(() => import("./pages/guide/quiz-stage-page"));
const QuizPlayPage = lazy(() => import("./pages/guide/quiz-play-page"));
const GuideListPage = lazy(() => import("./pages/guide/guide-list-page"));
const GuideDetailPage = lazy(() => import("./pages/guide/guide-detail-page"));
const GuideVideoPage = lazy(() => import("./pages/guide/guide-video-page"));
const NoticeListPage = lazy(() => import("./pages/support/notice-list-page"));
const NoticeDetailPage = lazy(() => import("./pages/support/notice-detail-page"));
const FaqPage = lazy(() => import("./pages/support/faq-page"));
const InquiryCreatePage = lazy(() => import("./pages/support/inquiry-create-page"));
const InquiryListPage = lazy(() => import("./pages/support/inquiry-list-page"));
const TermsPage = lazy(() => import("./pages/support/terms-page"));
const AdminLicensePage = lazy(() => import("./pages/admin/admin-license-page"));
const AdminBusinessChangePage = lazy(() => import("./pages/admin/admin-business-change-page"));
const AdminMembersPage = lazy(() => import("./pages/admin/admin-members-page"));
const AdminContentPage = lazy(() => import("./pages/admin/admin-content-page"));
const AdminSupportPage = lazy(() => import("./pages/admin/admin-support-page"));

function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <svg
          className="size-8 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="#F26118"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="#F26118"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm text-muted-foreground">로딩 중...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/partners" element={<PartnerSearchPage />} />
          <Route path="/partners/:id" element={<PartnerDetailPage />} />
          <Route path="/partners/:id/portfolio/:portfolioId" element={<PortfolioDetailPage />} />
          <Route path="/architects" element={<PublicArchitectSearchPage />} />
          <Route path="/analysis/ai" element={<AiProjectListPage />} />
          <Route path="/analysis/ai/new" element={<AiProjectDetailPage />} />
          <Route path="/analysis/ai/:id" element={<AiProjectDetailPage />} />
          <Route path="/analysis/ai/:id/report/:reportId" element={<AiReportPage />} />
          <Route path="/analysis/manual" element={<ManualSimulationPage />} />
          <Route path="/bids" element={<BidListPage />} />
          <Route path="/bids/new" element={<BidRegistrationPage />} />
          <Route path="/bids/:id" element={<BidDetailPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/analysis/ai/:id/report/:reportId/3d" element={<Ai3dViewerPage />} />
          <Route path="/bids/:id/edit" element={<BidEditPage />} />
          <Route path="/bids/:bidId/proposals/new" element={<ProposalCreatePage />} />
          <Route path="/bids/:bidId/proposals/:proposalId/edit" element={<ProposalEditPage />} />
          <Route path="/bids/:bidId/proposals/:proposalId" element={<ProposalDetailPage />} />
          <Route path="/contracts/new" element={<ContractDraftPage />} />
          <Route path="/contracts/:id/edit" element={<ContractEditPage />} />
          <Route path="/contracts/:id/sign" element={<ContractSignPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/deliverables" element={<ProjectDeliverablesPage />} />
          <Route path="/projects/:id/review" element={<ProjectReviewPage />} />
          <Route path="/auth/password-find" element={<PasswordFindPage />} />
          <Route path="/auth/password-reset" element={<PasswordResetPage />} />
          <Route path="/architects/:id" element={<PublicArchitectDetailPage />} />
          <Route path="/portfolio" element={<PortfolioListPage />} />
          <Route path="/portfolio/new" element={<PortfolioCreatePage />} />
          <Route path="/portfolio/:id/edit" element={<PortfolioEditPage />} />
          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/chat/:channelId" element={<ChatRoomPage />} />
          <Route path="/notifications" element={<NotificationListPage />} />
          <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
          <Route path="/guide/quiz" element={<QuizStagePage />} />
          <Route path="/guide/quiz/:stageId" element={<QuizPlayPage />} />
          <Route path="/guide/articles" element={<GuideListPage />} />
          <Route path="/guide/articles/:id" element={<GuideDetailPage />} />
          <Route path="/guide/videos" element={<GuideVideoPage />} />
          <Route path="/support/notices" element={<NoticeListPage />} />
          <Route path="/support/notices/:id" element={<NoticeDetailPage />} />
          <Route path="/support/faq" element={<FaqPage />} />
          <Route path="/support/inquiries" element={<InquiryListPage />} />
          <Route path="/support/inquiries/new" element={<InquiryCreatePage />} />
          <Route path="/support/terms" element={<TermsPage />} />
          <Route path="/admin/license" element={<AdminLicensePage />} />
          <Route path="/admin/business-change" element={<AdminBusinessChangePage />} />
          <Route path="/admin/members" element={<AdminMembersPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

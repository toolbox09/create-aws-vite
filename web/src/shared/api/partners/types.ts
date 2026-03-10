export interface CodeLabel {
  code: string;
  label: string;
}

export interface CodeItem extends CodeLabel {
  metadata?: Record<string, unknown>;
}

// ── Partner List ──

export interface PartnerListItem {
  id: number;
  name: string;
  sido: CodeLabel;
  sigunguCode: string | null;
  address: string;
  profileImage: string | null;
  coverImage: string | null;
  certs: CodeLabel[];
  usages: CodeLabel[];
  portfolioCount: number;
  reviewCount: number;
  rating: number;
  foundedYear: number;
  years: number;
  topReviewTags: string[];
  isFavorited: boolean | null;
}

export interface PartnerListResponse {
  data: PartnerListItem[];
  total: number;
  page: number;
  size: number;
}

export interface PartnerListParams {
  q?: string;
  certs?: string;
  sidoCodes?: string;
  usages?: string;
  minYears?: number;
  maxYears?: number;
  minPortfolio?: number;
  sort?: "rating" | "portfolio" | "years";
  page?: number;
  size?: number;
}

// ── Partner Detail ──

export interface PartnerDetail {
  id: number;
  name: string;
  sido: CodeLabel;
  sigunguCode: string | null;
  address: string;
  profileImage: string | null;
  coverImage: string | null;
  certs: CodeLabel[];
  usages: CodeLabel[];
  foundedYear: number;
  years: number;
  ceoName: string;
  employeeCount: number | null;
  phone: string | null;
  websiteUrl: string | null;
  intro: string;
  rating: number;
  reviewCount: number;
  portfolioCount: number;
  isFavorited: boolean | null;
}

export interface PortfolioSummary {
  id: number;
  title: string;
  thumbnail: string | null;
  usage: CodeLabel;
  landArea: number | null;
  year: number;
  description: string | null;
}

export interface QualificationItem {
  id: number;
  label: string;
  description: string | null;
  status: string;
}

export interface ReviewTagCount {
  id: number;
  label: string;
  count: number;
}

export interface ReviewItem {
  id: number;
  author: string;
  date: string;
  rating: number;
  portfolioId: number | null;
  portfolioTitle: string | null;
  tags: CodeLabel[];
  text: string;
}

export interface PartnerDetailResponse {
  partner: PartnerDetail;
  brandStoryContent: string | null;
  portfolios: PortfolioSummary[];
  qualifications: QualificationItem[];
  reviewTagSummary: ReviewTagCount[];
  reviews: ReviewItem[];
}

// ── Portfolio Detail ──

export interface PortfolioImageItem {
  id: number;
  url: string;
  caption: string | null;
}

export interface PortfolioDetailResponse {
  id: number;
  partnerId: number;
  partnerName: string;
  title: string;
  intro: string | null;
  heroImage: string | null;
  usage: CodeLabel;
  location: string;
  completionYear: number;
  landArea: number | null;
  buildingArea: number | null;
  totalFloorArea: number | null;
  floorsAbove: number | null;
  floorsBelow: number | null;
  constructorName: string | null;
  constructionPeriodMonths: number | null;
  designPeriodMonths: number | null;
  images: PortfolioImageItem[];
}

// ── Codes ──

export type CodesResponse = Record<string, CodeItem[]>;

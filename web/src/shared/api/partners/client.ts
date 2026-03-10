import http from "../http";
import type {
  PartnerListParams,
  PartnerListResponse,
  PartnerDetailResponse,
  PortfolioDetailResponse,
  CodesResponse,
} from "./types";

export const partnersApi = {
  getCodes: (groups?: string) =>
    http.get<CodesResponse>("/codes", { params: { groups } }).then((r) => r.data),

  listPartners: (params: PartnerListParams) =>
    http
      .get<PartnerListResponse>("/partners", {
        params: {
          q: params.q,
          certs: params.certs,
          sido_codes: params.sidoCodes,
          usages: params.usages,
          min_years: params.minYears,
          max_years: params.maxYears,
          min_portfolio: params.minPortfolio,
          sort: params.sort,
          page: params.page,
          size: params.size,
        },
      })
      .then((r) => r.data),

  getPartner: (id: number) =>
    http.get<PartnerDetailResponse>(`/partners/${id}`).then((r) => r.data),

  toggleFavorite: (id: number) =>
    http.post<{ favorited: boolean }>(`/partners/${id}/favorite`).then((r) => r.data),

  getPortfolio: (partnerId: number, portfolioId: number) =>
    http
      .get<PortfolioDetailResponse>(
        `/partners/${partnerId}/portfolios/${portfolioId}`,
      )
      .then((r) => r.data),

  listReviews: (partnerId: number, page = 1, size = 10) =>
    http
      .get(`/partners/${partnerId}/reviews`, { params: { page, size } })
      .then((r) => r.data),
};

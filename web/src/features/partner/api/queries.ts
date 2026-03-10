import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnersApi } from "@/shared/api/partners/client";
import type {
  PartnerListParams,
  PartnerListResponse,
  PartnerDetailResponse,
  PortfolioDetailResponse,
  CodesResponse,
} from "@/shared/api/partners/types";

export const partnerKeys = {
  all: ["partners"] as const,
  codes: (groups?: string) => ["codes", groups] as const,
  list: (params: PartnerListParams) => [...partnerKeys.all, "list", params] as const,
  detail: (id: number) => [...partnerKeys.all, "detail", id] as const,
  portfolio: (partnerId: number, portfolioId: number) =>
    [...partnerKeys.all, "portfolio", partnerId, portfolioId] as const,
  reviews: (partnerId: number, page: number) =>
    [...partnerKeys.all, "reviews", partnerId, page] as const,
};

/** 공통 코드 조회 */
export const useCodesQuery = (groups?: string) =>
  useQuery<CodesResponse>({
    queryKey: partnerKeys.codes(groups),
    queryFn: () => partnersApi.getCodes(groups),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

/** 파트너 목록 */
export const usePartnerListQuery = (params: PartnerListParams) =>
  useQuery<PartnerListResponse>({
    queryKey: partnerKeys.list(params),
    queryFn: () => partnersApi.listPartners(params),
  });

/** 파트너 상세 */
export const usePartnerDetailQuery = (id: number) =>
  useQuery<PartnerDetailResponse>({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnersApi.getPartner(id),
    enabled: id > 0,
  });

/** 포트폴리오 상세 */
export const usePortfolioDetailQuery = (partnerId: number, portfolioId: number) =>
  useQuery<PortfolioDetailResponse>({
    queryKey: partnerKeys.portfolio(partnerId, portfolioId),
    queryFn: () => partnersApi.getPortfolio(partnerId, portfolioId),
    enabled: partnerId > 0 && portfolioId > 0,
  });

/** 찜하기 토글 */
export const useFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: number) => partnersApi.toggleFavorite(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
};

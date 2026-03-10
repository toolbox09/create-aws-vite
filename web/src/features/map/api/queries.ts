import { useQuery } from "@tanstack/react-query";
import { ginplusApi } from "@/shared/api/ginplus/client";
import type {
  GetSearchAddressReq,
  GetMapMarkersReq,
  GetMapMarkersInfoReq,
  GetCroodAllDataReq,
  GetRtmsAroundReq,
  CommonRes,
  GetSearchAddressRes,
  MapMarkersDTO,
  AllDataByCroodDTO,
  PriceLandDTO,
  RtmsAroundDTO,
} from "@conmarket/apis";

export const mapKeys = {
  all: ["map"] as const,
  searchAddress: (keyword: string) =>
    [...mapKeys.all, "searchAddress", keyword] as const,
  markers: (params: GetMapMarkersReq) =>
    [...mapKeys.all, "markers", params] as const,
  markersInfo: (params: GetMapMarkersInfoReq) =>
    [...mapKeys.all, "markersInfo", params] as const,
  croodAllData: (params: GetCroodAllDataReq) =>
    [...mapKeys.all, "croodAllData", params] as const,
  priceLand: (pnu: string) =>
    [...mapKeys.all, "priceLand", pnu] as const,
  rtmsAround: (params: GetRtmsAroundReq) =>
    [...mapKeys.all, "rtmsAround", params] as const,
};

/** 주소 검색 */
export const useSearchAddressQuery = (
  params: GetSearchAddressReq,
  enabled = true,
) => {
  return useQuery<GetSearchAddressRes>({
    queryKey: mapKeys.searchAddress(params.keyword),
    queryFn: () => ginplusApi.searchAddress(params),
    enabled: enabled && params.keyword.length >= 2,
  });
};

/** 지도 범위 내 마커 조회 */
export const useMapMarkersQuery = (
  params: GetMapMarkersReq | null,
) => {
  return useQuery<CommonRes<MapMarkersDTO[]>>({
    queryKey: mapKeys.markers(params!),
    queryFn: () => ginplusApi.getMapMarkers(params!),
    enabled: !!params,
  });
};

/** 마커 상세 (PNU or pk_build_mapper_group) */
export const useMapMarkersInfoQuery = (
  params: GetMapMarkersInfoReq | null,
) => {
  return useQuery<CommonRes<AllDataByCroodDTO[]>>({
    queryKey: mapKeys.markersInfo(params!),
    queryFn: () => ginplusApi.getMapMarkersInfo(params!),
    enabled: !!params && !!(params.pnu || params.pk_build_mapper_group),
  });
};

/** 좌표 기반 전체 데이터 */
export const useCroodAllDataQuery = (
  params: GetCroodAllDataReq | null,
) => {
  return useQuery<CommonRes<AllDataByCroodDTO[]>>({
    queryKey: mapKeys.croodAllData(params!),
    queryFn: () => ginplusApi.getCroodAllData(params!),
    enabled: !!params,
  });
};

/** 토지 추정가 */
export const usePriceLandQuery = (pnu: string | null) => {
  return useQuery<CommonRes<PriceLandDTO[]>>({
    queryKey: mapKeys.priceLand(pnu!),
    queryFn: () => ginplusApi.getPriceLand({ pnu: pnu! }),
    enabled: !!pnu,
  });
};

/** 주변 유사 실거래 */
export const useRtmsAroundQuery = (
  params: GetRtmsAroundReq | null,
) => {
  return useQuery<CommonRes<RtmsAroundDTO[]>>({
    queryKey: mapKeys.rtmsAround(params!),
    queryFn: () => ginplusApi.getRtmsAround(params!),
    enabled: !!params,
  });
};

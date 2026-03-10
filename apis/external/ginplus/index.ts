import type { AxiosRequestConfig } from "axios";
import type {
  GetPermitBuildingDesignerBaseReq,
  GetPermitBuildingDesignerMainReq,
  GetPermitBuildingDesignerTypeReq,
  GetPermitBuildingDesignerTypeCnstrReq,
  GetSearchAddressReq,
  GetMapMarkersReq,
  GetMapMarkersInfoReq,
  GetCroodAllDataReq,
  GetPriceLandReq,
  GetRtmsAroundReq,
} from "./types/req.ts";
import type {
  CommonRes,
  BuildingDesignerBaseDTO,
  BuildingDesignerMainDTO,
  BuildingDesignerTypeDTO,
  BuildingDesignerConstructionTypeDTO,
  GetSearchAddressRes,
  MapMarkersDTO,
  AllDataByCroodDTO,
  PriceLandDTO,
  RtmsAroundDTO,
} from "./types/res.ts";

/**
 * GinPlus API 팩토리 함수
 * - axios 요청 함수를 주입받아 타입 안전한 API 클라이언트를 생성
 */
export const createGinplusAPI = (
  ginplusApi: <TData = unknown>(config: AxiosRequestConfig) => Promise<TData>,
) => {
  /* ─── 건축사 통계 ─── */

  const getPermitBuildingDesignerBase = async (
    params?: GetPermitBuildingDesignerBaseReq,
  ) => {
    return ginplusApi<CommonRes<BuildingDesignerBaseDTO[]>>({
      url: "/permit/building/designer/base/",
      method: "GET",
      params,
    });
  };

  const getPermitBuildingDesignerMain = async (
    params: GetPermitBuildingDesignerMainReq,
  ) => {
    return ginplusApi<CommonRes<BuildingDesignerMainDTO[]>>({
      url: "/permit/building/designer/main/",
      method: "GET",
      params,
    });
  };

  const getPermitBuildingDesignerType = async (
    params: GetPermitBuildingDesignerTypeReq,
  ) => {
    return ginplusApi<CommonRes<BuildingDesignerTypeDTO[]>>({
      url: "/permit/building/designer/type/use",
      method: "GET",
      params,
    });
  };

  const getPermitBuildingDesignerTypeCnstr = async (
    params: GetPermitBuildingDesignerTypeCnstrReq,
  ) => {
    return ginplusApi<CommonRes<BuildingDesignerConstructionTypeDTO[]>>({
      url: "/permit/building/designer/type/construction/",
      method: "GET",
      params,
    });
  };

  /* ─── 주소 검색 ─── */

  const searchAddress = async (params: GetSearchAddressReq) => {
    return ginplusApi<GetSearchAddressRes>({
      url: `/search/v2/ADDRESS/${encodeURIComponent(params.keyword)}`,
      method: "GET",
      params: { page: params.page ?? 1, size: params.size ?? 20 },
    });
  };

  /* ─── 지도 마커 ─── */

  const getMapMarkers = async (params: GetMapMarkersReq) => {
    return ginplusApi<CommonRes<MapMarkersDTO[]>>({
      url: "/soosung/map/markers",
      method: "GET",
      params,
    });
  };

  /** 마커 상세 (통합) */
  const getMapMarkersInfo = async (params: GetMapMarkersInfoReq) => {
    return ginplusApi<CommonRes<AllDataByCroodDTO[]>>({
      url: "/soosung/map/markers/Info",
      method: "GET",
      params,
    });
  };

  /** 좌표 기반 전체 데이터 */
  const getCroodAllData = async (params: GetCroodAllDataReq) => {
    return ginplusApi<CommonRes<AllDataByCroodDTO[]>>({
      url: "/soosung/crood/all/data",
      method: "GET",
      params,
    });
  };

  /** 토지 추정가 (m²당) */
  const getPriceLand = async (params: GetPriceLandReq) => {
    return ginplusApi<CommonRes<PriceLandDTO[]>>({
      url: "/soosung/price/land",
      method: "GET",
      params,
    });
  };

  /** 주변 유사 실거래 */
  const getRtmsAround = async (params: GetRtmsAroundReq) => {
    return ginplusApi<CommonRes<RtmsAroundDTO[]>>({
      url: "/soosung/rtms/around",
      method: "GET",
      params,
    });
  };

  return {
    // 건축사
    getPermitBuildingDesignerBase,
    getPermitBuildingDesignerMain,
    getPermitBuildingDesignerType,
    getPermitBuildingDesignerTypeCnstr,
    // 지도
    searchAddress,
    getMapMarkers,
    getMapMarkersInfo,
    getCroodAllData,
    getPriceLand,
    getRtmsAround,
  };
};

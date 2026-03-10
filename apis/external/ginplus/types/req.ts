/** 정렬 기준 */
export enum PmtBldgDsgnReqOrderEnum {
  total_score = "자체점수",
  work_diff = "업력",
  main_use_cd_00_cnt = "인허가개수",
}

/** 건축사 기본 통계 조회 요청 */
export interface GetPermitBuildingDesignerBaseReq {
  building_designer_nm?: string;
  building_designer_reg_num?: string;
  lawd_cd?: string;
  from_work_diff_cnt?: string;
  to_work_diff_cnt?: string;
  from_permit_cnt?: string;
  to_permit_cnt?: string;
  page?: string;
  page_size?: string;
  order?: keyof typeof PmtBldgDsgnReqOrderEnum;
}

/** 건축사 주용도 통계 조회 요청 */
export interface GetPermitBuildingDesignerMainReq {
  building_designer_reg_num: string;
}

/** 건축사 건축구분 통계 조회 요청 */
export interface GetPermitBuildingDesignerTypeReq {
  building_designer_reg_num: string;
}

/** 건축사 설계종류 통계 조회 요청 */
export interface GetPermitBuildingDesignerTypeCnstrReq {
  building_designer_reg_num: string;
}

/* ─── 지도 API 요청 ─── */

/** 주소 검색 요청 */
export interface GetSearchAddressReq {
  keyword: string;
  page?: number;
  size?: number;
}

/** 지도 마커 조회 요청 */
export interface GetMapMarkersReq {
  left_lat: number;
  right_lat: number;
  left_lon: number;
  right_lon: number;
  from_dt: string;
  to_dt: string;
  data_type: string;
  icon_type: string;
  price_type: string;
}

/** 마커 상세 조회 요청 */
export interface GetMapMarkersInfoReq {
  pk_build_mapper_group?: string;
  pnu?: string;
}

/** 좌표 기반 전체 데이터 조회 */
export interface GetCroodAllDataReq {
  lat: number;
  lon: number;
}

/** 토지 공시지가 조회 */
export interface GetPriceLandReq {
  pnu: string;
}

/** 주변 실거래 조회 */
export interface GetRtmsAroundReq {
  lat: number;
  lon: number;
  distance?: number;
  icon_type?: string;
  limit_cnt?: number;
}

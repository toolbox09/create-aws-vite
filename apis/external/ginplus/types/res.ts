/** GinPlus 공통 응답 래퍼 */
export interface CommonRes<T> {
  body: T;
  request?: unknown;
  header?: unknown;
}

/* ─── 건축사 통계 ─── */

/** 건축사 기본 통계 정보 */
export interface BuildingDesignerBaseDTO {
  building_designer_nm: string;
  building_designer_reg_num: string;
  total_score: string;
  work_diff: string;
  init_permission_dt: string;
  main_use_cd_00_cnt: string;
  main_use_cd_01_cnt: string;
  main_use_cd_02_cnt: string;
  main_use_cd_03_cnt: string;
  main_use_cd_04_cnt: string;
  main_use_cd_05_cnt: string;
  main_use_cd_06_cnt: string;
  main_use_cd_07_cnt: string;
  main_use_cd_08_cnt: string;
  lv1_lawd: string;
  lv2_lawd: string;
  total_cnt: string;
}

/** 건축사 주용도 통계 */
export interface BuildingDesignerMainDTO {
  building_designer_nm: string;
  building_designer_reg_num: string;
  main_use_cd_00_cnt: string;
  main_use_cd_01_cnt: string;
  main_use_cd_02_cnt: string;
  main_use_cd_03_cnt: string;
  main_use_cd_04_cnt: string;
  main_use_cd_05_cnt: string;
  main_use_cd_06_cnt: string;
  main_use_cd_07_cnt: string;
  main_use_cd_08_cnt: string;
}

/** 건축사 건축구분(용도별 연도) 통계 */
export interface BuildingDesignerTypeDTO {
  building_designer_nm: string;
  building_designer_reg_num: string;
  yyyy: string;
  main_use_cd_00_cnt: string;
  main_use_cd_01_cnt: string;
  main_use_cd_02_cnt: string;
  main_use_cd_03_cnt: string;
  main_use_cd_04_cnt: string;
  main_use_cd_05_cnt: string;
  main_use_cd_06_cnt: string;
  main_use_cd_07_cnt: string;
  main_use_cd_08_cnt: string;
}

/** 건축사 설계종류 통계 */
export interface BuildingDesignerConstructionTypeDTO {
  building_designer_nm: string;
  building_designer_reg_num: string;
  yyyy: string;
  main_construction_cd_00_cnt: string;
  main_construction_cd_01_cnt: string;
  main_construction_cd_02_cnt: string;
  main_construction_cd_03_cnt: string;
  main_construction_cd_04_cnt: string;
  main_construction_cd_05_cnt: string;
  main_construction_cd_06_cnt: string;
  main_construction_cd_07_cnt: string;
}

/* ─── 주소 검색 ─── */

export interface SearchResultItem {
  pk_build_mapper_group: string;
  id: string;
  search_type: string;
  pnu_list: string;
  doro_cd?: string | null;
  sido: string;
  sido_short: string;
  sigungu: string;
  dong: string;
  ri: string;
  doro: string;
  bldg_no: string;
  bldg_sub_no: string;
  jibun_main: string;
  jibun_sub: string;
  jimok: string;
  bldg_nm: string;
  search_bldg_nm: string;
  bldg_use_nm: string;
  full_jibun_address: string;
  full_doro_address?: string | null;
  lat: number;
  lon: number;
}

export interface GetSearchAddressRes {
  results: SearchResultItem[];
  total: number;
}

/* ─── 지도 마커 ─── */

export type MarkerDataType = "rtms" | "sale";

export interface MapMarkersDTO {
  pk_mapper_master: string;
  pk_build_mapper_group?: string | null;
  pnu?: string | null;
  lat: string;
  lon: string;
  data_type: MarkerDataType;
  sigungu_cd?: string | null;
  dong_cd?: string | null;
  bun?: string | null;
  ji?: string | null;
  land_div_cd?: string | null;
  address_doro_cd?: string | null;
  address_doro_updown_cd?: string | null;
  address_doro_bun?: string | null;
  address_doro_ji?: string | null;
  indu_yn?: string | null;
  indu_sale_yn?: string | null;
  srbld_yn?: string | null;
  srbld_sale_yn?: string | null;
  slh_yn?: string | null;
  slh_sale_yn?: string | null;
  land_yn?: string | null;
  land_sale_yn?: string | null;
  indu_obj?: string | null;
  srbld_obj?: string | null;
  slh_obj?: string | null;
  land_obj?: string | null;
}

/* ─── 마커 상세 (통합 엔드포인트) ─── */

export interface AllDataByCroodDTO {
  address: string;
  address_doro?: string;
  land_extent?: string;
  jimok?: string;
  build_type_obj?: string;
  normal_json_obj?: string;
  type: "land" | "build" | "없음";
  pnu?: string;
  pk_build_mapper_group?: string;
  indu_yn: string;
  srbld_yn: string;
  slh_yn: string;
  land_yn: string;
  indu_sale_yn: string;
  srbld_sale_yn: string;
  slh_sale_yn: string;
  land_sale_yn: string;
  land_polygon_obj: string;
  build_land_polygon_obj: string;
  build_bldg_polygon_obj: string;
  land_special_info_obj: string;
  land_public_price_obj: string;
  bldg_public_price_obj?: string;
  land_use_plan_obj: string;
  total_json_obj: string;
  floor_json_obj: string;
  sub_jibun_json_obj: string;
  extent_json_obj: string;
  build_price_public_obj: string;
  rtms_indu: string;
  rtms_srbld: string;
  rtms_slh: string;
  rtms_land: string;
  sale_indu: string;
  sale_srbld: string;
  sale_slh: string;
  sale_land: string;
}

/* ─── 토지 공시지가 ─── */

export interface PriceLandDTO {
  pnu: string;
  price_m2: string;
}

/* ─── 실거래가 (주변) ─── */

export interface RtmsAroundDTO {
  pk_mapper_master: string;
  pk_build_mapper_group: string;
  pnu: string;
  distance: string;
  rank: string;
  obj_data: string;
}

/* ─── 토지 마스터 ─── */

export interface LandMasterDTO {
  pk_mapper_master: string;
  pnu?: string;
  address: string;
  sigungu_cd: string;
  dong_cd: string;
  bun: string;
  ji: string;
  land_div_cd: string;
  land_yn: string;
  land_sale_yn: string;
  lat: string;
  lon: string;
  land_special_info_obj?: string;
  land_public_obj?: string;
  land_use_plan_obj?: string;
}

/* ─── Parsed sub-object types ─── */

export interface LandSpecialInfoObj {
  address: string;
  pnu: string;
  jimok_nm: string;
  land_extent: number;
  land_use_nm: string;
  land_use_sts_nm: string;
  land_height_nm: string;
  land_shape_nm: string;
  land_road_contact_nm: string;
  import_dt: string;
}

export interface LandPublicObj {
  pnu: string;
  yyyy: string;
  price: number;
}

export interface LandUsePlanObj {
  pnu: string;
  drawing_num: string;
  contact_nm: string;
  use_lawd_nm: string;
  registr_dt: string;
  memo: string;
  import_dt: string;
}

export interface TotalJsonObj {
  pk_build_mapper_group: string;
  total_bldg_pk: string;
  address: string;
  address_doro: string;
  bldg_div_nm: string;
  bldg_kind_nm: string;
  bldg_nm: string;
  land_extent: number;
  build_extent: number;
  coverage_rate: number;
  total_floor_area: number;
  floor_area_rate: number;
  main_use_nm: string;
  etc_use_nm: string;
  total_family_cnt: number;
  total_house_cnt: number;
  main_bldg_cnt: number;
  sub_bldg_cnt: number;
  total_jucha: number;
  permit_dt: string;
  start_dt: string;
  gen_dt: string;
  import_dt: string;
}

export interface NormalJsonObj {
  address: string;
  address_doro: string;
  pk_build_mapper_group: string;
  total_bldg_pk: string;
  normal_bldg_pk: string;
  bldg_div_nm: string;
  bldg_kind_nm: string;
  bldg_nm: string;
  main_strc_nm: string;
  land_extent: number;
  build_extent: number;
  coverage_rate: number;
  total_floor_area: number;
  floor_area_rate: number;
  strc_nm: string;
  main_use_nm: string;
  etc_use_nm: string;
  roof_nm: string;
  roof_etc: string;
  total_family_cnt: number;
  total_house_cnt: number;
  height: number;
  up_floor_num: number;
  down_floor_num: number;
  elevator: number;
  emergency_elevator: number;
  permit_dt: string;
  start_dt: string;
  gen_dt: string;
  import_dt: string;
}

export interface FloorJsonObj {
  pk_build_mapper_group: string;
  total_bldg_pk: string;
  normal_bldg_pk: string;
  bldg_dong_nm: string;
  floor_div_nm: string;
  floor_num: number;
  floor_num_nm: string;
  main_strc_nm: string;
  strc_nm: string;
  etc_strc_nm: string;
  main_use_nm: string;
  etc_use_nm: string;
  extent: number;
  import_dt: string;
}

export interface Rtms {
  pk_mapper_master: number;
  pnu?: string;
  pk_build_mapper_group?: string;
  pk_srbld_master?: number;
  pk_slh_master?: number;
  pk_indu_master?: number;
  pk_land_master?: number;
  deal_ymd: string;
  real_day: string;
  build_extent: number;
  land_extent: number;
  floor?: string;
  gen_dt: string;
  regstr_gb?: string;
  build_main_use?: string;
  price: number;
  req_gbn: string;
  cancel_dt: string | null;
  house_type?: string;
  jimok?: string;
  land_use?: string;
}

export interface Sale {
  pk_naver_sale: number;
  pk_naver_sale_mapper: number;
  pk_build_mapper_group: string;
  pnu: string;
  supply_extent: number;
  private_extent: number;
  mapper_type: string;
  reg_date: string;
  price: number;
  trade_type: string;
  realestate_type_nm: string;
  lat: number;
  lon: number;
}

/* ─── Polygon sub-object types ─── */

export interface LandPolygonObj {
  pnu: string;
  geojson: string;
  lat: number;
  lon: number;
}

export interface BuildLandPolygonObj {
  pnu: string;
  geojson: string;
  target: string;
  main: string;
  lat: number;
  lon: number;
}

export interface BuildBldgPolygonObj {
  bd_mgt_sn: string;
  doro_pk: string;
  geojson: string;
  normal_bldg_pk: string;
  pk_build_mapper_group: string;
}

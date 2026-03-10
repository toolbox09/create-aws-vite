import type { BuildingDesignerMainDTO, BuildingDesignerConstructionTypeDTO } from "./res.ts";

/** 주용도 코드 → 한글 라벨 */
export const PmtBldgDsgnUseCdCntLabel = {
  main_use_cd_00_cnt: "전체",
  main_use_cd_01_cnt: "공장/창고",
  main_use_cd_02_cnt: "근린생활시설",
  main_use_cd_03_cnt: "판매/업무",
  main_use_cd_04_cnt: "숙박",
  main_use_cd_05_cnt: "단독/다가구",
  main_use_cd_06_cnt: "다세대/연립",
  main_use_cd_07_cnt: "공동주택",
  main_use_cd_08_cnt: "기타",
} as const satisfies Record<
  keyof Omit<BuildingDesignerMainDTO, "building_designer_nm" | "building_designer_reg_num">,
  string
>;

/** 설계종류 코드 → 한글 라벨 */
export const PmtBldgDsgnCnstrCdCntLabel = {
  main_construction_cd_00_cnt: "전체 건수",
  main_construction_cd_01_cnt: "개축 허가수",
  main_construction_cd_02_cnt: "대수선 건수",
  main_construction_cd_03_cnt: "신축 건수",
  main_construction_cd_04_cnt: "용도변경 건수",
  main_construction_cd_05_cnt: "이전 건수",
  main_construction_cd_06_cnt: "재축 건수",
  main_construction_cd_07_cnt: "증축 건수",
} as const satisfies Record<
  keyof Omit<BuildingDesignerConstructionTypeDTO, "building_designer_nm" | "building_designer_reg_num" | "yyyy">,
  string
>;

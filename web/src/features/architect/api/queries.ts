import { useQuery } from "@tanstack/react-query";
import { ginplusApi } from "@/shared/api/ginplus/client";
import type {
  GetPermitBuildingDesignerBaseReq,
  CommonRes,
  BuildingDesignerBaseDTO,
  BuildingDesignerMainDTO,
  BuildingDesignerTypeDTO,
  BuildingDesignerConstructionTypeDTO,
} from "@conmarket/apis";

export const architectKeys = {
  all: ["architect"] as const,
  base: (params?: GetPermitBuildingDesignerBaseReq) =>
    [...architectKeys.all, "base", params] as const,
  main: (regNum: string) =>
    [...architectKeys.all, "main", regNum] as const,
  type: (regNum: string) =>
    [...architectKeys.all, "type", regNum] as const,
  cnstr: (regNum: string) =>
    [...architectKeys.all, "cnstr", regNum] as const,
};

/** 건축사 목록 (검색/필터/페이징) */
export const useArchitectBaseQuery = (
  params?: GetPermitBuildingDesignerBaseReq,
) => {
  return useQuery<CommonRes<BuildingDesignerBaseDTO[]>>({
    queryKey: architectKeys.base(params),
    queryFn: () => ginplusApi.getPermitBuildingDesignerBase(params),
  });
};

/** 건축사 기본 정보 (등록번호로 단건 조회) */
export const useArchitectBaseByRegNumQuery = (regNum: string) => {
  return useQuery<CommonRes<BuildingDesignerBaseDTO[]>>({
    queryKey: architectKeys.base({ building_designer_reg_num: regNum }),
    queryFn: () =>
      ginplusApi.getPermitBuildingDesignerBase({
        building_designer_reg_num: regNum,
      }),
    enabled: !!regNum,
  });
};

/** 건축사 주용도별 통계 */
export const useArchitectMainQuery = (regNum: string) => {
  return useQuery<CommonRes<BuildingDesignerMainDTO[]>>({
    queryKey: architectKeys.main(regNum),
    queryFn: () =>
      ginplusApi.getPermitBuildingDesignerMain({
        building_designer_reg_num: regNum,
      }),
    enabled: !!regNum,
  });
};

/** 건축사 연도별 용도별 통계 */
export const useArchitectTypeQuery = (regNum: string) => {
  return useQuery<CommonRes<BuildingDesignerTypeDTO[]>>({
    queryKey: architectKeys.type(regNum),
    queryFn: () =>
      ginplusApi.getPermitBuildingDesignerType({
        building_designer_reg_num: regNum,
      }),
    enabled: !!regNum,
  });
};

/** 건축사 설계종류별 통계 */
export const useArchitectCnstrQuery = (regNum: string) => {
  return useQuery<CommonRes<BuildingDesignerConstructionTypeDTO[]>>({
    queryKey: architectKeys.cnstr(regNum),
    queryFn: () =>
      ginplusApi.getPermitBuildingDesignerTypeCnstr({
        building_designer_reg_num: regNum,
      }),
    enabled: !!regNum,
  });
};

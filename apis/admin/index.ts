import type { AxiosRequestConfig } from "axios";
import type {
  GetMembersReq,
  UpdateMemberStatusReq,
  ReviewLicenseReq,
} from "./types/req.ts";
import type {
  MemberListRes,
  MemberDetailRes,
  MessageRes,
} from "./types/res.ts";

/**
 * Admin API 팩토리 함수
 */
export const createAdminAPI = (
  request: <TData = unknown>(config: AxiosRequestConfig) => Promise<TData>,
) => {
  /** 회원 목록 (필터, 검색, 페이지네이션) */
  const getMembers = async (params?: GetMembersReq) => {
    return request<MemberListRes>({
      url: "/admin/members",
      method: "GET",
      params,
    });
  };

  /** 회원 상세 */
  const getMember = async (memberId: string) => {
    return request<MemberDetailRes>({
      url: `/admin/members/${memberId}`,
      method: "GET",
    });
  };

  /** 회원 상태 변경 (활성/정지) */
  const updateMemberStatus = async (memberId: string, data: UpdateMemberStatusReq) => {
    return request<MessageRes>({
      url: `/admin/members/${memberId}/status`,
      method: "PATCH",
      data,
    });
  };

  /** 라이센스 심사 */
  const reviewLicense = async (licenseId: string, data: ReviewLicenseReq) => {
    return request<MessageRes>({
      url: `/admin/licenses/${licenseId}/review`,
      method: "PATCH",
      data,
    });
  };

  return {
    getMembers,
    getMember,
    updateMemberStatus,
    reviewLicense,
  };
};

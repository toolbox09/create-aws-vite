import type { UserRole, UserStatus } from "../../auth/types/res.ts";

/** 회원 목록 조회 */
export interface GetMembersReq {
  page?: number;
  size?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

/** 회원 상태 변경 */
export interface UpdateMemberStatusReq {
  status: "active" | "suspended";
}

/** 라이센스 심사 */
export interface ReviewLicenseReq {
  status: "approved" | "rejected";
  reject_reason?: string;
}

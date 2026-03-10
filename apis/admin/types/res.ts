import type { UserRole, UserStatus } from "../../auth/types/res.ts";

/** 회원 목록 아이템 */
export interface MemberItemRes {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

/** 회원 목록 (페이지네이션) */
export interface MemberListRes {
  items: MemberItemRes[];
  total: number;
  page: number;
  size: number;
}

/** 회원 상세 */
export interface MemberDetailRes extends MemberItemRes {
  avatar_url: string | null;
  identity_verified: boolean;
  agreed_marketing: boolean;
  licenses: LicenseItemRes[];
}

/** 라이센스 아이템 */
export interface LicenseItemRes {
  id: string;
  license_type: string;
  file_url: string;
  status: "pending" | "approved" | "rejected";
  biz_company: string | null;
  biz_reg_no: string | null;
  reject_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

/** 범용 메시지 응답 */
export interface MessageRes {
  message: string;
}

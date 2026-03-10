import type { UserRole, UserStatus } from "../../auth/types/res.ts";

/** 사용자 프로필 상세 */
export interface UserProfileRes {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  identity_verified: boolean;
  agreed_marketing: boolean;
  interests: UserInterestsRes;
  created_at: string;
}

/** 관심 분야 */
export interface UserInterestsRes {
  cert_types: string[];
  building_usages: string[];
  regions: string[];
}

/** 알림 설정 */
export interface NotificationSettingsRes {
  bid_email: boolean;
  bid_push: boolean;
  proposal_email: boolean;
  proposal_push: boolean;
  contract_email: boolean;
  contract_push: boolean;
  chat_email: boolean;
  chat_push: boolean;
  marketing_email: boolean;
  marketing_push: boolean;
}

/** 환경 설정 */
export interface PreferencesRes {
  language: string;
  region: string | null;
  currency: string;
  area_unit: string;
  theme: string;
}

/** 로그인 기기 */
export interface DeviceRes {
  id: string;
  device_name: string | null;
  ip_address: string | null;
  last_active_at: string;
  created_at: string;
}

/** 범용 메시지 응답 */
export interface MessageRes {
  message: string;
}

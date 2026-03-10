/** 프로필 수정 */
export interface UpdateProfileReq {
  name?: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
}

/** 비밀번호 변경 */
export interface ChangePasswordReq {
  current_password: string;
  new_password: string;
}

/** 관심 분야 수정 */
export interface UpdateInterestsReq {
  cert_types?: string[];
  building_usages?: string[];
  regions?: string[];
}

/** 알림 설정 수정 */
export interface UpdateNotificationSettingsReq {
  bid_email?: boolean;
  bid_push?: boolean;
  proposal_email?: boolean;
  proposal_push?: boolean;
  contract_email?: boolean;
  contract_push?: boolean;
  chat_email?: boolean;
  chat_push?: boolean;
  marketing_email?: boolean;
  marketing_push?: boolean;
}

/** 환경 설정 수정 */
export interface UpdatePreferencesReq {
  language?: string;
  region?: string;
  currency?: string;
  area_unit?: string;
  theme?: string;
}

/** 회원 탈퇴 */
export interface WithdrawReq {
  reason: string;
}

export type UserRole = "CL-P" | "CL-C" | "PT" | "ADMIN";
export type UserStatus = "active" | "suspended" | "withdrawn";

/** 인증 토큰 */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/** 로그인 응답 */
export interface LoginRes {
  user: MeRes;
  tokens: AuthTokens;
}

/** 토큰 갱신 응답 */
export interface RefreshRes {
  access_token: string;
}

/** 현재 사용자 정보 */
export interface MeRes {
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
  created_at: string;
}

/** 회원가입 응답 */
export interface SignupRes {
  user: MeRes;
  tokens: AuthTokens;
}

/** 이메일 중복 확인 응답 */
export interface CheckEmailRes {
  available: boolean;
}

/** 범용 메시지 응답 */
export interface MessageRes {
  message: string;
}

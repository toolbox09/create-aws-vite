/** 회원가입 (본인인증 Path B) */
export interface SignupReq {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  role: "CL-P" | "CL-C" | "PT";
  ci?: string;
  di?: string;
  agreed_marketing?: boolean;
  cert_types?: string[];
  building_usages?: string[];
  regions?: string[];
}

/** 소셜 회원가입 (Path A) */
export interface SocialSignupReq {
  provider: "naver" | "kakao";
  provider_id: string;
  name: string;
  email: string;
  agreed_marketing?: boolean;
  building_usages?: string[];
  regions?: string[];
}

/** 로그인 */
export interface LoginReq {
  email: string;
  password: string;
  remember_me?: boolean;
}

/** 토큰 갱신 */
export interface RefreshReq {
  refresh_token: string;
}

/** 비밀번호 찾기 */
export interface PasswordFindReq {
  email: string;
}

/** 비밀번호 재설정 */
export interface PasswordResetReq {
  token: string;
  new_password: string;
}

/** 이메일 중복 확인 */
export interface CheckEmailReq {
  email: string;
}

import type { AxiosRequestConfig } from "axios";
import type {
  SignupReq,
  SocialSignupReq,
  LoginReq,
  RefreshReq,
  PasswordFindReq,
  PasswordResetReq,
  CheckEmailReq,
} from "./types/req.ts";
import type {
  SignupRes,
  LoginRes,
  RefreshRes,
  MeRes,
  CheckEmailRes,
  MessageRes,
} from "./types/res.ts";

/**
 * Auth API 팩토리 함수
 * - axios 요청 함수를 주입받아 타입 안전한 API 클라이언트를 생성
 */
export const createAuthAPI = (
  request: <TData = unknown>(config: AxiosRequestConfig) => Promise<TData>,
) => {
  /** 회원가입 (본인인증) */
  const signup = async (data: SignupReq) => {
    return request<SignupRes>({
      url: "/auth/signup",
      method: "POST",
      data,
    });
  };

  /** 소셜 회원가입 */
  const socialSignup = async (data: SocialSignupReq) => {
    return request<SignupRes>({
      url: "/auth/signup/social",
      method: "POST",
      data,
    });
  };

  /** 로그인 */
  const login = async (data: LoginReq) => {
    return request<LoginRes>({
      url: "/auth/login",
      method: "POST",
      data,
    });
  };

  /** 로그아웃 */
  const logout = async (data: { refresh_token: string }) => {
    return request<MessageRes>({
      url: "/auth/logout",
      method: "POST",
      data,
    });
  };

  /** Access Token 갱신 */
  const refresh = async (data: RefreshReq) => {
    return request<RefreshRes>({
      url: "/auth/refresh",
      method: "POST",
      data,
    });
  };

  /** 비밀번호 찾기 (이메일 발송) */
  const passwordFind = async (data: PasswordFindReq) => {
    return request<MessageRes>({
      url: "/auth/password-find",
      method: "POST",
      data,
    });
  };

  /** 비밀번호 재설정 */
  const passwordReset = async (data: PasswordResetReq) => {
    return request<MessageRes>({
      url: "/auth/password-reset",
      method: "POST",
      data,
    });
  };

  /** 현재 사용자 정보 */
  const me = async () => {
    return request<MeRes>({
      url: "/auth/me",
      method: "GET",
    });
  };

  /** 이메일 중복 확인 */
  const checkEmail = async (params: CheckEmailReq) => {
    return request<CheckEmailRes>({
      url: "/auth/check-email",
      method: "GET",
      params,
    });
  };

  return {
    signup,
    socialSignup,
    login,
    logout,
    refresh,
    passwordFind,
    passwordReset,
    me,
    checkEmail,
  };
};

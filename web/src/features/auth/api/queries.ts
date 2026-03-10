import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/shared/api/auth/client";
import type {
  SignupReq,
  SocialSignupReq,
  LoginReq,
  PasswordFindReq,
  PasswordResetReq,
  LoginRes,
  SignupRes,
  MeRes,
  CheckEmailRes,
  MessageRes,
} from "@conmarket/apis";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  checkEmail: (email: string) => [...authKeys.all, "checkEmail", email] as const,
};

/** 로그인 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<LoginRes, Error, LoginReq>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.tokens.access_token);
      localStorage.setItem("refresh_token", data.tokens.refresh_token);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

/** 회원가입 */
export const useSignup = () => {
  return useMutation<SignupRes, Error, SignupReq>({
    mutationFn: (data) => authApi.signup(data),
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.tokens.access_token);
      localStorage.setItem("refresh_token", data.tokens.refresh_token);
    },
  });
};

/** 소셜 회원가입 */
export const useSocialSignup = () => {
  return useMutation<SignupRes, Error, SocialSignupReq>({
    mutationFn: (data) => authApi.socialSignup(data),
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.tokens.access_token);
      localStorage.setItem("refresh_token", data.tokens.refresh_token);
    },
  });
};

/** 로그아웃 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation<MessageRes, Error, void>({
    mutationFn: () => {
      const refreshToken = localStorage.getItem("refresh_token") ?? "";
      return authApi.logout({ refresh_token: refreshToken });
    },
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      window.location.href = "/auth/login";
    },
  });
};

/** 현재 사용자 정보 */
export const useMe = () => {
  return useQuery<MeRes>({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    enabled: !!localStorage.getItem("access_token"),
  });
};

/** 이메일 중복 확인 */
export const useCheckEmail = (email: string) => {
  return useQuery<CheckEmailRes>({
    queryKey: authKeys.checkEmail(email),
    queryFn: () => authApi.checkEmail({ email }),
    enabled: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  });
};

/** 비밀번호 찾기 */
export const usePasswordFind = () => {
  return useMutation<MessageRes, Error, PasswordFindReq>({
    mutationFn: (data) => authApi.passwordFind(data),
  });
};

/** 비밀번호 재설정 */
export const usePasswordReset = () => {
  return useMutation<MessageRes, Error, PasswordResetReq>({
    mutationFn: (data) => authApi.passwordReset(data),
  });
};

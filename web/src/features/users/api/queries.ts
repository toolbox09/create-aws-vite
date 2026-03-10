import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/shared/api/users/client";
import type {
  UpdateProfileReq,
  ChangePasswordReq,
  UpdateInterestsReq,
  UpdateNotificationSettingsReq,
  UpdatePreferencesReq,
  WithdrawReq,
  UserProfileRes,
  NotificationSettingsRes,
  PreferencesRes,
  MessageRes,
} from "@conmarket/apis";

export const usersKeys = {
  all: ["users"] as const,
  profile: () => [...usersKeys.all, "profile"] as const,
  interests: () => [...usersKeys.all, "interests"] as const,
  notifications: () => [...usersKeys.all, "notifications"] as const,
  preferences: () => [...usersKeys.all, "preferences"] as const,
};

/** 내 프로필 조회 */
export const useProfile = () => {
  return useQuery<UserProfileRes>({
    queryKey: usersKeys.profile(),
    queryFn: () => usersApi.getProfile(),
  });
};

/** 내 프로필 수정 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<UserProfileRes, Error, UpdateProfileReq>({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.profile() });
    },
  });
};

/** 비밀번호 변경 */
export const useChangePassword = () => {
  return useMutation<MessageRes, Error, ChangePasswordReq>({
    mutationFn: (data) => usersApi.changePassword(data),
  });
};

/** 관심 분야 조회 */
export const useInterests = () => {
  return useQuery<{ cert_types: string[]; building_usages: string[]; regions: string[] }>({
    queryKey: usersKeys.interests(),
    queryFn: () => usersApi.getInterests(),
  });
};

/** 관심 분야 수정 */
export const useUpdateInterests = () => {
  const queryClient = useQueryClient();
  return useMutation<MessageRes, Error, UpdateInterestsReq>({
    mutationFn: (data) => usersApi.updateInterests(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.interests() });
    },
  });
};

/** 알림 설정 조회 */
export const useNotificationSettings = () => {
  return useQuery<NotificationSettingsRes>({
    queryKey: usersKeys.notifications(),
    queryFn: () => usersApi.getNotificationSettings(),
  });
};

/** 알림 설정 변경 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<NotificationSettingsRes, Error, UpdateNotificationSettingsReq>({
    mutationFn: (data) => usersApi.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.notifications() });
    },
  });
};

/** 환경 설정 조회 */
export const usePreferences = () => {
  return useQuery<PreferencesRes>({
    queryKey: usersKeys.preferences(),
    queryFn: () => usersApi.getPreferences(),
  });
};

/** 환경 설정 변경 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation<PreferencesRes, Error, UpdatePreferencesReq>({
    mutationFn: (data) => usersApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.preferences() });
    },
  });
};

/** 회원 탈퇴 */
export const useWithdraw = () => {
  return useMutation<MessageRes, Error, WithdrawReq>({
    mutationFn: (data) => usersApi.withdraw(data),
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth/login";
    },
  });
};

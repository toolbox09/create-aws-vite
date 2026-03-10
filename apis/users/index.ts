import type { AxiosRequestConfig } from "axios";
import type {
  UpdateProfileReq,
  ChangePasswordReq,
  UpdateInterestsReq,
  UpdateNotificationSettingsReq,
  UpdatePreferencesReq,
  WithdrawReq,
} from "./types/req.ts";
import type {
  UserProfileRes,
  NotificationSettingsRes,
  PreferencesRes,
  DeviceRes,
  MessageRes,
} from "./types/res.ts";

/**
 * Users API 팩토리 함수
 */
export const createUsersAPI = (
  request: <TData = unknown>(config: AxiosRequestConfig) => Promise<TData>,
) => {
  /** 내 프로필 조회 */
  const getProfile = async () => {
    return request<UserProfileRes>({
      url: "/users/me",
      method: "GET",
    });
  };

  /** 내 프로필 수정 */
  const updateProfile = async (data: UpdateProfileReq) => {
    return request<UserProfileRes>({
      url: "/users/me",
      method: "PATCH",
      data,
    });
  };

  /** 비밀번호 변경 */
  const changePassword = async (data: ChangePasswordReq) => {
    return request<MessageRes>({
      url: "/users/me/password",
      method: "PATCH",
      data,
    });
  };

  /** 관심 분야 조회 */
  const getInterests = async () => {
    return request<{ cert_types: string[]; building_usages: string[]; regions: string[] }>({
      url: "/users/me/interests",
      method: "GET",
    });
  };

  /** 관심 분야 수정 */
  const updateInterests = async (data: UpdateInterestsReq) => {
    return request<MessageRes>({
      url: "/users/me/interests",
      method: "PATCH",
      data,
    });
  };

  /** 알림 설정 조회 */
  const getNotificationSettings = async () => {
    return request<NotificationSettingsRes>({
      url: "/users/me/notifications",
      method: "GET",
    });
  };

  /** 알림 설정 변경 */
  const updateNotificationSettings = async (data: UpdateNotificationSettingsReq) => {
    return request<NotificationSettingsRes>({
      url: "/users/me/notifications",
      method: "PATCH",
      data,
    });
  };

  /** 환경 설정 조회 */
  const getPreferences = async () => {
    return request<PreferencesRes>({
      url: "/users/me/preferences",
      method: "GET",
    });
  };

  /** 환경 설정 변경 */
  const updatePreferences = async (data: UpdatePreferencesReq) => {
    return request<PreferencesRes>({
      url: "/users/me/preferences",
      method: "PATCH",
      data,
    });
  };

  /** 로그인 기기 목록 */
  const getDevices = async () => {
    return request<DeviceRes[]>({
      url: "/users/me/devices",
      method: "GET",
    });
  };

  /** 기기 로그아웃 */
  const removeDevice = async (deviceId: string) => {
    return request<MessageRes>({
      url: `/users/me/devices/${deviceId}`,
      method: "DELETE",
    });
  };

  /** 회원 탈퇴 */
  const withdraw = async (data: WithdrawReq) => {
    return request<MessageRes>({
      url: "/users/me",
      method: "DELETE",
      data,
    });
  };

  return {
    getProfile,
    updateProfile,
    changePassword,
    getInterests,
    updateInterests,
    getNotificationSettings,
    updateNotificationSettings,
    getPreferences,
    updatePreferences,
    getDevices,
    removeDevice,
    withdraw,
  };
};

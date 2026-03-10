import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/shared/api/admin/client";
import type {
  GetMembersReq,
  UpdateMemberStatusReq,
  ReviewLicenseReq,
  MemberListRes,
  MemberDetailRes,
  MessageRes,
} from "@conmarket/apis";

export const adminKeys = {
  all: ["admin"] as const,
  members: (params?: GetMembersReq) => [...adminKeys.all, "members", params] as const,
  member: (id: string) => [...adminKeys.all, "member", id] as const,
};

/** 회원 목록 */
export const useMembers = (params?: GetMembersReq) => {
  return useQuery<MemberListRes>({
    queryKey: adminKeys.members(params),
    queryFn: () => adminApi.getMembers(params),
  });
};

/** 회원 상세 */
export const useMember = (id: string) => {
  return useQuery<MemberDetailRes>({
    queryKey: adminKeys.member(id),
    queryFn: () => adminApi.getMember(id),
    enabled: !!id,
  });
};

/** 회원 상태 변경 */
export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<MessageRes, Error, { memberId: string; data: UpdateMemberStatusReq }>({
    mutationFn: ({ memberId, data }) => adminApi.updateMemberStatus(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

/** 라이센스 심사 */
export const useReviewLicense = () => {
  const queryClient = useQueryClient();
  return useMutation<MessageRes, Error, { licenseId: string; data: ReviewLicenseReq }>({
    mutationFn: ({ licenseId, data }) => adminApi.reviewLicense(licenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

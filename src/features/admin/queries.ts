import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from './keys';
import * as adminApi from './api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiClient';

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: adminApi.getAdminStats,
    staleTime: 60 * 1000, // 60s cache[cite: 146]
  });
}

export function useAdminVerifications(status = 'PENDING', page = 1) {
  return useQuery({
    queryKey: adminKeys.verifications(status, page),
    queryFn: () => adminApi.getAdminVerifications(status, page),
  });
}

export function useAdminVerificationDetail(technicianId: string) {
  return useQuery({
    queryKey: adminKeys.verificationDetail(technicianId),
    queryFn: () => adminApi.getAdminVerificationDetail(technicianId),
    staleTime: 0,
    gcTime: 0,
    // Nested data handle korar jonno safe select fallback:
    select: (response: any) => {
      if (!response) return null;
      return response?.data?.verification ?? response?.data?.technician ?? response?.verification ?? response?.technician ?? response;
    },
  });
}

export function useApproveTechnician(technicianId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.approveTechnician(technicianId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('কারিগর সফলভাবে যাচাই করা হয়েছে');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useRejectTechnician(technicianId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => adminApi.rejectTechnician(technicianId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('যাচাইকরণ আবেদন বাতিল করা হয়েছে');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAdminUsers(filters: { role?: string; status?: string; q?: string; page?: number }) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => adminApi.getAdminUsers(filters),
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: adminKeys.userDetail(userId),
    queryFn: () => adminApi.getAdminUserDetail(userId),
    // ব্যাকএন্ডের নেস্টেড অবজেক্ট থেকে সেফলি ডেটা এক্সট্রাক্ট করা (যাতে undefined ক্র্যাশ না করে)
    select: (response: any) => {
      if (!response) return null;
      return response?.data?.user ?? response?.user ?? response;
    },
  });
}

export function useToggleBlockUser(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ blocked, reason }: { blocked: boolean; reason: string }) =>
      adminApi.toggleBlockUser(userId, blocked, reason),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(variables.blocked ? 'ব্যবহারকারীকে ব্লক করা হয়েছে' : 'ব্লক তুলে নেওয়া হয়েছে');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useResolveReport(reportId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ decision, resolution }: { decision: 'COMPLETE' | 'CANCEL' | 'DISMISS'; resolution: string }) =>
      adminApi.resolveAdminReport(reportId, decision, resolution),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('অভিযোগটি নিষ্পত্তি করা হয়েছে');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
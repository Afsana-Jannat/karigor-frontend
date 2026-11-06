"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { jobKeys } from "@/features/jobs/keys";
import { getErrorMessage } from "@/lib/apiClient";
import { sessionKey } from "@/lib/session/use-session";
import {
  deleteMyAccount,
  generateCvSummary,
  getJobPayments,
  getMyReports,
  getNotifications,
  initiateBkashPayment,
  markAllNotificationsRead,
  markNotificationRead,
  recordCashPayment,
  submitJobReport,
  updateMyName,
} from "./api";

export const workflowKeys = {
  notifications: ["notifications"] as const,
  reports: ["reports"] as const,
  payments: (jobId: string) => ["payments", jobId] as const,
};

export const useNotifications = (page = 1, unreadOnly = false) =>
  useQuery({
    queryKey: [...workflowKeys.notifications, page, unreadOnly],
    queryFn: () => getNotifications(page, unreadOnly),
    refetchInterval: 25_000,
    placeholderData: keepPreviousData,
  });

export const useReadNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: workflowKeys.notifications });
      void qc.invalidateQueries({ queryKey: sessionKey });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useReadAllNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: ({ count }) => {
      void qc.invalidateQueries({ queryKey: workflowKeys.notifications });
      void qc.invalidateQueries({ queryKey: sessionKey });
      toast.success(`${count}টি বিজ্ঞপ্তি পড়া হয়েছে।`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useMyReports = (page = 1) =>
  useQuery({
    queryKey: [...workflowKeys.reports, page],
    queryFn: () => getMyReports(page),
    placeholderData: keepPreviousData,
  });

export const useReportJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      reason,
      details,
    }: {
      jobId: string;
      reason: "NO_SHOW" | "POOR_WORK" | "OVERCHARGE" | "FRAUD" | "OTHER";
      details?: string;
    }) => submitJobReport(jobId, { reason, details }),
    onSuccess: (_result, { jobId }) => {
      void qc.invalidateQueries({ queryKey: jobKeys.byId(jobId) });
      void qc.invalidateQueries({ queryKey: workflowKeys.reports });
      toast.success("রিপোর্ট জমা হয়েছে।");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useJobPayments = (jobId: string, enabled = true) =>
  useQuery({
    queryKey: workflowKeys.payments(jobId),
    queryFn: () => getJobPayments(jobId),
    retry: false,
    enabled,
  });

export const useBkashPayment = () =>
  useMutation({
    mutationFn: initiateBkashPayment,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useCashPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recordCashPayment,
    onSuccess: (_payment, jobId) => {
      void qc.invalidateQueries({ queryKey: workflowKeys.payments(jobId) });
      void qc.invalidateQueries({ queryKey: jobKeys.byId(jobId) });
      toast.success("নগদ পেমেন্ট পাওয়া হিসেবে রেকর্ড হয়েছে।");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateMyName = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyName,
    onSuccess: ({ name }) => {
      qc.setQueryData(
        sessionKey,
        (user: { name?: string } | null | undefined) =>
          user ? { ...user, name } : user,
      );
      toast.success("নাম আপডেট হয়েছে।");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteMyAccount = () =>
  useMutation({
    mutationFn: deleteMyAccount,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useSaveCvSummary = () =>
  useMutation({
    mutationFn: generateCvSummary,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

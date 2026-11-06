"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiClient";
import {
  approveVerification,
  getAdminJobs,
  getAdminReports,
  getAdminStats,
  getAdminUser,
  getAdminUsers,
  getAdminVerification,
  getAuditLogs,
  getVerificationQueue,
  rejectVerification,
  resolveAdminReport,
  setUserBlocked,
} from "./api";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  verifications: (status: string, page: number) =>
    [...adminKeys.all, "verifications", status, page] as const,
  verification: (id: string) => [...adminKeys.all, "verification", id] as const,
  users: (filters: object) => [...adminKeys.all, "users", filters] as const,
  user: (id: string) => [...adminKeys.all, "user", id] as const,
  jobs: (filters: object) => [...adminKeys.all, "jobs", filters] as const,
  reports: (status: string, page: number) =>
    [...adminKeys.all, "reports", status, page] as const,
  audit: (page: number) => [...adminKeys.all, "audit", page] as const,
};

export const useAdminStats = () =>
  useQuery({ queryKey: adminKeys.stats(), queryFn: getAdminStats });

export const useVerificationQueue = (status = "PENDING", page = 1) =>
  useQuery({
    queryKey: adminKeys.verifications(status, page),
    queryFn: () => getVerificationQueue(status, page),
  });

export const useAdminVerification = (id: string) =>
  useQuery({
    queryKey: adminKeys.verification(id),
    queryFn: () => getAdminVerification(id),
    retry: false,
  });

export const useAdminUsers = (filters: {
  role?: string;
  status?: string;
  q?: string;
  page?: number;
}) =>
  useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => getAdminUsers(filters),
  });

export const useAdminUser = (id: string) =>
  useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => getAdminUser(id),
    enabled: Boolean(id),
  });

export const useAdminJobs = (filters: {
  status?: string;
  skill?: string;
  area?: string;
  page?: number;
}) =>
  useQuery({
    queryKey: adminKeys.jobs(filters),
    queryFn: () => getAdminJobs(filters),
  });

export const useAdminReports = (status = "OPEN", page = 1) =>
  useQuery({
    queryKey: adminKeys.reports(status, page),
    queryFn: () => getAdminReports(status, page),
  });

export const useAuditLogs = (page = 1) =>
  useQuery({
    queryKey: adminKeys.audit(page),
    queryFn: () => getAuditLogs(page),
  });

function useAdminMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.all });
      toast.success("পরিবর্তন সংরক্ষণ হয়েছে।");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export const useApproveVerification = () =>
  useAdminMutation((id: string) => approveVerification(id));

export const useRejectVerification = () =>
  useAdminMutation(({ id, reason }: { id: string; reason: string }) =>
    rejectVerification(id, reason),
  );

export const useSetUserBlocked = () =>
  useAdminMutation(
    ({
      id,
      blocked,
      reason,
    }: {
      id: string;
      blocked: boolean;
      reason: string;
    }) => setUserBlocked(id, blocked, reason),
  );

export const useResolveAdminReport = () =>
  useAdminMutation(
    ({
      id,
      decision,
      resolution,
    }: {
      id: string;
      decision: "COMPLETE" | "CANCEL" | "DISMISS";
      resolution: string;
    }) => resolveAdminReport(id, decision, resolution),
  );

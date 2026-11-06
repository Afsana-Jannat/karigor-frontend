import { requestApi, requestApiPage } from "@/lib/apiClient";

function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export type AdminStats = {
  usersByRole: Record<string, number>;
  techniciansByVerifyStatus: Record<string, number>;
  jobsByStatus: Record<string, number>;
  openJobs: {
    count: number;
    averageBidCount?: number | null;
    avgBidCount?: number | null;
  };
  openReports: number;
  totalPaidAmount: number;
  newUsersLast7Days: number;
};

export type VerificationItem = {
  id: string;
  name: string;
  photoUrl: string;
  submittedAt: string;
};

export type AdminVerification = {
  technicianId: string;
  name: string;
  phone: string;
  age: number;
  bio: string | null;
  experienceYears: number;
  skills: string[];
  areas: string[];
  photoUrl: string;
  nidUrl: string;
  verifyStatus: string;
  submittedAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  createdAt: string;
};

export type AdminJob = {
  id: string;
  skill: string;
  area: string;
  status: string;
  preferredDate: string;
  customer: { id: string; name: string };
  technician: { id: string; name: string } | null;
  agreedPrice: number | null;
  createdAt: string;
};

export type AdminReport = {
  id: string;
  jobId: string;
  reason: string;
  details: string | null;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  customerName: string;
  technicianName: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminName: string;
  createdAt: string;
};

export const getAdminStats = () => requestApi<AdminStats>("admin/stats");

export const getVerificationQueue = (status = "PENDING", page = 1) =>
  requestApiPage<VerificationItem>(
    `admin/verifications${queryString({ status, page })}`,
  );

export const getAdminVerification = (id: string) =>
  requestApi<AdminVerification>(
    `admin/verifications/${encodeURIComponent(id)}`,
  );

export const approveVerification = (id: string) =>
  requestApi<{ verifyStatus: "VERIFIED" }>(
    `admin/verifications/${encodeURIComponent(id)}/approve`,
    { method: "POST" },
  );

export const rejectVerification = (id: string, reason: string) =>
  requestApi<{ verifyStatus: "REJECTED" }>(
    `admin/verifications/${encodeURIComponent(id)}/reject`,
    { method: "POST", body: { reason } },
  );

export const getAdminUsers = (params: {
  role?: string;
  status?: string;
  q?: string;
  page?: number;
}) => requestApiPage<AdminUser>(`admin/users${queryString(params)}`);

export const getAdminUser = (id: string) =>
  requestApi<Record<string, unknown>>(`admin/users/${encodeURIComponent(id)}`);

export const setUserBlocked = (id: string, blocked: boolean, reason: string) =>
  requestApi<{ status: "ACTIVE" | "BLOCKED" }>(
    `admin/users/${encodeURIComponent(id)}/block`,
    { method: "PATCH", body: { blocked, reason } },
  );

export const getAdminJobs = (params: {
  status?: string;
  skill?: string;
  area?: string;
  page?: number;
}) => requestApiPage<AdminJob>(`admin/jobs${queryString(params)}`);

export const getAdminReports = (status = "OPEN", page = 1) =>
  requestApiPage<AdminReport>(`admin/reports${queryString({ status, page })}`);

export const resolveAdminReport = (
  id: string,
  decision: "COMPLETE" | "CANCEL" | "DISMISS",
  resolution: string,
) =>
  requestApi<AdminReport>(`admin/reports/${encodeURIComponent(id)}/resolve`, {
    method: "POST",
    body: { decision, resolution },
  });

export const getAuditLogs = (page = 1) =>
  requestApiPage<AuditLog>(`admin/audit-logs${queryString({ page })}`);

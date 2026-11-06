import { getJob } from "@/features/jobs/api";
import {
  type PageMeta,
  requestApi,
  requestApiPage,
  requestApiWithMeta,
} from "@/lib/apiClient";

export type NotificationItem = {
  id: string;
  type: string;
  jobId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ReportItem = {
  id: string;
  jobId: string;
  reason: "NO_SHOW" | "POOR_WORK" | "OVERCHARGE" | "FRAUD" | "OTHER";
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  resolution: string | null;
  createdAt: string;
};

export type JobPayments = {
  paid: boolean;
  method: "BKASH" | "CASH" | null;
  amountDue: number;
  allowedActions: Record<string, boolean>;
};

function toQuery(
  params: Record<string, string | number | boolean | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const getNotifications = async (page = 1, unreadOnly = false) => {
  const pageSize = 20;
  const { data, meta } = await requestApiWithMeta<{
    unreadCount: number;
    notifications: NotificationItem[];
  }>(
    `notifications${toQuery({ page, pageSize, unreadOnly: unreadOnly || undefined })}`,
  );
  return {
    items: data.notifications,
    meta: meta ?? {
      page,
      pageSize,
      total: data.notifications.length,
      totalPages: 1,
    },
  };
};

export const markNotificationRead = (id: string) =>
  requestApi<NotificationItem>(`notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = () =>
  requestApi<{ updated: number }>("notifications/read-all", { method: "POST" });

export const getMyReports = (page = 1) =>
  requestApiPage<ReportItem>(`reports/mine${toQuery({ page, pageSize: 10 })}`);

export const submitJobReport = (
  jobId: string,
  input: { reason: ReportItem["reason"]; details?: string },
) =>
  requestApi<ReportItem>(`jobs/${encodeURIComponent(jobId)}/report`, {
    method: "POST",
    body: input,
  });

export const getJobPayments = async (jobId: string): Promise<JobPayments> => {
  const job = await getJob(jobId);
  return {
    paid: Boolean(job.payment?.paidAt),
    method: job.payment?.method ?? null,
    amountDue: job.agreedPrice ?? 0,
    allowedActions: job.allowedActions,
  };
};

export const initiateBkashPayment = (jobId: string) =>
  requestApi<{ paymentId: string; amount: number; bkashURL: string }>(
    "payments/bkash/initiate",
    { method: "POST", body: { jobId } },
  );

export const generateCvSummary = (language: "bn" | "en" | "both" = "both") =>
  requestApi<{ suggestion: { bn?: string; en?: string }; usedAi: boolean }>(
    "technicians/me/cv-summary",
    {
      method: "POST",
      body: { language },
    },
  );

export type PaginatedResult<T> = { items: T[]; meta: PageMeta };

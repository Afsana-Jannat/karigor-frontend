import { type PageMeta, requestApi, requestApiPage } from "@/lib/apiClient";

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

export type PaymentAttempt = {
  id: string;
  method: "BKASH" | "CASH";
  amount: number;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
  trxId: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type JobPayments = {
  payments: PaymentAttempt[];
  paid: boolean;
  method: "BKASH" | "CASH" | null;
  amountDue: number;
  allowedActions: string[];
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

export const getNotifications = (page = 1, unreadOnly = false) =>
  requestApiPage<NotificationItem>(
    `notifications${toQuery({ page, pageSize: 20, unreadOnly: unreadOnly || undefined })}`,
  );

export const markNotificationRead = (id: string) =>
  requestApi<NotificationItem>(`notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = () =>
  requestApi<{ count: number }>("notifications/read-all", { method: "POST" });

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

export const getJobPayments = (jobId: string) =>
  requestApi<JobPayments>(`jobs/${encodeURIComponent(jobId)}/payments`);

export const getPayment = (paymentId: string) =>
  requestApi<PaymentAttempt>(`payments/${encodeURIComponent(paymentId)}`);

export const initiateBkashPayment = (jobId: string) =>
  requestApi<{ paymentId: string; amount: number; bkashURL: string }>(
    "payments/bkash/initiate",
    { method: "POST", body: { jobId } },
  );

export const recordCashPayment = (jobId: string) =>
  requestApi<PaymentAttempt>(
    `jobs/${encodeURIComponent(jobId)}/payments/cash`,
    { method: "POST" },
  );

export const updateMyName = (name: string) =>
  requestApi<{ id: string; name: string }>("users/me", {
    method: "PATCH",
    body: { name },
  });

export const deleteMyAccount = () =>
  requestApi<{ deleted: boolean }>("users/me", {
    method: "DELETE",
    body: { confirm: "DELETE" },
  });

export const requestUploadSignature = (purpose: "PHOTO" | "NID") =>
  requestApi<{
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    type: "upload" | "authenticated";
    uploadUrl: string;
    maxBytes: number;
    allowedFormats: string[];
  }>("uploads/sign", {
    method: "POST",
    body: { purpose },
  });

export const generateCvSummary = (language: "bn" | "en" | "both" = "both") =>
  requestApi<{ suggestion: { bn?: string; en?: string }; usedAi: boolean }>(
    "technicians/me/cv-summary",
    {
      method: "POST",
      body: { language },
    },
  );

export type PaginatedResult<T> = { items: T[]; meta: PageMeta };

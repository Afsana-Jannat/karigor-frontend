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
  amountPaid: number | null;
  attempts: PaymentAttempt[];
  allowedActions: Record<string, boolean>;
};

export type PaymentAttempt = {
  id: string;
  method: "BKASH" | "CASH";
  amount: number;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
  trxId: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
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
  const result = await requestApi<{
    paid: boolean;
    method: JobPayments["method"];
    amountDue: number | null;
    paymentAttempts: PaymentAttempt[];
    availableActions: { canPayWithBkash: boolean; [action: string]: boolean };
  }>(`payments/${encodeURIComponent(jobId)}/payments`);
  const successfulPayment = result.paymentAttempts.find(
    (payment) => payment.status === "SUCCESS",
  );

  return {
    paid: result.paid,
    method: result.method,
    amountDue: result.amountDue ?? 0,
    amountPaid: successfulPayment?.amount ?? null,
    attempts: result.paymentAttempts,
    allowedActions: { pay_bkash: result.availableActions.canPayWithBkash },
  };
};

export const initiateBkashPayment = (jobId: string) =>
  requestApi<{ paymentId: string; amount: number; bkashURL: string }>(
    "payments/bkash/initiate",
    { method: "POST", body: { jobId } },
  );

export const reconcileBkashPayment = (jobId: string) =>
  requestApi<{ status: "PAID" | "FAILED" | "PENDING"; paid: boolean }>(
    `payments/${encodeURIComponent(jobId)}/reconcile`,
    { method: "POST" },
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

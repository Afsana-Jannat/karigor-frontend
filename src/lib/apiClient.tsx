import { type FetchOptions, ofetch } from "ofetch";
import { errorMessages } from "./labels";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
const API_BASE_URL = API_ORIGIN
  ? API_ORIGIN.endsWith("/api/v1")
    ? API_ORIGIN
    : `${API_ORIGIN}/api/v1`
  : undefined;

let accessToken: string | null = null;
let refreshInFlight: Promise<void> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const apiClient = ofetch.create({
  baseURL: API_BASE_URL,
  cache: "no-store",
  credentials: "include",
  onRequest({ options }) {
    if (accessToken) {
      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);
      options.headers = headers;
    }
  },
});

export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: PageMeta;
  message?: string;
  error?: { code?: string; message?: string };
};

export type ApiErrorDetail = { path: string; message: string };

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: ApiErrorDetail[];

  constructor(
    code: string,
    status: number,
    message: string,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type FetchErrorShape = {
  status?: number;
  statusCode?: number;
  response?: { status?: number };
  data?: {
    error?: { code?: string; message?: string; details?: ApiErrorDetail[] };
    message?: string;
  };
  message?: string;
};

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  const shape = (
    error && typeof error === "object" ? error : {}
  ) as FetchErrorShape;
  const status =
    shape.status ?? shape.statusCode ?? shape.response?.status ?? 0;
  if (status === 0) {
    return new ApiError("NETWORK", 0, errorMessages.NETWORK);
  }
  const body = shape.data;
  return new ApiError(
    body?.error?.code ?? "INTERNAL",
    status,
    body?.error?.message ?? body?.message ?? shape.message ?? "",
    body?.error?.details ?? [],
  );
}

async function send<T>(
  path: string,
  options: FetchOptions<"json">,
  canRetry = true,
): Promise<ApiEnvelope<T>> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "INTERNAL",
      0,
      "API is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  try {
    return await apiClient<ApiEnvelope<T>>(path, options);
  } catch (error) {
    const apiError = toApiError(error);
    const mayRefresh =
      apiError.status === 401 &&
      canRetry &&
      (!path.startsWith("auth/") || path === "auth/check-auth");

    if (!mayRefresh) {
      throw apiError;
    }

    if (!refreshInFlight) {
      refreshInFlight = apiClient<ApiEnvelope<{ accessToken?: string }>>(
        "auth/refresh",
        { method: "POST" },
      )
        .then((response) => {
          const token = response.data?.accessToken;
          if (!response.success || !token) {
            throw new ApiError(
              "INTERNAL",
              500,
              "ব্যাকএন্ড থেকে নতুন সেশন টোকেন পাওয়া যায়নি।",
            );
          }
          setAccessToken(token);
        })
        .catch((refreshError: unknown) => {
          throw toApiError(refreshError);
        })
        .finally(() => {
          refreshInFlight = null;
        });
    }

    await refreshInFlight;
    return send<T>(path, options, false);
  }
}

export async function requestApi<T>(
  path: string,
  options: FetchOptions<"json"> = {},
): Promise<T> {
  const response = await send<T>(path, options);
  if (!response.success) {
    throw new ApiError(
      "INTERNAL",
      500,
      response.error?.message ?? response.message ?? "Request failed.",
    );
  }
  return response.data;
}

export async function requestApiWithMeta<T>(
  path: string,
  options: FetchOptions<"json"> = {},
): Promise<{ data: T; meta?: PageMeta }> {
  const response = await send<T>(path, options);
  if (!response.success) {
    throw new ApiError(
      "INTERNAL",
      500,
      response.error?.message ?? response.message ?? "Request failed.",
    );
  }
  return {
    data: response.data,
    ...(response.meta ? { meta: response.meta } : {}),
  };
}

// For list endpoints. Keeps the pagination meta that requestApi throws away.
export async function requestApiPage<T>(
  path: string,
  options: FetchOptions<"json"> = {},
): Promise<{ items: T[]; meta: PageMeta }> {
  const response = await send<T[]>(path, options);
  const items = response.data;
  return {
    items,
    meta: response.meta ?? {
      page: 1,
      pageSize: items.length,
      total: items.length,
      totalPages: 1,
    },
  };
}

// Bangla message by error code. A screen can override single codes.
export function getErrorMessage(
  error: unknown,
  overrides: Record<string, string> = {},
): string {
  if (error instanceof ApiError) {
    return (
      overrides[error.code] ??
      errorMessages[error.code] ??
      errorMessages.INTERNAL
    );
  }
  if (error instanceof Error && /[\u0980-\u09FF]/.test(error.message)) {
    return error.message;
  }
  return errorMessages.INTERNAL;
}

// Kept so that existing screens keep working.
export function getApiErrorMessage(error: unknown) {
  return getErrorMessage(error);
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

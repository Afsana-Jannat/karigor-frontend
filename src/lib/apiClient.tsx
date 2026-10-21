import { type FetchOptions, ofetch } from "ofetch";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
const API_BASE_URL = API_ORIGIN
  ? `${API_ORIGIN.endsWith("/api/v1") ? API_ORIGIN : `${API_ORIGIN}/api/v1`}`
  : undefined;

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

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
};

export async function requestApi<T>(
  path: string,
  options: FetchOptions<"json"> = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API is not configured. Set NEXT_PUBLIC_API_BASE_URL.");
  }

  const response = await apiClient<ApiEnvelope<T>>(path, options);
  if (!response.success) {
    throw new Error(
      response.error?.message ?? response.message ?? "Request failed.",
    );
  }

  return response.data;
}

export function getApiErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const responseData = error.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      "error" in responseData
    ) {
      const apiError = responseData.error;
      if (
        apiError &&
        typeof apiError === "object" &&
        "message" in apiError &&
        typeof apiError.message === "string"
      ) {
        return apiError.message;
      }
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string"
    ) {
      return responseData.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
}

export function getApiErrorStatus(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }

  return undefined;
}

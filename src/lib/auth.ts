import { requestApi, setAccessToken } from "./apiClient";

export type UserRole = "CUSTOMER" | "TECHNICIAN";

type OtpRequestResult = {
  phone: string;
  otpSent: boolean;
  devCode?: string;
};

type RegistrationVerificationResult = {
  verified: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
  };
};

type LoginResult = {
  user: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
  };
  accessToken: string;
};

export function registerAccount(input: {
  name: string;
  phone: string;
  role: UserRole;
}) {
  return requestApi<OtpRequestResult>("auth/register", {
    method: "POST",
    body: input,
  });
}

export function requestLoginOtp(phone: string) {
  return requestApi<OtpRequestResult>("auth/login/request-otp", {
    method: "POST",
    body: { phone },
  });
}

export function verifyRegistrationOtp(phone: string, otp: string) {
  return requestApi<RegistrationVerificationResult>("auth/verify-otp", {
    method: "POST",
    body: { phone, otp },
  });
}

export async function verifyLoginOtp(phone: string, otp: string) {
  const result = await requestApi<LoginResult>("auth/login/verify-otp", {
    method: "POST",
    body: { phone, otp },
  });

  if (!result.accessToken) {
    throw new Error("Login response did not include an access token.");
  }

  setAccessToken(result.accessToken);
  return result;
}

export async function logoutAccount() {
  await requestApi<unknown>("auth/logout", { method: "POST" });
  setAccessToken(null);
}

let refreshInFlight: Promise<void> | null = null;

export function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = requestApi<{ accessToken: string }>("auth/refresh", {
      method: "POST",
    })
      .then((result) => {
        if (!result.accessToken) {
          throw new Error("Refresh response did not include an access token.");
        }

        setAccessToken(result.accessToken);
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

import { requestApi } from "./apiClient";

export type UserRole = "CUSTOMER" | "TECHNICIAN";

type OtpRequestResult = {
  phone: string;
  otpSent: boolean;
  devCode?: string;
};

type RegistrationVerificationResult = {
  verified: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
  };
  technician: { hasProfile: boolean; verifyStatus: string } | null;
};

export type LoginResult = {
  user: {
    id: string;
    name: string;
    phone: string;
    role: UserRole | "ADMIN";
  };
  technician: { hasProfile: boolean; verifyStatus: string } | null;
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
  return requestApi<OtpRequestResult>("auth/login", {
    method: "POST",
    body: { phone },
  });
}

export function verifyAccountOtp(phone: string, code: string) {
  return requestApi<LoginResult & Partial<RegistrationVerificationResult>>(
    "auth/verify-otp",
    {
      method: "POST",
      body: { phone, code },
    },
  );
}

export const verifyRegistrationOtp = verifyAccountOtp;
export const verifyLoginOtp = verifyAccountOtp;

export function logoutAccount(allDevices = false) {
  return requestApi<unknown>(allDevices ? "auth/logout-all" : "auth/logout", {
    method: "POST",
  });
}

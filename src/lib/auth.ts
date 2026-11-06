import { requestApi, setAccessToken } from "./apiClient";

export type UserRole = "CUSTOMER" | "TECHNICIAN";

type OtpRequestResult = {
  phone: string;
  otpSent: boolean;
  devCode?: string;
};

export type RegistrationVerificationResult = {
  verified: boolean;
  message: string;
};

export type LoginResult = {
  user: {
    id: string;
    name: string;
    phone: string;
    role: UserRole | "ADMIN";
  };
  accessToken: string;
  refreshToken?: string;
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

export function verifyLoginOtp(phone: string, otp: string) {
  return requestApi<LoginResult>("auth/login/verify-otp", {
    method: "POST",
    body: { phone, otp },
  }).then((result) => {
    setAccessToken(result.accessToken);
    return result;
  });
}

export function logoutAccount() {
  return requestApi<unknown>("auth/logout", {
    method: "POST",
  }).finally(() => setAccessToken(null));
}

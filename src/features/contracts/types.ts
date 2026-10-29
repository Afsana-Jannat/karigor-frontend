// Shapes read from contracts.service.ts of the backend, not guessed.
// (verify) = not seen in the code, check in Postman.

export type ContractStatus = "PENDING" | "SIGNED" | "VOID";

/**
 * The frozen snapshot made when a bid is selected. `skill` and `area` are
 * already Bangla names here, so do NOT pass them to skillName()/areaName().
 */
export type ContractContent = {
  jobId: string;
  customerName: string;
  technicianName: string;
  skill: string;
  area: string;
  description: string;
  /** ISO string. */
  preferredDate: string;
  /** Integer BDT. */
  agreedPrice: number;
  /** ISO string. */
  createdAt: string;
  /**
   * The backend line `terms: [...CONTRACT_TERMS_BN]` is commented out today,
   * so this is absent. The page shows terms only when the backend sends them.
   */
  terms?: string[];
};

/** GET /jobs/:id/contract. Here :id is the JOB id. `id` is the CONTRACT id. */
export type Contract = {
  id: string;
  content: ContractContent;
  contentHash: string;
  status: ContractStatus;
  customerSignedAt: string | null;
  technicianSignedAt: string | null;
  createdAt: string;
};

/** POST /contracts/:id/sign-otp. (verify) The code that sends it was not shared. */
export type SignOtpResult = {
  otpSent?: boolean;
  /** Only in demo mode. */
  devCode?: string;
};

/** POST /contracts/:id/sign */
export type SignResult = {
  contractId: string;
  signed: boolean;
  contractStatus: "PENDING" | "SIGNED";
  jobStatus: string;
  bothPartiesSigned: boolean;
};

/** GET /contracts/:id/verify */
export type VerifyResult = {
  valid: boolean;
  hash: string;
};

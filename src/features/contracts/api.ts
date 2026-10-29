import { requestApi } from "@/lib/apiClient";
import type {
  Contract,
  SignOtpResult,
  SignResult,
  VerifyResult,
} from "./types";

// Raw requests only. Components never call these directly: use queries.ts.
//
// Which id goes where (read from contracts.service.ts):
//   select and "view the contract" take the JOB id,
//   sign-otp, sign and verify take the CONTRACT id (Contract.id).

/**
 * POST /jobs/:id/bids/:bidId/select. Here :id is the job id (section 9.7).
 * The response is "the job and the new contract". We never read it: the
 * contract page loads the contract again with getJobContract.
 */
export const selectBid = (jobId: string, bidId: string) =>
  requestApi<unknown>(
    `jobs/${encodeURIComponent(jobId)}/bids/${encodeURIComponent(bidId)}/select`,
    { method: "POST" },
  );

/** GET /jobs/:id/contract. 404 if there is no contract or you are not a party. */
export const getJobContract = (jobId: string) =>
  requestApi<Contract>(`jobs/${encodeURIComponent(jobId)}/contract`);

/** POST /contracts/:id/sign-otp. No body. Sends a code to the signer's phone. */
export const requestSignOtp = (contractId: string) =>
  requestApi<SignOtpResult>(
    `contracts/${encodeURIComponent(contractId)}/sign-otp`,
    { method: "POST" },
  );

/** POST /contracts/:id/sign. Body: { otp }. */
export const signContract = (contractId: string, otp: string) =>
  requestApi<SignResult>(`contracts/${encodeURIComponent(contractId)}/sign`, {
    method: "POST",
    body: { otp },
  });

/** GET /contracts/:id/verify */
export const verifyContract = (contractId: string) =>
  requestApi<VerifyResult>(
    `contracts/${encodeURIComponent(contractId)}/verify`,
  );

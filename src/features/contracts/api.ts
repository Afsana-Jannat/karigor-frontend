import { requestApi } from "@/lib/apiClient";

// Raw requests only. Components never call these directly: use queries.ts.

/**
 * POST /jobs/:id/bids/:bidId/select. Here :id is the job id (section 9.7).
 * The response is "the job and the new contract" and is marked (verify) in the
 * guide, so it is typed as unknown and never read.
 */
export const selectBid = (jobId: string, bidId: string) =>
  requestApi<unknown>(
    `jobs/${encodeURIComponent(jobId)}/bids/${encodeURIComponent(bidId)}/select`,
    { method: "POST" },
  );

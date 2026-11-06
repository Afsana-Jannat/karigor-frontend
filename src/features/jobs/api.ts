import { requestApi, requestApiPage } from "@/lib/apiClient";
import type {
  Bid,
  CreateBidInput,
  CreateJobInput,
  CreateJobResult,
  JobBid,
  JobDetail,
  JobListFilters,
  JobListItem,
  OpenJobItem,
} from "./types";

// Raw requests only. Components never call these directly: use queries.ts.

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** GET /jobs: the user's own jobs (customer or technician). */
export const getMyJobs = ({
  status,
  page = 1,
  pageSize = 10,
}: JobListFilters = {}) =>
  requestApiPage<JobListItem>(`jobs${toQuery({ status, page, pageSize })}`);

/** GET /jobs/open: technician feed. 409 means no technician profile yet. */
export const getOpenJobs = ({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
} = {}) =>
  requestApiPage<OpenJobItem>(`jobs/open${toQuery({ page, pageSize })}`);

/** GET /jobs/:id. Details and actions available to the current user. */
export const getJob = (jobId: string) =>
  requestApi<JobDetail>(`jobs/${encodeURIComponent(jobId)}`);

/** GET /jobs/:id/bids. Customer-owned job bids. */
export const getJobBids = (jobId: string, sort = "price") =>
  requestApi<Array<JobBid & { id?: string; bidId?: string }>>(
    `jobs/${encodeURIComponent(jobId)}/bids${toQuery({ sort })}`,
  ).then((bids) =>
    bids.map((bid) => ({
      ...bid,
      id: bid.id ?? bid.bidId ?? "",
      bidId: bid.bidId ?? bid.id ?? "",
    })),
  );

/** POST /jobs */
export const createJob = (input: CreateJobInput) =>
  requestApi<CreateJobResult>("jobs", { method: "POST", body: input });

/** PUT /jobs/:id/bid. Creates, edits, or reactivates the technician's bid. */
export const submitBid = (jobId: string, input: CreateBidInput) =>
  requestApi<Bid>(`jobs/${encodeURIComponent(jobId)}/bid`, {
    method: "PUT",
    body: input,
  });

/** DELETE /jobs/:id/bid. Withdraws the technician's active bid. */
export const withdrawBid = (jobId: string) =>
  requestApi<{ jobId: string; status: "WITHDRAWN" }>(
    `jobs/${encodeURIComponent(jobId)}/bid`,
    { method: "DELETE" },
  );

export const cancelJob = (jobId: string, reason?: string) =>
  requestApi<{ id: string; status: "CANCELLED" }>(
    `jobs/${encodeURIComponent(jobId)}/cancel`,
    { method: "POST", body: { reason } },
  );

export const completeJob = (jobId: string) =>
  requestApi<{ id: string; status: "AWAITING_CONFIRMATION" }>(
    `jobs/${encodeURIComponent(jobId)}/complete`,
    { method: "POST" },
  );

export const confirmJob = (jobId: string) =>
  requestApi<{ id: string; status: "COMPLETED" }>(
    `jobs/${encodeURIComponent(jobId)}/confirm`,
    { method: "POST" },
  );

export const reviewJob = (
  jobId: string,
  input: { rating: number; comment?: string },
) =>
  requestApi<{ id: string; rating: number }>(
    `jobs/${encodeURIComponent(jobId)}/review`,
    { method: "POST", body: input },
  );

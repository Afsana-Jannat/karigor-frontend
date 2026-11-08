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
  MyBidItem,
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

export const getMyBids = ({
  status,
  page = 1,
  pageSize = 20,
}: {
  status?: string;
  page?: number;
  pageSize?: number;
} = {}) =>
  requestApiPage<MyBidItem>(`bids/mine${toQuery({ status, page, pageSize })}`);

/** GET /jobs/:id. Details and actions available to the current user. */
export const getJob = async (jobId: string) => {
  type NestedJobDetail = {
    job: Omit<
      JobDetail,
      "counterpart" | "contract" | "payment" | "allowedActions"
    >;
    counterpart: JobDetail["counterpart"];
    contract: JobDetail["contract"];
    payment: JobDetail["payment"];
    allowedActions: Record<string, boolean>;
  };

  const result = await requestApi<JobDetail | NestedJobDetail>(
    `jobs/${encodeURIComponent(jobId)}`,
  );
  if (!("job" in result)) {
    return result;
  }
  return {
    ...result.job,
    counterpart: result.counterpart,
    contract: result.contract,
    payment: result.payment,
    allowedActions: result.allowedActions,
  };
};

/** GET /jobs/:id/bids. Customer-owned job bids. */
export const getJobBids = async (jobId: string, sort = "price") => {
  type BidResponse = Omit<JobBid, "id" | "bidId"> & {
    id?: string;
    bidId?: string;
  };
  type JobBidsResponse =
    | BidResponse[]
    | {
        job: {
          id: string;
          status: string;
          expiresAt: string;
          bidCount: number;
        };
        bids: BidResponse[];
      };

  const response = await requestApi<JobBidsResponse>(
    `jobs/${encodeURIComponent(jobId)}/bids${toQuery({ sort })}`,
  );
  const bids = Array.isArray(response) ? response : response.bids;
  return bids.map((bid) => ({
    ...bid,
    id: bid.id ?? bid.bidId ?? "",
    bidId: bid.bidId ?? bid.id ?? "",
  }));
};

/** POST /jobs */
export const createJob = (input: CreateJobInput) =>
  requestApi<CreateJobResult>("jobs", { method: "POST", body: input });

/** PUT /jobs/:id/bid. Creates, edits, or reactivates the technician's bid. */
export const submitBid = (jobId: string, input: CreateBidInput) =>
  requestApi<Bid>(`bids/${encodeURIComponent(jobId)}/bid`, {
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

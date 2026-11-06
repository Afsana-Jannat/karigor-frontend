"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiClient";
import {
  cancelJob,
  completeJob,
  confirmJob,
  createJob,
  getJob,
  getJobBids,
  getMyJobs,
  getOpenJobs,
  reviewJob,
  submitBid,
  withdrawBid,
} from "./api";
import { jobKeys } from "./keys";
import type { CreateBidInput, JobListFilters } from "./types";

// Keys owned by other people. We only invalidate them, we never read them.
const technicianKey = ["technician"] as const;
const notificationKey = ["notifications"] as const;

/** My jobs list. Keeps the old page on screen while the next page loads. */
export const useMyJobs = (filters: JobListFilters) =>
  useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => getMyJobs(filters),
    placeholderData: keepPreviousData,
  });

/** Technician open jobs feed. Refetches every 60 seconds. */
export const useOpenJobs = (
  filters: { page?: number; pageSize?: number } = {},
) =>
  useQuery({
    queryKey: jobKeys.open(filters),
    queryFn: () => getOpenJobs(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    retry: false,
  });

export const useJob = (jobId: string) =>
  useQuery({
    queryKey: jobKeys.byId(jobId),
    queryFn: () => getJob(jobId),
    refetchInterval: (query) =>
      ["CONTRACT_PENDING", "AWAITING_CONFIRMATION"].includes(
        query.state.data?.status ?? "",
      )
        ? 20_000
        : false,
    retry: false,
  });

export const useJobBids = (jobId: string, sort: string) =>
  useQuery({
    queryKey: jobKeys.bids(jobId, sort),
    queryFn: () => getJobBids(jobId, sort),
    retry: false,
  });

function useInvalidateJobs() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: jobKeys.all });
    qc.invalidateQueries({ queryKey: technicianKey });
    qc.invalidateQueries({ queryKey: notificationKey });
  };
}

export const useCreateJob = () => {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => invalidate(),
    // The form shows the error under the field or in an error box, so no toast here.
  });
};

export const useSubmitBid = () => {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: ({ jobId, input }: { jobId: string; input: CreateBidInput }) =>
      submitBid(jobId, input),
    onSuccess: () => {
      invalidate();
      toast.success("আপনার প্রস্তাব পাঠানো হয়েছে");
    },
  });
};

export const useWithdrawBid = () => {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: withdrawBid,
    onSuccess: () => {
      invalidate();
      toast.success("আপনার প্রস্তাব প্রত্যাহার করা হয়েছে");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

function useJobTransition<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const invalidate = useInvalidateJobs();
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      invalidate();
      if (typeof variables === "string") {
        void qc.invalidateQueries({ queryKey: jobKeys.byId(variables) });
      } else if (
        variables &&
        typeof variables === "object" &&
        "jobId" in variables &&
        typeof variables.jobId === "string"
      ) {
        void qc.invalidateQueries({
          queryKey: jobKeys.byId(variables.jobId),
        });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export const useCancelJob = () =>
  useJobTransition(({ jobId, reason }: { jobId: string; reason?: string }) =>
    cancelJob(jobId, reason),
  );

export const useCompleteJob = () =>
  useJobTransition((jobId: string) => completeJob(jobId));

export const useConfirmJob = () =>
  useJobTransition((jobId: string) => confirmJob(jobId));

export const useReviewJob = () =>
  useJobTransition(
    ({
      jobId,
      rating,
      comment,
    }: {
      jobId: string;
      rating: number;
      comment?: string;
    }) => reviewJob(jobId, { rating, comment }),
  );

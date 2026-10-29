"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jobKeys } from "@/features/jobs/keys";
import {
  getJobContract,
  requestSignOtp,
  selectBid,
  signContract,
  verifyContract,
} from "./api";
import { contractKeys } from "./keys";

// Keys owned by Samir. We only invalidate them, we never read them.
const bidsKey = ["bids"] as const;
const notificationKey = ["notifications"] as const;

/** Select a bid. Invalidates jobs, bids and notifications (section 7.4). */
export const useSelectBid = (jobId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bidId: string) => selectBid(jobId, bidId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.all });
      qc.invalidateQueries({ queryKey: bidsKey });
      qc.invalidateQueries({ queryKey: notificationKey });
    },
    // The error is shown inside the dialog, so there is no toast here.
  });
};

/** The contract of a job (by JOB id). Refetches while it waits for signatures. */
export const useJobContract = (jobId: string) =>
  useQuery({
    queryKey: contractKeys.byJob(jobId),
    queryFn: () => getJobContract(jobId),
    // The other party may sign at any time, so keep looking until it is done.
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 20_000 : false,
    retry: false,
  });

/** Is the contract text unchanged? Takes the CONTRACT id. */
export const useContractVerify = (contractId: string | undefined) =>
  useQuery({
    queryKey: contractKeys.verify(contractId ?? ""),
    queryFn: () => verifyContract(contractId as string),
    enabled: Boolean(contractId),
    retry: false,
  });

/** Ask for a signing code. The caller shows the errors and the countdown. */
export const useRequestSignOtp = () =>
  useMutation({
    mutationFn: (contractId: string) => requestSignOtp(contractId),
  });

/** Sign with the code. Invalidates jobs, contracts, notifications (section 7.4). */
export const useSignContract = (contractId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (otp: string) => signContract(contractId, otp),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: jobKeys.all });
      qc.invalidateQueries({ queryKey: contractKeys.all });
      qc.invalidateQueries({ queryKey: notificationKey });
      toast.success(
        result.bothPartiesSigned
          ? "দুজনেই স্বাক্ষর করেছেন। কাজ শুরু হয়েছে।"
          : "আপনার স্বাক্ষর সম্পন্ন হয়েছে।",
      );
    },
    // OTP errors are shown under the input, so there is no toast here.
  });
};

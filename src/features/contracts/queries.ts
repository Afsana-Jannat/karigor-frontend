"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobKeys } from "@/features/jobs/keys";
import { selectBid } from "./api";

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

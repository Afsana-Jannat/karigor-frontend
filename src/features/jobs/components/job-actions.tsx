"use client";

import { FileSignature, Users } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { JobStatus } from "../types";

type JobActionsProps = {
  jobId: string;
  status: JobStatus;
};

export function JobActions({ jobId, status }: JobActionsProps) {
  if (status === "OPEN") {
    return (
      <Link
        href={`/jobs/${jobId}/bids`}
        className={buttonVariants({ variant: "accent", size: "lg" })}
      >
        <Users aria-hidden="true" /> প্রস্তাব দেখুন
      </Link>
    );
  }

  if (
    status === "CONTRACT_PENDING" ||
    status === "IN_PROGRESS" ||
    status === "AWAITING_CONFIRMATION" ||
    status === "COMPLETED" ||
    status === "DISPUTED"
  ) {
    return (
      <Link
        href={`/jobs/${jobId}/contract`}
        className={buttonVariants({ variant: "accent", size: "lg" })}
      >
        <FileSignature aria-hidden="true" /> চুক্তি দেখুন
      </Link>
    );
  }

  return null;
}

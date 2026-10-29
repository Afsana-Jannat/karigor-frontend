"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useContractVerify } from "../queries";

type ContractVerifyBadgeProps = {
  /** The CONTRACT id, not the job id. */
  contractId: string;
};

/** valid gives a green "verified" badge, invalid gives a red warning. */
export function ContractVerifyBadge({ contractId }: ContractVerifyBadgeProps) {
  const { data, isPending, isError } = useContractVerify(contractId);

  // The badge is extra information: while it loads or if it fails, show nothing.
  if (isPending || isError) return null;

  return data.valid ? (
    <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
      <ShieldCheck className="size-4" aria-hidden="true" />
      যাচাইকৃত চুক্তি
    </p>
  ) : (
    <p
      role="alert"
      className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
    >
      <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
      সতর্কতা: চুক্তির লেখা বদলে গেছে বলে মনে হচ্ছে। স্বাক্ষর করবেন না।
    </p>
  );
}

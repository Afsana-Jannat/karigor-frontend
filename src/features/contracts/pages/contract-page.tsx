"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button, buttonVariants } from "@/components/ui/button";
import { PhoneLink } from "@/features/jobs/components/phone-link";
import { useJob } from "@/features/jobs/queries";
import { getApiErrorStatus } from "@/lib/apiClient";
import { useSession } from "@/lib/session/use-session";
import { ContractDocument } from "../components/contract-document";
import { ContractVerifyBadge } from "../components/contract-verify-badge";
import { SignContractPanel } from "../components/sign-contract-panel";
import { useJobContract } from "../queries";

type ContractPageProps = {
  /** The JOB id from the URL. The contract id comes from the response. */
  jobId: string;
};

// The phone comes from the job, and the backend sends it only after both
// parties signed. If it is missing, or the job request fails, show nothing.
function CounterpartPhone({ jobId }: { jobId: string }) {
  const { data } = useJob(jobId);
  const counterpart = data?.counterpart;
  if (!counterpart?.phone) return null;
  return (
    <p className="mt-3 text-sm text-slate-600">
      {counterpart.name}: <PhoneLink phone={counterpart.phone} />
    </p>
  );
}

/** Contract and signing: /jobs/[id]/contract. */
export default function ContractPage({ jobId }: ContractPageProps) {
  const { data: user } = useSession();
  const {
    data: contract,
    isPending,
    isError,
    error,
    refetch,
  } = useJobContract(jobId);

  if (isPending) {
    return (
      <PageContainer narrow>
        <LoadingState />
      </PageContainer>
    );
  }

  // 404: no contract yet, or the viewer is not a party of this job.
  if (isError && getApiErrorStatus(error) === 404) {
    return (
      <PageContainer narrow>
        <EmptyState
          text="চুক্তিটি খুঁজে পাওয়া যায়নি।"
          action={
            <Link
              href="/jobs"
              className={buttonVariants({ variant: "brand", size: "xl" })}
            >
              আমার কাজগুলো
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer narrow>
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  const role = user?.role;
  const viewerSigned =
    role === "CUSTOMER"
      ? Boolean(contract.customerSignedAt)
      : role === "TECHNICIAN"
        ? Boolean(contract.technicianSignedAt)
        : true; // an admin only reads, so there is nothing for them to sign
  const canSign = contract.status === "PENDING" && !viewerSigned;

  return (
    <PageContainer narrow>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/jobs/${jobId}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> কাজে ফিরে যান
        </Link>
        <Button
          type="button"
          variant="outline"
          size="xl"
          onClick={() => window.print()}
        >
          <Printer aria-hidden="true" /> চুক্তি ছাপুন
        </Button>
      </div>

      <div className="mb-4 print:hidden">
        <ContractVerifyBadge contractId={contract.id} />
      </div>

      <ContractDocument contract={contract} />

      <div className="mt-6 space-y-4">
        {canSign ? <SignContractPanel contractId={contract.id} /> : null}

        {contract.status === "PENDING" && viewerSigned && role !== "ADMIN" ? (
          <output className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
            আপনি স্বাক্ষর করেছেন। অন্য পক্ষের স্বাক্ষরের জন্য অপেক্ষা করা হচ্ছে।
          </output>
        ) : null}

        {contract.status === "SIGNED" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden">
            <output>দুজনেই স্বাক্ষর করেছেন। কাজ শুরু করা যাবে।</output>
            <CounterpartPhone jobId={jobId} />
          </div>
        ) : null}

        {contract.status === "VOID" ? (
          <output className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 print:hidden">
            চুক্তি বাতিল হয়েছে।
          </output>
        ) : null}
      </div>
    </PageContainer>
  );
}

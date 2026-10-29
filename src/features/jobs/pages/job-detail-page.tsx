"use client";

import { ArrowLeft, CalendarDays, MapPin, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/shared/app-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Money } from "@/components/shared/money";
import { PageContainer } from "@/components/shared/page-container";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { useMetaOptions } from "@/features/meta";
import { getApiErrorStatus } from "@/lib/apiClient";
import { formatDate } from "@/lib/format";
import { jobStatusLabels } from "@/lib/labels";
import { useSession } from "@/lib/session/use-session";
import { JobActions } from "../components/job-actions";
import { JobStatusStepper } from "../components/job-status-stepper";
import { PhoneLink } from "../components/phone-link";
import { useJob } from "../queries";

type JobDetailPageProps = { jobId: string };

// The backend reason code EXPIRED is shown as a sentence, never as the code.
function cancelReasonText(reason: string) {
  return reason === "EXPIRED" ? "সময় শেষ হয়ে গেছে" : reason;
}

/** Job detail, the hub of the job: /jobs/[id]. Refetches every 20 seconds. */
export default function JobDetailPage({ jobId }: JobDetailPageProps) {
  const { data: user } = useSession();
  const { skillName, areaName } = useMetaOptions();
  const { data, isPending, isError, error, refetch } = useJob(jobId);

  if (isPending) {
    return (
      <PageContainer narrow>
        <LoadingState />
      </PageContainer>
    );
  }

  // A job that does not exist, or that this user may not see.
  if (isError && getApiErrorStatus(error) === 404) {
    return (
      <PageContainer narrow>
        <EmptyState
          text="কাজটি খুঁজে পাওয়া যায়নি।"
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

  const { job, counterpart } = data;
  const allowedActions = data.allowedActions ?? [];
  const counterpartLabel = user?.role === "CUSTOMER" ? "কারিগর" : "গ্রাহক";

  return (
    <PageContainer narrow>
      <Link
        href="/jobs"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> কাজের তালিকায় ফিরুন
      </Link>

      <AppCard className="shadow-xl shadow-blue-950/5 sm:p-9">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold tracking-wider text-cta">
              কাজের বিস্তারিত
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brand">
              {skillName(job.skill)}
            </h1>
          </div>
          <StatusBadge labels={jobStatusLabels} status={job.status} />
        </div>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-slate-400" aria-hidden="true" />
            <dt className="sr-only">এলাকা</dt>
            <dd>{areaName(job.area)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays
              className="size-4 text-slate-400"
              aria-hidden="true"
            />
            <dt className="sr-only">পছন্দের তারিখ</dt>
            <dd>{formatDate(job.preferredDate)}</dd>
          </div>
        </dl>

        {job.agreedPrice !== null ? (
          <p className="mt-5 text-slate-500">
            নির্ধারিত দাম: <Money amount={job.agreedPrice} className="text-2xl" />
          </p>
        ) : null}

        <p className="mt-5 whitespace-pre-line leading-7 text-slate-700">
          {job.description}
        </p>

        {counterpart ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{counterpartLabel}</p>
            <p className="font-bold text-brand">{counterpart.name}</p>
            {/* The backend sends the phone only after the contract is SIGNED. */}
            {counterpart.phone ? <PhoneLink phone={counterpart.phone} /> : null}
          </div>
        ) : null}

        <div className="mt-8">
          <JobStatusStepper status={job.status} />
        </div>

        {job.status === "CANCELLED" ? (
          <output className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            কাজটি বাতিল করা হয়েছে
            {job.cancelReason ? `: ${cancelReasonText(job.cancelReason)}` : "।"}
          </output>
        ) : null}

        {job.status === "DISPUTED" ? (
          <output className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            একজন অ্যাডমিন কাজটি পর্যালোচনা করছেন। সিদ্ধান্ত না আসা পর্যন্ত অপেক্ষা করুন।
          </output>
        ) : null}

        {/* A cancelled job has no actions. Everything else comes from allowedActions. */}
        {job.status !== "CANCELLED" ? (
          <div className="mt-8">
            <JobActions jobId={jobId} allowedActions={allowedActions} />
          </div>
        ) : null}
      </AppCard>
    </PageContainer>
  );
}

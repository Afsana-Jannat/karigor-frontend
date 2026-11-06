"use client";

import { ArrowLeft, CalendarDays, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/shared/app-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Money } from "@/components/shared/money";
import { PageContainer } from "@/components/shared/page-container";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMetaOptions } from "@/features/meta";
import { getApiErrorStatus } from "@/lib/apiClient";
import { formatDate, formatNumber } from "@/lib/format";
import { jobStatusLabels } from "@/lib/labels";
import { useSession } from "@/lib/session/use-session";
import { JobActions } from "../components/job-actions";
import { JobStatusStepper } from "../components/job-status-stepper";
import { useMyJobs } from "../queries";
import type { JobListItem } from "../types";

type JobDetailPageProps = { jobId: string };

function findJob(jobs: JobListItem[] | undefined, jobId: string) {
  return jobs?.find((job) => job.id === jobId);
}

/**
 * The backend currently exposes only the user's paginated job list, not
 * GET /jobs/:id. Render its available summary instead of calling an
 * unregistered endpoint.
 */
export default function JobDetailPage({ jobId }: JobDetailPageProps) {
  const { data: user } = useSession();
  const { skillName, areaName } = useMetaOptions();
  const { data, isPending, isError, error, refetch } = useMyJobs({
    page: 1,
    pageSize: 100,
  });

  if (isPending) {
    return (
      <PageContainer narrow>
        <LoadingState />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer narrow>
        {getApiErrorStatus(error) === 404 ? (
          <EmptyState text="কাজটি খুঁজে পাওয়া যায়নি।" />
        ) : (
          <ErrorState error={error} onRetry={() => refetch()} />
        )}
      </PageContainer>
    );
  }

  const job = findJob(data.items, jobId);
  if (!job) {
    return (
      <PageContainer narrow>
        <EmptyState
          text="কাজটি আপনার তালিকায় পাওয়া যায়নি।"
          action={
            <Link
              href="/jobs"
              className="inline-flex h-12 items-center rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-dark"
            >
              আমার কাজগুলো
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const isCustomer = user?.role === "CUSTOMER";

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
              কাজের সারাংশ
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brand">
              {skillName(job.skill)}
            </h1>
          </div>
          <StatusBadge labels={jobStatusLabels} status={job.status} />
        </div>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
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
          {job.counterpart ? (
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-slate-400" aria-hidden="true" />
              <dt className="sr-only">{isCustomer ? "কারিগর" : "গ্রাহক"}</dt>
              <dd>{job.counterpart.name}</dd>
            </div>
          ) : null}
        </dl>

        {job.agreedPrice !== null ? (
          <p className="mt-5 text-slate-500">
            নির্ধারিত দাম: <Money amount={job.agreedPrice} className="text-2xl" />
          </p>
        ) : null}

        {job.status === "OPEN" ? (
          <p className="mt-5 text-sm text-slate-600">
            {formatNumber(job.bidCount ?? 0)}টি প্রস্তাব এসেছে। কাজের বিবরণ ও প্রস্তাব
            দেখতে প্রস্তাবের তালিকা খুলুন।
          </p>
        ) : null}

        <div className="mt-8">
          <JobStatusStepper status={job.status} />
        </div>

        <div className="mt-8">
          <JobActions jobId={job.id} status={job.status} />
        </div>
      </AppCard>
    </PageContainer>
  );
}

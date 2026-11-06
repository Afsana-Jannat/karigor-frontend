"use client";

import {
  ArrowLeft,
  CalendarDays,
  FileSignature,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AppCard } from "@/components/shared/app-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Money } from "@/components/shared/money";
import { PageContainer } from "@/components/shared/page-container";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMetaOptions } from "@/features/meta";
import type { PaymentAttempt } from "@/features/workflow/api";
import { useJobPayments, useReportJob } from "@/features/workflow/queries";
import { getApiErrorStatus } from "@/lib/apiClient";
import { formatDate, formatNumber } from "@/lib/format";
import { jobStatusLabels, reportReasonLabels } from "@/lib/labels";
import { useSession } from "@/lib/session/use-session";
import {
  useCancelJob,
  useCompleteJob,
  useConfirmJob,
  useJob,
  useReviewJob,
} from "../queries";
import type { JobStatus } from "../types";

type JobDetailPageProps = { jobId: string };
type ReportReason = "NO_SHOW" | "POOR_WORK" | "OVERCHARGE" | "FRAUD" | "OTHER";

const paymentAttemptStatusLabels: Record<PaymentAttempt["status"], string> = {
  INITIATED: "অবস্থা যাচাই বাকি",
  SUCCESS: "সম্পন্ন",
  FAILED: "ব্যর্থ",
  CANCELLED: "বাতিল",
};

export default function JobDetailPage({ jobId }: JobDetailPageProps) {
  const { data: user } = useSession();
  const { skillName, areaName } = useMetaOptions();
  const { data: job, isPending, isError, error, refetch } = useJob(jobId);
  const payments = useJobPayments(
    jobId,
    job?.status === "AWAITING_CONFIRMATION" || job?.status === "COMPLETED",
  );
  const cancel = useCancelJob();
  const complete = useCompleteJob();
  const confirm = useConfirmJob();
  const review = useReviewJob();
  const report = useReportJob();
  const [cancelReason, setCancelReason] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("OTHER");
  const [reportDetails, setReportDetails] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (isPending)
    return (
      <PageContainer narrow>
        <LoadingState />
      </PageContainer>
    );
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
  if (!job)
    return (
      <PageContainer narrow>
        <EmptyState text="কাজটি খুঁজে পাওয়া যায়নি।" />
      </PageContainer>
    );

  const can = (action: string) => job.allowedActions?.[action] ?? false;
  const isCustomer = user?.role === "CUSTOMER";

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    report.mutate(
      {
        jobId,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      },
      { onSuccess: () => setReportOpen(false) },
    );
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    review.mutate({
      jobId,
      rating,
      comment: reviewComment.trim() || undefined,
    });
  }

  return (
    <PageContainer narrow>
      <Link
        href="/jobs"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> আমার কাজগুলো
      </Link>
      <AppCard className="shadow-xl shadow-blue-950/5 sm:p-9">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold tracking-wider text-accent">
              কাজের বিবরণ
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brand">
              {skillName(job.skill)}
            </h1>
          </div>
          <StatusBadge labels={jobStatusLabels} status={job.status} />
        </div>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-slate-400" />
            <dt className="sr-only">এলাকা</dt>
            <dd>{areaName(job.area)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-slate-400" />
            <dt className="sr-only">পছন্দের তারিখ</dt>
            <dd>{formatDate(job.preferredDate)}</dd>
          </div>
          {job.counterpart ? (
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-slate-400" />
              <dt className="sr-only">অন্য পক্ষ</dt>
              <dd>{job.counterpart.name}</dd>
            </div>
          ) : null}
          {job.counterpart?.phone ? (
            <a
              href={`tel:${job.counterpart.phone}`}
              className="flex items-center gap-2 text-brand"
            >
              <Phone className="size-4" />
              {job.counterpart.phone}
            </a>
          ) : null}
          {job.isEmergency ? (
            <div className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-700">
              জরুরি কাজ
            </div>
          ) : null}
        </dl>

        <section className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5">
          <h2 className="text-sm font-bold text-brand">কাজের বিবরণ</h2>
          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
            {job.description}
          </p>
        </section>

        {job.agreedPrice !== null ? (
          <p className="mt-5 text-slate-500">
            নির্ধারিত দাম: <Money amount={job.agreedPrice} className="text-2xl" />
          </p>
        ) : null}
        {job.status === "OPEN" ? (
          <p className="mt-4 text-sm text-slate-600">
            {formatNumber(job.bidCount)}টি প্রস্তাব এসেছে।
          </p>
        ) : null}

        <div className="mt-8">
          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${jobProgress(job.status)}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {jobStatusLabels[job.status]}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {job.status === "OPEN" && isCustomer && can("select_bid") ? (
            <Link
              href={`/jobs/${jobId}/bids`}
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              প্রস্তাব তুলনা করুন
            </Link>
          ) : null}
          {can("sign") || job.contract ? (
            <Link
              href={`/jobs/${jobId}/contract`}
              className={buttonVariants({ variant: "brand", size: "lg" })}
            >
              <FileSignature /> চুক্তি দেখুন ও স্বাক্ষর করুন
            </Link>
          ) : null}
          {can("complete") ? (
            <Button
              size="lg"
              disabled={complete.isPending}
              onClick={() => complete.mutate(jobId)}
            >
              কাজ সম্পন্ন হয়েছে
            </Button>
          ) : null}
          {can("confirm") && payments.data?.paid ? (
            <Button
              size="lg"
              disabled={confirm.isPending}
              onClick={() => confirm.mutate(jobId)}
            >
              কাজ ও পেমেন্ট নিশ্চিত করুন
            </Button>
          ) : null}
          {can("cancel") ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <input
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                maxLength={200}
                placeholder="বাতিলের কারণ (ঐচ্ছিক)"
                className="h-11 flex-1 rounded-xl border border-slate-200 px-3"
              />
              <Button
                variant="outline"
                disabled={cancel.isPending}
                onClick={() => {
                  if (window.confirm("কাজটি বাতিল করবেন?"))
                    cancel.mutate({
                      jobId,
                      reason: cancelReason.trim() || undefined,
                    });
                }}
              >
                কাজ বাতিল করুন
              </Button>
            </div>
          ) : null}
        </div>

        {job.status === "AWAITING_CONFIRMATION" ||
        job.status === "COMPLETED" ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h2 className="font-bold text-brand">পেমেন্টের অবস্থা</h2>
            {payments.isPending ? (
              <p className="mt-2 text-sm text-slate-600">
                পেমেন্টের তথ্য লোড হচ্ছে…
              </p>
            ) : null}
            {payments.isError ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p role="alert" className="text-sm text-red-700">
                  পেমেন্টের তথ্য লোড হয়নি।
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => payments.refetch()}
                >
                  আবার চেষ্টা করুন
                </Button>
              </div>
            ) : null}
            {payments.data?.paid ? (
              <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                পেমেন্ট সম্পন্ন ·{" "}
                {payments.data.method === "BKASH" ? "বিকাশ" : "নগদ"}
                {payments.data.amountPaid !== null
                  ? ` · ৳${payments.data.amountPaid.toLocaleString("bn-BD")}`
                  : ""}
              </p>
            ) : null}
            {payments.data && !payments.data.paid ? (
              <>
                <p className="mt-2 text-sm text-slate-700">
                  বকেয়া: ৳{payments.data.amountDue.toLocaleString("bn-BD")}
                </p>
                {payments.data.attempts.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {payments.data.attempts.map((attempt) => (
                      <li
                        key={attempt.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-sm"
                      >
                        <p className="font-semibold text-slate-800">
                          বিকাশ ·{" "}
                          {attempt.id === payments.data.attempts[0]?.id &&
                          attempt.status === "FAILED" &&
                          !payments.data.allowedActions.pay_bkash
                            ? "অবস্থা যাচাই বাকি"
                            : paymentAttemptStatusLabels[attempt.status]}
                          {" · ৳"}
                          {attempt.amount.toLocaleString("bn-BD")}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {formatDate(attempt.createdAt)}
                          {attempt.trxId ? ` · TrxID: ${attempt.trxId}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    এই কাজের জন্য এখনো কোনো পেমেন্ট পাওয়া যায়নি।
                  </p>
                )}
                {job.status === "AWAITING_CONFIRMATION" &&
                isCustomer &&
                payments.data.allowedActions.pay_bkash ? (
                  <Link
                    href={`/jobs/${jobId}/payment`}
                    className={`${buttonVariants({ variant: "accent", size: "lg" })} mt-4`}
                  >
                    {payments.data.attempts.length > 0
                      ? "আবার বিকাশে পেমেন্ট করুন"
                      : "বিকাশে পেমেন্ট করুন"}
                  </Link>
                ) : null}
                {job.status === "AWAITING_CONFIRMATION" &&
                isCustomer &&
                !payments.data.allowedActions.pay_bkash &&
                payments.data.attempts.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-sm text-amber-800">
                      আগের পেমেন্টের অবস্থা নিশ্চিত নয়। যাচাই না হওয়া পর্যন্ত আবার পেমেন্ট করবেন না।
                    </p>
                    <Link
                      href={`/payment/result?status=failure&jobId=${encodeURIComponent(jobId)}`}
                      className={`${buttonVariants({ variant: "outline", size: "lg" })} mt-3`}
                    >
                      পেমেন্টের অবস্থা যাচাই করুন
                    </Link>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}
        {job.status === "COMPLETED" ? (
          <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            কাজ সম্পন্ন হয়েছে। আপনার কাজের চূড়ান্ত অবস্থা এখানে দেখানো হচ্ছে।
          </p>
        ) : null}

        {can("report") || job.status === "DISPUTED" ? (
          <section className="mt-8 border-t border-slate-100 pt-6">
            <Button
              variant="outline"
              onClick={() => setReportOpen((open) => !open)}
            >
              <ShieldAlert /> সমস্যা রিপোর্ট করুন
            </Button>
            {reportOpen ? (
              <form
                onSubmit={submitReport}
                className="mt-4 space-y-3 rounded-2xl border border-red-100 bg-red-50/50 p-4"
              >
                <label className="block text-sm font-semibold">
                  সমস্যার ধরন
                  <select
                    value={reportReason}
                    onChange={(event) =>
                      setReportReason(event.target.value as ReportReason)
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                  >
                    {Object.entries(reportReasonLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  বিস্তারিত (ঐচ্ছিক)
                  <textarea
                    value={reportDetails}
                    onChange={(event) => setReportDetails(event.target.value)}
                    maxLength={500}
                    className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3"
                  />
                </label>
                <Button type="submit" disabled={report.isPending}>
                  রিপোর্ট জমা দিন
                </Button>
              </form>
            ) : null}
          </section>
        ) : null}

        {can("review") ? (
          <form
            onSubmit={submitReview}
            className="mt-8 border-t border-slate-100 pt-6"
          >
            <h2 className="font-bold text-brand">কাজের রিভিউ দিন</h2>
            <label className="mt-3 block text-sm font-semibold">
              রেটিং
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="ml-3 h-10 rounded-lg border border-slate-200 bg-white px-2"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} ★
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              maxLength={300}
              placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)"
              className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 p-3"
            />
            <Button type="submit" disabled={review.isPending}>
              রিভিউ জমা দিন
            </Button>
          </form>
        ) : null}
      </AppCard>
    </PageContainer>
  );
}

function jobProgress(status: JobStatus) {
  const progress: Record<JobStatus, number> = {
    OPEN: 12,
    CONTRACT_PENDING: 30,
    IN_PROGRESS: 55,
    AWAITING_CONFIRMATION: 78,
    COMPLETED: 100,
    CANCELLED: 100,
    DISPUTED: 88,
  };
  return progress[status];
}

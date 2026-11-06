"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import {
  useJobPayments,
  useReconcileBkashPayment,
} from "@/features/workflow/queries";

const verifiedNoncompletionReasons = new Set([
  "bKash payment initiation failed",
  "bKash payment verified not completed",
]);

function isVerifiedNoncompletion(attempt: {
  status: string;
  failureReason: string | null;
}) {
  return (
    (attempt.status === "FAILED" || attempt.status === "CANCELLED") &&
    verifiedNoncompletionReasons.has(attempt.failureReason ?? "")
  );
}

function paymentAttemptStatusLabel(attempt: {
  status: string;
  failureReason: string | null;
}) {
  switch (attempt.status) {
    case "SUCCESS":
      return "সফল";
    case "FAILED":
      return isVerifiedNoncompletion(attempt) ? "ব্যর্থ" : "যাচাই চলছে";
    case "CANCELLED":
      return isVerifiedNoncompletion(attempt) ? "বাতিল" : "যাচাই চলছে";
    default:
      return "যাচাই চলছে";
  }
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const jobId = searchParams.get("jobId");
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <PaymentResultQuery status={status} jobId={jobId} />
    </RequireAuth>
  );
}

function PaymentResultQuery({
  status,
  jobId,
}: {
  status: string | null;
  jobId: string | null;
}) {
  const router = useRouter();
  const payments = useJobPayments(jobId ?? "", Boolean(jobId));
  const reconcile = useReconcileBkashPayment();
  const latestAttempt = payments.data?.attempts[0];
  const canRetry = Boolean(
    !payments.data?.paid && payments.data?.allowedActions.pay_bkash,
  );

  useEffect(() => {
    if (jobId && payments.data?.paid) {
      router.replace(`/jobs/${encodeURIComponent(jobId)}`);
    }
  }, [jobId, payments.data?.paid, router]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-12">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-brand">পেমেন্টের অবস্থা</h1>
        {!jobId ? (
          <p className="mt-3 leading-7 text-slate-600">
            পেমেন্টের কাজটি খুঁজে পাওয়া যায়নি। আপনার কাজের তালিকা থেকে অবস্থা দেখুন।
          </p>
        ) : payments.isPending ? (
          <LoadingState />
        ) : payments.isError ? (
          <div className="mt-4">
            <ErrorState
              error={payments.error}
              onRetry={() => payments.refetch()}
            />
          </div>
        ) : (
          <>
            <p className="mt-3 leading-7 text-slate-600">
              {payments.data.paid
                ? `পেমেন্ট সফল হয়েছে · ${payments.data.method === "BKASH" ? "বিকাশ" : payments.data.method === "CASH" ? "নগদ" : "পরিশোধিত"}${payments.data.amountPaid !== null ? ` · ৳${payments.data.amountPaid.toLocaleString("bn-BD")}` : ""}`
                : latestAttempt &&
                    isVerifiedNoncompletion(latestAttempt) &&
                    latestAttempt.status === "FAILED"
                  ? "পেমেন্ট ব্যর্থ হয়েছে। সার্ভার নিশ্চিত করেছে যে লেনদেন সম্পন্ন হয়নি।"
                  : latestAttempt &&
                      isVerifiedNoncompletion(latestAttempt) &&
                      latestAttempt.status === "CANCELLED"
                    ? "পেমেন্ট বাতিল হয়েছে। সার্ভার নিশ্চিত করেছে যে লেনদেন সম্পন্ন হয়নি।"
                    : reconcile.data?.status === "FAILED"
                      ? "bKash নিশ্চিত করেছে যে পেমেন্ট সম্পন্ন হয়নি। নিরাপদে আবার পেমেন্ট করতে পারেন।"
                      : canRetry &&
                          (status === "failure" || status === "cancel")
                        ? "পেমেন্ট সম্পন্ন হয়নি। সার্ভারে কোনো অনিষ্পন্ন লেনদেন নেই—নিচের বাটন দিয়ে আবার চেষ্টা করতে পারেন।"
                        : status === "failure" || status === "success"
                          ? "পেমেন্টের ফলাফল এখনো সার্ভারে নিশ্চিত হয়নি। নিরাপত্তার জন্য আবার পেমেন্ট শুরু করা বন্ধ রাখা হয়েছে। নিচে এই কাজের পেমেন্ট রেকর্ড দেখুন বা রেকর্ড রিফ্রেশ করুন।"
                          : status === "cancel"
                            ? "পেমেন্ট বাতিলের তথ্য সার্ভারে এখনো নিশ্চিত হয়নি। অবস্থা যাচাই না হওয়া পর্যন্ত আবার পেমেন্ট করবেন না।"
                            : "সার্ভার পেমেন্টের ফলাফল নিশ্চিত করতে পারেনি। নিচে এই কাজের পেমেন্ট রেকর্ড দেখুন বা রেকর্ড রিফ্রেশ করুন।"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {payments.data.paid
                ? "পেমেন্টের অবস্থা সার্ভার থেকে নিশ্চিত করা হয়েছে।"
                : `Karigor-এ বকেয়া: ৳${payments.data.amountDue.toLocaleString("bn-BD")}`}
            </p>
            <section className="mt-6 rounded-2xl border border-slate-200 p-4 text-left">
              <h2 className="font-bold text-brand">এই কাজের পেমেন্ট ইতিহাস</h2>
              {payments.data.attempts.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  এই কাজের জন্য কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {payments.data.attempts.map((attempt) => (
                    <li key={attempt.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <span className="font-semibold">
                          {attempt.method === "BKASH" ? "বিকাশ" : "নগদ"} ·{" "}
                          {paymentAttemptStatusLabel(attempt)}
                        </span>
                        <span>৳{attempt.amount.toLocaleString("bn-BD")}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(attempt.createdAt).toLocaleString("bn-BD")}
                      </p>
                      {attempt.trxId ? (
                        <p className="mt-1 text-xs text-slate-600">
                          TrxID: {attempt.trxId}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500">
                        Karigor রেফারেন্স: {attempt.id}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
        {jobId ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/jobs/${encodeURIComponent(jobId)}`}
              className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 font-bold text-white"
            >
              কাজের অবস্থা দেখুন
            </Link>
            {canRetry ? (
              <Link
                href={`/jobs/${encodeURIComponent(jobId)}/payment`}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 font-bold text-brand"
              >
                আবার পেমেন্ট করুন
              </Link>
            ) : null}
            {!payments.data?.paid && !canRetry && !payments.isError ? (
              <button
                type="button"
                disabled={reconcile.isPending}
                onClick={() => reconcile.mutate(jobId)}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 font-bold text-brand"
              >
                {reconcile.isPending
                  ? "অবস্থা যাচাই হচ্ছে..."
                  : "বিকাশ পেমেন্টের অবস্থা যাচাই করুন"}
              </button>
            ) : null}
            {reconcile.data?.status === "PENDING" ? (
              <p className="w-full text-sm text-amber-700">
                bKash এখনো চূড়ান্ত ফল দেয়নি। একই পেমেন্ট আবার শুরু করবেন না; কিছুক্ষণ পরে
                আবার যাচাই করুন।
              </p>
            ) : null}
          </div>
        ) : (
          <Link
            href="/jobs"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 font-bold text-white"
          >
            আমার কাজগুলো
          </Link>
        )}
      </section>
    </main>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentResultContent />
    </Suspense>
  );
}

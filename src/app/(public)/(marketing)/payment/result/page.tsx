"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { useJobPayments } from "@/features/workflow/queries";

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
  const payments = useJobPayments(jobId ?? "", Boolean(jobId));

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
                ? `পেমেন্ট সফল হয়েছে · ${payments.data.method ?? "পরিশোধিত"} · ৳${payments.data.amountDue.toLocaleString("bn-BD")}`
                : status === "cancel"
                  ? "পেমেন্ট বাতিল হয়েছে। bKash Transaction History-তে টাকা কাটা হয়নি নিশ্চিত হলে আবার চেষ্টা করতে পারেন।"
                  : status === "success"
                    ? "bKash-এ সফল দেখালেও Karigor সার্ভার পেমেন্ট নিশ্চিত করতে পারেনি। আবার পেমেন্ট করবেন না; bKash Transaction History-তে লেনদেন যাচাই করে TrxID support/admin-কে দিন।"
                    : status === "failure"
                      ? "পেমেন্টের অবস্থা নিশ্চিত নয়। bKash Transaction History-তে টাকা কাটা হয়েছে কি না দেখুন। টাকা কাটা হয়ে থাকলে আবার পেমেন্ট করবেন না; TrxID support/admin-কে দিন।"
                      : "সার্ভার পেমেন্ট নিশ্চিত করতে পারেনি। bKash Transaction History-তে লেনদেন যাচাই করে তারপর পরবর্তী পদক্ষেপ নিন।"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {payments.data.paid
                ? "পেমেন্টের অবস্থা সার্ভার থেকে নিশ্চিত করা হয়েছে।"
                : `Karigor-এ বকেয়া দেখাচ্ছে: ৳${payments.data.amountDue.toLocaleString("bn-BD")}`}
            </p>
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
            {!payments.data?.paid && status === "cancel" ? (
              <Link
                href={`/jobs/${encodeURIComponent(jobId)}/payment`}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 font-bold text-brand"
              >
                আবার পেমেন্ট করুন
              </Link>
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

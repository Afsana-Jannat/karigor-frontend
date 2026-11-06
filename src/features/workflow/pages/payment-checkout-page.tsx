"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { useBkashPayment, useJobPayments } from "../queries";

export default function PaymentCheckoutPage({ jobId }: { jobId: string }) {
  const router = useRouter();
  const payments = useJobPayments(jobId);
  const checkout = useBkashPayment();
  const [notice, setNotice] = useState("");

  if (payments.isPending)
    return (
      <PageContainer narrow>
        <LoadingState />
      </PageContainer>
    );
  if (payments.isError)
    return (
      <PageContainer narrow>
        <ErrorState error={payments.error} onRetry={() => payments.refetch()} />
      </PageContainer>
    );

  if (payments.data.paid) {
    return (
      <PageContainer narrow>
        <section className="rounded-3xl border border-emerald-100 bg-white p-7 text-center shadow-sm">
          <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-extrabold text-brand">
            পেমেন্ট সম্পন্ন
          </h1>
          <p className="mt-2 text-slate-600">
            {formatMoney(payments.data.amountDue)} ·{" "}
            {payments.data.method === "BKASH" ? "বিকাশ" : "নগদ"}
          </p>
          <Button
            className="mt-5"
            onClick={() => router.push(`/jobs/${jobId}`)}
          >
            কাজে ফিরে যান
          </Button>
        </section>
      </PageContainer>
    );
  }

  const canPay = payments.data.allowedActions.pay_bkash;
  return (
    <PageContainer narrow>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-bold text-accent">নিরাপদ পেমেন্ট</p>
        <h1 className="mt-2 text-3xl font-extrabold text-brand">
          বিকাশে পেমেন্ট
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          নির্ধারিত কাজের মূল্য বিকাশের মাধ্যমে পরিশোধ করুন। পেমেন্টের পর কাজটি নিশ্চিত করতে
          হবে।
        </p>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">পরিশোধযোগ্য</p>
          <p className="mt-1 text-3xl font-extrabold text-brand">
            {formatMoney(payments.data.amountDue)}
          </p>
        </div>
        {notice ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {notice}
          </p>
        ) : null}
        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={!canPay || checkout.isPending}
          onClick={() =>
            checkout.mutate(jobId, {
              onSuccess: ({ bkashURL }) => {
                if (!bkashURL) {
                  setNotice("বিকাশ checkout link পাওয়া যায়নি। আবার চেষ্টা করুন।");
                  return;
                }
                window.location.assign(bkashURL);
              },
              onError: (error) =>
                setNotice(
                  error instanceof Error ? error.message : "পেমেন্ট শুরু করা যায়নি।",
                ),
            })
          }
        >
          {checkout.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {canPay ? "বিকাশে এগিয়ে যান" : "এই মুহূর্তে পেমেন্ট করা যাবে না"}
        </Button>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          পেমেন্ট কেবল backend থেকে নির্ধারিত কাজের মূল্যেই হবে। রিফান্ড এই সংস্করণে
          সমর্থিত নয়।
        </p>
      </section>
    </PageContainer>
  );
}

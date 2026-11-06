"use client";

import { HandCoins } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { useOpenJobs } from "@/features/jobs/queries";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { bidStatusLabels } from "@/lib/labels";

function MyBidsContent() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useOpenJobs({
    page,
    pageSize: 20,
  });
  const myBids = data?.items.filter((job) => job.myBid) ?? [];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="কারিগরের কাজ"
        title="আমার প্রস্তাবগুলো"
        description="আপনার সক্রিয় ও প্রত্যাহার করা প্রস্তাবের অবস্থা দেখুন।"
      />
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : myBids.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          text="এই পাতার কাজগুলোতে আপনার কোনো প্রস্তাব নেই।"
          action={
            <Link
              href="/jobs/open"
              className="rounded-xl bg-brand px-4 py-3 font-bold text-white"
            >
              খোলা কাজ দেখুন
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {myBids.map((job) => (
              <article
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <p className="font-bold text-brand">
                    {job.customerName} · {formatDate(job.preferredDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatNumber(job.bidCount)}টি প্রস্তাব
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-cta">
                      {formatMoney(job.myBid?.price ?? 0)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {job.myBid ? bidStatusLabels[job.myBid.status] : ""}
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-brand"
                  >
                    কাজ দেখুন
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </PageContainer>
  );
}

export default function MyBidsPage() {
  return (
    <RequireAuth roles={["TECHNICIAN"]}>
      <MyBidsContent />
    </RequireAuth>
  );
}

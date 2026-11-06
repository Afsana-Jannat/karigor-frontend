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
import { useMyBids } from "@/features/jobs/queries";
import { useMetaOptions } from "@/features/meta";
import { formatDate, formatMoney } from "@/lib/format";
import { bidStatusLabels } from "@/lib/labels";

function MyBidsContent() {
  const [page, setPage] = useState(1);
  const { skillName, areaName } = useMetaOptions();
  const { data, isPending, isError, error, refetch } = useMyBids({
    page,
    pageSize: 20,
  });

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
      ) : data.items.length === 0 ? (
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
            {data.items.map((bid) => (
              <article
                key={bid.bidId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <p className="font-bold text-brand">
                    {skillName(bid.job.skill)} · {areaName(bid.job.area)} ·{" "}
                    {formatDate(bid.job.preferredDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {bidStatusLabels[bid.status] ?? bid.status}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-cta">
                      {formatMoney(bid.price)}
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${bid.job.id}`}
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

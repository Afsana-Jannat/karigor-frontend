"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { useMyReports } from "@/features/workflow/queries";
import { formatDate } from "@/lib/format";
import { reportReasonLabels, reportStatusLabels } from "@/lib/labels";

function MyReportsContent() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useMyReports(page);
  return (
    <PageContainer>
      <PageHeader
        eyebrow="সহায়তা"
        title="আমার রিপোর্ট"
        description="আপনার জমা দেওয়া সমস্যা ও সমাধানের অবস্থা দেখুন।"
      />
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={ShieldAlert} text="আপনি এখনো কোনো রিপোর্ট জমা দেননি।" />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h2 className="font-bold text-brand">
                    {reportReasonLabels[report.reason] ?? report.reason}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                    {reportStatusLabels[report.status] ?? report.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  জমা: {formatDate(report.createdAt)}
                </p>
                {report.resolution ? (
                  <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                    {report.resolution}
                  </p>
                ) : null}
                <Link
                  href={`/jobs/${report.jobId}`}
                  className="mt-3 inline-flex text-sm font-bold text-brand hover:underline"
                >
                  কাজ দেখুন
                </Link>
              </article>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </PageContainer>
  );
}

export default function MyReportsPage() {
  return (
    <RequireAuth>
      <MyReportsContent />
    </RequireAuth>
  );
}

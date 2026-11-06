"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  useAdminReports,
  useResolveAdminReport,
} from "@/features/admin/queries";

function AdminReportsContent() {
  const [status, setStatus] = useState("OPEN");
  const [page, setPage] = useState(1);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<
    Record<string, "COMPLETE" | "CANCEL" | "DISMISS">
  >({});
  const { data, isPending, isError, error, refetch } = useAdminReports(
    status,
    page,
  );
  const resolve = useResolveAdminReport();
  return (
    <PageContainer>
      <PageHeader
        eyebrow="অ্যাডমিন"
        title="রিপোর্ট পর্যালোচনা"
        description="রিপোর্টের সিদ্ধান্ত লিখলে সংশ্লিষ্ট কাজের অবস্থাও পরিবর্তিত হতে পারে।"
      />
      <label className="mb-5 block text-sm font-semibold">
        অবস্থা
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="ml-3 h-10 rounded-lg border border-slate-200 bg-white px-3"
        >
          <option value="OPEN">খোলা</option>
          <option value="RESOLVED">সমাধান হয়েছে</option>
          <option value="DISMISSED">খারিজ</option>
        </select>
      </label>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState text="কোনো রিপোর্ট নেই।" />
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h2 className="font-bold text-brand">
                    {report.reason} · কাজ {report.jobId}
                  </h2>
                  <span className="text-sm text-slate-500">
                    {report.status}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  {report.details || "বিস্তারিত দেওয়া হয়নি"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  গ্রাহক: {report.customerName} · কারিগর: {report.technicianName}
                </p>
                {report.status === "OPEN" ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      resolve.mutate({
                        id: report.id,
                        decision: decisions[report.id] ?? "DISMISS",
                        resolution: resolutions[report.id]?.trim() ?? "",
                      });
                    }}
                    className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]"
                  >
                    <select
                      value={decisions[report.id] ?? "DISMISS"}
                      onChange={(event) =>
                        setDecisions((current) => ({
                          ...current,
                          [report.id]: event.target.value as
                            | "COMPLETE"
                            | "CANCEL"
                            | "DISMISS",
                        }))
                      }
                      className="h-11 rounded-xl border border-slate-200 px-3"
                    >
                      <option value="COMPLETE">কাজ সম্পন্ন</option>
                      <option value="CANCEL">কাজ বাতিল</option>
                      <option value="DISMISS">রিপোর্ট খারিজ</option>
                    </select>
                    <input
                      value={resolutions[report.id] ?? ""}
                      onChange={(event) =>
                        setResolutions((current) => ({
                          ...current,
                          [report.id]: event.target.value,
                        }))
                      }
                      minLength={5}
                      maxLength={300}
                      required
                      placeholder="সমাধানের বিবরণ (৫–৩০০ অক্ষর)"
                      className="h-11 rounded-xl border border-slate-200 px-3"
                    />
                    <Button
                      type="submit"
                      disabled={
                        resolve.isPending ||
                        (resolutions[report.id]?.trim().length ?? 0) < 5
                      }
                    >
                      সিদ্ধান্ত সংরক্ষণ
                    </Button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </PageContainer>
  );
}

export default function AdminReportsPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AdminReportsContent />
    </RequireAuth>
  );
}

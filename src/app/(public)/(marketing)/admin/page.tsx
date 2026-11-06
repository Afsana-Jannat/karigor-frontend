"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/require-auth";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminStats } from "@/features/admin/queries";
import { formatMoney, formatNumber } from "@/lib/format";

function AdminHome() {
  const { data, isPending, isError, error, refetch } = useAdminStats();
  const averageBidCount =
    data?.openJobs.averageBidCount ?? data?.openJobs.avgBidCount;
  return (
    <PageContainer>
      <PageHeader
        eyebrow="অ্যাডমিন"
        title="অ্যাডমিন ড্যাশবোর্ড"
        description="প্ল্যাটফর্মের ব্যবহারকারী, কাজ, যাচাই ও রিপোর্ট পরিচালনা করুন।"
      />
      <nav className="mb-6 flex flex-wrap gap-2">
        {[
          ["/admin/verifications", "পরিচয় যাচাই"],
          ["/admin/users", "ব্যবহারকারী"],
          ["/admin/jobs", "কাজ"],
          ["/admin/reports", "রিপোর্ট"],
          ["/admin/audit-logs", "অডিট লগ"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-brand hover:bg-slate-50"
          >
            {label}
          </Link>
        ))}
      </nav>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            title="নতুন ব্যবহারকারী (৭ দিন)"
            value={formatNumber(data.newUsersLast7Days)}
          />
          <Stat title="খোলা রিপোর্ট" value={formatNumber(data.openReports)} />
          <Stat
            title="মোট পরিশোধিত"
            value={formatMoney(data.totalPaidAmount)}
          />
          <Stat
            title="খোলা কাজ"
            value={`${formatNumber(data.openJobs.count)} · গড় বিড ${averageBidCount == null ? "—" : averageBidCount.toFixed(1)}`}
          />
          {Object.entries(data.usersByRole).map(([role, count]) => (
            <Stat
              key={`user-${role}`}
              title={`ব্যবহারকারী · ${role}`}
              value={formatNumber(count)}
            />
          ))}
          {Object.entries(data.techniciansByVerifyStatus).map(
            ([status, count]) => (
              <Stat
                key={`verify-${status}`}
                title={`কারিগর · ${status}`}
                value={formatNumber(count)}
              />
            ),
          )}
          {Object.entries(data.jobsByStatus).map(([status, count]) => (
            <Stat
              key={`job-${status}`}
              title={`কাজ · ${status}`}
              value={formatNumber(count)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-extrabold text-brand">{value}</p>
    </article>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AdminHome />
    </RequireAuth>
  );
}

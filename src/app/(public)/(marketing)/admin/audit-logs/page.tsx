"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { useAuditLogs } from "@/features/admin/queries";

function AuditLogsContent() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useAuditLogs(page);
  return (
    <PageContainer>
      <PageHeader
        eyebrow="অ্যাডমিন"
        title="অডিট লগ"
        description="অ্যাডমিনদের সাম্প্রতিক কার্যকলাপ।"
      />
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState text="কোনো অডিট লগ নেই।" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4">সময়</th>
                  <th className="p-4">অ্যাডমিন</th>
                  <th className="p-4">কাজ</th>
                  <th className="p-4">সংশ্লিষ্ট রেকর্ড</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="p-4">
                      {new Date(log.createdAt).toLocaleString("bn-BD")}
                    </td>
                    <td className="p-4">{log.adminName}</td>
                    <td className="p-4 font-semibold">{log.action}</td>
                    <td className="p-4">
                      {log.entityType} · {log.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </PageContainer>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AuditLogsContent />
    </RequireAuth>
  );
}

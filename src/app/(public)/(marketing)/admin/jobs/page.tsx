"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { useAdminJobs } from "@/features/admin/queries";

function AdminJobsContent() {
  const [status, setStatus] = useState("");
  const [skill, setSkill] = useState("");
  const [area, setArea] = useState("");
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useAdminJobs({
    status: status || undefined,
    skill: skill || undefined,
    area: area || undefined,
    page,
  });
  return (
    <PageContainer>
      <PageHeader
        eyebrow="অ্যাডমিন"
        title="কাজ পর্যবেক্ষণ"
        description="কাজের অবস্থা, দক্ষতা ও এলাকা অনুযায়ী তালিকা ফিল্টার করুন।"
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <input
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          placeholder="অবস্থা"
          className="h-11 rounded-xl border border-slate-200 bg-white px-3"
        />
        <input
          value={skill}
          onChange={(event) => {
            setSkill(event.target.value);
            setPage(1);
          }}
          placeholder="দক্ষতার slug"
          className="h-11 rounded-xl border border-slate-200 bg-white px-3"
        />
        <input
          value={area}
          onChange={(event) => {
            setArea(event.target.value);
            setPage(1);
          }}
          placeholder="এলাকার slug"
          className="h-11 rounded-xl border border-slate-200 bg-white px-3"
        />
      </div>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState text="কোনো কাজ পাওয়া যায়নি।" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4">দক্ষতা / এলাকা</th>
                  <th className="p-4">গ্রাহক</th>
                  <th className="p-4">কারিগর</th>
                  <th className="p-4">অবস্থা</th>
                  <th className="p-4">মূল্য</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((job) => (
                  <tr key={job.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-bold text-brand underline"
                      >
                        {job.skill} · {job.area}
                      </Link>
                    </td>
                    <td className="p-4">{job.customer.name}</td>
                    <td className="p-4">
                      {job.technician?.name ?? "নির্ধারিত নয়"}
                    </td>
                    <td className="p-4">{job.status}</td>
                    <td className="p-4">
                      {job.agreedPrice?.toLocaleString("bn-BD") ?? "—"}
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

export default function AdminJobsPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AdminJobsContent />
    </RequireAuth>
  );
}

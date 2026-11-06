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
import { useAdminUsers } from "@/features/admin/queries";

function UsersContent() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useAdminUsers({
    q: q.trim() || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
  });
  return (
    <PageContainer>
      <PageHeader
        eyebrow="অ্যাডমিন"
        title="ব্যবহারকারী পরিচালনা"
        description="নাম, ফোন, ভূমিকা ও অ্যাকাউন্টের অবস্থা দিয়ে খুঁজুন।"
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <input
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setPage(1);
          }}
          placeholder="নাম বা ফোন"
          className="h-11 rounded-xl border border-slate-200 bg-white px-3"
        />
        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3"
        >
          <option value="">সব ভূমিকা</option>
          <option value="CUSTOMER">গ্রাহক</option>
          <option value="TECHNICIAN">কারিগর</option>
          <option value="ADMIN">অ্যাডমিন</option>
        </select>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3"
        >
          <option value="">সব অবস্থা</option>
          <option value="ACTIVE">সক্রিয়</option>
          <option value="BLOCKED">ব্লকড</option>
          <option value="DELETED">মুছে ফেলা</option>
        </select>
      </div>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState text="কোনো ব্যবহারকারী পাওয়া যায়নি।" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4">নাম / ফোন</th>
                  <th className="p-4">ভূমিকা</th>
                  <th className="p-4">অবস্থা</th>
                  <th className="p-4">যোগ দিয়েছেন</th>
                  <th className="p-4">বিস্তারিত</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold text-brand">
                      {user.name}
                      <small className="block font-normal text-slate-500">
                        {user.phone}
                      </small>
                    </td>
                    <td className="p-4">{user.role}</td>
                    <td className="p-4">{user.status}</td>
                    <td className="p-4">
                      {new Date(user.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                    <td className="p-4">
                      <Link
                        className="font-bold text-brand underline"
                        href={`/admin/users/${user.id}`}
                      >
                        খুলুন
                      </Link>
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

export default function AdminUsersPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <UsersContent />
    </RequireAuth>
  );
}

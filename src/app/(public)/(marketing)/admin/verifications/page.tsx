"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { useVerificationQueue } from "@/features/admin/queries";

function VerificationQueue() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const { data, isPending, isError, error, refetch } = useVerificationQueue(
    status,
    page,
  );
  return (
    <PageContainer>
      <PageHeader
        eyebrow="অ্যাডমিন"
        title="কারিগর যাচাই"
        description="পরিচয় যাচাইয়ের আবেদনের তালিকা।"
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
          <option value="PENDING">পর্যালোচনাধীন</option>
          <option value="VERIFIED">যাচাইকৃত</option>
          <option value="REJECTED">প্রত্যাখ্যাত</option>
        </select>
      </label>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState text="এই অবস্থায় কোনো আবেদন নেই।" />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {data.items.map((item) => (
              <Link
                key={item.id}
                href={`/admin/verifications/${item.id}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md"
              >
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="size-14 rounded-xl object-cover"
                  />
                ) : null}
                <span>
                  <strong className="block text-brand">{item.name}</strong>
                  <small className="text-slate-500">
                    {item.submittedAt
                      ? new Date(item.submittedAt).toLocaleDateString("bn-BD")
                      : ""}
                  </small>
                </span>
              </Link>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </PageContainer>
  );
}

export default function VerificationsPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <VerificationQueue />
    </RequireAuth>
  );
}

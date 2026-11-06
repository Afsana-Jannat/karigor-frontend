"use client";

import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import {
  useAdminVerification,
  useApproveVerification,
  useRejectVerification,
} from "@/features/admin/queries";

function VerificationDetail({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useAdminVerification(id);
  const approve = useApproveVerification();
  const reject = useRejectVerification();
  const [reason, setReason] = useState("");
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!data) return null;
  return (
    <PageContainer narrow>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-extrabold text-brand">
          {data.name} · পরিচয় যাচাই
        </h1>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="ফোন" value={data.phone} />
          <Info label="বয়স" value={String(data.age)} />
          <Info label="অভিজ্ঞতা" value={`${data.experienceYears} বছর`} />
          <Info label="অবস্থা" value={data.verifyStatus} />
          <Info label="কাজ" value={data.skills.join(", ")} />
          <Info label="এলাকা" value={data.areas.join(", ")} />
        </dl>
        <a
          href={data.photoUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block text-sm font-bold text-brand underline"
        >
          প্রোফাইল ছবি খুলুন
        </a>
        <a
          href={data.nidUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-5 inline-block text-sm font-bold text-brand underline"
        >
          ব্যক্তিগত এনআইডি ছবি খুলুন
        </a>
        {data.verifyStatus === "PENDING" ? (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <Button
              disabled={approve.isPending}
              onClick={() => approve.mutate(id)}
            >
              যাচাই অনুমোদন
            </Button>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                reject.mutate({ id, reason: reason.trim() });
              }}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={5}
                maxLength={200}
                required
                placeholder="প্রত্যাখ্যানের কারণ"
                className="h-11 flex-1 rounded-xl border border-slate-200 px-3"
              />
              <Button
                type="submit"
                variant="destructive"
                disabled={reject.isPending || reason.trim().length < 5}
              >
                প্রত্যাখ্যান
              </Button>
            </form>
          </div>
        ) : null}
      </section>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export default function VerificationDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerificationDetailRoute />
    </Suspense>
  );
}

function VerificationDetailRoute() {
  const { technicianId } = useParams<{ technicianId: string }>();
  return (
    <RequireAuth roles={["ADMIN"]}>
      <VerificationDetail id={technicianId} />
    </RequireAuth>
  );
}

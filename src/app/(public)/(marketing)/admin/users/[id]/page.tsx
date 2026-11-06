"use client";

import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { useAdminUser, useSetUserBlocked } from "@/features/admin/queries";

function AdminUserDetail({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useAdminUser(id);
  const mutation = useSetUserBlocked();
  const [reason, setReason] = useState("");
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!data) return null;
  const user = (data.user ?? data) as Record<string, unknown>;
  const userId = String(user.id ?? id);
  const status = String(user.status ?? "");
  const blocked = status === "BLOCKED";
  return (
    <PageContainer narrow>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-extrabold text-brand">
          {String(user.name ?? "ব্যবহারকারী")}
        </h1>
        <p className="mt-1 text-slate-500">{String(user.phone ?? "")}</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {Object.entries(user)
            .filter(
              ([key, value]) =>
                ["role", "status", "createdAt"].includes(key) &&
                value !== undefined,
            )
            .map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm text-slate-500">{key}</dt>
                <dd className="font-semibold">{String(value)}</dd>
              </div>
            ))}
        </dl>
        <section className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          {Object.entries(data)
            .filter(([key]) => key !== "user")
            .map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-slate-500">{key}</p>
                <pre className="mt-1 overflow-auto text-xs">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
        </section>
        {user.role !== "ADMIN" && status !== "DELETED" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({
                id: userId,
                blocked: !blocked,
                reason: reason.trim(),
              });
            }}
            className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5"
          >
            <label className="text-sm font-bold">
              {blocked ? "অ্যাকাউন্ট সচল করার কারণ" : "ব্লক করার কারণ"}
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={5}
                maxLength={200}
                required
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal"
              />
            </label>
            <Button
              type="submit"
              variant={blocked ? "default" : "destructive"}
              disabled={mutation.isPending || reason.trim().length < 5}
            >
              {blocked ? "অ্যাকাউন্ট সচল করুন" : "অ্যাকাউন্ট ব্লক করুন"}
            </Button>
          </form>
        ) : null}
      </section>
    </PageContainer>
  );
}

export default function AdminUserDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminUserDetailRoute />
    </Suspense>
  );
}

function AdminUserDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AdminUserDetail id={id} />
    </RequireAuth>
  );
}

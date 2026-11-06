"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
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
  useNotifications,
  useReadAllNotifications,
  useReadNotification,
} from "@/features/workflow/queries";
import { formatDate } from "@/lib/format";

const notificationText: Record<string, string> = {
  JOB_POSTED: "আপনার এলাকার নতুন কাজ পোস্ট হয়েছে।",
  BID_RECEIVED: "আপনার কাজে নতুন প্রস্তাব এসেছে।",
  BID_SELECTED: "আপনার প্রস্তাবটি নির্বাচিত হয়েছে।",
  BID_REJECTED: "এই কাজের জন্য অন্য প্রস্তাব নির্বাচন করা হয়েছে।",
  CONTRACT_SIGNED: "চুক্তিতে স্বাক্ষর সম্পন্ন হয়েছে।",
  JOB_COMPLETED: "কারিগর কাজ সম্পন্ন করেছেন।",
  JOB_CONFIRMED: "গ্রাহক কাজটি নিশ্চিত করেছেন।",
  PAYMENT_RECEIVED: "পেমেন্ট সম্পন্ন হয়েছে।",
  JOB_CANCELLED: "কাজটি বাতিল হয়েছে।",
  VERIFICATION_RESULT: "আপনার পরিচয় যাচাইয়ের অবস্থা আপডেট হয়েছে।",
};

function NotificationsContent() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isPending, isError, error, refetch } = useNotifications(
    page,
    unreadOnly,
  );
  const readOne = useReadNotification();
  const readAll = useReadAllNotifications();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="বিজ্ঞপ্তি"
        title="আপনার আপডেট"
        description="কাজ, প্রস্তাব, চুক্তি ও প্রোফাইলের নতুন খবর এখানে দেখুন।"
        actions={
          <Button
            variant="outline"
            disabled={!data?.meta.total || readAll.isPending}
            onClick={() => readAll.mutate()}
          >
            <CheckCheck /> সব পড়া হয়েছে
          </Button>
        }
      />
      <label className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(event) => {
            setUnreadOnly(event.target.checked);
            setPage(1);
          }}
        />
        শুধু অপঠিত
      </label>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          text={
            unreadOnly ? "কোনো অপঠিত বিজ্ঞপ্তি নেই।" : "এখনো কোনো বিজ্ঞপ্তি নেই।"
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((item) => (
              <article
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 ${item.readAt ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/50"}`}
              >
                <div>
                  <p className="font-semibold text-brand">
                    {notificationText[item.type] ??
                      "আপনার অ্যাকাউন্টে একটি আপডেট এসেছে।"}
                  </p>
                  <time className="mt-1 block text-xs text-slate-500">
                    {formatDate(item.createdAt)}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  {item.jobId ? (
                    <Link
                      href={`/jobs/${item.jobId}`}
                      className="rounded-lg px-3 py-2 text-sm font-bold text-brand hover:bg-white"
                    >
                      কাজ দেখুন
                    </Link>
                  ) : null}
                  {!item.readAt ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={readOne.isPending}
                      onClick={() => readOne.mutate(item.id)}
                    >
                      পড়েছি
                    </Button>
                  ) : null}
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

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}

"use client";

import { Briefcase, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { buttonVariants } from "@/components/ui/button";
import { getApiErrorStatus } from "@/lib/apiClient";
import { OpenJobCard } from "../components/open-job-card";
import { useOpenJobs } from "../queries";

// TODO(Rabbi): confirm this route with Mohebul. The guide says a 409 here
// means "no technician profile yet", so we send the user to onboarding.
const ONBOARDING_HREF = "/technician/onboarding";

function readPage(value: string | null) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Open jobs for technicians: /jobs/open. Refetches every 60 seconds. */
export default function OpenJobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = readPage(searchParams.get("page"));

  const { data, isPending, isError, error, refetch } = useOpenJobs({
    page,
    pageSize: 10,
  });

  function changePage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next > 1) params.set("page", String(next));
    else params.delete("page");
    const text = params.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="খোলা কাজ"
        title="আপনার জন্য খোলা কাজ"
        description="আপনার দক্ষতা ও এলাকার সাথে মেলে এমন কাজে প্রস্তাব দিন।"
      />

      {isPending ? (
        <LoadingState />
      ) : isError && getApiErrorStatus(error) === 409 ? (
        // 409 is not a failure: the technician simply has no profile yet.
        <EmptyState
          icon={UserRoundCog}
          text="খোলা কাজ দেখতে আগে আপনার কারিগর প্রোফাইল সম্পূর্ণ করুন।"
          action={
            <Link
              href={ONBOARDING_HREF}
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              প্রোফাইল সম্পূর্ণ করুন
            </Link>
          }
        />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          text="এই মুহূর্তে আপনার জন্য কোনো খোলা কাজ নেই। একটু পরে আবার দেখুন।"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((job) => (
              <OpenJobCard
                key={job.id}
                job={job}
                // TODO(Samir): replace this placeholder with
                // <PlaceBidForm jobId={job.id} myBid={job.myBid} /> and
                // <WithdrawBidButton /> once features/bids is merged.
                bidSlot={
                  <p className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-xs text-slate-500">
                    প্রস্তাব দেওয়ার ফর্ম এখানে বসবে (Samir)
                  </p>
                }
              />
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={changePage} />
        </>
      )}
    </PageContainer>
  );
}

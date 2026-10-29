import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { LoadingState } from "@/components/shared/loading-state";
import BidsPageClient from "./bids-page-client";

type JobBidsPageProps = {
  params: Promise<{ id: string }>;
};

export default function JobBidsPage({ params }: JobBidsPageProps) {
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <Suspense fallback={<LoadingState />}>
        <ResolvedBidsPage params={params} />
      </Suspense>
    </RequireAuth>
  );
}

async function ResolvedBidsPage({ params }: JobBidsPageProps) {
  const { id } = await params;
  // TODO(Samir): when features/bids is merged, replace the body of
  // BidsPageClient with <BidComparisonList jobId={id} canSelect /> and pass
  // <SelectBidButton /> from features/contracts as its select action.
  return <BidsPageClient jobId={id} />;
}

import { Suspense } from "react";
import BidsPageClient from "./bids-page-client";

type JobBidsPageProps = {
  params: Promise<{ id: string }>;
};

export default function JobBidsPage({ params }: JobBidsPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f8fafc] px-5 py-20 text-center text-slate-500">
          প্রস্তাবের পেজ লোড হচ্ছে…
        </main>
      }
    >
      <ResolvedBidsPage params={params} />
    </Suspense>
  );
}

async function ResolvedBidsPage({ params }: JobBidsPageProps) {
  const { id } = await params;
  return <BidsPageClient jobId={id} />;
}

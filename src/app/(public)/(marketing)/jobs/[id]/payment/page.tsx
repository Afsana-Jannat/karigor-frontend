import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { LoadingState } from "@/components/shared/loading-state";
import PaymentCheckoutPage from "@/features/workflow/pages/payment-checkout-page";

type PaymentRouteProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PaymentRouteProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResolvedPage params={params} />
    </Suspense>
  );
}

async function ResolvedPage({ params }: PaymentRouteProps) {
  const { id } = await params;
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <PaymentCheckoutPage jobId={id} />
    </RequireAuth>
  );
}

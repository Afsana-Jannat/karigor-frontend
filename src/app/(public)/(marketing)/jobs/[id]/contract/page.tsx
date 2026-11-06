import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { LoadingState } from "@/components/shared/loading-state";
import ContractPage from "@/features/contracts/pages/contract-page";

type ContractRouteProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: ContractRouteProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResolvedPage params={params} />
    </Suspense>
  );
}

async function ResolvedPage({ params }: ContractRouteProps) {
  const { id } = await params;
  return (
    <RequireAuth roles={["CUSTOMER", "TECHNICIAN", "ADMIN"]}>
      <ContractPage jobId={id} />
    </RequireAuth>
  );
}

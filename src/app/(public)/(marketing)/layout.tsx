import { type ReactNode, Suspense } from "react";
import SiteHeader from "@/components/layout/site-header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16" aria-hidden="true" />}>
        <SiteHeader />
      </Suspense>
      {children}
    </>
  );
}

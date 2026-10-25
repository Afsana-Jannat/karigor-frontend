import type { ReactNode } from "react";
import SiteHeader from "@/components/layout/site-header";
import { Toaster } from "sonner";
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
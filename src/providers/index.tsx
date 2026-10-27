"use client";

import type { ReactNode } from "react";
import AuthSessionProvider from "./auth-session.provider";
import QueryProvider from "./query.provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </QueryProvider>
  );
}

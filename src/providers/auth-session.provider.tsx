"use client";

import { type ReactNode, useEffect } from "react";
import { getApiErrorStatus, refreshAccessToken } from "@/lib/apiClient";

export default function AuthSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    let isActive = true;
    void refreshAccessToken().catch((error: unknown) => {
      if (!isActive || getApiErrorStatus(error) === 401) {
        return;
      }
      console.error("Unable to restore the Karigor session.", error);
    });

    return () => {
      isActive = false;
    };
  }, []);

  return children;
}

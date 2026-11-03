"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCurrentUser,
  type SignedInUser,
} from "@/features/auth/current-user";
import { getApiErrorStatus, refreshAccessToken } from "@/lib/apiClient";

export const sessionKey = ["session"] as const;

async function loadSession(): Promise<SignedInUser | null> {
  try {
    await refreshAccessToken();
    return await getCurrentUser();
  } catch (error) {
    if (getApiErrorStatus(error) === 401) {
      return null;
    }
    throw error;
  }
}

// One session for the whole app: the user, or null when logged out.
export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: loadSession,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}
"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/features/workflow/queries";
import { formatNumber } from "@/lib/format";

export default function NotificationBell() {
  const { data } = useNotifications(1, true);
  const unread = data?.meta.total ?? 0;
  return (
    <Link
      href="/notifications"
      aria-label={unread ? `বিজ্ঞপ্তি, অপঠিত ${unread}টি` : "বিজ্ঞপ্তি"}
      className="relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-brand transition hover:bg-slate-50"
    >
      <Bell className="size-5" aria-hidden="true" />
      {unread > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-5 text-white">
          {formatNumber(unread)}
        </span>
      ) : null}
    </Link>
  );
}

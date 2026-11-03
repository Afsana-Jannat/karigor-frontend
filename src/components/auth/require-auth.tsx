"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import type { SignedInUser } from "@/features/auth/current-user";
import { useSession } from "@/lib/session/use-session";

type RequireAuthProps = {
  children: ReactNode;
  roles?: SignedInUser["role"][];
};

function Spinner() {
  return (
    <div className="flex min-h-80 items-center justify-center">
      <LoaderCircle className="animate-spin text-[#103963]" size={30} />
      <span className="sr-only">লোড হচ্ছে</span>
    </div>
  );
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isPending, isError, refetch } = useSession();

  useEffect(() => {
    if (!isPending && !isError && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, isError, user, pathname, router]);

  if (isError) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center">
        <CircleAlert className="mx-auto text-red-500" size={30} />
        <h2 className="mt-4 font-bold text-[#103963]">
          লগইন যাচাই করা যায়নি
        </h2>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-5 rounded-xl bg-[#103963] px-4 py-2.5 text-sm font-bold text-white"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (isPending || !user) {
    return <Spinner />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center">
        <h2 className="font-bold text-[#103963]">এই পাতাটি পাওয়া যায়নি</h2>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-xl bg-[#103963] px-4 py-2.5 text-sm font-bold text-white"
        >
          হোমে ফিরুন
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
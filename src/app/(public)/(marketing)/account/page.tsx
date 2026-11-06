"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/apiClient";
import { logoutAccount } from "@/lib/auth";
import { sessionKey, useSession } from "@/lib/session/use-session";

function AccountContent() {
  const { data: user } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function logoutEverywhere() {
    setLoggingOut(true);
    setError("");
    try {
      await logoutAccount();
      qc.clear();
      qc.setQueryData(sessionKey, null);
      router.replace("/");
      router.refresh();
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <PageContainer narrow>
      <PageHeader
        eyebrow="অ্যাকাউন্ট"
        title="অ্যাকাউন্ট সেটিংস"
        description="আপনার অ্যাকাউন্টের তথ্য দেখুন এবং নিরাপত্তা পরিচালনা করুন।"
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="font-bold text-brand">ব্যক্তিগত তথ্য</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-500">নাম</dt>
            <dd className="mt-1">{user?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">ফোন নম্বর</dt>
            <dd className="mt-1">{user?.phone ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="font-bold text-brand">নিরাপত্তা</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          এই ডিভাইসের বর্তমান সেশন বন্ধ হবে।
        </p>
        <Button
          className="mt-4"
          variant="outline"
          disabled={loggingOut}
          onClick={logoutEverywhere}
        >
          <LogOut /> এই ডিভাইস থেকে লগআউট
        </Button>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
    </PageContainer>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}

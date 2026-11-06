"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  useDeleteMyAccount,
  useUpdateMyName,
} from "@/features/workflow/queries";
import { ApiError, getErrorMessage } from "@/lib/apiClient";
import { logoutAccount } from "@/lib/auth";
import { sessionKey, useSession } from "@/lib/session/use-session";

function AccountContent() {
  const { data: user } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const updateName = useUpdateMyName();
  const deleteAccount = useDeleteMyAccount();
  const [name, setName] = useState(user?.name ?? "");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function logoutEverywhere() {
    setLoggingOut(true);
    setError("");
    try {
      await logoutAccount(true);
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

  function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (confirmation !== "DELETE") {
      setError("নিশ্চিত করতে DELETE লিখুন।");
      return;
    }
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        qc.clear();
        qc.setQueryData(sessionKey, null);
        router.replace("/");
        router.refresh();
      },
      onError: (deleteError) => {
        if (
          deleteError instanceof ApiError &&
          deleteError.code === "CONFLICT"
        ) {
          setError("চলমান কাজ শেষ বা বাতিল করার পর অ্যাকাউন্ট মুছতে পারবেন।");
        } else {
          setError(getErrorMessage(deleteError));
        }
      },
    });
  }

  return (
    <PageContainer narrow>
      <PageHeader
        eyebrow="অ্যাকাউন্ট"
        title="অ্যাকাউন্ট সেটিংস"
        description="আপনার ব্যক্তিগত তথ্য ও নিরাপত্তা পরিচালনা করুন।"
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateName.mutate(name.trim());
          }}
          className="space-y-4"
        >
          <label className="block text-sm font-semibold">
            নাম
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={50}
              required
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
            />
          </label>
          <label className="block text-sm font-semibold">
            ফোন নম্বর
            <input
              value={user?.phone ?? ""}
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500"
            />
          </label>
          <Button
            type="submit"
            disabled={updateName.isPending || name.trim().length < 2}
          >
            <Save /> নাম সংরক্ষণ করুন
          </Button>
        </form>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="font-bold text-brand">নিরাপত্তা</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          সব ডিভাইস থেকে লগআউট করলে আপনার আগের সব সেশন বন্ধ হবে।
        </p>
        <Button
          className="mt-4"
          variant="outline"
          disabled={loggingOut}
          onClick={logoutEverywhere}
        >
          <LogOut /> সব ডিভাইস থেকে লগআউট
        </Button>
      </section>

      <section className="mt-5 rounded-2xl border border-red-200 bg-white p-5 sm:p-7">
        <h2 className="font-bold text-red-700">অ্যাকাউন্ট মুছুন</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          এই কাজটি ফেরানো যাবে না। চলমান কাজ থাকলে আগে সেগুলো শেষ করুন।
        </p>
        <form
          onSubmit={handleDelete}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="নিশ্চিত করতে DELETE লিখুন"
            className="h-11 flex-1 rounded-xl border border-slate-200 px-3"
          />
          <Button
            type="submit"
            variant="destructive"
            disabled={deleteAccount.isPending || confirmation !== "DELETE"}
          >
            <Trash2 /> অ্যাকাউন্ট মুছুন
          </Button>
        </form>
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

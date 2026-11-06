"use client";

import { LoaderCircle, ShieldCheck, Upload } from "lucide-react";
import { type FormEvent, useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/apiClient";
import { useMyProfile, useSubmitVerification } from "../queries";

export default function TechnicianVerificationPage() {
  const profile = useMyProfile();
  const submit = useSubmitVerification();
  const [photo, setPhoto] = useState<File | null>(null);
  const [nid, setNid] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!photo || !nid) {
      setError("প্রোফাইল ছবি এবং এনআইডির ছবি—দুটিই নির্বাচন করুন।");
      return;
    }
    if (photo.size > 2 * 1024 * 1024 || nid.size > 2 * 1024 * 1024) {
      setError("প্রতিটি ছবির আকার সর্বোচ্চ ২ MB হতে পারে।");
      return;
    }
    setUploading(true);
    try {
      await submit.mutateAsync({ photo, nid });
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setUploading(false);
    }
  }

  if (profile.isPending)
    return (
      <PageContainer narrow>
        <p>প্রোফাইল লোড হচ্ছে…</p>
      </PageContainer>
    );
  if (profile.isError)
    return (
      <PageContainer narrow>
        <p role="alert">{getErrorMessage(profile.error)}</p>
      </PageContainer>
    );
  if (
    profile.data.verifyStatus === "VERIFIED" ||
    profile.data.verifyStatus === "PENDING"
  ) {
    return (
      <PageContainer narrow>
        <section className="rounded-2xl border border-emerald-100 bg-white p-7">
          <ShieldCheck className="size-10 text-emerald-600" />
          <h1 className="mt-3 text-xl font-bold text-brand">
            {profile.data.verifyStatus === "VERIFIED"
              ? "আপনার পরিচয় যাচাই হয়েছে"
              : "যাচাইয়ের আবেদন পর্যালোচনাধীন"}
          </h1>
          <p className="mt-2 text-slate-600">
            আপনার যাচাইয়ের অবস্থা ড্যাশবোর্ডে দেখা যাবে।
          </p>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader
        eyebrow="কারিগর প্রোফাইল"
        title="পরিচয় যাচাই"
        description="একটি প্রোফাইল ছবি এবং এনআইডির ছবি দিন। এনআইডি privateভাবে আপলোড হবে।"
      />
      {profile.data.rejectReason ? (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          আগের আবেদন প্রত্যাখ্যাত: {profile.data.rejectReason}
        </p>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
      >
        <label className="block text-sm font-semibold">
          প্রোফাইল ছবি
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm"
          />
        </label>
        <label className="block text-sm font-semibold">
          এনআইডির ছবি
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setNid(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm"
          />
        </label>
        <p className="text-xs leading-5 text-slate-500">
          প্রতিটি ফাইল সর্বোচ্চ ২ MB; JPG, PNG বা WEBP।
        </p>
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          size="lg"
          disabled={uploading || submit.isPending}
        >
          {uploading || submit.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Upload />
          )}
          যাচাইয়ের জন্য জমা দিন
        </Button>
      </form>
    </PageContainer>
  );
}

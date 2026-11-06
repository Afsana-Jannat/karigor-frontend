"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useMyProfile, useUpsertProfile } from "@/features/technician/queries";
import { useSaveCvSummary } from "@/features/workflow/queries";

type SummaryLanguage = "bn" | "en";

function CvSummaryContent() {
  const profile = useMyProfile();
  const generate = useSaveCvSummary();
  const saveProfile = useUpsertProfile();
  const [language, setLanguage] = useState<"bn" | "en" | "both">("both");
  const [selectedLanguage, setSelectedLanguage] =
    useState<SummaryLanguage>("bn");
  const summary = generate.data?.suggestion;
  const text = summary?.[selectedLanguage];

  if (profile.isPending)
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  if (profile.isError)
    return (
      <PageContainer>
        <ErrorState error={profile.error} onRetry={() => profile.refetch()} />
      </PageContainer>
    );
  if (!profile.data) return null;

  const data = profile.data;
  return (
    <PageContainer narrow>
      <PageHeader
        eyebrow="কারিগর প্রোফাইল"
        title="সিভি পরিচিতি লিখুন"
        description="আপনার প্রোফাইলের তথ্য থেকে একটি সংক্ষিপ্ত পরিচিতির খসড়া তৈরি করুন। আপনি বেছে নিয়ে সংরক্ষণ না করা পর্যন্ত এটি প্রোফাইলে যোগ হবে না।"
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <label className="block text-sm font-bold text-slate-700">
          খসড়ার ভাষা
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as "bn" | "en" | "both")
            }
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
          >
            <option value="both">বাংলা ও ইংরেজি</option>
            <option value="bn">শুধু বাংলা</option>
            <option value="en">শুধু ইংরেজি</option>
          </select>
        </label>
        <Button
          type="button"
          className="mt-4"
          onClick={() =>
            generate.mutate(language, {
              onSuccess: () =>
                setSelectedLanguage(language === "en" ? "en" : "bn"),
            })
          }
          disabled={generate.isPending}
        >
          {generate.isPending
            ? "খসড়া তৈরি হচ্ছে..."
            : summary
              ? "আবার খসড়া তৈরি করুন"
              : "খসড়া তৈরি করুন"}
        </Button>
        {summary ? (
          <div className="mt-6 space-y-4">
            {summary.bn ? (
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="radio"
                  name="summary-language"
                  checked={selectedLanguage === "bn"}
                  onChange={() => setSelectedLanguage("bn")}
                />
                বাংলা
              </label>
            ) : null}
            {summary.en ? (
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="radio"
                  name="summary-language"
                  checked={selectedLanguage === "en"}
                  onChange={() => setSelectedLanguage("en")}
                />
                English
              </label>
            ) : null}
            <p
              lang={selectedLanguage}
              className="rounded-xl bg-slate-50 p-5 text-lg leading-8 text-slate-800"
            >
              {text}
            </p>
            <p className="text-xs text-slate-500">
              {generate.data?.usedAi
                ? "AI সহায়তায় তৈরি খসড়া—সংরক্ষণের আগে যাচাই করুন।"
                : "তথ্যভিত্তিক স্বয়ংক্রিয় খসড়া—সংরক্ষণের আগে যাচাই করুন।"}
            </p>
            <Button
              type="button"
              disabled={!text || saveProfile.isPending}
              onClick={() => {
                if (!text) return;
                saveProfile.mutate({
                  name: data.name,
                  age: data.age,
                  bio: text,
                  experienceYears: data.experienceYears,
                  skills: data.skills,
                  areas: data.areas,
                  ...(data.rateMin != null ? { rateMin: data.rateMin } : {}),
                  ...(data.rateMax != null ? { rateMax: data.rateMax } : {}),
                });
              }}
            >
              {saveProfile.isPending
                ? "সংরক্ষণ হচ্ছে..."
                : "এই পরিচিতি প্রোফাইলে সংরক্ষণ করুন"}
            </Button>
          </div>
        ) : null}
      </section>
    </PageContainer>
  );
}

export default function CvSummaryPage() {
  return (
    <RequireAuth roles={["TECHNICIAN"]}>
      <CvSummaryContent />
    </RequireAuth>
  );
}

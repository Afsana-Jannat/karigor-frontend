"use client";

import { ArrowLeft, ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiClient";
import { refreshAccessToken } from "@/lib/auth";
import {
  createJob,
  getCurrentUser,
  getJobOptions,
  type JobOption,
} from "@/lib/jobs";

function dateToInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NewJobPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<JobOption[]>([]);
  const [areas, setAreas] = useState<JobOption[]>([]);
  const [skill, setSkill] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [error, setError] = useState("");
  const [createdCount, setCreatedCount] = useState<number | null>(null);
  const [minimumDate, setMinimumDate] = useState("");
  const [maximumDate, setMaximumDate] = useState("");

  useEffect(() => {
    let isActive = true;
    void (async () => {
      try {
        await refreshAccessToken();
        const user = await getCurrentUser();
        if (user.role !== "CUSTOMER") {
          router.replace(user.role === "TECHNICIAN" ? "/jobs" : "/");
          return;
        }
        const options = await getJobOptions();
        if (!isActive) {
          return;
        }
        setSkills(options.skills);
        setAreas(options.areas);
        const now = new Date();
        setMinimumDate(dateToInputValue(now));
        setPreferredDate(dateToInputValue(now));
        const latestDate = new Date(now);
        latestDate.setDate(latestDate.getDate() + 60);
        setMaximumDate(dateToInputValue(latestDate));
      } catch (loadError) {
        if (!isActive) {
          return;
        }
        if (getApiErrorStatus(loadError) === 401) {
          setIsUnauthenticated(true);
        } else {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (description.trim().length < 5 || description.trim().length > 500) {
      setError("কাজের বিবরণ ৫ থেকে ৫০০ অক্ষরের মধ্যে লিখুন।");
      return;
    }
    if (!skill || !area || !preferredDate) {
      setError("সার্ভিস, এলাকা ও পছন্দের তারিখ নির্বাচন করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createJob({
        skill,
        area,
        description: description.trim(),
        preferredDate,
        isEmergency,
      });
      setCreatedCount(result.notifiedCount);
    } catch (createError) {
      setError(getApiErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
     
      <section className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden py-10 sm:py-14">
        <div className="pointer-events-none absolute -right-40 -top-32 -z-10 size-120 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#103963]"
          >
            <ArrowLeft size={16} /> কাজের তালিকায় ফিরুন
          </Link>

          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center">
              <LoaderCircle className="animate-spin text-[#103963]" size={30} />
              <span className="sr-only">সার্ভিসের তালিকা লোড হচ্ছে</span>
            </div>
          ) : isUnauthenticated ? (
            <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
              <h1 className="text-2xl font-extrabold text-[#103963]">
                কাজ পোস্ট করতে লগইন করুন
              </h1>
              <Link
                href="/login"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#103963] px-5 py-3 font-bold text-white"
              >
                লগইন করুন <ArrowRight size={17} />
              </Link>
            </div>
          ) : createdCount !== null ? (
            <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-7 shadow-xl shadow-blue-950/5 sm:p-10">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Sparkles size={27} />
              </span>
              <h1 className="mt-6 text-2xl font-extrabold text-[#103963]">
                আপনার কাজ পোস্ট হয়েছে
              </h1>
              <p className="mt-3 leading-7 text-slate-600">
                {createdCount > 0
                  ? `${createdCount} জন উপযুক্ত কারিগরকে কাজের বিজ্ঞপ্তি পাঠানো হয়েছে।`
                  : "এখনো কোনো মিল থাকা কারিগরকে বিজ্ঞপ্তি পাঠানো যায়নি। আপনার কাজটি খোলা কাজের তালিকায় থাকবে।"}
              </p>
              <Link
                href="/jobs"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#103963] px-5 py-3 font-bold text-white transition hover:bg-[#0b2b4c]"
              >
                আমার কাজগুলো দেখুন <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-blue-950/5 sm:p-9">
              <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
                নতুন কাজ
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#103963]">
                আপনার কী কাজ দরকার?
              </h1>
              <p className="mt-3 leading-7 text-slate-600">
                কাজের তথ্য দিন। আগ্রহী কারিগররা আপনাকে মূল্যসহ প্রস্তাব পাঠাবেন।
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    কাজের ধরন
                  </span>
                  <select
                    onChange={(event) => setSkill(event.target.value)}
                    required
                    value={skill}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-800 outline-none transition focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
                  >
                    <option value="">সার্ভিস বেছে নিন</option>
                    {skills.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.bn} ({option.en})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    কাজের এলাকা
                  </span>
                  <select
                    onChange={(event) => setArea(event.target.value)}
                    required
                    value={area}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-800 outline-none transition focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
                  >
                    <option value="">এলাকা বেছে নিন</option>
                    {areas.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.bn} ({option.en})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                    কাজের বিস্তারিত
                    <span className="font-normal text-slate-400">
                      {description.length}/500
                    </span>
                  </span>
                  <textarea
                    maxLength={500}
                    minLength={5}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="কী সমস্যা হয়েছে এবং কী ধরনের সাহায্য দরকার তা লিখুন"
                    required
                    rows={5}
                    value={description}
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 leading-7 outline-none transition placeholder:text-slate-400 focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    কাজের পছন্দের তারিখ
                  </span>
                  <input
                    max={maximumDate}
                    min={minimumDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    required
                    type="date"
                    value={preferredDate}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-800 outline-none transition focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
                  />
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                  <input
                    checked={isEmergency}
                    className="mt-1 size-4 accent-[#FF6F00]"
                    onChange={(event) => setIsEmergency(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-bold text-[#103963]">
                      কাজটি জরুরি
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                      জরুরি কাজের বিজ্ঞপ্তি এখন উপলভ্য কারিগরদের কাছে যাবে।
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={
                    isSubmitting || skills.length === 0 || areas.length === 0
                  }
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF6F00] px-5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      পোস্ট হচ্ছে
                    </>
                  ) : (
                    <>
                      কাজ পোস্ট করুন <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import {
  ArrowLeft,
  BadgeCheck,
  CircleAlert,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiClient";
import { refreshAccessToken } from "@/lib/auth";
import { getCustomerJobBids, type JobBid } from "@/lib/jobs";
import HomePageNav from "../../../home-page-nav";

type BidSort = "price" | "rating" | "experience";

function money(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

export default function JobBidsPage({ jobId }: { jobId: string }) {
  const [bids, setBids] = useState<JobBid[]>([]);
  const [bidCount, setBidCount] = useState(0);
  const [sort, setSort] = useState<BidSort>("price");
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [error, setError] = useState("");

  const loadBids = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      await refreshAccessToken();
      const result = await getCustomerJobBids(jobId, sort);
      setBids(result.bids);
      setBidCount(result.job.bidCount);
      setIsUnauthenticated(false);
    } catch (loadError) {
      if (getApiErrorStatus(loadError) === 401) {
        setIsUnauthenticated(true);
      } else {
        setError(getApiErrorMessage(loadError));
      }
    } finally {
      setIsLoading(false);
    }
  }, [jobId, sort]);

  useEffect(() => {
    void loadBids();
  }, [loadBids]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <HomePageNav />
      <section className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden py-10 sm:py-14">
        <div className="pointer-events-none absolute -right-40 -top-32 -z-10 size-120 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#103963]"
          >
            <ArrowLeft size={16} /> আমার কাজগুলো
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
                কারিগরদের প্রস্তাব
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#103963] sm:text-4xl">
                প্রস্তাব তুলনা করুন
              </h1>
              <p className="mt-3 text-slate-600">
                মূল্য, রেটিং ও অভিজ্ঞতা দেখে আপনার পছন্দের কারিগর বেছে নিন।
              </p>
            </div>
            {!isLoading && !error && (
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                সাজান
                <select
                  onChange={(event) => setSort(event.target.value as BidSort)}
                  value={sort}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-[#103963] outline-none focus:border-[#103963]"
                >
                  <option value="price">কম মূল্য আগে</option>
                  <option value="rating">সেরা রেটিং আগে</option>
                  <option value="experience">অভিজ্ঞতা বেশি আগে</option>
                </select>
              </label>
            )}
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <LoaderCircle className="animate-spin text-[#103963]" size={30} />
              <span className="sr-only">প্রস্তাব লোড হচ্ছে</span>
            </div>
          ) : isUnauthenticated ? (
            <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-9 text-center">
              <h2 className="text-xl font-bold text-[#103963]">
                প্রস্তাব দেখতে লগইন করুন
              </h2>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-xl bg-[#103963] px-5 py-3 font-bold text-white"
              >
                লগইন করুন
              </Link>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-3xl border border-red-100 bg-white p-8 text-center">
              <CircleAlert className="mx-auto text-red-500" size={30} />
              <h2 className="mt-4 font-bold text-[#103963]">
                প্রস্তাবগুলো লোড করা যায়নি
              </h2>
              <p role="alert" className="mt-2 text-sm text-slate-600">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadBids()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#103963] px-4 py-2.5 text-sm font-bold text-white"
              >
                <RefreshCw size={16} /> আবার চেষ্টা করুন
              </button>
            </div>
          ) : bids.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <Wrench className="mx-auto text-slate-400" size={30} />
              <h2 className="mt-4 font-bold text-[#103963]">
                এখনো কোনো প্রস্তাব আসেনি
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {bidCount > 0
                  ? "প্রস্তাবগুলো আর সক্রিয় নেই।"
                  : "আগ্রহী কারিগররা প্রস্তাব দিলে এখানে দেখতে পাবেন।"}
              </p>
            </div>
          ) : (
            <>
              <p className="mt-7 text-sm font-medium text-slate-500">
                {money(bids.length)}টি সক্রিয় প্রস্তাব
              </p>
              <div className="mt-4 grid gap-5 lg:grid-cols-2">
                {bids.map((bid) => (
                  <article
                    key={bid.bidId}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-[#103963]">
                        {bid.technician.photoUrl ? (
                          <Image
                            src={bid.technician.photoUrl}
                            alt=""
                            width={56}
                            height={56}
                            unoptimized
                            className="size-full object-cover"
                          />
                        ) : (
                          <UserRound size={26} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-extrabold text-[#103963]">
                            {bid.technician.name}
                          </h2>
                          {bid.technician.verified && (
                            <span
                              title="যাচাইকৃত কারিগর"
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
                            >
                              <BadgeCheck size={14} /> যাচাইকৃত
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {money(bid.technician.experienceYears)} বছরের অভিজ্ঞতা
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                          <Star
                            size={15}
                            className="fill-amber-400 text-amber-400"
                          />
                          {bid.technician.ratingAvg.toFixed(1)}
                          <span className="font-normal text-slate-500">
                            ({money(bid.technician.ratingCount)} রিভিউ)
                          </span>
                        </span>
                      </div>
                      <p className="shrink-0 text-lg font-extrabold text-[#FF6F00]">
                        ৳{money(bid.price)}
                      </p>
                    </div>

                    {bid.note && (
                      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        {bid.note}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={15} />
                        {bid.technician.isAvailableNow
                          ? "এখন কাজ নিতে প্রস্তুত"
                          : "প্রোফাইল দেখে বিস্তারিত জানুন"}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {money(bid.technician.completedJobs)}টি কাজ সম্পন্ন
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <p className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                এই পেজে প্রস্তাব তুলনা করা যাবে। আপনার শেয়ার করা ব্যাকএন্ড রাউটার কোডে
                bid-selection endpoint নেই, তাই এখান থেকে কাউকে নির্বাচন করার অনুরোধ
                পাঠানো হচ্ছে না।
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

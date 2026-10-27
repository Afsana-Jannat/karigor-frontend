"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CircleAlert,
  Clock3,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiClient";
import { refreshAccessToken } from "@/lib/auth";
import {
  type CustomerJob,
  getCurrentUser,
  getCustomerJobs,
  getTechnicianOpenJobs,
  type OpenJob,
  type SignedInUser,
  submitJobBid,
  withdrawJobBid,
} from "@/lib/jobs";


function formatDate(value: string) {
  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

function statusLabel(status: CustomerJob["status"]) {
  const labels: Record<CustomerJob["status"], string> = {
    OPEN: "প্রস্তাবের অপেক্ষায়",
    CONTRACT_PENDING: "চুক্তির অপেক্ষায়",
    IN_PROGRESS: "কাজ চলছে",
    AWAITING_CONFIRMATION: "নিশ্চিতকরণের অপেক্ষায়",
    COMPLETED: "সম্পন্ন",
    CANCELLED: "বাতিল",
    DISPUTED: "সমস্যা পর্যালোচনাধীন",
  };
  return labels[status];
}

function LoginPrompt() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6F00]">
        <BriefcaseBusiness size={26} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-[#103963]">
        কাজের তালিকা দেখতে লগইন করুন
      </h1>
      <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
        গ্রাহক হিসেবে আপনার কাজ দেখুন, অথবা কারিগর হিসেবে আপনার এলাকার কাজ খুঁজুন।
      </p>
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#103963] px-5 py-3 font-bold text-white transition hover:bg-[#0b2b4c]"
      >
        লগইন করুন <ArrowRight size={17} />
      </Link>
    </div>
  );
}

function CustomerJobs({
  jobs,
  user,
}: {
  jobs: CustomerJob[];
  user: SignedInUser;
}) {
  const openJobCount = jobs.filter(
    (job) => job.status === "OPEN" || job.status === "CONTRACT_PENDING",
  ).length;

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
            গ্রাহক ড্যাশবোর্ড
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#103963] sm:text-4xl">
            স্বাগতম, {user.name}
          </h1>
          <p className="mt-3 text-slate-600">
            আপনার কাজের অগ্রগতি ও কারিগরদের প্রস্তাব এক জায়গায় দেখুন।
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF6F00] px-5 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
        >
          <Plus size={19} /> নতুন কাজ পোস্ট করুন
        </Link>
      </div>

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">মোট কাজ</p>
          <p className="mt-2 text-3xl font-extrabold text-[#103963]">
            {formatPrice(jobs.length)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">চলমান / খোলা কাজ</p>
          <p className="mt-2 text-3xl font-extrabold text-[#103963]">
            {formatPrice(openJobCount)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">নতুন প্রস্তাব</p>
          <p className="mt-2 text-3xl font-extrabold text-[#103963]">
            {formatPrice(
              jobs.reduce(
                (total, job) =>
                  total + (job.status === "OPEN" ? (job.bidCount ?? 0) : 0),
                0,
              ),
            )}
          </p>
        </div>
      </div>

      <section aria-labelledby="customer-jobs-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="customer-jobs-heading"
            className="text-xl font-extrabold text-[#103963]"
          >
            আপনার পোস্ট করা কাজ
          </h2>
          <span className="text-sm text-slate-500">
            {formatPrice(jobs.length)}টি
          </span>
        </div>
        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Wrench className="mx-auto text-slate-400" size={30} />
            <h3 className="mt-4 font-bold text-[#103963]">
              এখনো কোনো কাজ পোস্ট করেননি
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              আপনার প্রয়োজন জানালে উপযুক্ত কারিগররা প্রস্তাব দিতে পারবেন।
            </p>
            <Link
              href="/jobs/new"
              className="mt-5 inline-flex items-center gap-2 font-bold text-[#FF6F00]"
            >
              প্রথম কাজটি পোস্ট করুন <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#103963]">
                        {job.skill.replaceAll("-", " ")}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {statusLabel(job.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} /> {job.area.replaceAll("-", " ")}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={15} /> {formatDate(job.preferredDate)}
                      </span>
                      {job.agreedPrice !== null && (
                        <span className="font-semibold text-[#103963]">
                          ৳{formatPrice(job.agreedPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                      <Users size={16} />
                      {formatPrice(job.bidCount ?? 0)} প্রস্তাব
                    </span>
                    {job.status === "OPEN" && (
                      <Link
                        href={`/jobs/${encodeURIComponent(job.id)}/bids`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#103963] transition hover:border-[#103963] hover:bg-blue-50"
                      >
                        প্রস্তাব দেখুন <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function TechnicianJobs({
  jobs,
  onRefresh,
}: {
  jobs: OpenJob[];
  onRefresh: () => void;
}) {
  const [drafts, setDrafts] = useState<
    Record<string, { price: string; note: string }>
  >({});
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateDraft(job: OpenJob, field: "price" | "note", value: string) {
    setDrafts((previous) => ({
      ...previous,
      [job.id]: {
        price:
          field === "price"
            ? value
            : (previous[job.id]?.price ?? String(job.myBid?.price ?? "")),
        note: field === "note" ? value : (previous[job.id]?.note ?? ""),
      },
    }));
  }

  async function saveBid(job: OpenJob) {
    const price = Number(drafts[job.id]?.price ?? job.myBid?.price);
    const note = drafts[job.id]?.note ?? "";
    if (!Number.isInteger(price) || price < 1 || price > 1_000_000) {
      setError("প্রস্তাবের মূল্য ১ থেকে ১০,০০,০০০ টাকার মধ্যে লিখুন।");
      return;
    }
    if (note.trim().length > 200) {
      setError("নোট ২০০ অক্ষরের মধ্যে লিখুন।");
      return;
    }

    setBusyJobId(job.id);
    setError("");
    setSuccess("");
    try {
      await submitJobBid(job.id, {
        price,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setSuccess("আপনার প্রস্তাব পাঠানো হয়েছে।");
      onRefresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyJobId(null);
    }
  }

  async function withdraw(job: OpenJob) {
    setBusyJobId(job.id);
    setError("");
    setSuccess("");
    try {
      await withdrawJobBid(job.id);
      setSuccess("আপনার প্রস্তাব প্রত্যাহার করা হয়েছে।");
      onRefresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyJobId(null);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
            কারিগর ড্যাশবোর্ড
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#103963] sm:text-4xl">
            আপনার এলাকার কাজ
          </h1>
          <p className="mt-3 text-slate-600">
            আপনার দক্ষতা ও এলাকার সাথে মেলে এমন খোলা কাজগুলো দেখুন।
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-[#103963] transition hover:bg-slate-50"
        >
          <RefreshCw size={17} /> কাজ রিফ্রেশ করুন
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {success && (
        <output className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </output>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <BriefcaseBusiness className="mx-auto text-slate-400" size={32} />
          <h2 className="mt-4 font-bold text-[#103963]">
            এই মুহূর্তে মিলে যাওয়া কাজ নেই
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            আপনার প্রোফাইলের দক্ষতা ও এলাকা অনুযায়ী নতুন কাজ এখানে দেখানো হবে।
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => {
            const draft = drafts[job.id];
            const price = draft?.price ?? String(job.myBid?.price ?? "");
            const note = draft?.note ?? "";
            const isActiveBid = job.myBid?.status === "ACTIVE";
            return (
              <article
                key={job.id}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#103963]">
                        {job.skill.replaceAll("-", " ")}
                      </span>
                      {job.isEmergency && (
                        <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                          জরুরি
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 text-xl font-extrabold text-[#103963]">
                      {job.customerName} এর কাজ
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                    <Users size={15} /> {formatPrice(job.bidCount)}
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                  {job.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} /> {job.area.replaceAll("-", " ")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={15} /> {formatDate(job.preferredDate)}
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      আপনার প্রস্তাব (টাকা)
                    </span>
                    <input
                      inputMode="numeric"
                      max={1_000_000}
                      min={1}
                      onChange={(event) =>
                        updateDraft(job, "price", event.target.value)
                      }
                      placeholder="যেমন: ১৫০০"
                      type="number"
                      value={price}
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none transition focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      সংক্ষিপ্ত নোট{" "}
                      <span className="font-normal text-slate-400">
                        (ঐচ্ছিক)
                      </span>
                    </span>
                    <textarea
                      maxLength={200}
                      onChange={(event) =>
                        updateDraft(job, "note", event.target.value)
                      }
                      placeholder="কাজটি কীভাবে করবেন তা লিখুন"
                      rows={2}
                      value={note}
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busyJobId === job.id}
                      onClick={() => saveBid(job)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#103963] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b2b4c] disabled:cursor-wait disabled:opacity-60"
                    >
                      {busyJobId === job.id ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <ArrowRight size={16} />
                      )}
                      {isActiveBid ? "প্রস্তাব আপডেট করুন" : "প্রস্তাব পাঠান"}
                    </button>
                    {isActiveBid && (
                      <button
                        type="button"
                        disabled={busyJobId === job.id}
                        onClick={() => withdraw(job)}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                      >
                        প্রস্তাব প্রত্যাহার
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function JobsPage() {
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [customerJobs, setCustomerJobs] = useState<CustomerJob[]>([]);
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async (showLoader: boolean) => {
    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError("");

    try {
      await refreshAccessToken();
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser.role === "CUSTOMER") {
        setCustomerJobs(await getCustomerJobs());
        setOpenJobs([]);
      } else if (currentUser.role === "TECHNICIAN") {
        setOpenJobs(await getTechnicianOpenJobs());
        setCustomerJobs([]);
      } else {
        setError("অ্যাডমিন অ্যাকাউন্ট থেকে এই কাজের তালিকা ব্যবহার করা যাবে না।");
      }
      setIsUnauthenticated(false);
    } catch (loadError) {
      if (getApiErrorStatus(loadError) === 401) {
        setIsUnauthenticated(true);
      } else {
        setError(getApiErrorMessage(loadError));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs(true);
  }, [loadJobs]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
     
      <section className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden py-10 sm:py-14">
        <div className="pointer-events-none absolute -right-40 -top-32 -z-10 size-120 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center">
              <LoaderCircle className="animate-spin text-[#103963]" size={30} />
              <span className="sr-only">কাজের তালিকা লোড হচ্ছে</span>
            </div>
          ) : isUnauthenticated ? (
            <LoginPrompt />
          ) : error ? (
            <div className="rounded-3xl border border-red-100 bg-white px-6 py-12 text-center">
              <CircleAlert className="mx-auto text-red-500" size={30} />
              <h1 className="mt-4 text-xl font-bold text-[#103963]">
                কাজের তালিকা লোড করা যায়নি
              </h1>
              <p role="alert" className="mt-2 text-sm text-slate-600">
                {error}
              </p>
              <button
                type="button"
                disabled={isRefreshing}
                onClick={() => void loadJobs(false)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#103963] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                <RefreshCw size={16} /> আবার চেষ্টা করুন
              </button>
            </div>
          ) : user?.role === "CUSTOMER" ? (
            <CustomerJobs jobs={customerJobs} user={user} />
          ) : user?.role === "TECHNICIAN" ? (
            <TechnicianJobs
              jobs={openJobs}
              onRefresh={() => void loadJobs(false)}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

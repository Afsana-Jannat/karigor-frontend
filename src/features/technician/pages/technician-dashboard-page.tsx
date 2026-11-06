
'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSignature,
  HandCoins,
  LoaderCircle,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingUp,
  Wrench,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/apiClient';
import { formatDate, formatMoney, formatNumber } from '@/lib/format';
import { labelOf, verifyStatusLabels } from '@/lib/labels';
import { useSession } from '@/lib/session/use-session';
import { useDashboard, useSetAvailability } from '../queries';
import type { DashboardData } from '../types';

type VerificationState = DashboardData['verifyStatus'];

type Stat = {
  label: string;
  count: number;
  icon: typeof BriefcaseBusiness;
  href: string;
  tone: string;
};

const verificationContent: Record<
  VerificationState,
  {
    title: string;
    text: string;
    icon: typeof ShieldCheck;
    className: string;
  }
> = {
  NONE: {
    title: 'প্রোফাইল যাচাই করুন',
    text: 'যাচাইকৃত প্রোফাইল পেলে গ্রাহকের আস্থা অর্জনে সাহায্য হবে।',
    icon: ShieldCheck,
    className: 'border-[#ffd7ad] bg-[#fffaf4]',
  },
  PENDING: {
    title: 'যাচাই চলছে',
    text: 'আপনার তথ্য পর্যালোচনা করা হচ্ছে।',
    icon: Clock3,
    className: 'border-[#cfe3f6] bg-[#f5faff]',
  },
  VERIFIED: {
    title: 'যাচাইকৃত কারিগর',
    text: 'আপনার প্রোফাইল সফলভাবে যাচাই করা হয়েছে।',
    icon: ShieldCheck,
    className: 'border-[#c9ead8] bg-[#f3fcf6]',
  },
  REJECTED: {
    title: 'আবার যাচাইয়ের জন্য জমা দিন',
    text: 'আপনার প্রোফাইলের তথ্য সংশোধন করে আবার জমা দিন।',
    icon: XCircle,
    className: 'border-[#ffd0d0] bg-[#fff7f7]',
  },
};

const banglaDigits = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);

function Stars({ rating }: { rating: number }) {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation>
<span
      className="inline-flex gap-0.5"
      aria-label={`৫-এর মধ্যে ${banglaDigits(rating)} স্টার`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          aria-hidden="true"
          className={`size-4 ${
            index < Math.round(rating)
              ? 'fill-[#ffb400] text-[#ffb400]'
              : 'text-slate-200'
          }`}
        />
      ))}
    </span>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;

  return (
    <Link
      href={stat.href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_3px_16px_rgba(16,57,99,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,57,99,0.1)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${stat.tone}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="size-4 text-slate-300 transition group-hover:text-[#ff6f00]"
          aria-hidden="true"
        />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {stat.label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-[#0b2b4c]">
        {formatNumber(stat.count)}
      </p>
    </Link>
  );
}

function VerificationCard({ state }: { state: VerificationState }) {
  const content = verificationContent[state];
  const Icon = content.icon;

  return (
    <section
      className={`rounded-2xl border p-5 ${content.className}`}
      aria-labelledby="verification-heading"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="size-5 text-[#ff6f00]" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h2
            id="verification-heading"
            className="font-bold text-[#0b2b4c]"
          >
            {content.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {content.text}
          </p>
          <span className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
            {labelOf(verifyStatusLabels, state)}
          </span>
        </div>
      </div>

      {state === 'NONE' || state === 'REJECTED' ? (
        <Link
          href="/technician/verification"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6f00] px-4 text-sm font-bold text-white transition hover:bg-[#ea5808]"
        >
          {state === 'REJECTED' ? 'আবার জমা দিন' : 'যাচাই শুরু করুন'}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="h-36 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="size-10 rounded-xl bg-slate-200" />
              <div className="mt-5 h-4 w-24 max-w-full rounded bg-slate-200" />
              <div className="mt-2 h-7 w-12 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="h-64 rounded-2xl bg-white" />
          <div className="h-64 rounded-2xl bg-white" />
        </div>

        <div className="mt-8 h-60 rounded-2xl bg-white" />
      </div>

      <span className="sr-only">ড্যাশবোর্ড লোড হচ্ছে...</span>
    </main>
  );
}

function DashboardError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc] px-4 py-10">
      <section
        role="alert"
        className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm"
      >
        <XCircle className="mx-auto size-11 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-[#0b2b4c]">
          ড্যাশবোর্ড লোড করা যায়নি
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>

        <Button
          size="lg"
          disabled={isRetrying}
          onClick={onRetry}
          className="mt-5 h-11 bg-[#103963] text-white hover:bg-[#0b2b4c]"
        >
          {isRetrying ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          আবার চেষ্টা করুন
        </Button>
      </section>
    </main>
  );
}

export default function TechnicianDashboardPage() {
  const dashboardQuery = useDashboard();
  const availabilityMutation = useSetAvailability();
  const session = useSession();

  const data = dashboardQuery.data;

  if (dashboardQuery.isPending) {
    return <DashboardSkeleton />;
  }

  if (dashboardQuery.isError || !data) {
    return (
      <DashboardError
        message={getErrorMessage(dashboardQuery.error)}
        onRetry={() => void dashboardQuery.refetch()}
        isRetrying={dashboardQuery.isFetching}
      />
    );
  }

  const stats: Stat[] = [
    {
      label: 'নতুন কাজ',
      count: data.counts.newJobs,
      icon: BriefcaseBusiness,
      href: '/jobs/open',
      tone: 'bg-[#fff4e9] text-[#ea5808]',
    },
    {
      label: 'সক্রিয় প্রস্তাব',
      count: data.counts.activeBids,
      icon: HandCoins,
      href: '/bids',
      tone: 'bg-[#edf5ff] text-[#103963]',
    },
    {
      label: 'স্বাক্ষরের অপেক্ষায়',
      count: data.counts.awaitingSignature,
      icon: FileSignature,
      href: '/jobs?status=CONTRACT_PENDING',
      tone: 'bg-[#f6f0ff] text-[#7048a8]',
    },
    {
      label: 'চলমান কাজ',
      count: data.counts.active,
      icon: Wrench,
      href: '/jobs?status=IN_PROGRESS',
      tone: 'bg-[#edf8f2] text-[#16834e]',
    },
    {
      label: 'সম্পন্ন কাজ',
      count: data.counts.completed,
      icon: CheckCircle2,
      href: '/jobs?status=COMPLETED',
      tone: 'bg-[#eef5f7] text-[#277486]',
    },
    {
      label: 'বিতর্কিত কাজ',
      count: data.counts.disputed,
      icon: XCircle,
      href: '/jobs?status=DISPUTED',
      tone: 'bg-[#fff0f0] text-[#c24141]',
    },
  ];

  const displayName = session.data?.name?.trim() || 'কারিগর';

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-[#0b2b4c] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#ff6f00]">
              কারিগর ড্যাশবোর্ড
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              স্বাগতম, {displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              আপনার দক্ষতার সাথে মেলে এমন নতুন কাজগুলো দেখে নিন।
            </p>
          </div>

          <button
            type="button"
            aria-pressed={data.isAvailableNow}
            disabled={availabilityMutation.isPending}
            onClick={() =>
              availabilityMutation.mutate(!data.isAvailableNow)
            }
            className="flex min-h-11 items-center gap-3 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm disabled:cursor-wait disabled:opacity-60 sm:self-auto"
          >
            <span
              aria-hidden="true"
              className={`relative h-6 w-11 rounded-full transition ${
                data.isAvailableNow ? 'bg-[#ff6f00]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
                  data.isAvailableNow ? 'left-6' : 'left-1'
                }`}
              />
            </span>
            <span>
              {availabilityMutation.isPending
                ? 'আপডেট হচ্ছে...'
                : data.isAvailableNow
                  ? 'এখন কাজ করতে পারবেন'
                  : 'এখন কাজ করতে পারবেন না'}
            </span>
          </button>
        </div>

        <section className="mt-8" aria-labelledby="stats-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="stats-heading" className="text-lg font-bold">
              কাজের সারসংক্ষেপ
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_16px_rgba(16,57,99,0.05)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">আয় ও রেটিং</h2>
                <p className="mt-1 text-sm text-slate-500">
                  আপনার কাজের পারফরম্যান্স এক নজরে
                </p>
              </div>
              <TrendingUp
                className="size-5 text-[#ff6f00]"
                aria-hidden="true"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f4f8fc] p-4">
                <p className="text-sm text-slate-500">মোট আয়</p>
                <p className="mt-2 text-2xl font-bold text-[#0b2b4c]">
                  {formatMoney(data.earnings.total)}
                </p>
                <p className="mt-1 text-xs text-slate-400">এখন পর্যন্ত</p>
              </div>

              <div className="rounded-xl bg-[#fff8ef] p-4">
                <p className="text-sm text-slate-500">গত ৩০ দিনের আয়</p>
                <p className="mt-2 text-2xl font-bold text-[#ea5808]">
                  {formatMoney(data.earnings.last30Days)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  গত ৩০ দিনের পেমেন্ট
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-sm text-slate-500">গড় রেটিং</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <strong className="text-2xl">
                    {formatNumber(data.rating.avg)}
                  </strong>
                  <Stars rating={data.rating.avg} />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">মোট রিভিউ</p>
                <p className="mt-1 text-xl font-bold">
                  {formatNumber(data.rating.count)}টি
                </p>
              </div>
            </div>
          </section>

          <VerificationCard state={data.verifyStatus} />
        </div>

        <section
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_16px_rgba(16,57,99,0.05)] sm:p-6"
          aria-labelledby="reviews-heading"
        >
          <div>
            <h2 id="reviews-heading" className="text-lg font-bold">
              সাম্প্রতিক রিভিউ
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              গ্রাহকেরা আপনার কাজ সম্পর্কে কী বলছেন
            </p>
          </div>

          {data.recentReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle
                className="size-10 text-slate-300"
                aria-hidden="true"
              />
              <p className="mt-3 font-semibold">এখনও কোনো রিভিউ নেই</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                সম্পন্ন কাজের পর গ্রাহকেরা রেটিং দিলে এখানে দেখা যাবে।
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {data.recentReviews.map((review, index) => (
                <article
                  key={`${review.createdAt}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">গ্রাহকের রিভিউ</p>
                      <div className="mt-1">
                        <Stars rating={review.rating} />
                      </div>
                    </div>
                    <MessageCircle
                      className="size-4 shrink-0 text-slate-300"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-4 break-words text-sm leading-6 text-slate-600">
                    {review.comment || 'কোনো মন্তব্য দেওয়া হয়নি।'}
                  </p>

                  <time
                    dateTime={review.createdAt}
                    className="mt-3 block text-xs text-slate-400"
                  >
                    {formatDate(review.createdAt)}
                  </time>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" aria-hidden="true" />
            ঢাকা, বাংলাদেশ
          </span>
          <span>নিরাপদ ও নির্ভরযোগ্য কাজের প্ল্যাটফর্ম</span>
        </div>
      </div>
    </main>
  );
}

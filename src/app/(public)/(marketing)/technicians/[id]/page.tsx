"use client";

import { BadgeCheck, MapPin, Star, UserRound } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Pagination } from "@/components/shared/pagination";
import { useMetaOptions } from "@/features/meta";
import {
  usePublicTechnician,
  useTechnicianReviews,
} from "@/features/technician-public/queries";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";

function TechnicianProfileContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [page, setPage] = useState(1);
  const {
    data: technician,
    isPending,
    isError,
    error,
    refetch,
  } = usePublicTechnician(id);
  const reviewsQuery = useTechnicianReviews(id, page);
  const { skillName, areaName } = useMetaOptions();

  if (isPending)
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  if (isError || !technician)
    return (
      <PageContainer>
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <EmptyState text="কারিগরের প্রোফাইল পাওয়া যায়নি।" />
        )}
      </PageContainer>
    );

  return (
    <PageContainer narrow>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">
        <div className="flex flex-wrap items-start gap-5">
          <span className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-brand">
            {technician.photoUrl ? (
              <Image
                src={technician.photoUrl}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              <UserRound className="size-10" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-3xl font-extrabold text-brand">
              {technician.name}
              {technician.verified ? (
                <BadgeCheck
                  aria-label="যাচাইকৃত"
                  className="size-6 text-emerald-600"
                />
              ) : null}
            </h1>
            <p className="mt-2 flex items-center gap-1 text-slate-600">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {technician.ratingAvg.toFixed(1)} ·{" "}
              {formatNumber(technician.ratingCount)}টি রিভিউ
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {formatNumber(technician.experienceYears)} বছরের অভিজ্ঞতা ·{" "}
              {formatNumber(technician.completedJobs)}টি কাজ সম্পন্ন
            </p>
          </div>
        </div>
        {technician.bio ? (
          <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-700">
            {technician.bio}
          </p>
        ) : null}
        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold text-slate-500">কাজের ধরন</dt>
            <dd className="mt-1">
              {technician.skills.map(skillName).filter(Boolean).join(" · ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-500">কাজের এলাকা</dt>
            <dd className="mt-1 flex items-center gap-1">
              <MapPin className="size-4" />
              {technician.areas.map(areaName).filter(Boolean).join(" · ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-500">সাধারণ চার্জ</dt>
            <dd className="mt-1">
              {technician.rateMin != null
                ? formatMoney(technician.rateMin)
                : "আলোচনা সাপেক্ষে"}
              {technician.rateMax != null
                ? ` – ${formatMoney(technician.rateMax)}`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-500">বর্তমান অবস্থা</dt>
            <dd className="mt-1">
              {technician.isAvailableNow
                ? "এখন কাজ নিতে পারবেন"
                : "এই মুহূর্তে ব্যস্ত"}
            </dd>
          </div>
        </dl>
        <a
          href={technician.profileUrl}
          onClick={(event) => {
            event.preventDefault();
            window.print();
          }}
          className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 font-semibold text-brand print:hidden"
        >
          প্রোফাইল প্রিন্ট করুন
        </a>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-brand">গ্রাহকদের রিভিউ</h2>
        {reviewsQuery.isPending ? (
          <LoadingState />
        ) : reviewsQuery.isError ? (
          <ErrorState
            error={reviewsQuery.error}
            onRetry={() => reviewsQuery.refetch()}
          />
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              রেটিং বিতরণ:{" "}
              {Object.entries(reviewsQuery.data.summary.distribution)
                .map(([rating, count]) => `${rating}★ ${formatNumber(count)}`)
                .join(" · ")}
            </p>
            <div className="mt-4 space-y-3">
              {reviewsQuery.data.reviews.length ? (
                reviewsQuery.data.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <p className="font-bold">
                      {review.customerName} · {"★".repeat(review.rating)}
                    </p>
                    {review.comment ? (
                      <p className="mt-2 text-slate-600">{review.comment}</p>
                    ) : null}
                    <time className="mt-2 block text-xs text-slate-400">
                      {formatDate(review.createdAt)}
                    </time>
                  </article>
                ))
              ) : (
                <EmptyState text="এখনো কোনো রিভিউ নেই।" />
              )}
            </div>
            <Pagination meta={reviewsQuery.data.meta} onPageChange={setPage} />
          </>
        )}
      </section>
    </PageContainer>
  );
}

export default function PublicTechnicianPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingState />
        </PageContainer>
      }
    >
      <TechnicianProfileContent />
    </Suspense>
  );
}

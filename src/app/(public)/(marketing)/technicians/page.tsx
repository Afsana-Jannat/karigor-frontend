"use client";

import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, Search, Star, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { AreaSelect, SkillSelect, useMetaOptions } from "@/features/meta";
import { parseSearchQuery } from "@/features/technician-public/api";
import { useTechnicianSearch } from "@/features/technician-public/queries";
import { getErrorMessage } from "@/lib/apiClient";
import { formatMoney, formatNumber } from "@/lib/format";

export default function TechniciansPage() {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [area, setArea] = useState("");
  const [sort, setSort] = useState<
    "relevance" | "rating" | "experience" | "rate"
  >("relevance");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [page, setPage] = useState(1);
  const parseQuery = useMutation({
    mutationFn: parseSearchQuery,
    onSuccess: (parsed) => {
      if (parsed.skill) setSkill(parsed.skill);
      if (parsed.area) setArea(parsed.area);
      if (parsed.isEmergency) setAvailableNow(true);
      setPage(1);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const { skillName, areaName } = useMetaOptions();
  const params = useMemo(
    () => ({
      q: query || undefined,
      skill: skill || undefined,
      area: area || undefined,
      verifiedOnly: verifiedOnly || undefined,
      availableNow: availableNow || undefined,
      sort,
      page,
      pageSize: 12,
    }),
    [query, skill, area, verifiedOnly, availableNow, sort, page],
  );
  const { data, isPending, isError, error, refetch } =
    useTechnicianSearch(params);

  async function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    if (query.trim()) parseQuery.mutate(query.trim());
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="কারিগর খুঁজুন"
        title="আপনার কাজের জন্য কারিগর"
        description="এলাকা, কাজের ধরন, অভিজ্ঞতা ও রেটিং দেখে পছন্দ করুন।"
      />
      <form
        onSubmit={submitSearch}
        className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search className="size-4 text-slate-400" />
          <input
            value={query}
            maxLength={200}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="h-11 min-w-0 flex-1 outline-none"
            placeholder="সার্ভিস বা এলাকার নাম"
          />
        </label>
        <SkillSelect
          value={skill}
          onChange={(value) => {
            setSkill(value);
            setPage(1);
          }}
        />
        <AreaSelect
          value={area}
          onChange={(value) => {
            setArea(value);
            setPage(1);
          }}
        />
        <button
          className="min-h-11 rounded-xl bg-brand px-5 font-bold text-white disabled:opacity-60"
          type="submit"
          disabled={parseQuery.isPending}
        >
          {parseQuery.isPending ? "খুঁজছি..." : "খুঁজুন"}
        </button>
        <label className="text-sm text-slate-600 md:col-span-4">
          সাজান{" "}
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as typeof sort);
              setPage(1);
            }}
            className="ml-2 h-10 rounded-lg border border-slate-200 bg-white px-3"
          >
            <option value="relevance">প্রাসঙ্গিকতা</option>
            <option value="rating">রেটিং</option>
            <option value="experience">অভিজ্ঞতা</option>
            <option value="rate">সর্বনিম্ন চার্জ</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-5 text-sm text-slate-600 md:col-span-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => {
                setVerifiedOnly(event.target.checked);
                setPage(1);
              }}
            />
            যাচাইকৃত কারিগর
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={availableNow}
              onChange={(event) => {
                setAvailableNow(event.target.checked);
                setPage(1);
              }}
            />
            এখন কাজ নিতে পারবেন
          </label>
        </div>
      </form>

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Search} text="এই খোঁজে কোনো কারিগর পাওয়া যায়নি।" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((technician) => (
              <Link
                key={technician.id}
                href={`/technicians/${technician.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-brand">
                    {technician.photoUrl ? (
                      <Image
                        src={technician.photoUrl}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized
                        className="size-full object-cover"
                      />
                    ) : (
                      <UserRound />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-1 font-bold text-brand">
                      {technician.name}
                      {technician.verified ? (
                        <BadgeCheck
                          aria-label="যাচাইকৃত"
                          className="size-4 text-emerald-600"
                        />
                      ) : null}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {formatNumber(technician.experienceYears)} বছরের অভিজ্ঞতা
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-1 text-sm text-slate-600">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {technician.ratingAvg.toFixed(1)} (
                  {formatNumber(technician.ratingCount)} রিভিউ)
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {technician.skills.map(skillName).filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {technician.areas.map(areaName).filter(Boolean).join(" · ")}
                </p>
                <p className="mt-4 font-bold text-cta">
                  {technician.rateMin != null
                    ? formatMoney(technician.rateMin)
                    : "চার্জ আলোচনা সাপেক্ষে"}
                  {technician.rateMax != null
                    ? ` – ${formatMoney(technician.rateMax)}`
                    : ""}
                </p>
              </Link>
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </PageContainer>
  );
}

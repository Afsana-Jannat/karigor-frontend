"use client";

import { CalendarDays, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/shared/app-card";
import { Money } from "@/components/shared/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { useMetaOptions } from "@/features/meta";
import { formatDate, formatNumber } from "@/lib/format";
import { jobStatusLabels } from "@/lib/labels";
import type { JobListItem } from "../types";

type JobCardProps = { job: JobListItem; isCustomer: boolean };

export function JobCard({ job, isCustomer }: JobCardProps) {
  const { skillName, areaName } = useMetaOptions();
  const canViewBids = isCustomer && job.status === "OPEN";
  const hasContract = [
    "CONTRACT_PENDING",
    "IN_PROGRESS",
    "AWAITING_CONFIRMATION",
    "COMPLETED",
    "DISPUTED",
  ].includes(job.status);

  return (
    <AppCard>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-brand">{skillName(job.skill)}</h2>
        <StatusBadge labels={jobStatusLabels} status={job.status} />
      </div>

      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-slate-400" aria-hidden="true" />
          <dt className="sr-only">এলাকা</dt>
          <dd>{areaName(job.area)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
          <dt className="sr-only">তারিখ</dt>
          <dd>{formatDate(job.preferredDate)}</dd>
        </div>
        {job.counterpart ? (
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-slate-400" aria-hidden="true" />
            <dt className="sr-only">নাম</dt>
            <dd>{job.counterpart.name}</dd>
          </div>
        ) : null}
      </dl>

      {job.agreedPrice !== null ? (
        <p className="mt-4 text-sm text-slate-500">
          নির্ধারিত দাম: <Money amount={job.agreedPrice} />
        </p>
      ) : null}

      {canViewBids || hasContract ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {canViewBids ? (
            <span className="text-sm text-slate-600">
              {formatNumber(job.bidCount ?? 0)}টি প্রস্তাব
            </span>
          ) : null}
          <Link
            href={
              canViewBids ? `/jobs/${job.id}/bids` : `/jobs/${job.id}/contract`
            }
            className={buttonVariants({ variant: "accent", size: "default" })}
          >
            {canViewBids ? "প্রস্তাব দেখুন" : "চুক্তি দেখুন"}
          </Link>
        </div>
      ) : null}
    </AppCard>
  );
}

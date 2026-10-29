"use client";

import {
  CalendarDays,
  Clock,
  MapPin,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppCard } from "@/components/shared/app-card";
import { Money } from "@/components/shared/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMetaOptions } from "@/features/meta";
import { formatDate, formatNumber, formatRelative } from "@/lib/format";
import { bidStatusLabels } from "@/lib/labels";
import type { OpenJobItem } from "../types";

type OpenJobCardProps = {
  job: OpenJobItem;
  /**
   * Where Samir's <PlaceBidForm> goes. Until it is merged the page passes a
   * placeholder here, so this card never imports another person's feature.
   */
  bidSlot?: ReactNode;
};

export function OpenJobCard({ job, bidSlot }: OpenJobCardProps) {
  const { skillName, areaName } = useMetaOptions();

  return (
    <AppCard>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-brand">{skillName(job.skill)}</h2>
        {job.isEmergency ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            জরুরি
          </span>
        ) : null}
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-slate-600">
        {job.description}
      </p>

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
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-slate-400" aria-hidden="true" />
          <dt className="sr-only">গ্রাহক</dt>
          <dd>{job.customerName}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-slate-400" aria-hidden="true" />
          <dt className="sr-only">মেয়াদ</dt>
          <dd>মেয়াদ শেষ: {formatRelative(job.expiresAt)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="text-slate-600">
          {formatNumber(job.bidCount)}টি প্রস্তাব এসেছে
        </span>
        {job.myBid ? (
          <span className="flex items-center gap-2">
            <span className="text-slate-500">আপনার প্রস্তাব:</span>
            <Money amount={job.myBid.price} />
            <StatusBadge labels={bidStatusLabels} status={job.myBid.status} />
          </span>
        ) : null}
      </div>

      {bidSlot ? <div className="mt-4">{bidSlot}</div> : null}
    </AppCard>
  );
}

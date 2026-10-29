'use client';

import { CalendarDays, MapPin, UserRound } from 'lucide-react';
import Link from 'next/link';
import { AppCard } from '@/components/shared/app-card';
import { Money } from '@/components/shared/money';
import { StatusBadge } from '@/components/shared/status-badge';
import { useMetaOptions } from '@/features/meta';
import { formatDate, formatNumber } from '@/lib/format';
import { jobStatusLabels } from '@/lib/labels';
import type { JobListItem } from '../types';

type JobCardProps = { job: JobListItem };

export function JobCard({ job }: JobCardProps) {
  const { skillName, areaName } = useMetaOptions();

  return (
    // The whole card opens the job. The title link stretches over the card,
    // and the bids link sits above it, so we never nest one link in another.
    <AppCard interactive className="relative">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-brand">
          <Link
            href={`/jobs/${job.id}`}
            className="after:absolute after:inset-0 after:rounded-3xl"
          >
            {skillName(job.skill)}
          </Link>
        </h2>
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

      {job.status === 'OPEN' ? (
        <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-600">
            {formatNumber(job.bidCount ?? 0)}টি প্রস্তাব
          </span>
          <Link
            href={`/jobs/${job.id}/bids`}
            className="inline-flex min-h-11 items-center text-sm font-bold text-accent hover:text-accent-dark"
          >
            প্রস্তাব দেখুন
          </Link>
        </div>
      ) : null}
    </AppCard>
  );
}

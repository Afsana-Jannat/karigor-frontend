'use client';

import { Briefcase, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AppCard } from '@/components/shared/app-card';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingState } from '@/components/shared/loading-state';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { buttonVariants } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { jobStatusLabels } from '@/lib/labels';
import { useSession } from '@/lib/session/use-session';
import { cn } from '@/lib/utils';
import { JobCard } from '../components/job-card';
import { useMyJobs } from '../queries';
import type { JobStatus } from '../types';

const statuses = Object.keys(jobStatusLabels) as JobStatus[];

function readStatus(value: string | null): JobStatus | '' {
  return statuses.includes(value as JobStatus) ? (value as JobStatus) : '';
}

function readPage(value: string | null) {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** My jobs: /jobs. Reads and writes ?status= and ?page= so the page can be shared. */
export default function MyJobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user } = useSession();

  const status = readStatus(searchParams.get('status'));
  const page = readPage(searchParams.get('page'));

  const { data, isPending, isError, error, refetch } = useMyJobs({ status, page, pageSize: 10 });

  function update(next: { status?: JobStatus | ''; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.status !== undefined) {
      if (next.status) params.set('status', next.status);
      else params.delete('status');
      params.delete('page'); // a new filter starts at page 1
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set('page', String(next.page));
      else params.delete('page');
    }
    const text = params.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  }

  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <PageContainer>
      <PageHeader
        eyebrow="আমার কাজ"
        title="আমার কাজগুলো"
        description="আপনার সব কাজ এক জায়গায় দেখুন।"
        actions={
          isCustomer ? (
            <Link href="/jobs/new" className={buttonVariants({ variant: 'accent' })}>
              কাজ পোস্ট করুন
            </Link>
          ) : null
        }
      />

      {/* Status filter chips */}
      {/** biome-ignore lint/a11y/useSemanticElements: <explanation> */}
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="অবস্থা">
        {(['', ...statuses] as const).map((value) => {
          const active = value === status;
          return (
            <button
              key={value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => update({ status: value })}
              className={cn(
                'min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition',
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {value ? jobStatusLabels[value] : 'সব'}
            </button>
          );
        })}
      </div>

      {/* Total from meta.total (the count of every job, not only this page) */}
      {data ? (
        <AppCard small className="mb-6 inline-flex items-center gap-3">
          <Briefcase className="size-5 text-brand" aria-hidden="true" />
          <span className="text-sm text-slate-600">
            মোট কাজ: <strong className="text-brand">{formatNumber(data.meta.total)}</strong>
          </span>
        </AppCard>
      ) : null}

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={isCustomer ? Briefcase : Search}
          text={
            status
              ? 'এই অবস্থায় কোনো কাজ নেই।'
              : isCustomer
                ? 'আপনি এখনো কোনো কাজ পোস্ট করেননি।'
                : 'আপনার এখনো কোনো কাজ নেই।'
          }
          action={
            isCustomer ? (
              <Link href="/jobs/new" className={buttonVariants({ variant: 'accent' })}>
                কাজ পোস্ট করুন
              </Link>
            ) : (
              <Link href="/jobs/open" className={buttonVariants({ variant: 'accent' })}>
                খোলা কাজ দেখুন
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}
    </PageContainer>
  );
}

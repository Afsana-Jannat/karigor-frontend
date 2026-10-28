import { requestApi, requestApiPage } from '@/lib/apiClient';
import type {
  CreateJobInput,
  CreateJobResult,
  JobDetail,
  JobListFilters,
  JobListItem,
  OpenJobItem,
} from './types';

// Raw requests only. Components never call these directly: use queries.ts.

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

/** GET /jobs: the user's own jobs (customer or technician). */
export const getMyJobs = ({ status, page = 1, pageSize = 10 }: JobListFilters = {}) =>
  requestApiPage<JobListItem>(`jobs${toQuery({ status, page, pageSize })}`);

/** GET /jobs/open: technician feed. 409 means no technician profile yet. */
export const getOpenJobs = ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}) =>
  requestApiPage<OpenJobItem>(`jobs/open${toQuery({ page, pageSize })}`);

/** POST /jobs */
export const createJob = (input: CreateJobInput) =>
  requestApi<CreateJobResult>('jobs', { method: 'POST', body: input });

/** GET /jobs/:id (Phase 2) */
export const getJob = (id: string) => requestApi<JobDetail>(`jobs/${id}`);

/** POST /jobs/:id/cancel (Phase 2) */
export const cancelJob = (id: string, reason?: string) =>
  requestApi<unknown>(`jobs/${id}/cancel`, {
    method: 'POST',
    body: reason ? { reason } : {},
  });

/** POST /jobs/:id/complete (Phase 2) */
export const completeJob = (id: string) =>
  requestApi<unknown>(`jobs/${id}/complete`, { method: 'POST' });

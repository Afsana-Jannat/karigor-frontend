'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiClient';
import { cancelJob, completeJob, createJob, getJob, getMyJobs, getOpenJobs } from './api';
import { jobKeys } from './keys';
import type { JobListFilters } from './types';

// Keys owned by other people. We only invalidate them, we never read them.
const technicianKey = ['technician'] as const;
const notificationKey = ['notifications'] as const;

/** My jobs list. Keeps the old page on screen while the next page loads. */
export const useMyJobs = (filters: JobListFilters) =>
  useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => getMyJobs(filters),
    placeholderData: keepPreviousData,
  });

/** Technician open jobs feed. Refetches every 60 seconds. */
export const useOpenJobs = (filters: { page?: number; pageSize?: number } = {}) =>
  useQuery({
    queryKey: jobKeys.open(filters),
    queryFn: () => getOpenJobs(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    retry: false,
  });

/** One job. Afsana and Samir reuse this. Refetches every 20 seconds until the job is finished. */
export const useJob = (id: string) =>
  useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getJob(id),
    refetchInterval: (query) => {
      const status = query.state.data?.job.status;
      return status === 'COMPLETED' || status === 'CANCELLED' ? false : 20_000;
    },
  });

function useInvalidateJobs() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: jobKeys.all });
    qc.invalidateQueries({ queryKey: technicianKey });
    qc.invalidateQueries({ queryKey: notificationKey });
  };
}

export const useCreateJob = () => {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => invalidate(),
    // The form shows the error under the field or in an error box, so no toast here.
  });
};

export const useCancelJob = (jobId: string) => {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (reason?: string) => cancelJob(jobId, reason),
    onSuccess: () => {
      invalidate();
      toast.success('কাজটি বাতিল করা হয়েছে');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useCompleteJob = (jobId: string) => {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: () => completeJob(jobId),
    onSuccess: () => {
      invalidate();
      toast.success('কাজ শেষ হয়েছে বলে জানানো হয়েছে');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

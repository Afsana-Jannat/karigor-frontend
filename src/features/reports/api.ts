import { requestApi, requestApiPage } from '@/lib/apiClient';

export interface CreateReportPayload {
  reason: 'NO_SHOW' | 'POOR_WORK' | 'OVERCHARGE' | 'FRAUD' | 'OTHER';
  details?: string;
}

export async function submitJobReport(jobId: string, data: CreateReportPayload) {
  return await requestApi(`/jobs/${jobId}/report`, {
    method: 'POST',
    body: data,
  });
}

export async function getMyReports(page = 1, pageSize = 10) {
  return await requestApiPage(`/reports/mine?page=${page}&pageSize=${pageSize}`);
}
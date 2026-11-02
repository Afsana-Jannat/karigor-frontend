import { requestApi } from '@/lib/apiClient';

export interface CreateReviewPayload {
  rating: number; // ১ থেকে ৫
  comment?: string; // সর্বোচ্চ ৩০০ ক্যারেক্টার
}

export async function submitJobReview(jobId: string, data: CreateReviewPayload) {
  return await requestApi(`/jobs/${jobId}/review`, {
    method: 'POST',
    body: data,
  });
}
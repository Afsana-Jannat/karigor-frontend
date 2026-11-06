import { requestApi } from '@/lib/apiClient';
import type { MyProfile, DashboardData, ExtractResult } from './types';

export async function getMyProfile(): Promise<MyProfile> {
  return requestApi<MyProfile>('technicians/me/profile');
}

export async function upsertProfile(formData: FormData): Promise<MyProfile> {
  return requestApi<MyProfile>('technicians/me/profile', {
    method: 'PUT',
    body: formData,
  });
}

export async function setAvailability(isAvailableNow: boolean): Promise<{ isAvailableNow: boolean }> {
  return requestApi('technicians/me/availability', {
    method: 'PATCH',
    body: { isAvailableNow },
  });
}

export async function submitVerification(formData: FormData): Promise<{ verifyStatus: string }> {
  return requestApi('technicians/me/verification', {
    method: 'POST',
    body: formData,
  });
}

export async function getDashboard(): Promise<DashboardData> {
  return requestApi<DashboardData>('technicians/me/dashboard');
}

export async function extractAnswerText(questionKey: string, text: string): Promise<ExtractResult> {
  return requestApi<ExtractResult>('technicians/onboarding/extract', {
    method: 'POST',
    body: { questionKey, text },
  });
}

export async function extractAnswerAudio(questionKey: string, blob: Blob, mimeType: string): Promise<ExtractResult> {
  // Pick the right file extension from the mimeType.
  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
  const fd = new FormData();
  fd.append('questionKey', questionKey);
  fd.append('audio', blob, `answer.${ext}`);
  return requestApi<ExtractResult>('technicians/onboarding/extract', {
    method: 'POST',
    body: fd,
  });
}
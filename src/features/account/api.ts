import { requestApi } from '@/lib/apiClient';

export interface UpdateUserPayload {
  name: string;
}

export async function updateMyProfile(data: UpdateUserPayload) {
  return await requestApi('/users/me', {
    method: 'PATCH',
    body: data,
  });
}

export async function logoutEverywhere() {
  return await requestApi('/auth/logout-all', {
    method: 'POST',
  });
}

export async function deleteMyAccount(confirmText: string) {
  return await requestApi('/users/me', {
    method: 'DELETE',
    body: { confirm: confirmText },
  });
}
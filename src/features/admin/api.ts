import { requestApi, requestApiPage } from '@/lib/apiClient';
import type {
  AdminStats,
  AdminVerificationItem,
  AdminVerificationDetail,
  AdminUserListItem,
  AdminUserDetail,
  AdminJobListItem,
  AdminReportListItem,
  AdminAuditLogItem,
} from './types';


export function getAdminStats() {
  return requestApi<AdminStats>('/admin/stats');
}


export function getAdminVerifications(status = 'PENDING', page = 1) {
  return requestApiPage<AdminVerificationItem>(`/admin/verifications?status=${status}&page=${page}`);
}

export function getAdminVerificationDetail(technicianId: string) {
  return requestApi<AdminVerificationDetail>(`/admin/verifications/${technicianId}`);
}

export function approveTechnician(technicianId: string) {
  return requestApi<{ success: true }>(`/admin/verifications/${technicianId}/approve`, {
    method: 'POST',
  });
}

export function rejectTechnician(technicianId: string, reason: string) {
  return requestApi<{ success: true }>(`/admin/verifications/${technicianId}/reject`, {
    method: 'POST',
    body: { reason },
  });
}

// Users
export function getAdminUsers(params: { role?: string; status?: string; q?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', String(params.page));
  return requestApiPage<AdminUserListItem>(`/admin/users?${query.toString()}`);
}

export function getAdminUserDetail(userId: string) {
  return requestApi<AdminUserDetail>(`/admin/users/${userId}`);
}

export function toggleBlockUser(userId: string, blocked: boolean, reason: string) {
  return requestApi<{ success: true }>(`/admin/users/${userId}/block`, {
    method: 'PATCH',
    body: { blocked, reason },
  });
}

// Jobs
export function getAdminJobs(params: { status?: string; skill?: string; area?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.skill) query.set('skill', params.skill);
  if (params.area) query.set('area', params.area);
  if (params.page) query.set('page', String(params.page));
  return requestApiPage<AdminJobListItem>(`/admin/jobs?${query.toString()}`);
}

// Reports
export function getAdminReports(status = 'OPEN', page = 1) {
  return requestApiPage<AdminReportListItem>(`/admin/reports?status=${status}&page=${page}`);
}

export function resolveAdminReport(reportId: string, decision: 'COMPLETE' | 'CANCEL' | 'DISMISS', resolution: string) {
  return requestApi<{ success: true }>(`/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    body: { decision, resolution },
  });
}

// Audit Logs
export function getAdminAuditLogs(params: { action?: string; entityType?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.action) query.set('action', params.action);
  if (params.entityType) query.set('entityType', params.entityType);
  if (params.page) query.set('page', String(params.page));
  return requestApiPage<AdminAuditLogItem>(`/admin/audit-logs?${query.toString()}`);
}
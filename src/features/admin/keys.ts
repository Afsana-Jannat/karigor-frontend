export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  verifications: (status: string, page: number) => [...adminKeys.all, 'verifications', status, page] as const,
  verificationDetail: (id: string) => [...adminKeys.all, 'verification', id] as const,
  users: (filters: object) => [...adminKeys.all, 'users', filters] as const,
  userDetail: (id: string) => [...adminKeys.all, 'user', id] as const,
  jobs: (filters: object) => [...adminKeys.all, 'jobs', filters] as const,
  reports: (status: string, page: number) => [...adminKeys.all, 'reports', status, page] as const,
  auditLogs: (filters: object) => [...adminKeys.all, 'audit-logs', filters] as const,
};
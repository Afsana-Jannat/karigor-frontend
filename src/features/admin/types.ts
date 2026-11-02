import type { PageMeta } from '@/lib/apiClient';

export interface AdminStats {
  usersByRole: {
    CUSTOMER: number;
    TECHNICIAN: number;
    ADMIN: number;
  };
  techniciansByVerifyStatus: {
    NONE: number;
    PENDING: number;
    VERIFIED: number;
    REJECTED: number;
  };
  jobsByStatus: {
    OPEN: number;
    CONTRACT_PENDING: number;
    IN_PROGRESS: number;
    AWAITING_CONFIRMATION: number;
    COMPLETED: number;
    CANCELLED: number;
    DISPUTED: number;
  };
  openReports: number;
  totalPaidAmount: number;
  newUsersLast7Days: number;
}

export interface AdminVerificationItem {
  id: string; 
  name: string;
  photoUrl: string | null;
  submittedAt: string;
  verifyStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface AdminVerificationDetail {
  technicianId: string;
  name: string;
  phone: string;
  age: number;
  bio: string | null;
  experienceYears: number;
  skills: string[];
  areas: string[];
  rateMin: number | null;
  rateMax: number | null;
  photoUrl: string | null;
  nidUrl: string; 
  verifyStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectReason: string | null;
  submittedAt: string;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  isVerified: boolean;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  isVerified: boolean;
  createdAt: string;
  profileSummary?: {
    verifyStatus: string;
    completedJobs: number;
    ratingAvg: number;
  };
  jobCounts: Record<string, number>;
  reportsFiledCount: number;
  reportsReceivedCount: number;
  totalPaymentAmount: number;
}

export interface AdminJobListItem {
  id: string;
  skill: string;
  area: string;
  status: string;
  customerId: string;
  customerName: string;
  technicianId: string | null;
  technicianName: string | null;
  agreedPrice: number | null;
  createdAt: string;
}

export interface AdminReportListItem {
  id: string;
  jobId: string;
  reporterId: string;
  reporterName: string;
  againstName: string;
  reason: 'NO_SHOW' | 'POOR_WORK' | 'OVERCHARGE' | 'FRAUD' | 'OTHER';
  details: string | null;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  resolution: string | null;
  createdAt: string;
}

export interface AdminAuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}
// Shapes come from section 9.5 of the guide.
// (verify) = check the real response in Postman before trusting the type.

export type JobStatus =
  | 'OPEN'
  | 'CONTRACT_PENDING'
  | 'IN_PROGRESS'
  | 'AWAITING_CONFIRMATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type Counterpart = { id: string; name: string };

/** One row of GET /jobs. */
export type JobListItem = {
  id: string;
  skill: string; // slug, never shown: use skillName()
  area: string; // slug, never shown: use areaName()
  status: JobStatus;
  preferredDate: string;
  agreedPrice: number | null;
  createdAt: string;
  /** Only for OPEN jobs. */
  bidCount?: number;
  counterpart: Counterpart | null;
};

export type JobListFilters = {
  status?: JobStatus | '';
  page?: number;
  pageSize?: number;
};

/** One row of GET /jobs/open. */
export type OpenJobItem = {
  id: string;
  skill: string;
  area: string;
  description: string;
  preferredDate: string;
  isEmergency: boolean;
  expiresAt: string;
  bidCount: number;
  customerName: string;
  myBid: { price: number; status: string } | null;
};

export type CreateJobInput = {
  skill: string;
  area: string;
  description: string;
  /** YYYY-MM-DD, ASCII digits. */
  preferredDate: string;
  isEmergency: boolean;
};

/** POST /jobs answers 201 with the job and notifiedCount. */
export type CreateJobResult = {
  job: { id: string } & Partial<JobListItem>;
  notifiedCount: number;
};

/** GET /jobs/:id is a Phase 2 endpoint. (verify) every field in Postman. */
export type JobDetail = {
  job: {
    id: string;
    skill: string;
    area: string;
    description: string;
    status: JobStatus;
    preferredDate: string;
    agreedPrice: number | null;
    isEmergency?: boolean;
    cancelReason?: string | null;
    expiresAt?: string;
    createdAt?: string;
  };
  contract?: unknown;
  payment?: unknown;
  allowedActions: string[];
  counterpart?: { id?: string; name: string; phone?: string } | null;
};

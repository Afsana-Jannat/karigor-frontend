// Shapes come from section 9.5 of the guide.
// (verify) = check the real response in Postman before trusting the type.

export type JobStatus =
  | "OPEN"
  | "CONTRACT_PENDING"
  | "IN_PROGRESS"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

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
  status?: JobStatus | "";
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
  myBid: { price: number; status: BidStatus } | null;
};

export type JobBid = {
  id: string;
  bidId: string;
  price: number;
  note: string | null;
  status: BidStatus;
  createdAt: string;
  technician: {
    id: string;
    name: string;
    photoUrl: string | null;
    verified: boolean;
    ratingAvg: number;
    ratingCount: number;
    completedJobs: number;
    experienceYears: number;
  };
};

export type JobDetail = {
  id: string;
  skill: string;
  area: string;
  status: JobStatus;
  preferredDate: string;
  description: string;
  isEmergency: boolean;
  expiresAt: string | null;
  agreedPrice: number | null;
  createdAt: string;
  bidCount: number;
  counterpart: (Counterpart & { phone?: string | null }) | null;
  contract: {
    id: string;
    status: "PENDING" | "SIGNED" | "VOID";
    customerSignedAt: string | null;
    technicianSignedAt: string | null;
  } | null;
  payment: { paidAt: string | null; method: "BKASH" | "CASH" | null } | null;
  allowedActions: string[];
  review?: { id: string; rating: number; comment: string | null } | null;
};

export type BidStatus = "ACTIVE" | "SELECTED" | "REJECTED" | "WITHDRAWN";

export type CreateBidInput = {
  price: number;
  note?: string;
};

export type Bid = {
  id: string;
  jobId: string;
  technicianId: string;
  price: number;
  note: string | null;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
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

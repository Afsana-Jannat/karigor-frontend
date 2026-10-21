import { requestApi } from "./apiClient";

export type JobStatus =
  | "OPEN"
  | "CONTRACT_PENDING"
  | "IN_PROGRESS"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type JobOption = {
  slug: string;
  en: string;
  bn: string;
};

export type JobOptions = {
  skills: JobOption[];
  areas: JobOption[];
};

export type SignedInUser = {
  id: string;
  name: string;
  phone?: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
};

function describeCurrentUserShape(value: unknown) {
  const parts: string[] = [];
  let candidate = value;
  let location = "response";

  for (let depth = 0; depth < 3; depth += 1) {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      Array.isArray(candidate)
    ) {
      parts.push(
        `${location} is ${candidate === null ? "null" : typeof candidate}`,
      );
      break;
    }

    const record = candidate as Record<string, unknown>;
    parts.push(
      `${location} keys: ${Object.keys(record).join(", ") || "(none)"}`,
    );
    if ("role" in record) {
      parts.push(
        `field types: id=${typeof record.id}, name=${typeof record.name}, role=${typeof record.role}`,
      );
      break;
    }

    if ("user" in record) {
      candidate = record.user;
      location += ".user";
    } else if ("data" in record) {
      candidate = record.data;
      location += ".data";
    } else {
      break;
    }
  }

  return parts.join("; ");
}

function normalizeCurrentUser(value: unknown): SignedInUser {
  let candidate = value;

  for (let depth = 0; depth < 3; depth += 1) {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      Array.isArray(candidate)
    ) {
      break;
    }

    const record = candidate as Record<string, unknown>;
    if ("role" in record) {
      const { id, name, phone, role } = record;
      if (
        typeof id !== "string" ||
        typeof name !== "string" ||
        (role !== "CUSTOMER" && role !== "TECHNICIAN" && role !== "ADMIN") ||
        (phone !== undefined && typeof phone !== "string")
      ) {
        break;
      }

      return {
        id,
        name,
        role,
        ...(typeof phone === "string" ? { phone } : {}),
      };
    }

    if ("user" in record) {
      candidate = record.user;
    } else if ("data" in record) {
      candidate = record.data;
    } else {
      break;
    }
  }

  throw new Error(
    `ব্যাকএন্ডের auth/check-auth response-এ user-এর id, name ও role পাওয়া যায়নি। (${describeCurrentUserShape(value)})`,
  );
}

export type CustomerJob = {
  id: string;
  skill: string;
  area: string;
  status: JobStatus;
  preferredDate: string;
  agreedPrice: number | null;
  createdAt: string;
  bidCount?: number;
  counterpart: { id: string; name: string } | null;
};

export type OpenJob = {
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

export type JobBid = {
  bidId: string;
  price: number;
  note: string | null;
  status: string;
  createdAt: string;
  technician: {
    id: string;
    name: string;
    photoUrl: string | null;
    verified: boolean;
    isAvailableNow: boolean;
    experienceYears: number;
    ratingAvg: number;
    ratingCount: number;
    completedJobs: number;
  };
};

type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function normalizeOption(value: unknown): JobOption | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const option = value as Record<string, unknown>;
  const slug = option.slug;
  const en = option.en ?? option.name;
  const bn = option.bn;
  if (
    typeof slug !== "string" ||
    typeof en !== "string" ||
    typeof bn !== "string"
  ) {
    return null;
  }

  return { slug, en, bn };
}

export function normalizeJobOptions(value: unknown): JobOptions {
  if (!value || typeof value !== "object") {
    throw new Error("সার্ভিস ও এলাকার তালিকা পাওয়া যায়নি।");
  }

  const options = value as Record<string, unknown>;
  const skillsSource = options.skills ?? options.SKILLS;
  const areasSource = options.areas ?? options.AREAS;
  if (!Array.isArray(skillsSource) || !Array.isArray(areasSource)) {
    throw new Error("ব্যাকএন্ড থেকে সার্ভিস ও এলাকার তালিকা সঠিকভাবে আসেনি।");
  }

  const skills = skillsSource.map(normalizeOption);
  const areas = areasSource.map(normalizeOption);
  if (
    skills.some((option) => option === null) ||
    areas.some((option) => option === null)
  ) {
    throw new Error("সার্ভিস বা এলাকার কোনো অপশন সঠিক ফরম্যাটে নেই।");
  }

  return {
    skills: skills.filter((option): option is JobOption => option !== null),
    areas: areas.filter((option): option is JobOption => option !== null),
  };
}

export async function getCurrentUser() {
  const result = await requestApi<unknown>("auth/check-auth");
  return normalizeCurrentUser(result);
}

export async function getJobOptions() {
  const result = await requestApi<unknown>("meta/options");
  return normalizeJobOptions(result);
}

export async function getCustomerJobs() {
  const result = await requestApi<CustomerJob[]>("jobs?page=1&pageSize=20");
  return result;
}

export async function getTechnicianOpenJobs() {
  const result = await requestApi<OpenJob[]>("jobs/open?page=1&pageSize=20");
  return result;
}

export async function createJob(input: {
  skill: string;
  area: string;
  description: string;
  preferredDate: string;
  isEmergency: boolean;
}) {
  return requestApi<{ job: CustomerJob; notifiedCount: number }>("jobs", {
    method: "POST",
    body: input,
  });
}

export async function submitJobBid(
  jobId: string,
  input: { price: number; note?: string },
) {
  return requestApi<{ id: string; price: number; status: string }>(
    `jobs/${encodeURIComponent(jobId)}/bid`,
    { method: "PUT", body: input },
  );
}

export async function withdrawJobBid(jobId: string) {
  return requestApi<{ jobId: string; status: "WITHDRAWN" }>(
    `jobs/${encodeURIComponent(jobId)}/bid`,
    { method: "DELETE" },
  );
}

export async function getCustomerJobBids(jobId: string, sort: string) {
  return requestApi<{
    job: {
      id: string;
      status: JobStatus;
      expiresAt: string;
      bidCount: number;
    };
    bids: JobBid[];
  }>(`jobs/${encodeURIComponent(jobId)}/bids?sort=${sort}`);
}

export type { PageMeta };

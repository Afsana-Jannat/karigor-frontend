import { requestApi } from "@/lib/apiClient";

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

export async function getCurrentUser() {
  const result = await requestApi<unknown>("auth/check-auth");
  return normalizeCurrentUser(result);
}
export const contractKeys = {
  all: ["contracts"] as const,
  byJob: (jobId: string) => [...contractKeys.all, "job", jobId] as const,
  verify: (contractId: string) =>
    [...contractKeys.all, "verify", contractId] as const,
};

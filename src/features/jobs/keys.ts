export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters: object) => [...jobKeys.all, "list", filters] as const,
  open: (filters: object) => [...jobKeys.all, "open", filters] as const,
  myBids: (filters: object) => [...jobKeys.all, "my-bids", filters] as const,
  byId: (jobId: string) => [...jobKeys.all, "detail", jobId] as const,
  bids: (jobId: string, sort: string) =>
    [...jobKeys.all, "bids", jobId, sort] as const,
};

export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters: object) => [...jobKeys.all, "list", filters] as const,
  open: (filters: object) => [...jobKeys.all, "open", filters] as const,
};

export const technicianKeys = {
  all: ['technician'] as const,
  me: () => [...technicianKeys.all, 'me'] as const,
  dashboard: () => [...technicianKeys.all, 'dashboard'] as const,
  list: (filters: object) => [...technicianKeys.all, 'list', filters] as const,
  detail: (id: string) => [...technicianKeys.all, 'detail', id] as const,
  reviews: (id: string, filters: object) => [...technicianKeys.all, 'reviews', id, filters] as const,
};
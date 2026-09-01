/**
 * Project-scoped cache keys. Keep credentials, SQL, and other user data out
 * of keys so caches remain safe to inspect and invalidate.
 */
export const dataMartQueryKeys = {
  all: (projectId: string) => ['data-marts', projectId] as const,
  detail: (projectId: string, dataMartId: string) => ['data-mart', projectId, dataMartId] as const,
  runsRoot: (projectId: string) => ['data-mart-runs', projectId] as const,
  runs: (projectId: string, filtersOrPage: unknown = {}) =>
    ['data-mart-runs', projectId, filtersOrPage] as const,
  reportsRoot: (projectId: string) => ['reports', projectId] as const,
  reports: (projectId: string, filtersOrPage: unknown = {}) =>
    ['reports', projectId, filtersOrPage] as const,
  storagesRoot: (projectId: string) => ['data-storages', projectId] as const,
  storages: (projectId: string, filtersOrPage: unknown = {}) =>
    ['data-storages', projectId, filtersOrPage] as const,
  storageRoot: (projectId: string) => ['data-storage', projectId] as const,
  storage: (projectId: string, storageId: string) =>
    ['data-storage', projectId, storageId] as const,
  destinationsRoot: (projectId: string) => ['data-destinations', projectId] as const,
  destinations: (projectId: string, filtersOrPage: unknown = {}) =>
    ['data-destinations', projectId, filtersOrPage] as const,
  destinationRoot: (projectId: string) => ['data-destination', projectId] as const,
  destination: (projectId: string, destinationId: string) =>
    ['data-destination', projectId, destinationId] as const,
};

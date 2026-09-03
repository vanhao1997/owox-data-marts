import apiClient from '../app/api/apiClient';

export interface FeatureFlags {
  [key: string]: boolean;
}

let cachedFlags: FeatureFlags | null = null;
let fetchPromise: Promise<FeatureFlags> | null = null;

export async function loadRemoteFlags(): Promise<FeatureFlags> {
  if (cachedFlags) return cachedFlags;

  if (fetchPromise) return fetchPromise;

  fetchPromise = apiClient
    .get<FeatureFlags>('/feature-flags', { skipErrorToast: true } as any)
    .then(res => {
      cachedFlags = res.data;
      return res.data;
    })
    .catch(() => {
      return {};
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function getFlag(name: string, defaultValue: boolean = false): boolean {
  return cachedFlags?.[name] ?? defaultValue;
}

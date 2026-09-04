import apiClient, { type AxiosRequestConfig } from '../app/api/apiClient';

export type FeatureFlags = Record<string, boolean>;

let cachedFlags: FeatureFlags | null = null;
let fetchPromise: Promise<FeatureFlags> | null = null;

export async function loadRemoteFlags(): Promise<FeatureFlags> {
  if (cachedFlags) return cachedFlags;

  if (fetchPromise) return fetchPromise;

  const requestConfig: AxiosRequestConfig = { skipErrorToast: true };
  fetchPromise = apiClient
    .get<FeatureFlags>('/feature-flags', requestConfig)
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

export function getFlag(name: string, defaultValue = false): boolean {
  return cachedFlags?.[name] ?? defaultValue;
}

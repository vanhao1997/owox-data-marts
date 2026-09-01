import { isAxiosError } from 'axios';

/** Legacy lookup is valid only when V2 confirms the entity does not exist. */
export function shouldFallbackToLegacyInsight(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

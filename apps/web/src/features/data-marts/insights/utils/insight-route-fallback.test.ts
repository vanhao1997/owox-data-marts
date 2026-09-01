import { describe, expect, it } from 'vitest';
import { shouldFallbackToLegacyInsight } from './insight-route-fallback';

function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe('shouldFallbackToLegacyInsight', () => {
  it('falls back only for a V2 404', () => {
    expect(shouldFallbackToLegacyInsight(axiosError(404))).toBe(true);
  });

  it.each([401, 403, 500, 503])('does not hide an HTTP %s failure', status => {
    expect(shouldFallbackToLegacyInsight(axiosError(status))).toBe(false);
  });

  it('does not treat an unrelated error as a legacy record', () => {
    expect(shouldFallbackToLegacyInsight(new Error('network failed'))).toBe(false);
  });
});

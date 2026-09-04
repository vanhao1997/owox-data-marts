import { describe, expect, it } from 'vitest';
import { signRequest, verifyHmac, bodyHash } from '../src/security.js';

function requestFor(headers) {
  return {
    get(name) {
      return headers[name.toLowerCase()] || '';
    },
  };
}

describe('Admicro extractor HMAC', () => {
  it('accepts a fresh signed body and rejects replay', () => {
    const body = JSON.stringify({ runId: 'run-1' });
    const timestamp = String(Date.now());
    const nonce = 'nonce-1';
    const secret = 'test-secret';
    const signature = signRequest({ timestamp, nonce, body, secret });
    const headers = {
      'x-owox-timestamp': timestamp,
      'x-owox-nonce': nonce,
      'x-owox-body-sha256': bodyHash(body),
      'x-owox-signature': signature,
    };
    expect(verifyHmac(requestFor(headers), body, secret)).toEqual({ ok: true });
    expect(verifyHmac(requestFor(headers), body, secret).ok).toBe(false);
  });

  it('rejects body tampering', () => {
    const body = '{}';
    const timestamp = String(Date.now());
    const secret = 'test-secret';
    const nonce = 'nonce-2';
    const signature = signRequest({ timestamp, nonce, body, secret });
    const result = verifyHmac(
      requestFor({
        'x-owox-timestamp': timestamp,
        'x-owox-nonce': nonce,
        'x-owox-body-sha256': bodyHash(body),
        'x-owox-signature': signature,
      }),
      '{"changed":true}',
      secret
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('body hash');
  });
});

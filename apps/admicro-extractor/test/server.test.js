import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('Admicro extractor HTTP contract', () => {
  it('exposes health without credentials', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      ok: false,
      service: 'admicro-extractor',
      schemaVersion: '1',
      hmacConfigured: false,
    });
  });

  it('requires HMAC on preview', async () => {
    const response = await request(app).post('/v1/preview').send({ reportType: 'campaign' });
    expect([401, 503]).toContain(response.status);
    expect(response.body.error).toEqual(expect.any(String));
  });
});

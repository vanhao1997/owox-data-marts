import { describe, expect, it, vi } from 'vitest';
import { jobLogContext, writeOperationalLog } from '../src/operational-log.js';

describe('Admicro operational logging', () => {
  it('keeps only bounded operational dimensions from a request', () => {
    const context = jobLogContext({
      body: {
        reportType: 'campaign',
        platform: 'mobile',
        username: 'sensitive-user',
        password: 'sensitive-password',
        projectId: 'sensitive-project',
        rawDataview: 'sensitive-payload',
      },
      get: name => (name === 'x-owox-attempt' ? '2' : ''),
    });

    expect(context).toEqual({
      reportType: 'campaign',
      platform: 'mobile',
      attempt: 2,
      retryCount: 1,
    });
    expect(JSON.stringify(context)).not.toMatch(
      /sensitive-user|sensitive-password|sensitive-project|sensitive-payload/
    );
  });

  it('writes one-line JSON without adding request data', () => {
    const output = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    writeOperationalLog(
      'info',
      'job_completed',
      { operation: 'extract', reportType: 'date', statusCode: 200, durationMs: 12 },
      output
    );

    expect(output.info).toHaveBeenCalledOnce();
    expect(JSON.parse(output.info.mock.calls[0][0])).toEqual({
      service: 'admicro-extractor',
      event: 'job_completed',
      operation: 'extract',
      reportType: 'date',
      statusCode: 200,
      durationMs: 12,
    });
  });

  it('uses the preview report default without copying other body fields', () => {
    expect(
      jobLogContext(
        { body: { username: 'secret-user' }, get: () => '' },
        { reportType: 'campaign' }
      )
    ).toEqual({
      reportType: 'campaign',
      platform: 'unknown',
      attempt: 1,
      retryCount: 0,
    });
  });
});

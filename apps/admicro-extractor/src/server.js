import express from 'express';
import { extract, validateRequest } from './extractor.js';
import { verifyHmac } from './security.js';

const app = express();
const port = Number(process.env.PORT || 8091);
const sharedSecret = process.env.ADMICRO_EXTRACTOR_SHARED_SECRET || '';
const enabled =
  String(process.env.ADMICRO_EXTRACTOR_ENABLED || 'true')
    .trim()
    .toLowerCase() !== 'false';
const maxBodyBytes = 512 * 1024;
const configuredConcurrency = Number(process.env.ADMICRO_EXTRACTOR_MAX_CONCURRENCY || 2);
const maxConcurrentJobs =
  Number.isInteger(configuredConcurrency) && configuredConcurrency > 0
    ? Math.min(configuredConcurrency, 100)
    : 2;
let activeJobs = 0;

app.use(
  express.json({
    limit: maxBodyBytes,
    verify: (req, _res, buffer) => {
      req.rawBody = buffer.toString('utf8');
    },
  })
);

app.get('/healthz', (_req, res) => {
  const healthy = !enabled || Boolean(sharedSecret);
  return res.status(healthy ? 200 : 503).json({
    ok: healthy,
    enabled,
    service: 'admicro-extractor',
    schemaVersion: '1',
    hmacConfigured: Boolean(sharedSecret),
  });
});

function requireEnabled(req, res, next) {
  if (!enabled) return res.status(503).json({ error: 'Admicro extractor is disabled' });
  return next();
}

function requireHmac(req, res, next) {
  const result = verifyHmac(req, req.rawBody || '', sharedSecret);
  if (!result.ok) return res.status(result.status).json({ error: result.message });
  return next();
}

app.post('/v1/preview', requireEnabled, requireHmac, async (req, res) => {
  if (activeJobs >= maxConcurrentJobs) {
    return res.status(429).json({ error: 'Admicro extractor concurrency limit reached' });
  }
  activeJobs += 1;
  const abortController = new AbortController();
  const abort = () => abortController.abort(new Error('Client disconnected'));
  req.once('aborted', abort);
  res.once('close', () => {
    if (!res.writableEnded) abort();
  });
  try {
    const request = validateRequest({ ...req.body, reportType: req.body.reportType || 'campaign' });
    const result = await extract(request, { signal: abortController.signal });
    return res.json({
      schemaVersion: '1',
      reportType: request.reportType,
      platform: request.platform,
      fields: result.fields,
      requestedColumnIds: request.columnIds,
    });
  } catch (error) {
    if (abortController.signal.aborted) return;
    const status = [400, 401, 429].includes(error?.statusCode) ? error.statusCode : 502;
    return res
      .status(status)
      .json({ error: error instanceof Error ? error.message : 'Invalid preview request' });
  } finally {
    activeJobs -= 1;
    req.removeListener('aborted', abort);
  }
});

app.post('/v1/extract', requireEnabled, requireHmac, async (req, res) => {
  if (activeJobs >= maxConcurrentJobs) {
    return res.status(429).json({ error: 'Admicro extractor concurrency limit reached' });
  }
  activeJobs += 1;
  const abortController = new AbortController();
  const abort = () => abortController.abort(new Error('Client disconnected'));
  req.once('aborted', abort);
  res.once('close', () => {
    if (!res.writableEnded) abort();
  });
  try {
    const request = validateRequest(req.body);
    const startedAt = Date.now();
    const result = await extract(request, { signal: abortController.signal });
    return res.json({
      schemaVersion: '1',
      fields: result.fields,
      rows: result.rows,
      reportType: request.reportType,
      platform: request.platform,
      dateRange: {
        startDate: request.startDate,
        endDate: request.endDate,
        timezone: request.timezone,
      },
      campaignScope: request.campaignIds.length ? request.campaignIds : ['all'],
      parserVersion: '1.1.0',
      fetchedAt: new Date().toISOString(),
      requestedColumnIds: request.columnIds,
      rowCount: result.rows.length,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    if (abortController.signal.aborted) return;
    const status = [400, 401, 429].includes(error?.statusCode) ? error.statusCode : 502;
    return res
      .status(status)
      .json({ error: error instanceof Error ? error.message : 'Admicro extraction failed' });
  } finally {
    activeJobs -= 1;
    req.removeListener('aborted', abort);
  }
});

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large')
    return res.status(413).json({ error: 'Request payload exceeds 512 KB' });
  return res.status(400).json({ error: 'Invalid JSON request' });
});

export { app };

if (process.env.NODE_ENV !== 'test')
  app.listen(port, '0.0.0.0', () => console.log(`Admicro extractor listening on ${port}`));

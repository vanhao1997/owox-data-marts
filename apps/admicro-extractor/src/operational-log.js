const REPORT_TYPES = new Set(['campaign', 'date']);
const PLATFORMS = new Set(['desktop', 'mobile']);

function boundedAttempt(value) {
  const attempt = Number(value);
  return Number.isInteger(attempt) && attempt >= 1 && attempt <= 100 ? attempt : 1;
}

export function jobLogContext(req, defaults = {}) {
  const body = req?.body && typeof req.body === 'object' ? req.body : {};
  const requestedReportType = body.reportType || defaults.reportType;
  const requestedPlatform = body.platform || defaults.platform;
  const reportType = REPORT_TYPES.has(requestedReportType) ? requestedReportType : 'unknown';
  const platform = PLATFORMS.has(requestedPlatform) ? requestedPlatform : 'unknown';

  const attempt = boundedAttempt(req?.get?.('x-owox-attempt'));
  return {
    reportType,
    platform,
    attempt,
    retryCount: attempt - 1,
  };
}

export function writeOperationalLog(level, event, details = {}, output = console) {
  const entry = {
    ...details,
    service: 'admicro-extractor',
    event,
  };
  const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info';
  output[method](JSON.stringify(entry));
}

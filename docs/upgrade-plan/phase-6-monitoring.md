# Phase 6: Monitoring & Observability

> Priority: TRUNG BINH | Sprint: 6
> Muc tieu: Biet loi truoc khi user bao

## CANH BAO CHO AGENT

- Chi sua files trong `apps/web/src/`
- KHONG gui data ra service ngoai — chi setup infrastructure
- Cac service (Sentry, PostHog) duoc cau hinh qua env variables
- Chay `npm run test -w @owox/web` sau moi task

---

## Task 6.1: Them Web Vitals tracking

### Yeu cau chinh xac

1. Cai dat: `npm install web-vitals -w @owox/web`

2. TAO file `apps/web/src/utils/web-vitals.ts`:

```typescript
import { onCLS, onFID, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

function reportMetric(metric: Metric): void {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
  }

  // Send to analytics endpoint if configured
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (endpoint) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });

    // Use sendBeacon for reliability (fires even on page close)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${endpoint}/web-vitals`, body);
    }
  }
}

export function initWebVitals(): void {
  onCLS(reportMetric);
  onFID(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
  onINP(reportMetric);
}
```

3. Goi `initWebVitals()` trong entry point cua app.
   Tim file: `rg "createRoot\|ReactDOM" apps/web/src -g "*.tsx" --no-heading -l`
   Them SAU `root.render(...)`:

```typescript
import { initWebVitals } from './utils/web-vitals';
initWebVitals();
```

### Files can sua/tao

- TAO: `apps/web/src/utils/web-vitals.ts`
- SUA: entry point file (main.tsx hoac index.tsx)

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
npm run build -w @owox/web
```

---

## Task 6.2: Them error boundary voi reporting

### Van de

`RootErrorBoundary` va `LayoutErrorBoundary` bat loi nhung KHONG gui di dau.

### Yeu cau chinh xac

1. TAO file `apps/web/src/utils/error-reporter.ts`:

```typescript
interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
}

const MAX_ERRORS_PER_SESSION = 10;
let errorCount = 0;

export function reportError(error: Error, componentStack?: string): void {
  // Rate limit to avoid flooding
  if (errorCount >= MAX_ERRORS_PER_SESSION) return;
  errorCount++;

  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    componentStack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  // Log in development
  if (import.meta.env.DEV) {
    console.error('[Error Reporter]', report);
    return;
  }

  // Send to backend error endpoint if available
  const endpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT;
  if (endpoint) {
    fetch(`${endpoint}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).catch(() => {
      // Swallow — we cannot report the reporter failing
    });
  }
}

// Catch unhandled errors globally
export function initGlobalErrorHandlers(): void {
  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message));
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    reportError(error);
  });
}
```

2. SUA error boundary components de goi reportError:

Tim files:
```bash
rg --files apps/web/src/components/errors
```

Trong moi error boundary, tim method `componentDidCatch` hoac `useRouteError`.
THEM goi `reportError`:

```typescript
import { reportError } from '../../utils/error-reporter';

// Trong error handling logic:
reportError(error, errorInfo?.componentStack);
```

3. Goi `initGlobalErrorHandlers()` trong entry point (cung cho voi web-vitals):

```typescript
import { initGlobalErrorHandlers } from './utils/error-reporter';
initGlobalErrorHandlers();
```

### Files can sua/tao

- TAO: `apps/web/src/utils/error-reporter.ts`
- SUA: `apps/web/src/components/errors/RootErrorBoundary.tsx`
- SUA: `apps/web/src/components/errors/LayoutErrorBoundary.tsx`
- SUA: entry point file

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 6.3: API latency tracking trong axios interceptor

### Yeu cau chinh xac

1. SUA file `apps/web/src/app/api/apiClient.ts`

2. THEM request timing trong request interceptor:

```typescript
apiClient.interceptors.request.use(
  (config: ExtendedInternalAxiosRequestConfig) => {
    // THEM dong nay — luu thoi diem bat dau request
    (config as any)._requestStartTime = Date.now();

    // ... GIU NGUYEN logic hien tai ...
    return config;
  },
  // ... GIU NGUYEN error handler ...
);
```

3. THEM vao DAU response interceptor (TRUOC logic hien tai):

```typescript
apiClient.interceptors.response.use(
  response => {
    // THEM tracking logic
    const startTime = (response.config as any)?._requestStartTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      if (import.meta.env.DEV && duration > 3000) {
        console.warn(
          `[Slow API] ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`
        );
      }
    }

    return response;  // GIU NGUYEN return
  },
  // ... GIU NGUYEN error handler hien tai KHONG DOI ...
);
```

### QUAN TRONG

- Chi THEM code moi — KHONG sua logic hien tai
- Tracking chi log khi DEV mode va > 3 giay
- KHONG gui data ra external service

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 6.4: Mo rong feature flags cho remote config

### Van de

`useFlags.ts` da co nhung chi ho tro local flags.

### Yeu cau chinh xac

1. DOC file `apps/web/src/app/store/hooks/useFlags.ts` va
   `apps/web/src/app/store/reducers/flags.reducer.ts` va
   `apps/web/src/app/store/types/default-flags.ts`

2. THEM kha nang load flags tu API:

TAO file `apps/web/src/utils/feature-flags.ts`:

```typescript
import apiClient from '../app/api/apiClient';

export interface FeatureFlags {
  [key: string]: boolean;
}

let cachedFlags: FeatureFlags | null = null;
let fetchPromise: Promise<FeatureFlags> | null = null;

export async function loadRemoteFlags(): Promise<FeatureFlags> {
  // Return cached if available
  if (cachedFlags) return cachedFlags;

  // Deduplicate concurrent calls
  if (fetchPromise) return fetchPromise;

  fetchPromise = apiClient
    .get<FeatureFlags>('/feature-flags', { skipErrorToast: true })
    .then(res => {
      cachedFlags = res.data;
      return res.data;
    })
    .catch(() => {
      // Fallback to empty — local defaults take precedence
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
```

3. KHONG thay doi useFlags.ts hien tai — file moi la OPTIONAL extension
4. File nay chi hoat dong khi backend co endpoint `/api/feature-flags` — NEU KHONG CO, no fallback ve {}

### QUAN TRONG

- Day la OPTIONAL infrastructure — khong bat buoc backend phai co endpoint
- KHONG break local flags logic hien tai
- KHONG import file nay vao bat ky component nao — chi tao san

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

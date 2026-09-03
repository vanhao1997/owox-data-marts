# Phase 3: Test Coverage

> Priority: CAO | Sprint: 3-4
> Muc tieu: Tu 259 test files (~15%) len 70%+ coverage

## CANH BAO CHO AGENT

- KHONG xoa hoac sua test hien co
- Chi THEM test moi
- Test file dat CUNG thu muc voi file duoc test, ten dang `*.test.ts` hoac `*.test.tsx`
- Dung Vitest (da cau hinh san trong project)
- Dung `@testing-library/react` cho component tests
- Dung `happy-dom` lam test environment (da cau hinh trong vite.config.ts)
- Chay `npm run test -w @owox/web` de verify

---

## Task 3.1: Setup MSW (Mock Service Worker) cho API mocking

> **CHI TIET DAY DU:** Xem file 	ask-test-coverage.md — co MSW setup, 10 services, 13 hooks, 10 components.
> Phan duoi day la TOM TAT. Khi thuc hien, dung file task-test-coverage.md.

### Van de

Hien tai tests mock axios truc tiep. Can setup MSW de mock o network level
— chinh xac hon va khong phu thuoc implementation.

### Yeu cau chinh xac

1. Cai dat: `npm install -D msw -w @owox/web`

2. TAO file `apps/web/src/test/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

3. TAO file `apps/web/src/test/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth context
  http.get('/api/auth/context', () => {
    return HttpResponse.json({
      userId: 'test-user-id',
      projectId: 'test-project-id',
      email: 'test@example.com',
      fullName: 'Test User',
      roles: ['admin'],
    });
  }),

  // Data marts list
  http.get('/api/data-marts', () => {
    return HttpResponse.json({
      items: [],
      total: 0,
    });
  }),
];
```

4. TAO file `apps/web/src/test/setup.ts`:

```typescript
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
```

5. SUA `apps/web/vite.config.ts` — them setup file:

```typescript
test: {
  environment: 'happy-dom',
  setupFiles: ['./src/test/setup.ts'],  // THAY [] thanh day
},
```

### Files can sua/tao

- TAO: `apps/web/src/test/mocks/server.ts`
- TAO: `apps/web/src/test/mocks/handlers.ts`
- TAO: `apps/web/src/test/setup.ts`
- SUA: `apps/web/vite.config.ts`
- SUA: `apps/web/package.json` (dependency)

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
```

---

## Task 3.2: Test cho API services (30 files)

### Van de

30 API service files hau nhu KHONG co test.

### Danh sach services can test

Chay lenh de lay danh sach day du:
```bash
rg --files apps/web/src/features -g "*service*.ts" -g "*-service.ts" -g "*-api.service.ts"
```

### Pattern test cho MOI service

Cho moi file service, TAO file test cung thu muc.
Vi du: `data-mart.service.ts` -> `data-mart.service.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/mocks/server';
// Import service functions can test
import { getDataMarts, createDataMart } from './data-mart.service';

describe('DataMartService', () => {
  describe('getDataMarts', () => {
    it('should return paginated data marts', async () => {
      server.use(
        http.get('/api/data-marts', () => {
          return HttpResponse.json({
            items: [{ id: '1', title: 'Test DM' }],
            total: 1,
          });
        })
      );

      const result = await getDataMarts({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test DM');
    });

    it('should handle API error', async () => {
      server.use(
        http.get('/api/data-marts', () => {
          return HttpResponse.json(
            { message: 'Internal error' },
            { status: 500 }
          );
        })
      );

      await expect(getDataMarts({ page: 1, limit: 10 })).rejects.toThrow();
    });
  });
});
```

### Thu tu uu tien (test services NAY truoc)

1. `features/data-marts/shared/services/data-mart.service.ts`
2. `features/idp/services/auth.service.ts`
3. `features/idp/services/auth-api.service.ts`
4. `features/plugins/services/plugins.service.ts`
5. `features/connectors/shared/api/connector-api.service.ts`
6. `features/data-storage/shared/api/data-storage-api.service.ts`
7. `features/project-members/services/project-members.service.ts`
8. `features/api-keys/services/api-keys.service.ts`
9. `features/contexts/services/context.service.ts`
10. `features/data-marts/reports/shared/services/report.service.ts`

### QUAN TRONG

- DOC source code cua MOI service TRUOC khi viet test
- Xac dinh: functions nao export, params nao can, response shape nao
- Mock dung HTTP method + path
- Test CA happy path VA error path
- KHONG mock axios truc tiep — dung MSW

### Kiem tra SAU MOI 3 services

```bash
npm run test -w @owox/web
```

---

## Task 3.3: Test cho custom hooks

### Van de

~47 custom hooks, chi mot so it co test.

### Pattern test cho hooks dung React Query

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/mocks/server';
import { useDataMarts } from './useDataMarts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useDataMarts', () => {
  it('should fetch and return data marts', async () => {
    server.use(
      http.get('/api/data-marts', () => {
        return HttpResponse.json({
          items: [{ id: '1', title: 'Test' }],
          total: 1,
        });
      })
    );

    const { result } = renderHook(() => useDataMarts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useDataMarts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
```

### Thu tu uu tien hooks

1. `features/idp/hooks/useAuth.ts`
2. `features/idp/hooks/useRole.ts`
3. `features/idp/hooks/useProjects.ts`
4. `features/data-marts/shared/hooks/` (tat ca)
5. `features/plugins/hooks/usePlugins.ts`
6. `features/connectors/shared/model/hooks/useConnector.ts`
7. `features/data-storage/shared/model/hooks/useDataStorage.ts`
8. `features/data-destination/shared/model/hooks/useDataDestination.ts`
9. `features/api-keys/hooks/useApiKeys.ts`
10. `hooks/useAutoRefresh.ts` (da co test, kiem tra coverage)
11. `hooks/useDebounce.ts`
12. `hooks/useClipboard.ts`
13. `hooks/useUnsavedGuard.ts`

### QUAN TRONG

- DOC hook source TRUOC khi viet test
- NEU hook da co test file — DOC test hien co, chi THEM test case moi
- Hooks dung useTranslation — mock i18next:
  `vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));`
- Hooks dung react-router — mock:
  `vi.mock('react-router', () => ({ useParams: () => ({ projectId: 'test-id' }), useNavigate: () => vi.fn() }));`

### Kiem tra SAU MOI 5 hooks

```bash
npm run test -w @owox/web
```

---

## Task 3.4: Test cho shared components

### Danh sach 32 shared components

Tim tai `apps/web/src/shared/components/`:
```bash
ls -d apps/web/src/shared/components/*/
```

### Pattern test cho component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from './ConfirmationDialog';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ConfirmationDialog', () => {
  it('should render title and description', () => {
    render(
      <ConfirmationDialog
        open={true}
        title="Delete item?"
        description="This cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmationDialog
        open={true}
        title="Delete?"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should not render when closed', () => {
    render(
      <ConfirmationDialog
        open={false}
        title="Delete?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });
});
```

### Thu tu uu tien (test components NAY truoc)

1. `ConfirmationDialog` — critical UX
2. `Table` — dung nhieu nhat
3. `EmptyStateCard`
4. `StatusLabel`
5. `CopyCredentialsButton`
6. `SecretRevealDialog`
7. `InlineEditTitle`
8. `InlineEditDescription`
9. `Combobox`
10. `TableFilters`

### QUAN TRONG

- DOC component props interface TRUOC
- Test: render, interaction (click, type), edge cases (empty props, long text)
- KHONG test @owox/ui internal behavior — chi test wrapper logic
- NEU component da co test — chi THEM test cases

### Kiem tra SAU MOI 5 components

```bash
npm run test -w @owox/web
```

---

## Task 3.5: Test cho apiClient

### Van de

`apps/web/src/app/api/apiClient.test.ts` da co nhung can mo rong.

### Test cases can them

1. Token refresh race condition — 2 request 401 dong thoi chi trigger 1 refresh
2. 5xx error toast hien thi request ID
3. 403 error voi code ACTION_NOT_ALLOWED_IN_VIEW_ONLY_MODE
4. 404 error toast
5. skipErrorToast option
6. skipAuthHeader option
7. X-OWOX-Authorization header duoc set dung

### Yeu cau chinh xac

1. Mo file `apps/web/src/app/api/apiClient.test.ts`
2. DOC tests hien co
3. THEM test cases moi cho cac truong hop tren
4. KHONG sua tests hien co

### Kiem tra

```bash
npm run test -w @owox/web -- --run apiClient
```

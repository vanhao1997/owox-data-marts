# Task: Test Coverage (MSW + Services + Hooks)

> 30 service files + 47 hooks | Uu tien: CAO
> Uoc tinh: 8-12 gio lam viec

## TONG QUAN

### Hien trang

- 259 test files / 1695 total files (~15% coverage)
- API services: 30 files, hau het KHONG co test
- Custom hooks: ~47 files, khoang 10 da co test
- Shared components: 32, khoang 5 da co test

### Muc tieu

- MSW infrastructure setup
- 10 service tests (uu tien cao nhat)
- 13 hook tests (uu tien cao nhat)
- 10 component tests (uu tien trung binh)

---

## CANH BAO CHO AGENT

- KHONG xoa hoac sua test hien co
- Chi THEM test moi
- Test file dat CUNG thu muc voi file duoc test
- Ten file: `<original-name>.test.ts` hoac `<original-name>.test.tsx`
- Dung Vitest (vi, describe, it, expect, beforeEach, afterEach)
- Dung `@testing-library/react` cho component tests
- Dung `happy-dom` (da cau hinh)
- Chay `npm run test -w @owox/web` sau moi 3 files

---

## Phan 1: MSW Setup

### KIEM TRA file da tao chua

Files can co (da tao truoc do):
- `apps/web/src/test/test-utils.tsx`

Files CAN TAO MOI:

### File 1: `apps/web/src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth context — dung cho moi test can auth
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
  http.get('/api/data-marts', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '20');
    return HttpResponse.json({
      items: [
        { id: 'dm-1', title: 'Test Data Mart 1', status: 'active' },
        { id: 'dm-2', title: 'Test Data Mart 2', status: 'draft' },
      ],
      total: 2,
      page,
      limit,
    });
  }),

  // Connectors
  http.get('/api/connectors', () => {
    return HttpResponse.json([
      { name: 'google-analytics', displayName: 'Google Analytics' },
      { name: 'facebook-ads', displayName: 'Facebook Ads' },
    ]);
  }),

  // Data storages
  http.get('/api/data-storages', () => {
    return HttpResponse.json([]);
  }),

  // Data destinations
  http.get('/api/data-destinations', () => {
    return HttpResponse.json([]);
  }),

  // Plugins
  http.get('/api/plugins/gallery', () => {
    return HttpResponse.json({ items: [], total: 0 });
  }),

  // Project members
  http.get('/api/project-members', () => {
    return HttpResponse.json([]);
  }),

  // Search
  http.get('/api/search', () => {
    return HttpResponse.json({ results: [], total: 0 });
  }),
];
```

### File 2: `apps/web/src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### File 3: `apps/web/src/test/setup.ts`

```typescript
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
```

### File 4: Cap nhat vite.config.ts

SUA `apps/web/vite.config.ts` — thay setupFiles:

```typescript
test: {
  environment: 'happy-dom',
  setupFiles: ['./src/test/setup.ts'],  // THAY [] thanh day
},
```

### Dependency

```bash
npm install -D msw -w @owox/web
```

### Kiem tra

```bash
npm run test -w @owox/web
```

---

## Phan 2: Service Tests (10 files uu tien cao)

### Cach viet test cho MOI service

1. DOC service file — xac dinh:
   - Cac function export
   - HTTP method + URL cho moi function
   - Request params / body shape
   - Response shape

2. TAO test file cung thu muc:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '<relative-path>/test/mocks/server';

// Import functions can test
import { getFunctionName } from './service-name.service';

describe('ServiceName', () => {
  describe('getFunctionName', () => {
    it('should return data on success', async () => {
      server.use(
        http.get('/api/endpoint', () => {
          return HttpResponse.json({ /* expected response */ });
        })
      );

      const result = await getFunctionName(/* params */);
      expect(result).toEqual(/* expected */);
    });

    it('should throw on API error', async () => {
      server.use(
        http.get('/api/endpoint', () => {
          return HttpResponse.json({ message: 'Error' }, { status: 500 });
        })
      );

      await expect(getFunctionName(/* params */)).rejects.toThrow();
    });
  });
});
```

### Danh sach 10 services (theo thu tu uu tien)

1. **`features/data-marts/shared/services/data-mart.service.ts`**
   - Core service, nhieu function
   - Test: list, get, create, update, delete, run

2. **`features/idp/services/auth-api.service.ts`**
   - Auth service — critical path
   - Test: login, refresh, get user, error handling

3. **`features/idp/services/auth.service.ts`**
   - Auth state management
   - Test: getAccessToken, refreshToken, logout

4. **`features/plugins/services/plugins.service.ts`**
   - Plugin gallery + installations
   - Test: list gallery, install, uninstall

5. **`features/connectors/shared/api/connector-api.service.ts`**
   - Connector metadata
   - Test: getAvailable, getSpecification, getFields

6. **`features/data-storage/shared/api/data-storage-api.service.ts`**
   - Data storage CRUD
   - Test: list, create, update, delete

7. **`features/project-members/services/project-members.service.ts`**
   - Member management
   - Test: list, invite, remove, changeRole

8. **`features/api-keys/services/api-keys.service.ts`**
   - API key management
   - Test: list, create, revoke

9. **`features/contexts/services/context.service.ts`**
   - Context CRUD
   - Test: list, create, update, delete

10. **`features/data-marts/reports/shared/services/report.service.ts`**
    - Report management
    - Test: list, create, run, delete

### QUAN TRONG cho MOI service

- DOC source file TRUOC — khong doan API shape
- Xac dinh apiClient base URL (thuong la VITE_PUBLIC_API_URL || '/api')
- Mock dung HTTP method (GET/POST/PUT/DELETE) + dung path
- Test CA success VA error path
- NEU service dung apiClient options (skipErrorToast, etc) — kiem tra

---

## Phan 3: Hook Tests (13 hooks uu tien cao)

### Cach viet test cho hooks dung React Query

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '<relative-path>/test/mocks/server';
import { useMyHook } from './useMyHook';

// Mock react-router neu hook dung useParams
vi.mock('react-router', () => ({
  useParams: () => ({ projectId: 'test-project-id' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// Mock i18next neu hook dung useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useMyHook', () => {
  it('should return data on success', async () => {
    server.use(
      http.get('/api/endpoint', () => {
        return HttpResponse.json({ items: [{ id: '1' }] });
      })
    );

    const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', async () => {
    server.use(
      http.get('/api/endpoint', () => {
        return HttpResponse.json({ message: 'Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

### Danh sach 13 hooks (theo thu tu uu tien)

#### IDP hooks (3)

1. **`features/idp/hooks/useAuth.ts`** — quan trong nhat
2. **`features/idp/hooks/useRole.ts`** — role checking
3. **`features/idp/hooks/useProjects.ts`** — project listing

#### Data hooks (5)

4. **`features/data-storage/shared/model/hooks/useDataStorage.ts`** — DA CO test, them cases
5. **`features/data-destination/shared/model/hooks/useDataDestination.ts`** — DA CO test, them cases
6. **`features/connectors/shared/model/hooks/useConnector.ts`** — DA CO test, them cases
7. **`features/api-keys/hooks/useApiKeys.ts`** — API key mutations
8. **`features/contexts/hooks/useInlineContextCreate.ts`** — mutation hook

#### Global hooks (5)

9. **`hooks/useDebounce.ts`** — utility, don gian
10. **`hooks/useClipboard.ts`** — clipboard API
11. **`hooks/useUnsavedGuard.ts`** — navigation guard
12. **`hooks/useAutoFocus.ts`** — DOM focus
13. **`hooks/useTableStorage.ts`** — table state persistence

### QUAN TRONG cho MOI hook

- DOC hook source TRUOC — hieu dependencies
- NEU hook goi service truc tiep — mock voi MSW
- NEU hook dung useQuery — wrap trong QueryClientProvider
- NEU hook dung useParams — mock react-router
- NEU hook da co test — DOC tests hien co, chi THEM test cases moi
- Test: success, error, loading, edge cases (empty data, null params)

---

## Phan 4: Component Tests (10 components uu tien)

### Cach viet

Dung `renderWithProviders` tu `test/test-utils.tsx` DA TAO:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '<relative-path>/test/test-utils';
import { MyComponent } from './MyComponent';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('MyComponent', () => {
  it('should render', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('expected-text')).toBeInTheDocument();
  });
});
```

### Danh sach 10 components

1. **`shared/components/ConfirmationDialog`** — render, confirm, cancel, close
2. **`shared/components/EmptyStateCard`** — render title, description, action
3. **`shared/components/StatusLabel`** — render cac status khac nhau
4. **`shared/components/CopyCredentialsButton`** — click copy, clipboard API
5. **`shared/components/InlineEditTitle`** — edit mode, save, cancel, validation
6. **`shared/components/InlineEditDescription`** — tuong tu InlineEditTitle
7. **`shared/components/Combobox`** — render options, select, search, clear
8. **`shared/components/TableFilters`** — render filters, apply, reset
9. **`shared/components/ErrorState`** (DA TAO) — render, retry button
10. **`shared/components/SkipToContent`** (DA TAO) — render, a11y attributes

### QUAN TRONG

- DOC component props TRUOC — hieu interface
- Test render, interaction, edge cases
- KHONG test @owox/ui internal — chi test wrapper logic
- Dung `@testing-library/jest-dom` matchers: toBeInTheDocument, toHaveAttribute
- Mock dependencies: useTranslation, useNavigate, clipboard API

---

## Thu tu thuc hien

```
1. MSW setup (30 phut)
2. Service tests — 2 files moi ngay, 5 ngay (uu tien 1-5 truoc)
3. Hook tests — 2-3 files moi ngay, song song voi services
4. Component tests — sau khi services + hooks xong
```

## Kiem tra CUOI CUNG

```bash
npm run test -w @owox/web
npm run test:coverage -w @owox/web  # Kiem tra coverage %
```

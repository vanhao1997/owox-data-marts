# Phase 7: Developer Experience (DX)

> Priority: THAP | Sprint: Ongoing
> Muc tieu: Tang toc phat trien, giam bug

## CANH BAO CHO AGENT

- Chi tao files moi hoac sua config — KHONG refactor code hien tai
- KHONG thay doi build pipeline production
- Chay `npm run test -w @owox/web` sau moi task

---

## Task 7.1: Tao component generator script

### Yeu cau chinh xac

TAO file `apps/web/scripts/generate-feature.mjs`:

```javascript
#!/usr/bin/env node

/**
 * Generate a new feature module with standard structure.
 *
 * Usage:
 *   node scripts/generate-feature.mjs <feature-name>
 *
 * Example:
 *   node scripts/generate-feature.mjs billing
 *
 * Creates:
 *   src/features/billing/
 *     services/billing.service.ts
 *     hooks/useBilling.ts
 *     components/BillingList/BillingList.tsx
 *     components/BillingList/index.ts
 *     types/billing.types.ts
 *     index.ts
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const featureName = process.argv[2];

if (!featureName) {
  console.error('Usage: node scripts/generate-feature.mjs <feature-name>');
  process.exit(1);
}

// Convert kebab-case to PascalCase
const pascal = featureName
  .split('-')
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join('');

// Convert kebab-case to camelCase
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);

const baseDir = resolve(__dirname, '..', 'src', 'features', featureName);

if (existsSync(baseDir)) {
  console.error(`Feature "${featureName}" already exists at ${baseDir}`);
  process.exit(1);
}

const files = {
  [`services/${featureName}.service.ts`]: `import apiClient from '../../../app/api/apiClient';
import type { ${pascal}Response } from '../types/${featureName}.types';

const BASE_URL = '/${featureName}';

export async function get${pascal}List(): Promise<${pascal}Response[]> {
  const response = await apiClient.get<${pascal}Response[]>(BASE_URL);
  return response.data;
}
`,

  [`hooks/use${pascal}.ts`]: `import { useQuery } from '@tanstack/react-query';
import { get${pascal}List } from '../services/${featureName}.service';

export const ${camel}Keys = {
  all: ['${featureName}'] as const,
  list: () => [...${camel}Keys.all, 'list'] as const,
};

export function use${pascal}List() {
  return useQuery({
    queryKey: ${camel}Keys.list(),
    queryFn: get${pascal}List,
  });
}
`,

  [`components/${pascal}List/${pascal}List.tsx`]: `import { useTranslation } from 'react-i18next';
import { use${pascal}List } from '../../hooks/use${pascal}';

export function ${pascal}List() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = use${pascal}List();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error <button onClick={() => refetch()}>Retry</button></div>;
  }

  return (
    <div>
      <h2>{t('${featureName}.title')}</h2>
      {/* TODO: Implement list */}
    </div>
  );
}
`,

  [`components/${pascal}List/index.ts`]: `export { ${pascal}List } from './${pascal}List';
`,

  [`types/${featureName}.types.ts`]: `export interface ${pascal}Response {
  id: string;
  // TODO: Define response shape
}
`,

  ['index.ts']: `export { ${pascal}List } from './components/${pascal}List';
export { use${pascal}List } from './hooks/use${pascal}';
`,
};

// Create directories and files
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = resolve(baseDir, filePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf8');
  console.log(`Created: ${fullPath}`);
}

console.log(`\nFeature "${featureName}" created successfully.`);
console.log('Next steps:');
console.log(`  1. Define types in src/features/${featureName}/types/${featureName}.types.ts`);
console.log(`  2. Implement service in src/features/${featureName}/services/${featureName}.service.ts`);
console.log(`  3. Add i18n keys for "${featureName}" in en.json and vi.json`);
console.log(`  4. Add route in src/routes/index.tsx`);
```

THEM script vao `apps/web/package.json`:
```json
"generate:feature": "node scripts/generate-feature.mjs"
```

### Kiem tra SAU KHI XONG

```bash
cd apps/web && node scripts/generate-feature.mjs test-feature
# Kiem tra output
rm -rf src/features/test-feature  # Xoa test output
npm run lint -w @owox/web
```

---

## Task 7.2: Them API type generation tu OpenAPI spec

### Van de

Backend co Swagger/OpenAPI spec. Frontend dinh nghia types thu cong — de bi lech.

### Yeu cau chinh xac

1. Cai dat: `npm install -D openapi-typescript -w @owox/web`

2. THEM scripts vao `apps/web/package.json`:
```json
"generate:api-types": "openapi-typescript http://localhost:3000/api-docs-json -o src/shared/types/api/generated.d.ts"
```

3. TAO file `apps/web/src/shared/types/api/generated.d.ts` (placeholder):
```typescript
/**
 * Auto-generated from OpenAPI spec.
 * Run: npm run generate:api-types -w @owox/web
 *
 * DO NOT EDIT MANUALLY.
 */

// Generated types will appear here after running the command
export {};
```

4. THEM vao `.gitignore` (apps/web level neu co, hoac root):
   `# Generated API types are committed but regenerated from OpenAPI spec`
   (KHONG gitignore — commit generated types de CI khong can running backend)

### QUAN TRONG

- Day chi la SETUP — khong thay doi existing types
- Developer chay manual khi backend API thay doi
- Generated types la OPTIONAL reference — khong bat buoc dung

### Kiem tra SAU KHI XONG

```bash
npm run lint -w @owox/web
```

---

## Task 7.3: Strict TypeScript settings

### Yeu cau chinh xac

1. DOC file `apps/web/tsconfig.json` hien tai

2. Kiem tra cac strict options:
   - `strict: true` — nen da co (kiem tra)
   - `noUncheckedIndexedAccess` — THEM neu chua co
   - `exactOptionalPropertyTypes` — KHONG them (qua strict, se break nhieu code)

3. NEU `strict` chua true:
   - KHONG bat ngay — se break qua nhieu code
   - Thay vao do, ghi chu "TODO: enable strict mode" trong tsconfig
   - Bat tung option nho: `strictNullChecks`, `strictFunctionTypes`

4. NEU `strict` da true:
   - THEM `"noUncheckedIndexedAccess": true`
   - Chay `npm run type-check -w @owox/web`
   - Fix tat ca errors (thuong la them `?.` hoac `!` check)

### QUAN TRONG

- KHONG bat option se break > 50 files cung luc
- Lam tung option, fix loi, roi bat tiep
- NEU > 100 errors — KHONG bat option do, ghi TODO

### Kiem tra SAU KHI XONG

```bash
npm run type-check -w @owox/web  # KHONG errors
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 7.4: Them test utils cho feature testing

### Yeu cau chinh xac

TAO file `apps/web/src/test/test-utils.tsx`:

```typescript
import { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface WrapperProps {
  children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialRoute = '/',
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  function Wrapper({ children }: WrapperProps) {
    return (
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[initialRoute]}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

export { createTestQueryClient };

// Re-export everything from testing-library
export * from '@testing-library/react';
```

### Su dung trong tests

```typescript
// Thay vi:
import { render } from '@testing-library/react';
// Dung:
import { renderWithProviders } from '../../../test/test-utils';

// Thay vi setup QueryClient, Router, i18n moi lan:
renderWithProviders(<MyComponent />);

// Voi custom route:
renderWithProviders(<MyComponent />, { initialRoute: '/ui/project-1/data-marts' });
```

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 7.5: Documentation cho web architecture

### Yeu cau chinh xac

TAO file `apps/web/ARCHITECTURE.md`:

Noi dung can bao gom:

1. **Thu muc structure** — giai thich tung thu muc trong `src/`:
   - `app/` — API client, store, providers, permissions
   - `features/` — feature modules (moi feature co services, hooks, components, types)
   - `pages/` — page components (route-level)
   - `routes/` — route definitions
   - `shared/` — shared components, hooks, utils, types
   - `layouts/` — layout components (MainLayout, ConnectFlowLayout)
   - `i18n/` — internationalization
   - `hooks/` — global custom hooks
   - `services/` — global services
   - `styles/` — global styles
   - `utils/` — global utilities
   - `test/` — test setup, mocks, utils

2. **Data flow** — giai thich:
   - API calls: `apiClient` -> `service` -> `hook (useQuery)` -> `component`
   - State: React Query cho server state, custom store cho client state
   - Auth: `AuthGuard` -> `useAuth` -> token provider -> apiClient interceptor

3. **Conventions** — giai thich:
   - File naming: kebab-case cho files, PascalCase cho components
   - Feature structure: services/, hooks/, components/, types/
   - i18n: useTranslation() cho tat ca user-facing text
   - Testing: Vitest + Testing Library + MSW

4. **Adding a new feature** — buoc lam:
   - Chay `npm run generate:feature -w @owox/web -- my-feature`
   - Define types
   - Implement service
   - Add i18n keys
   - Add route
   - Write tests

### QUAN TRONG

- Viet bang tieng Anh (documentation chuan)
- Giu ngan gon — developer doc, khong phai tutorial
- Tham chieu den file thuc te trong repo

### Kiem tra

- Doc lai dam bao chinh xac voi code hien tai
- Khong chay test (chi la doc file)

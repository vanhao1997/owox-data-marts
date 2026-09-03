# Phase 1: Performance Optimization

> Priority: CAO | Sprint: 1-2
> Muc tieu: Giam bundle size 30%+, First Contentful Paint < 1.5s

## CANH BAO CHO AGENT

- Chi sua files trong `apps/web/src/`
- KHONG sua `apps/backend/` hoac `packages/`
- KHONG xoa import nao dang duoc su dung
- Chay `npm run test -w @owox/web` sau moi thay doi
- Chay `npm run lint -w @owox/web` sau moi thay doi

---

## Task 1.1: Chuyen cac page chua lazy-load sang lazy()

### Van de

File `apps/web/src/routes/index.tsx` co 6 page import truc tiep (khong lazy).
Trong khi 13 page khac da dung lazy(). Can thong nhat.

6 page CHUA lazy:

1. `ProjectSettingsPage` from `../pages/project-settings/ProjectSettingsPage`
2. `RequestAccessPage` from `../pages/request-access/RequestAccessPage`
3. `LegacyRequestAccessRedirect` from `../pages/request-access/LegacyRequestAccessRedirect`
4. `MyApiKeysPage` from `../features/api-keys/pages/MyApiKeysPage`
5. `SearchPage` from `../pages/search/SearchPage`
6. `ProjectsPage` from `../pages/projects/ProjectsPage`

### Yeu cau chinh xac

1. Mo file `apps/web/src/routes/index.tsx`
2. XOA 6 dong import truc tiep (listed above)
3. THEM 6 lazy import theo DUNG pattern da co trong file:

```typescript
const ProjectSettingsPage = lazy(() =>
  import('../pages/project-settings/ProjectSettingsPage').then(module => ({
    default: module.ProjectSettingsPage,
  }))
);
const RequestAccessPage = lazy(() =>
  import('../pages/request-access/RequestAccessPage').then(module => ({
    default: module.RequestAccessPage,
  }))
);
const LegacyRequestAccessRedirect = lazy(() =>
  import('../pages/request-access/LegacyRequestAccessRedirect').then(module => ({
    default: module.LegacyRequestAccessRedirect,
  }))
);
const MyApiKeysPage = lazy(() =>
  import('../features/api-keys/pages/MyApiKeysPage').then(module => ({
    default: module.MyApiKeysPage,
  }))
);
const SearchPage = lazy(() =>
  import('../pages/search/SearchPage').then(module => ({
    default: module.SearchPage,
  }))
);
const ProjectsPage = lazy(() =>
  import('../pages/projects/ProjectsPage').then(module => ({
    default: module.ProjectsPage,
  }))
);
```

4. Tim tat ca cho dung 6 component nay trong routes array.
   Boc bang `lazyElement()` neu chua co.
   Vi du: `element: <SearchPage />` thanh `element: lazyElement(<SearchPage />)`

5. Dac biet: route `/projects` co `<AuthGuard><ProjectsPage /></AuthGuard>`.
   Doi thanh: `element: <AuthGuard>{lazyElement(<ProjectsPage />)}</AuthGuard>`

### File can sua

- `apps/web/src/routes/index.tsx` — DUY NHAT file nay

### Kiem tra SAU KHI SUA

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
npm run build -w @owox/web
```

---

## Task 1.2: Cau hinh manual chunks trong Vite

### Van de

File `apps/web/vite.config.ts` KHONG co `build.rollupOptions.output.manualChunks`.
Tat ca vendor code nam chung mot chunk lon.

### Yeu cau chinh xac

1. Mo file `apps/web/vite.config.ts`
2. THEM `rollupOptions` vao TRONG object `build` da co:

```typescript
build: {
  minify: mode === 'production',
  sourcemap: mode === 'development',
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-router': ['react-router'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        'vendor-forms': ['react-hook-form', '@hookform/resolvers'],
        'vendor-editor': ['@monaco-editor/react'],
        'vendor-flow': ['@xyflow/react', '@dagrejs/dagre'],
        'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
      },
    },
  },
},
```

3. GIU NGUYEN tat ca cau hinh khac (plugins, esbuild, optimizeDeps, test, server).

### File can sua

- `apps/web/vite.config.ts` — DUY NHAT

### Kiem tra SAU KHI SUA

```bash
npm run build -w @owox/web
# Kiem tra output: dist/assets/ phai co cac file chunk rieng biet
```

---

## Task 1.3: Cau hinh staleTime mac dinh cho TanStack Query

### Van de

Chi co 4 query dat staleTime. Tat ca query con lai dung default = 0
(moi lan component mount = refetch, gay API call thua).

### Yeu cau chinh xac

1. Tim file tao QueryClient. Chay lenh:
   `rg "new QueryClient" apps/web/src -g "*.ts" -g "*.tsx" --no-heading`

2. Them `defaultOptions` vao QueryClient (NEU chua co):

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30 giay
      gcTime: 5 * 60 * 1000,       // 5 phut
      refetchOnWindowFocus: false,  // Khong refetch khi user switch tab
      retry: 1,                     // Chi retry 1 lan
    },
  },
});
```

3. NEU da co defaultOptions, chi THEM cac field chua co. KHONG ghi de field da co.
4. KHONG thay doi bat ky query nao da co staleTime rieng.

### Tim file can sua

```bash
rg "new QueryClient" apps/web/src -g "*.ts" -g "*.tsx" --no-heading
```

### Kiem tra SAU KHI SUA

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 1.4: Them bundle analyzer (dev tool)

### Yeu cau chinh xac

1. Chay: `npm install -D rollup-plugin-visualizer -w @owox/web`

2. Sua `apps/web/vite.config.ts`:
   - THEM import o dau file: `import { visualizer } from 'rollup-plugin-visualizer';`
   - THEM vao cuoi plugins array:

```typescript
plugins: [
  react(),
  tailwindcss(),
  basicSsl(),
  mode === 'analyze' && visualizer({
    open: true,
    filename: 'dist/bundle-report.html',
    gzipSize: true,
  }),
].filter(Boolean),
```

3. Sua `apps/web/package.json` — them script:
   `"build:analyze": "vite build --mode analyze"`

### Files can sua

- `apps/web/vite.config.ts`
- `apps/web/package.json`

### Kiem tra SAU KHI SUA

```bash
npm run build -w @owox/web
npm run lint -w @owox/web
```

---

## Task 1.5: Prefetch routes pho bien

### Yeu cau chinh xac

1. TAO file moi `apps/web/src/utils/prefetch-routes.ts`:

```typescript
export function prefetchCommonRoutes(): void {
  if (typeof window === 'undefined') return;

  const routes = [
    () => import('../pages/data-marts/list/DataMartsPage'),
    () => import('../pages/data-marts/create/CreateDataMartPage'),
    () => import('../pages/search/SearchPage'),
  ];

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      routes.forEach(load => load());
    });
  }
}
```

2. Tim MainLayout component: `apps/web/src/layouts/MainLayout.tsx`
3. THEM useEffect goi prefetch:

```typescript
import { useEffect } from 'react';
import { prefetchCommonRoutes } from '../utils/prefetch-routes';

// Trong component, THEM:
useEffect(() => {
  prefetchCommonRoutes();
}, []);
```

### Files can sua

- TAO MOI: `apps/web/src/utils/prefetch-routes.ts`
- SUA: `apps/web/src/layouts/MainLayout.tsx`

### Kiem tra SAU KHI SUA

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
npm run build -w @owox/web
```

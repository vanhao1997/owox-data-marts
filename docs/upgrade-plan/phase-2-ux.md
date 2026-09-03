# Phase 2: UX Improvements

> Priority: CAO | Sprint: 1-2
> Muc tieu: Trai nghiem nhat quan, responsive, trang thai ro rang

## CANH BAO CHO AGENT

- Chi sua files trong `apps/web/src/`
- KHONG sua API contract hoac backend logic
- PHAI dung components tu `@owox/ui` — KHONG tao component UI moi
- PHAI dung `useTranslation()` cho text — KHONG hardcode tieng Anh/Viet
- Chay `npm run test -w @owox/web` va `npm run lint -w @owox/web` sau moi task

---

## Task 2.1: Hop nhat Toast System (react-hot-toast -> sonner)

> **CHI TIET DAY DU:** Xem file 	ask-toast-migration.md — co 15 batches va 6 buoc tuan tu.
> Phan duoi day la TOM TAT. Khi thuc hien, dung file task-toast-migration.md.

### Van de

Hien tai dung DONG THOI 2 toast library:
- `react-hot-toast` — 81 files import
- `sonner` (qua `@owox/ui/components/sonner`) — chi 1 file (MainLayout)

Can hop nhat ve sonner (da co trong @owox/ui, nhat quan voi design system).

### Yeu cau chinh xac

BUOC 1: Liet ke tat ca file dung react-hot-toast

```bash
rg "import.*from 'react-hot-toast'" apps/web/src -l
```

BUOC 2: Tao file migration utility

TAO file `apps/web/src/shared/utils/toast.ts`:

```typescript
import { toast as sonnerToast } from '@owox/ui/components/sonner';

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  promise: <T>(
    promise: Promise<T>,
    options: { loading: string; success: string; error: string }
  ) => sonnerToast.promise(promise, options),
};
```

BUOC 3: Migrate tung file

Trong MOI file tu danh sach buoc 1:
1. Thay `import toast from 'react-hot-toast'` thanh `import { toast } from '../../shared/utils/toast'`
   (dieu chinh relative path cho dung)
2. Thay `import { toast } from 'react-hot-toast'` tuong tu
3. Kiem tra cac cach goi toast:
   - `toast.success('...')` — GIU NGUYEN (da tuong thich)
   - `toast.error('...')` — GIU NGUYEN
   - `toast('...')` — DOI thanh `toast.success('...')` hoac `toast.error('...')` tuy context
   - `toast.custom(...)` — DOI thanh `sonnerToast(...)` va import truc tiep
   - `toast.dismiss(id)` — GIU NGUYEN

BUOC 4: Kiem tra file `apps/web/src/shared/utils/showApiErrorToast.ts`

File nay dang import `react-hot-toast`. Can sua:
- Doc noi dung file truoc
- Thay import
- Dam bao toast ID logic van hoat dong (sonner ho tro `id` option)

BUOC 5: Xoa Toaster component cu

- File `apps/web/src/shared/components/Toaster/index.tsx` — dang render `<Toaster />` tu react-hot-toast
- Xoa file nay HOAC doi noi dung thanh re-export tu sonner
- Trong `apps/web/src/layouts/MainLayout.tsx` — xoa import `HotToaster`, chi giu `SonnerToaster`

BUOC 6: Xoa dependency

- Sua `apps/web/package.json` — xoa `"react-hot-toast"` khoi `dependencies`
- Chay `npm install` de cap nhat lock file

### QUAN TRONG

- LAM TUNG FILE MOT, test sau moi 5-10 file
- NEU gap toast.custom() hoac pattern dac biet, DOC code xung quanh de hieu context
- KHONG thay doi logic business — chi thay doi toast library

### Files can sua

- 81 files (danh sach tu `rg` command)
- TAO MOI: `apps/web/src/shared/utils/toast.ts`
- XOA/SUA: `apps/web/src/shared/components/Toaster/index.tsx`
- SUA: `apps/web/src/layouts/MainLayout.tsx`
- SUA: `apps/web/package.json`

### Kiem tra SAU KHI XONG

```bash
rg "react-hot-toast" apps/web/src  # Phai tra ve 0 ket qua
npm run test -w @owox/web
npm run lint -w @owox/web
npm run build -w @owox/web
```

---

## Task 2.2: Them Skeleton loading nhat quan cho tat ca list pages

> **CHI TIET DAY DU:** Xem file 	ask-loading-error-empty-states.md — da audit 9 pages, chi 4 can sua.
> Phan duoi day la TOM TAT.

### Van de

`CardSkeleton` component da co nhung chua dung deu.
Nhieu page hien blank khi loading.

### Yeu cau chinh xac

Kiem tra TUNG page sau, neu CHUA co loading state thi THEM:

1. `apps/web/src/pages/data-marts/list/DataMartsPage.tsx`
2. `apps/web/src/pages/data-storage/` (DataStorageListPage)
3. `apps/web/src/pages/data-destination/DataDestinationListPage.tsx`
4. `apps/web/src/pages/plugins/gallery/`
5. `apps/web/src/pages/search/SearchPage.tsx`
6. `apps/web/src/pages/data-marts/runs/DataMartRunsPage.tsx`
7. `apps/web/src/pages/data-marts/schedules/DataMartSchedulesPage.tsx`
8. `apps/web/src/pages/data-marts/reports/DataMartReportsPage.tsx`
9. `apps/web/src/pages/data-marts/insights/DataMartInsightsPage.tsx`

Cho MOI page:

1. Tim hook/query chinh cua page (thuong la `useQuery` hoac custom hook)
2. Kiem tra co `isLoading` / `isPending` check khong
3. NEU KHONG CO, them:

```tsx
import { CardSkeleton } from '../../../shared/components/CardSkeleton';

// Trong component, truoc return chinh:
if (isLoading) {
  return (
    <div className="space-y-4 p-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
```

4. NEU DA CO loading state — KHONG thay doi gi

### QUAN TRONG

- DOC code page TRUOC khi sua — hieu data flow
- KHONG thay doi logic fetch data
- Chi THEM loading UI, KHONG sua component structure
- Dung `CardSkeleton` tu `apps/web/src/shared/components/CardSkeleton/`

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 2.3: Them Error state nhat quan voi retry

### Yeu cau chinh xac

1. TAO component moi `apps/web/src/shared/components/ErrorState/ErrorState.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@owox/ui/components/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {t('errors.somethingWentWrong')}
        </h3>
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('errors.retry')}
        </Button>
      )}
    </div>
  );
}
```

2. TAO file `apps/web/src/shared/components/ErrorState/index.ts`:

```typescript
export { ErrorState } from './ErrorState';
```

3. THEM i18n keys vao CA HAI file locale:

File `apps/web/src/i18n/locales/en.json` — them vao object "errors" (tao neu chua co):
```json
"errors": {
  "somethingWentWrong": "Something went wrong",
  "retry": "Try again"
}
```

File `apps/web/src/i18n/locales/vi.json` — them:
```json
"errors": {
  "somethingWentWrong": "Da xay ra loi",
  "retry": "Thu lai"
}
```

4. Su dung ErrorState trong cac list pages (cung danh sach Task 2.2).
   Cho moi page, them sau loading check:

```tsx
import { ErrorState } from '../../../shared/components/ErrorState';

if (isError) {
  return <ErrorState onRetry={refetch} />;
}
```

### QUAN TRONG

- Kiem tra page DA CO error handling chua truoc khi them
- NEU da co — KHONG thay doi
- `refetch` lay tu gia tri tra ve cua `useQuery()` hoac custom hook tuong ung

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 2.4: Them Empty state nhat quan

### Yeu cau chinh xac

1. Component `EmptyStateCard` da co tai `apps/web/src/shared/components/EmptyStateCard/`
2. Kiem tra TUNG list page (danh sach Task 2.2)
3. Cho moi page, sau loading check va error check, them:

```tsx
import { EmptyStateCard } from '../../../shared/components/EmptyStateCard';

if (!isLoading && !isError && data?.length === 0) {
  return (
    <EmptyStateCard
      title={t('dataMarts.emptyState.title')}
      description={t('dataMarts.emptyState.description')}
    />
  );
}
```

4. Dieu chinh i18n key phu hop voi tung page:
   - dataMarts -> `dataMarts.emptyState.*`
   - dataStorages -> `dataStorages.emptyState.*`
   - v.v.

5. THEM cac i18n keys can thiet vao `en.json` va `vi.json`

### QUAN TRONG

- DOC EmptyStateCard props TRUOC khi dung — hieu API cua no
- NEU page DA CO empty state — KHONG thay doi
- Chi THEM cho page chua co

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 2.5: Responsive audit cho Table components

### Yeu cau chinh xac

1. Tim tat ca Table components:
   ```bash
   rg --files apps/web/src -g "*Table*.tsx" -g "*table*.tsx"
   ```

2. Cho MOI table component, kiem tra:
   - Co bi overflow ngang tren viewport < 768px khong?
   - Co wrapper `overflow-x-auto` chua?

3. NEU CHUA CO overflow wrapper, them:

```tsx
<div className="overflow-x-auto">
  <Table>
    {/* noi dung table hien tai */}
  </Table>
</div>
```

4. KHONG thay doi Table component noi tai (no tu `@owox/ui`)
5. Chi them wrapper div ben ngoai

### QUAN TRONG

- Chi them wrapper neu CHUA CO
- KHONG thay doi column widths hoac content
- KHONG thay doi @owox/ui components

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

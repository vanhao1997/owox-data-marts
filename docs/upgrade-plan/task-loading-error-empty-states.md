# Task: Skeleton Loading, Error, Empty States cho List Pages
# Task: Loading, Error, Empty States — Audit va Bo Sung

> Uu tien: CAO | Uoc tinh: 1-2 gio

## KET QUA AUDIT CHI TIET (da xac minh toi component con)

### Ket luan: HAU HET pages DA CO du states o component level

| Page | Component con xu ly | Loading? | Error? | Empty? | Can lam? |
|---|---|---|---|---|---|
| DataMartsPage | DataMartTable + EmptyDataMartsState | CO | CO | CO | KHONG |
| DataMartRunsPage | (noi tai) | CO | CO | CO | KHONG |
| DataMartSchedulesPage | (noi tai) | CO | CO | CO | KHONG |
| DataMartReportsPage | (noi tai) | CO | CO | CO | KHONG |
| DataMartInsightsPage | (noi tai) | CO | CO | CO | KHONG |
| SearchPage | useSearch hook | CO (Loader2) | CO (retry) | CO (noResults) | KHONG |
| DataStorageListPage | DataStorageList component | CO | CO | CO (EmptyState o DataStorageTable) | KHONG |
| DataDestinationListPage | DataDestinationList component | CO | CO | CO (EmptyDataDestinationsState) | KHONG |

### CHI TIET: States da co o dau?

**DataStorageListPage:**
- Page file: `pages/data-storage/DataStorageListPage.tsx` — wrapper don gian, delegate cho `DataStorageList`
- Component: `features/data-storage/list/components/DataStorageList/DataStorageList.tsx`
  - `storagesQuery.isLoading` -> loading state (truyen `isLoading={loading}` xuong DataStorageTable)
  - `storagesQuery.isError` -> error message
  - DataStorageTable co empty state rieng

**DataDestinationListPage:**
- Page file: `pages/data-destination/DataDestinationListPage.tsx` — wrapper delegate
- Component: `features/data-destination/list/components/DataDestinationList/DataDestinationList.tsx`
  - `destinationsQuery.isLoading` va `destinationsQuery.isError` — da xu ly
  - `EmptyDataDestinationsState.tsx` — component rieng cho empty state

**DataMartsPage:**
- Component: `features/data-marts/list/components/DataMartTable/components/EmptyDataMartsState.tsx`
  - DA CO empty state phuc tap voi onboarding video

**SearchPage:**
- Hook: `pages/search/useSearch.ts` tra ve `isFetching`, `isError`, `retry`, `isDebouncing`
- Page: da render Loader2 khi loading, error message voi retry, "No results" message

---

## VIEC CON LAI CAN LAM

### 1. Tich hop ErrorState component moi (optional upgrade)

Component `ErrorState` da tao tai `shared/components/ErrorState/` co retry button.
Hien tai cac page dung inline error text. Co the nang cap:

- `DataStorageList.tsx` dong ~74: thay error text thanh `<ErrorState onRetry={storagesQuery.refetch} />`
- `DataDestinationList.tsx`: tuong tu

**CHI LA OPTIONAL** — khong bat buoc vi da co error handling.

### 2. Kiem tra Plugins pages

CHUA kiem tra:
- `pages/plugins/gallery/` — can audit loading/error/empty
- `pages/plugins/detail/` — can audit

Chay lenh:
```bash
rg "isLoading|isPending|isError|empty" apps/web/src/pages/plugins -g "*.tsx" --no-heading
rg "isLoading|isPending|isError|empty" apps/web/src/features/plugins -g "*.tsx" --no-heading | head -20
```

### 3. Kiem tra Notifications page

```bash
rg "isLoading|isPending|isError|empty" apps/web/src/pages/notifications -g "*.tsx" --no-heading
```

## Kiem tra

```bash
rg "react-hot-toast" apps/web/src/features/data-storage/list --no-heading
rg "react-hot-toast" apps/web/src/features/data-destination/list --no-heading
npm run test -w @owox/web
```

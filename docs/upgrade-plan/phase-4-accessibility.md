# Phase 4: Accessibility (a11y)

> Priority: TRUNG BINH | Sprint: 5
> Muc tieu: WCAG 2.1 AA compliance

## CANH BAO CHO AGENT

- Chi sua files trong `apps/web/src/`
- KHONG sua `@owox/ui` components (da co accessibility tu radix-ui)
- Chi them ARIA attributes vao wrapper/custom components
- Chay `npm run test -w @owox/web` sau moi task

---

## Task 4.1: Audit va fix icon-only buttons

### Van de

Nhieu button chi co icon, khong co text — screen reader khong doc duoc.

### Yeu cau chinh xac

1. Tim tat ca icon-only buttons:
```bash
rg "<Button.*variant.*icon" apps/web/src -g "*.tsx" --no-heading -l
rg "<SidebarMenuButton" apps/web/src -g "*.tsx" --no-heading -l
rg "IconButton\|<button.*className.*icon" apps/web/src -g "*.tsx" --no-heading -l
```

2. Kiem tra tung file — button nao KHONG co `aria-label`:
```bash
rg "<Button[^>]*>" apps/web/src -g "*.tsx" | rg -v "aria-label" | rg "icon\|Icon"
```

3. Cho MOI button icon thieu `aria-label`, THEM attribute:

```tsx
// TRUOC (SAI):
<Button variant="ghost" size="icon" onClick={onDelete}>
  <Trash2 className="h-4 w-4" />
</Button>

// SAU (DUNG):
<Button variant="ghost" size="icon" onClick={onDelete} aria-label={t('actions.delete')}>
  <Trash2 className="h-4 w-4" />
</Button>
```

4. THEM i18n keys cho tat ca aria-label moi vao `en.json` va `vi.json`:
```json
"actions": {
  "delete": "Delete",
  "edit": "Edit",
  "copy": "Copy",
  "close": "Close",
  "refresh": "Refresh",
  "search": "Search",
  "settings": "Settings",
  "more": "More actions",
  "expand": "Expand",
  "collapse": "Collapse"
}
```

Vi:
```json
"actions": {
  "delete": "Xoa",
  "edit": "Chinh sua",
  "copy": "Sao chep",
  "close": "Dong",
  "refresh": "Lam moi",
  "search": "Tim kiem",
  "settings": "Cai dat",
  "more": "Them hanh dong",
  "expand": "Mo rong",
  "collapse": "Thu gon"
}
```

### QUAN TRONG

- KHONG sua @owox/ui Button component — chi them aria-label tren instance
- Dung `t()` cho tat ca aria-label — KHONG hardcode
- NEU button da co aria-label — KHONG thay doi

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 4.2: Them aria-live cho toast va loading

### Yeu cau chinh xac

1. Kiem tra `SonnerToaster` component trong MainLayout — sonner tu dong ho tro
   `aria-live`. NEU da co — KHONG can sua.

2. Kiem tra `GlobalLoader` component tai `apps/web/src/shared/components/GlobalLoader/`:
   - Them `aria-live="polite"` va `role="status"` vao loading indicator
   - Them `aria-label={t('common.loading')}` (hoac text tuong tu)

3. Kiem tra `RouteLoading` component tai `apps/web/src/routes/RouteLoading.tsx`:
   - Them `aria-live="polite"` va `role="status"`

4. THEM i18n keys:
```json
// en.json
"common": {
  "loading": "Loading..."
}
// vi.json
"common": {
  "loading": "Dang tai..."
}
```

### QUAN TRONG

- DOC source truoc khi sua — co the da co ARIA attributes
- Chi them neu CHUA CO

---

## Task 4.3: Keyboard navigation cho data tables

### Yeu cau chinh xac

1. Kiem tra tat ca table components:
```bash
rg --files apps/web/src -g "*Table*.tsx" | rg -v test | rg -v spec
```

2. Cho MOI table, kiem tra:
   - Row actions (edit, delete, menu) co accessible bang keyboard khong?
   - Focus visible CSS co hien thi khong?

3. NEU table dung `@owox/ui` Table component — NO da co keyboard support tu radix.
   Chi can kiem tra custom action buttons trong cells co `tabIndex={0}` chua.

4. Cho action cells co dropdown menu:
   - Dam bao `<DropdownMenuTrigger>` co `aria-label`
   - Dam bao menu items co text ro rang

### QUAN TRONG

- KHONG override @owox/ui keyboard behavior
- Chi fix custom components TRONG table cells
- Test bang keyboard thuc te: Tab qua table, Enter/Space mo actions

---

## Task 4.4: Focus management cho dialogs/sheets

### Yeu cau chinh xac

1. Tim tat ca dialog/sheet components:
```bash
rg "Dialog|Sheet" apps/web/src -g "*.tsx" -l | rg -v test | rg -v node_modules
```

2. Kiem tra moi dialog/sheet:
   - Focus co trap dung trong dialog khi mo?
   - Focus co quay ve trigger element khi dong?
   - ESC co dong dialog?

3. `@owox/ui` Dialog/Sheet da handle focus trap (radix-ui).
   Chi can kiem tra CUSTOM dialogs (neu co) — dat trong `apps/web/src/shared/` hoac features.

4. NEU co custom modal khong dung @owox/ui:
   - Them `role="dialog"`
   - Them `aria-modal="true"`
   - Them `aria-labelledby` tro den title element

### QUAN TRONG

- HAU HET dialogs dung @owox/ui nen DA co focus trap
- Chi fix custom ones
- DOC code truoc — khong fix cai da dung

---

## Task 4.5: Them skip-to-content link

### Yeu cau chinh xac

1. TAO component `apps/web/src/shared/components/SkipToContent/SkipToContent.tsx`:

```tsx
import { useTranslation } from 'react-i18next';

export function SkipToContent() {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-ring"
    >
      {t('accessibility.skipToContent')}
    </a>
  );
}
```

2. TAO `apps/web/src/shared/components/SkipToContent/index.ts`:
```typescript
export { SkipToContent } from './SkipToContent';
```

3. THEM vao MainLayout — DAU TIEN trong return, TRUOC sidebar:
```tsx
import { SkipToContent } from '../shared/components/SkipToContent';

// Trong return:
<>
  <SkipToContent />
  <SidebarProvider ...>
    ...
  </SidebarProvider>
</>
```

4. THEM `id="main-content"` vao main content area trong MainLayout
   (tim element chua `<Outlet />` hoac `<SidebarInset>`)

5. THEM i18n keys:
```json
// en.json
"accessibility": { "skipToContent": "Skip to main content" }
// vi.json
"accessibility": { "skipToContent": "Chuyen den noi dung chinh" }
```

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

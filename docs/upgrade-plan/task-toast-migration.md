# Task: Toast Migration (react-hot-toast -> sonner)

> 81 files | ~261 toast calls | Uu tien: CAO
> Uoc tinh: 3-4 gio lam viec

## TONG QUAN

### Hien trang toast calls

| Pattern | So luong | Tuong thich sonner? |
|---|---|---|
| `toast.success(msg)` | 101 | DA — giu nguyen |
| `toast.error(msg)` | 123 | DA — giu nguyen |
| `toast.dismiss(id)` | 30 | DA — giu nguyen |
| `toast.custom(...)` | 4 (2 files) | CAN SUA — dung `toast()` hoac JSX sonner |
| `toast.loading(msg)` | 3 | DA — giu nguyen |
| `toast(msg)` direct | 16 | CAN SUA — doi thanh `toast.success(msg)` hoac `toast.error(msg)` |

### Strategy

toast.success, toast.error, toast.dismiss, toast.loading co API giong nhau giua
react-hot-toast va sonner. Chi can thay import source.

---

## CANH BAO CHO AGENT

- Lam TUNG BATCH 10 files — test sau moi batch
- KHONG sua logic business — chi thay doi toast library
- KHONG xoa hoac sua test files TRUOC — sua production code truoc, test code sau
- Chay `npm run test -w @owox/web` sau moi batch
- KHONG sua `apps/backend/`

---

## QUAN TRONG: 2 Kieu Import Khac Nhau

Co CHINH XAC 2 pattern import trong 81 files:

### Pattern A: Default import (43 files)
```
import toast from 'react-hot-toast';
```
DOI THANH:
```
import { toast } from 'sonner';
```

### Pattern B: Named import (37 files)
```
import { toast } from 'react-hot-toast';
```
DOI THANH:
```
import { toast } from 'sonner';
```

CA HAI deu doi thanh CUNG MOT import: `import { toast } from 'sonner'`

Sonner export `toast` la named export. react-hot-toast export no la CA
default VA named. Khi doi, TAT CA thanh named import tu sonner.

### Cach tim nhanh files theo pattern

```bash
# Pattern A (default):
rg "import toast from 'react-hot-toast'" apps/web/src -l

# Pattern B (named):
rg "import \{ toast \} from 'react-hot-toast'" apps/web/src -l
```

### Cach thay the hang loat (sed/PowerShell)

```bash
# Thay TAT CA default imports:
rg "import toast from 'react-hot-toast'" apps/web/src -l | xargs sed -i "s/import toast from 'react-hot-toast'/import { toast } from 'sonner'/g"

# Thay TAT CA named imports:
rg "import { toast } from 'react-hot-toast'" apps/web/src -l | xargs sed -i "s/import { toast } from 'react-hot-toast'/import { toast } from 'sonner'/g"
```

NHUNG SAU DO phai xu ly thu cong:
1. showApiErrorToast.ts — persistent toast callback
2. ReportQuickRunCell.tsx — toast.custom()
3. RunUndoToast.tsx — toast.dismiss() voi toastId
4. Tat ca test files — thay mock

---

## Buoc 1: Tao toast wrapper (DA LAM — kiem tra file ton tai)

File `apps/web/src/shared/utils/toast.ts` — NEU CHUA CO, tao:

```typescript
export { toast } from 'sonner';
```

Sonner export `toast` object voi cac method: `.success()`, `.error()`,
`.loading()`, `.dismiss()`, `.promise()`, `.custom()`, `.message()`.
API TUONG THICH voi react-hot-toast cho cac method pho bien.

---

## Buoc 2: Migrate showApiErrorToast.ts (FILE QUAN TRONG NHAT)

File: `apps/web/src/shared/utils/showApiErrorToast.ts`

File nay phuc tap nhat vi dung `toast.error()` voi callback pattern cua
react-hot-toast: `toast.error(t => createElement(...))` de render JSX
voi dismiss button.

### Yeu cau chinh xac

1. DOC ky file hien tai (da in o tren)
2. Thay doi:

```typescript
// THAY dong nay:
import toast from 'react-hot-toast';

// THANH:
import { toast } from 'sonner';
```

3. Sua persistent toast block. react-hot-toast dung callback `t => ...`,
   sonner dung object options khac.

Pattern HIEN TAI (react-hot-toast):
```typescript
toast.error(
  t => createElement('span', { ... }, message, createElement('button', { onClick: () => toast.dismiss(t.id) }, 'X')),
  { duration: Infinity, id: `persistent-error:${message}` }
);
```

DOI THANH (sonner):
```typescript
toast.error(message, {
  duration: Infinity,
  id: `persistent-error:${message}`,
  // Sonner tu dong co close button khi duration = Infinity
  // KHONG can render createElement nua
});
```

4. Cac toast.error(message) va toast.error(message, { id }) — GIU NGUYEN vi
   sonner API tuong thich.

### Test file lien quan

File: `apps/web/src/shared/utils/showApiErrorToast.test.ts`

DOC test file truoc. Thay doi:
- `import toast from 'react-hot-toast'` thanh `import { toast } from 'sonner'`
- `vi.mock('react-hot-toast', ...)` thanh `vi.mock('sonner', ...)`
- Kiem tra test case cho persistent toast — co the can update assertion
  vi callback pattern da thay doi

---

## Buoc 3: Migrate 81 files theo batch

### BATCH A: Shared components (3 files)

Lam truoc vi duoc import boi nhieu features:

1. `shared/components/InlineEditTitle/InlineEditTitle.tsx`
2. `shared/components/SecretRevealDialog/SecretRevealDialog.tsx`
3. `shared/components/Toaster/index.tsx` — FILE DAC BIET (xem buoc 4)

Cho file 1 va 2: chi thay `import toast from 'react-hot-toast'`
thanh `import { toast } from 'sonner'`.

### BATCH B: api-keys feature (4 files)

1. `features/api-keys/components/ApiKeysTable/columns.tsx`
2. `features/api-keys/components/CreateApiKeySheet.tsx`
3. `features/api-keys/components/EditApiKeySheet.tsx`
4. `features/api-keys/hooks/useApiKeys.ts`

Pattern: chi thay import. toast.success() va toast.error() tuong thich.

### BATCH C: contexts feature (4 files)

1. `features/contexts/components/AddContextSheet/AddContextSheet.tsx`
2. `features/contexts/components/ContextDetailsSheet/ContextDetailsSheet.tsx`
3. `features/contexts/components/ContextPicker/ContextPicker.tsx`
4. `features/contexts/hooks/useInlineContextCreate.ts`

### BATCH D: connectors feature (2 files)

1. `features/connectors/edit/components/ConnectorEditForm/ConnectorEditForm.tsx`
2. `features/connectors/edit/components/ConnectorEditForm/steps/ConfigurationStep/GoogleSheetsServiceAccountField.tsx`

### BATCH E: data-destination feature (4 files)

1. `features/data-destination/edit/components/DataDestinationEditForm/GoogleSheetsFields.tsx`
2. `features/data-destination/list/components/DataDestinationList/DataDestinationList.tsx`
3. `features/data-destination/list/components/DataDestinationTable/DataDestinationActionsCell.tsx`
4. `features/data-destination/shared/model/hooks/useDataDestination.ts`

### BATCH F: data-storage feature (5 files)

1. `features/data-storage/edit/components/DataStorageEditForm/GoogleBigQueryFields.tsx`
2. `features/data-storage/edit/components/DataStorageEditForm/LegacyGoogleBigQueryFields.tsx`
3. `features/data-storage/list/components/DataStorageList/DataStorageList.tsx`
4. `features/data-storage/shared/hooks/usePublishDraftsTrigger.ts`
5. `features/data-storage/shared/model/hooks/useDataStorage.ts`

### BATCH G: license-keys feature (4 files)

1. `features/license-keys/components/CreateLicenseKeySheet.tsx`
2. `features/license-keys/components/EditLicenseKeySheet.tsx`
3. `features/license-keys/components/LicenseKeysTable/columns.tsx`
4. `features/license-keys/hooks/useLicenseKeys.ts`

### BATCH H: plugins feature (3 files)

1. `features/plugins/hooks/usePluginPublications.ts`
2. `features/plugins/hooks/usePlugins.ts`
3. `features/plugins/hooks/usePlugins.test.tsx` — test file, thay mock

### BATCH I: project-settings feature (6 files)

1. `features/project-settings/members/components/InviteMemberSheet/InviteMemberSheet.tsx`
2. `features/project-settings/members/components/MemberDetailsSheet/MemberDetailsSheet.tsx`
3. `features/project-settings/members/components/MembershipRequestSheet/MembershipRequestSheet.tsx`
4. `features/project-settings/members/components/UserProvisioningSettings/UserProvisioningSettings.tsx`
5. `features/project-settings/overview/hooks/useProjectSettings.ts`
6. `pages/project-settings/ProjectSettingsPage.tsx`

### BATCH J: data-marts/edit feature (12 files)

1. `features/data-marts/edit/components/DataMartDetails.tsx`
2. `features/data-marts/edit/components/DataMartDefinitionSettings/form/ConnectorDefinitionField.tsx`
3. `features/data-marts/edit/components/DataMartRelationships/DataMartRelationshipsContent.tsx`
4. `features/data-marts/edit/components/DataMartRelationships/JoinDescriptionForm.tsx`
5. `features/data-marts/edit/components/DataMartRelationships/JoinSettingsForm.tsx`
6. `features/data-marts/edit/components/DataMartRelationships/TargetDataMartPicker.tsx`
7. `features/data-marts/edit/components/DataMartRunHistoryView/CancelRunButton.tsx`
8. `features/data-marts/edit/components/DataMartSchemaSettings/DataMartSchemaSettings.tsx`
9. `features/data-marts/edit/components/ReportColumnPicker/GeneratedSqlViewer.tsx`
10. `features/data-marts/edit/model/context/DataMartContext.tsx`
11. `features/data-marts/edit/model/hooks/ai-helper-toast.tsx`
12. `pages/data-marts/edit/DataMartOverviewContent.tsx`

### BATCH K: data-marts/insights + insights-prev (7 files)

1. `features/data-marts/insights/components/AiAssistantPanel.tsx`
2. `features/data-marts/insights/components/InsightDetailsView.tsx`
3. `features/data-marts/insights/components/InsightReportsList.tsx`
4. `features/data-marts/insights/components/InsightsListView.tsx`
5. `features/data-marts/insights/components/InsightSourcesPanel.tsx`
6. `features/data-marts/insights-prev/components/InsightDetailsView.tsx`
7. `features/data-marts/insights-prev/components/InsightEditor.tsx`

### BATCH L: data-marts/reports + shared + misc (13 files)

1. `features/data-marts/reports/edit/components/ReportEditForm/GoogleSheetsTargetSection.tsx`
2. `features/data-marts/reports/list/components/ReportsTable/ReportActionsCell.tsx`
3. `features/data-marts/reports/list/model/hooks/useReportsByInsightTemplate.ts`
4. `features/data-marts/reports/shared/components/ReportQuickRunCell.tsx` — CAN CHU Y: co toast.custom
5. `features/data-marts/reports/shared/components/RunUndoToast.tsx`
6. `features/data-marts/reports/shared/model/hooks/useReport.ts`
7. `features/data-marts/scheduled-triggers/model/context/ScheduledTriggerContext.tsx`
8. `features/data-marts/shared/components/DataMartBulkActions/DataMartBulkActions.tsx`
9. `features/data-marts/shared/components/RunDataQualityBatchDialog/RunDataQualityBatchDialog.tsx`
10. `features/data-marts/shared/hooks/useSchemaActualizeTrigger.ts`
11. `features/data-marts/insights-prev/model/hooks/useInsights.ts`
12. `features/data-marts/data-quality/components/DataQualityWorkspace.tsx`
13. `features/data-marts/model-canvas/components/ModelCanvasView.tsx`

### BATCH M: data-marts misc + pages (4 files)

1. `features/data-marts/model-canvas/model/use-refresh-data-last-updated.ts`
2. `features/data-marts/list/components/BulkCreateFromStorageDialog/BulkCreateFromStorageDialog.tsx`
3. `pages/data-marts/edit/DataMartDestinationsContent.tsx`
4. `pages/data-marts/insights/DataMartInsightsPage.tsx`

### BATCH N: Pages (2 files)

1. `pages/project-settings/ContextsTab.tsx`
2. `pages/project-settings/MembersTab.tsx`

### BATCH O: Test files (8 files)

Lam CUOI CUNG sau khi tat ca production code da migrate:

1. `features/data-marts/data-quality/components/DataQualityWorkspace.test.tsx`
2. `features/data-marts/edit/components/DataMartRunHistoryView/RunItem.test.tsx`
3. `features/data-marts/edit/model/hooks/__tests__/ai-helper-toast.test.tsx`
4. `features/data-marts/shared/components/RunDataQualityBatchDialog/RunDataQualityBatchDialog.test.tsx`
5. `features/data-marts/shared/hooks/__tests__/useSchemaActualizeTrigger.test.ts`
6. `features/data-marts/reports/shared/components/__tests__/ReportQuickRunCell.test.tsx`
7. `features/data-storage/shared/hooks/usePublishDraftsTrigger.test.ts`
8. `shared/utils/showApiErrorToast.test.ts`

Cho moi test file:
- Thay `import toast from 'react-hot-toast'` thanh `import { toast } from 'sonner'`
- Thay `vi.mock('react-hot-toast', ...)` thanh `vi.mock('sonner', ...)`
- Kiem tra mock shape tuong thich

---

## Buoc 4: Xu ly toast.custom — 2 FILES DAC BIET

### File 1: `features/data-marts/reports/shared/components/ReportQuickRunCell.tsx`

Code HIEN TAI (react-hot-toast):
```typescript
const id = toast.custom(
  t => (
    <RunUndoToast
      toastId={t.id}
      reportName={report.title}
      gracePeriodMs={GRACE_PERIOD_MS}
      onConfirm={executeRun}
      onCancel={() => { ... }}
    />
  ),
  { duration: Infinity, position: 'bottom-center' }
);
toastIdRef.current = id;
```

DOI THANH (sonner):
```typescript
// Sonner toast.custom() tra ve id (string | number)
// Va nhan ReactNode truc tiep, KHONG co callback (t) =>
const id = toast.custom(
  <RunUndoToast
    toastId={String(id)}
    reportName={report.title}
    gracePeriodMs={GRACE_PERIOD_MS}
    onConfirm={executeRun}
    onCancel={() => { ... }}
  />,
  { duration: Infinity, position: 'bottom-center' }
);
toastIdRef.current = String(id);
```

VAN DE: Sonner toast.custom() tra ve id NGAY, nhung trong JSX ta can truyen
id vao `toastId` prop. Giai phap:

```typescript
// Tao id truoc, truyen vao sonner
import { nanoid } from 'nanoid'; // hoac dung crypto.randomUUID()
// HOAC don gian:
const toastId = String(Date.now());
toast.custom(
  <RunUndoToast
    toastId={toastId}
    reportName={report.title}
    gracePeriodMs={GRACE_PERIOD_MS}
    onConfirm={executeRun}
    onCancel={() => { ... }}
  />,
  { id: toastId, duration: Infinity, position: 'bottom-center' }
);
toastIdRef.current = toastId;
```

### File 2: `features/data-marts/reports/shared/components/RunUndoToast.tsx`

File nay import `{ toast } from 'react-hot-toast'` de goi `toast.dismiss(toastId)`.
Chi can thay import:

```typescript
// THAY:
import { toast } from 'react-hot-toast';
// THANH:
import { toast } from 'sonner';
```

toast.dismiss(toastId) TUONG THICH giua 2 library.

---

## Buoc 5: Cap nhat Toaster component va MainLayout

### File: `shared/components/Toaster/index.tsx`

THAY TOAN BO noi dung thanh:

```typescript
export { Toaster } from '@owox/ui/components/sonner';
```

### File: `layouts/MainLayout.tsx`

1. XOA import: `import { Toaster as HotToaster } from '../shared/components/Toaster'`
2. XOA component: `<HotToaster />`
3. GIU: `<SonnerToaster />` (da co — import tu `@owox/ui/components/sonner`)

---

## Buoc 6: Xoa dependency

1. Sua `apps/web/package.json` — xoa `"react-hot-toast": "^2.5.2"` khoi dependencies
2. Chay `npm install`

---

## Kiem tra CUOI CUNG

```bash
# Phai tra ve 0 ket qua
rg "react-hot-toast" apps/web/src

# Tat ca tests phai pass
npm run test -w @owox/web

# Build phai thanh cong
npm run build -w @owox/web
```

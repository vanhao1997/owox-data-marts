# Phase 5: Internationalization (i18n)

> Priority: TRUNG BINH | Sprint: 5
> Muc tieu: i18n hoan chinh, san sang mo rong locale

## CANH BAO CHO AGENT

- Chi sua files trong `apps/web/src/`
- KHONG thay doi logic business
- PHAI giu dong bo en.json va vi.json — MOI key them vao en.json PHAI co trong vi.json
- Chay `npm run test -w @owox/web` sau moi task

---

## Task 5.1: Tim va fix hardcoded strings

### Van de

Co the co text tieng Anh hardcode trong JSX thay vi dung `t()`.

### Yeu cau chinh xac

1. Tim hardcoded strings trong JSX:
```bash
# Tim text giua JSX tags (khong phai trong attributes)
rg ">[A-Z][a-z]+ [a-z]+" apps/web/src -g "*.tsx" --no-heading | rg -v "test\." | rg -v ".test." | rg -v "className" | rg -v "console\." | head -50
```

2. Cho MOI hardcoded string tim thay:
   a. Xac dinh no thuoc feature/page nao
   b. Tao i18n key phu hop: `featureName.componentName.textPurpose`
   c. Them key vao en.json (gia tri = text hien tai)
   d. Them key vao vi.json (gia tri = ban dich tieng Viet)
   e. Thay hardcoded text bang `{t('featureName.componentName.textPurpose')}`
   f. Them `import { useTranslation } from 'react-i18next'` neu chua co
   g. Them `const { t } = useTranslation()` trong component neu chua co

### Vi du

```tsx
// TRUOC (SAI):
<h2>No data marts found</h2>
<p>Create your first data mart to get started.</p>

// SAU (DUNG):
const { t } = useTranslation();
<h2>{t('dataMarts.list.emptyTitle')}</h2>
<p>{t('dataMarts.list.emptyDescription')}</p>
```

### QUAN TRONG

- KHONG doi text trong: className, console.log, error messages cho developer
- Chi doi text HIEN THI cho user
- Placeholder text trong input cung can i18n
- Title/tooltip text cung can i18n
- KHONG doi text trong test files

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 5.2: Tach i18n namespace theo feature

### Van de

en.json va vi.json moi file 2,427 dong — qua lon, load het 1 luc.

### Yeu cau chinh xac

1. DOC file `apps/web/src/i18n/index.ts` de hieu cau hinh hien tai

2. TAO cac file namespace moi:
   - `apps/web/src/i18n/locales/en/common.json` — keys dung chung (actions, errors, common)
   - `apps/web/src/i18n/locales/en/data-marts.json` — keys cua data-marts feature
   - `apps/web/src/i18n/locales/en/plugins.json` — keys cua plugins feature
   - `apps/web/src/i18n/locales/en/settings.json` — keys cua project-settings
   - Tuong tu cho `vi/`

3. SUA `apps/web/src/i18n/index.ts`:
   - Cau hinh i18next load namespace lazy
   - Giu en.json va vi.json lam default fallback

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import namespaces
import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';
// ... cac namespace khac

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        // ... them namespaces
      },
      vi: {
        common: viCommon,
        // ...
      },
    },
    defaultNS: 'common',
    fallbackNS: 'common',
    // ... giu nguyen cau hinh khac
  });
```

4. KHONG xoa file en.json/vi.json goc — giu lam fallback

### QUAN TRONG

- Day la task LON — lam tung namespace mot
- Test sau moi namespace
- NEU gap conflict — giu file goc, chi them namespace moi
- Component dung namespace khac: `const { t } = useTranslation('data-marts');`

### Kiem tra SAU MOI namespace

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

---

## Task 5.3: Them CI check cho missing keys

### Yeu cau chinh xac

1. TAO script `apps/web/scripts/check-i18n-keys.mjs`:

```javascript
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return [...acc, ...flattenKeys(value, fullKey)];
    }
    return [...acc, fullKey];
  }, []);
}

const enPath = resolve(__dirname, '../src/i18n/locales/en.json');
const viPath = resolve(__dirname, '../src/i18n/locales/vi.json');

const enKeys = flattenKeys(JSON.parse(readFileSync(enPath, 'utf8')));
const viKeys = flattenKeys(JSON.parse(readFileSync(viPath, 'utf8')));

const enSet = new Set(enKeys);
const viSet = new Set(viKeys);

const missingInVi = enKeys.filter(k => !viSet.has(k));
const missingInEn = viKeys.filter(k => !enSet.has(k));

let exitCode = 0;

if (missingInVi.length > 0) {
  console.error('Keys in en.json missing from vi.json:');
  missingInVi.forEach(k => console.error(`  - ${k}`));
  exitCode = 1;
}

if (missingInEn.length > 0) {
  console.error('Keys in vi.json missing from en.json:');
  missingInEn.forEach(k => console.error(`  - ${k}`));
  exitCode = 1;
}

if (exitCode === 0) {
  console.log('All i18n keys are in sync.');
}

process.exit(exitCode);
```

2. THEM script vao `apps/web/package.json`:
```json
"check:i18n": "node scripts/check-i18n-keys.mjs"
```

3. THEM vao CI workflow (optional — chi ghi ra day, khong sua workflow file):
   Co the them vao `.github/workflows/lint-owox.yml` sau

### Kiem tra SAU KHI XONG

```bash
cd apps/web && node scripts/check-i18n-keys.mjs
npm run test -w @owox/web
```

---

## Task 5.4: Date/number formatting nhat quan

### Yeu cau chinh xac

1. Tim cac cho format date/number:
```bash
rg "toLocaleDateString\|toLocaleString\|Intl\.\|\.toFixed\|new Date\(" apps/web/src -g "*.tsx" -g "*.ts" --no-heading -l | rg -v test | rg -v node_modules
```

2. TAO utility `apps/web/src/utils/format.ts`:

```typescript
import i18n from 'i18next';

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat(i18n.language).format(num);
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });

  if (diffDay > 0) return rtf.format(-diffDay, 'day');
  if (diffHour > 0) return rtf.format(-diffHour, 'hour');
  if (diffMin > 0) return rtf.format(-diffMin, 'minute');
  return rtf.format(-diffSec, 'second');
}
```

3. Kiem tra tung file tu buoc 1, thay the truc tiep `toLocaleDateString()`
   va tuong tu bang cac ham tren.

4. KHONG thay doi logic — chi thay doi cach format hien thi.

### Kiem tra SAU KHI XONG

```bash
npm run test -w @owox/web
npm run lint -w @owox/web
```

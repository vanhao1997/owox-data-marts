import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

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
  console.log(`All i18n keys are in sync (${enKeys.length} keys).`);
}

process.exit(exitCode);

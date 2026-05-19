#!/usr/bin/env node
/**
 * Verify that all locales expose the same translation keys.
 *
 * - Reads every namespace from `public/locales/{locale}/*.json`.
 * - Compares key paths against the default locale defined in
 *   `src/services/i18n/constants.ts` (indirectly via project config).
 * - Exits with code 1 on any missing / extra keys.
 *
 * Usage: `pnpm check:i18n`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const localesDir = path.join(root, 'public', 'locales');

/** Flatten nested object keys into dot-paths. */
function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, next));
    } else {
      keys.push(next);
    }
  }
  return keys;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const locales = fs
  .readdirSync(localesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

if (locales.length === 0) {
  console.error(`No locales found in ${localesDir}`);
  process.exit(1);
}

// Namespaces are taken from the first locale (canonical reference).
const [reference, ...others] = locales;
const referenceDir = path.join(localesDir, reference);
const namespaces = fs
  .readdirSync(referenceDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => path.basename(f, '.json'));

let hasErrors = false;

for (const ns of namespaces) {
  const refPath = path.join(referenceDir, `${ns}.json`);
  const refKeys = new Set(flattenKeys(readJson(refPath)));

  for (const loc of others) {
    const locPath = path.join(localesDir, loc, `${ns}.json`);
    if (!fs.existsSync(locPath)) {
      console.error(`✖ ${loc}/${ns}.json — missing file (present in ${reference})`);
      hasErrors = true;
      continue;
    }

    const locKeys = new Set(flattenKeys(readJson(locPath)));
    const missing = [...refKeys].filter((k) => !locKeys.has(k));
    const extra = [...locKeys].filter((k) => !refKeys.has(k));

    if (missing.length) {
      console.error(`✖ ${loc}/${ns}.json — missing keys:\n    ${missing.join('\n    ')}`);
      hasErrors = true;
    }
    if (extra.length) {
      console.error(
        `✖ ${loc}/${ns}.json — extra keys not in ${reference}:\n    ${extra.join('\n    ')}`,
      );
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\ni18n check failed.');
  process.exit(1);
}

console.log(`✓ i18n ok (${locales.length} locales, ${namespaces.length} namespaces)`);

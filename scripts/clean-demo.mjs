#!/usr/bin/env node
// Strips the template's demo surface AND finalizes the template for a fresh
// project (rename, license removal, package.json cleanup).
// Idempotent: running twice is safe (missing files are ignored).
//
// Usage: pnpm clean:demo [project-name]

import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const ROOT = process.cwd();
const projectName = process.argv[2] ?? basename(resolve(ROOT));

// ---------- 1. Remove demo files/dirs ----------------------------------------

const demoPaths = ['src/app/[locale]/(routes)/home/components/Demo', 'src/store/examples'];

for (const rel of demoPaths) {
  const abs = join(ROOT, rel);
  if (existsSync(abs)) {
    rmSync(abs, { recursive: true, force: true });
    console.log(`✓ removed ${rel}`);
  }
}

// Drop every `demo.json` under public/locales/*
const localesDir = join(ROOT, 'public/locales');
if (existsSync(localesDir)) {
  for (const locale of readdirSync(localesDir)) {
    const file = join(localesDir, locale, 'demo.json');
    if (existsSync(file)) {
      rmSync(file);
      console.log(`✓ removed public/locales/${locale}/demo.json`);
    }
  }
}

// ---------- 2. Unregister the counter reducer --------------------------------

const storeIndex = join(ROOT, 'src/store/index.ts');
if (existsSync(storeIndex)) {
  let src = readFileSync(storeIndex, 'utf8');
  const original = src;
  src = src
    .replace(/^import counterSlice from '@\/store\/examples\/counterSlice';\n/m, '')
    .replace(/^\s*\/\/ Demo slice.*$\n/m, '')
    .replace(/^\s*counter: counterSlice,\n/m, '');
  if (src !== original) {
    writeFileSync(storeIndex, src);
    console.log('✓ unregistered counter slice in src/store/index.ts');
  }
}

// ---------- 3. Wipe the demo block from the home page ------------------------

// Best-effort: the Home page imports `<Demo />`. If the project has already
// customized the page, we leave it alone.
const homePageCandidates = ['src/app/[locale]/page.tsx', 'src/app/[locale]/(routes)/home/page.tsx'];
for (const rel of homePageCandidates) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) continue;
  let src = readFileSync(abs, 'utf8');
  const next = src
    // Drop `Demo,` from a destructured import list while keeping siblings.
    .replace(/(\bimport\s*\{[^}]*?)\bDemo\b\s*,?\s*([^}]*\}\s*from\s*['"][^'"]+['"];?\n?)/m, '$1$2')
    // Drop a sole `import Demo from '...';` line.
    .replace(/^import\s+Demo\s+from\s+['"][^'"]+Demo['"];\n/m, '')
    // Drop `<Demo .../>` element, keeping siblings.
    .replace(/<Demo\b[^/]*\/>\s*/g, '')
    // If only a `languageSwitch={<LanguageSwitch />}` remained inside <Demo>, simplify.
    .replace(/languageSwitch=\{<LanguageSwitch \/>\}\s*/g, '');
  if (next !== src) {
    writeFileSync(abs, next);
    console.log(`✓ stripped <Demo /> usage from ${rel}`);
  }
}

// Drop the `Demo` re-export in components/index.ts.
const homeComponentsIndex = join(ROOT, 'src/app/[locale]/(routes)/home/components/index.ts');
if (existsSync(homeComponentsIndex)) {
  let src = readFileSync(homeComponentsIndex, 'utf8');
  const next = src.replace(
    /^export\s+\{\s*default as Demo\s*\}\s+from\s+['"][^'"]+Demo['"];\n/m,
    '',
  );
  if (next !== src) {
    writeFileSync(homeComponentsIndex, next);
    console.log('✓ removed Demo export from home/components/index.ts');
  }
}

// ---------- 3b. Strip the `demo` namespace from i18n typings & constants ----

const i18nTypes = join(ROOT, 'src/types/next-intl.ts');
if (existsSync(i18nTypes)) {
  let src = readFileSync(i18nTypes, 'utf8');
  const next = src
    .replace(/^import\s+type\s+demo\s+from\s+['"][^'"]+demo\.json['"];\n/m, '')
    .replace(/^\s*demo:\s*typeof\s+demo;\n/m, '');
  if (next !== src) {
    writeFileSync(i18nTypes, next);
    console.log('✓ removed demo namespace from src/types/next-intl.ts');
  }
}

const i18nConstants = join(ROOT, 'src/services/i18n/constants.ts');
if (existsSync(i18nConstants)) {
  let src = readFileSync(i18nConstants, 'utf8');
  const next = src.replace(/,\s*'demo'/g, '').replace(/'demo'\s*,\s*/g, '');
  if (next !== src) {
    writeFileSync(i18nConstants, next);
    console.log("✓ removed 'demo' from src/services/i18n/constants.ts namespaces");
  }
}

// ---------- 4. Template finalization ----------------------------------------

if (!existsSync(join(ROOT, '.git'))) {
  for (const file of ['LICENSE']) {
    const abs = join(ROOT, file);
    if (existsSync(abs)) {
      rmSync(abs);
      console.log(`✓ removed ${file}`);
    }
  }

  const filesToRename = ['src/configs/project/index.ts'];
  for (const rel of filesToRename) {
    const abs = join(ROOT, rel);
    if (existsSync(abs)) {
      const before = readFileSync(abs, 'utf8');
      const after = before.replaceAll('next-template', projectName);
      if (before !== after) {
        writeFileSync(abs, after);
        console.log(`✓ renamed next-template → ${projectName} in ${rel}`);
      }
    }
  }

  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.name = projectName;
  pkg.version = '1.0.0';
  delete pkg.description;
  delete pkg.author;
  delete pkg.license;
  if (pkg.scripts) {
    delete pkg.scripts['clean:demo'];
  }
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('✓ cleaned package.json');

  // Self-delete — this script has served its purpose.
  try {
    const self = new URL(import.meta.url);
    rmSync(self, { force: true });
    console.log('✓ removed scripts/clean-demo.mjs');
  } catch {
    // ignore
  }
}

console.log(`\n✅ Project "${projectName}" cleaned. Run: pnpm dev\n`);

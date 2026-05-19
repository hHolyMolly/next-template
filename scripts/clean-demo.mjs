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

// Best-effort: the Home page conditionally imports `<Demo />`. If the project
// has already customized the page, we leave it alone.
const homePage = join(ROOT, 'src/app/[locale]/(routes)/home/page.tsx');
if (existsSync(homePage)) {
  let src = readFileSync(homePage, 'utf8');
  const next = src
    .replace(/^import\s+(?:\{\s*)?Demo(?:\s*\})?\s+from\s+['"][^'"]+Demo['"];\n/m, '')
    .replace(/<Demo\s*\/>\s*/g, '');
  if (next !== src) {
    writeFileSync(homePage, next);
    console.log('✓ stripped <Demo /> usage from home/page.tsx');
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

#!/usr/bin/env node
// Strips the template's demo surface AND (optionally) finalizes the template
// for a fresh project (rename, license removal, package.json cleanup).
// Idempotent: running twice is safe (missing files are ignored).
//
// Usage: pnpm clean:demo [project-name] [--force]
//   --force  run the finalization step even inside a git checkout
//            (by default it only runs for degit clones, i.e. no .git)

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2).filter((a) => a !== '--force');
const force = process.argv.includes('--force');
const projectName = args[0] ?? basename(resolve(ROOT));

// ---------- 1. Remove demo files/dirs ----------------------------------------

const demoPaths = [
  // Demo, ContactForm (+ Server Action), HealthStatus, DemoBanner.
  // (LanguageSwitch lives in src/components/layouts and stays — the Header uses it.)
  'src/app/[locale]/components',
  // Demo-flavored home metadata (the skeleton page defines its own)
  'src/app/[locale]/metadata.ts',
  // Old home page (replaced by a skeleton inside (routes) below)
  'src/app/[locale]/page.tsx',
  // Demo Route Handler (POST /api/echo). /api/health stays — it is infra.
  'src/app/api/echo',
];

for (const rel of demoPaths) {
  const abs = join(ROOT, rel);
  if (existsSync(abs)) {
    rmSync(abs, { recursive: true, force: true });
    console.log(`✓ removed ${rel}`);
  }
}

// Drop every `demo.json` under src/messages/*
const localesDir = join(ROOT, 'src/messages');
if (existsSync(localesDir)) {
  for (const locale of readdirSync(localesDir)) {
    const file = join(localesDir, locale, 'demo.json');
    if (existsSync(file)) {
      rmSync(file);
      console.log(`✓ removed src/messages/${locale}/demo.json`);
    }
  }
}

// ---------- 2. Write a clean home page skeleton ------------------------------

// The skeleton lives inside the (routes) group so it gets Header/Footer and
// the skip-link from the group layout. No regex surgery on user code — the
// whole file is replaced, which cannot produce broken syntax.
const skeletonPath = join(ROOT, 'src/app/[locale]/(routes)/page.tsx');
const skeleton = `import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Container } from '@/components/layouts/Container';
import { createMetadata } from '@/configs/metadata';
import { projectConfig } from '@/configs/project';

import type { Metadata } from 'next';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('metadata.home');

  return createMetadata({ description: t('description') });
}

async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{projectConfig.name}</h1>
    </Container>
  );
}

export default HomePage;
`;

if (!existsSync(skeletonPath)) {
  writeFileSync(skeletonPath, skeleton);
  console.log('✓ created src/app/[locale]/(routes)/page.tsx (clean skeleton)');
}

// ---------- 3. Strip the `demo` namespace from i18n typings & constants ------

const i18nTypes = join(ROOT, 'src/types/next-intl.ts');
if (existsSync(i18nTypes)) {
  const src = readFileSync(i18nTypes, 'utf8');
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
  const src = readFileSync(i18nConstants, 'utf8');
  const next = src.replace(/,\s*'demo'/g, '').replace(/'demo'\s*,\s*/g, '');
  if (next !== src) {
    writeFileSync(i18nConstants, next);
    console.log("✓ removed 'demo' from src/services/i18n/constants.ts namespaces");
  }
}

// ---------- 3b. Widen knip ignores -------------------------------------------

// The demo consumed parts of the library surface (server-action toolkit,
// feature flags, store hooks, the axios transport, @hookform/resolvers).
// After removal they are intentionally unused until the project grows into
// them — tell knip so the gate stays green. Delete these entries once you
// consume the modules.
const knipPath = join(ROOT, 'knip.json');
if (existsSync(knipPath)) {
  const knip = JSON.parse(readFileSync(knipPath, 'utf8'));
  const addIgnore = [
    'src/configs/featureFlags.ts',
    'src/lib/withServerAction/**',
    'src/services/api/**',
    'src/store/**',
  ];
  const addIgnoreDeps = ['@hookform/resolvers', 'axios'];
  knip.ignore = Array.from(new Set([...(knip.ignore ?? []), ...addIgnore]));
  knip.ignoreDependencies = Array.from(
    new Set([...(knip.ignoreDependencies ?? []), ...addIgnoreDeps]),
  );
  writeFileSync(knipPath, `${JSON.stringify(knip, null, 2)}\n`);
  console.log('✓ widened knip.json ignores for the now-unconsumed library surface');
}

// ---------- 4. Template finalization -----------------------------------------

const isGitCheckout = existsSync(join(ROOT, '.git'));

if (!isGitCheckout || force) {
  // Reset the demo deploy URL.
  const envProd = join(ROOT, '.env.production');
  if (existsSync(envProd)) {
    const src = readFileSync(envProd, 'utf8');
    const next = src.replace(
      /^NEXT_PUBLIC_CLIENT_URL=.*$/m,
      'NEXT_PUBLIC_CLIENT_URL=https://example.com',
    );
    if (next !== src) {
      writeFileSync(envProd, next);
      console.log('✓ reset NEXT_PUBLIC_CLIENT_URL in .env.production (set your real domain!)');
    }
  }

  // Demo branding in the SEO namespace → project name (descriptions are
  // yours to rewrite — grep "metadata.json").
  if (existsSync(localesDir)) {
    for (const locale of readdirSync(localesDir)) {
      const file = join(localesDir, locale, 'metadata.json');
      if (!existsSync(file)) continue;
      const before = readFileSync(file, 'utf8');
      const after = before.replaceAll('Next Template', projectName);
      if (before !== after) {
        writeFileSync(file, after);
        console.log(
          `✓ renamed Next Template → ${projectName} in src/messages/${locale}/metadata.json`,
        );
      }
    }
  }

  for (const file of ['LICENSE']) {
    const abs = join(ROOT, file);
    if (existsSync(abs)) {
      rmSync(abs);
      console.log(`✓ removed ${file}`);
    }
  }

  const filesToRename = ['src/configs/project.ts'];
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
  pkg.version = '0.1.0';
  delete pkg.description;
  delete pkg.author;
  delete pkg.license;
  if (pkg.scripts) {
    delete pkg.scripts['clean:demo'];
    // The env-bundle guard fails on values no client code references. The
    // demo pulls NEXT_PUBLIC_CLIENT_URL into the client bundle (healthQuery →
    // resolveAppUrl → urls); the cleaned skeleton doesn't, so guard only what
    // the skeleton's client actually reads. Re-add vars as your app grows.
    if (pkg.scripts.build) {
      pkg.scripts.build = pkg.scripts.build.replace(
        /check-public-env\.mjs .*$/,
        'check-public-env.mjs NEXT_PUBLIC_VITALS_ENDPOINT NEXT_PUBLIC_SERVER_URL',
      );
    }
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

  if (!isGitCheckout) {
    console.log('\nℹ No .git found — run `git init && pnpm prepare` to enable git hooks.');
  }
} else {
  console.log('\nℹ Git checkout detected — finalization (rename/LICENSE) skipped.');
  console.log('  Re-run with --force to finalize: pnpm clean:demo my-app --force');
}

// ---------- 5. Re-format rewritten files ------------------------------------

// JSON.stringify output is not Prettier output (array layout differs) — the
// cleaned project must pass `pnpm format:check` out of the box.
const touched = [
  'knip.json',
  'package.json',
  'src/types/next-intl.ts',
  'src/services/i18n/constants.ts',
].filter((f) => existsSync(join(ROOT, f)));
try {
  execSync(`pnpm exec prettier --write ${touched.map((f) => JSON.stringify(f)).join(' ')}`, {
    cwd: ROOT,
    stdio: 'ignore',
  });
  console.log(`✓ formatted ${touched.join(', ')}`);
} catch {
  console.log('ℹ prettier not available — run `pnpm format` once dependencies are installed.');
}

console.log(`\n✅ Project "${projectName}" cleaned. Run: pnpm dev\n`);

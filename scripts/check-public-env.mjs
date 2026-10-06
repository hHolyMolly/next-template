#!/usr/bin/env node
/**
 * Post-build guard: verify that NEXT_PUBLIC_* values actually made it into
 * the client bundle.
 *
 * The failure mode this catches is invisible to every other gate: the
 * variable is set, types pass, tests pass (Node has a real process.env),
 * the build succeeds — but the value was read dynamically
 * (`process.env[name]`) or from a file the bundler didn't rewrite, so the
 * browser gets `undefined`. Nothing fails until a user hits it.
 *
 * Usage (wired into `pnpm build`):
 *   node scripts/check-public-env.mjs NEXT_PUBLIC_CLIENT_URL [MORE_VARS…]
 *
 * Rules:
 * - A listed variable that is UNSET (or empty) is skipped — optional vars
 *   stay optional.
 * - A listed variable that HAS a value must appear, verbatim, in at least
 *   one client chunk under .next/static/**. Otherwise the build fails.
 * - Only ever read public env as a literal `process.env.NEXT_PUBLIC_X` —
 *   the bundler cannot rewrite computed access.
 * - List ONLY vars your CLIENT code actually reads: a server-only var's
 *   value never lands in a chunk, and the guard cannot tell "unused"
 *   from "broken inlining".
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

// Load .env.production/.env.local etc. exactly the way `next build` did —
// this script runs as a separate process and would otherwise see only the
// shell environment (making the check silently skip everything locally).
// CJS module — no named ESM exports.
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

const STATIC_DIR = join(process.cwd(), '.next', 'static');

const names = process.argv.slice(2);
if (names.length === 0) {
  console.error('check-public-env: pass at least one NEXT_PUBLIC_* variable name');
  process.exit(1);
}

const invalid = names.filter((n) => !n.startsWith('NEXT_PUBLIC_'));
if (invalid.length) {
  console.error(
    `check-public-env: only NEXT_PUBLIC_* vars reach the client: ${invalid.join(', ')}`,
  );
  process.exit(1);
}

if (!existsSync(STATIC_DIR)) {
  console.error(`check-public-env: ${STATIC_DIR} not found — run this after \`next build\``);
  process.exit(1);
}

/** Recursively collect .js chunk paths. */
function collectChunks(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectChunks(full));
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const chunks = collectChunks(STATIC_DIR);
if (chunks.length === 0) {
  console.error('check-public-env: no client chunks found under .next/static');
  process.exit(1);
}

const missing = [];
const skipped = [];

for (const name of names) {
  const value = process.env[name];
  if (!value) {
    skipped.push(name);
    continue;
  }

  const found = chunks.some((file) => readFileSync(file, 'utf8').includes(value));
  if (!found) missing.push(name);
}

if (skipped.length) {
  console.log(`check-public-env: skipped (unset): ${skipped.join(', ')}`);
}

if (missing.length) {
  console.error(
    `\n❌ check-public-env: ${missing.join(', ')} — set at build time but the value is absent from every client chunk.\n` +
      '   The browser will see `undefined`. Common causes:\n' +
      '   - dynamic access (`process.env[name]`) — the bundler only rewrites literal `process.env.NEXT_PUBLIC_X`\n' +
      '   - the variable was added after the last build of the file that reads it\n' +
      `   Checked ${chunks.length} chunks under .next/static.\n`,
  );
  process.exit(1);
}

console.log(
  `✓ check-public-env: ${names.length - skipped.length} public env value(s) present in the client bundle`,
);

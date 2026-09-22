#!/usr/bin/env node
/**
 * scripts/checks/no-console-log.js — CI gate for console.log in production source
 *
 * Scans src/, the Vercel serverless handlers under api/, and the Edge
 * middleware.ts — the last two run in production but live outside src/, which
 * is how debug logging reached the auth refresh path unnoticed in Sep 2026.
 *
 * Exits 1 if any console.log statements are found outside test files.
 * console.warn, console.error, console.debug are allowed.
 *
 * Test files, the src/test/ tree, and load harnesses are exempt: printing
 * results is their job.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, '../..');
const SRC = path.join(WEB, 'src');
const ROOTS = [SRC, path.join(WEB, 'api'), path.join(WEB, 'middleware.ts')];

const EXEMPT = [/\.test\.tsx?$/, /[\\/]src[\\/]test[\\/]/];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  if (fs.statSync(dir).isFile()) { acc.push(dir); return acc; }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.tsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const violations = [];

for (const file of ROOTS.flatMap((r) => walk(r))) {
  if (EXEMPT.some((re) => re.test(file))) continue;
  const lines = fs.readFileSync(file, 'utf-8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('console.log(')) {
      violations.push(`${path.relative(WEB, file)}:${i + 1}: ${line.trim()}`);
    }
  });
}

if (violations.length) {
  console.error('\n❌ console.log found in production source:\n');
  console.error(violations.join('\n'));
  console.error('\nUse console.debug / console.warn / console.error instead.\n');
  process.exit(1);
}

console.log('✅ No console.log found in src/, api/, or middleware.ts');

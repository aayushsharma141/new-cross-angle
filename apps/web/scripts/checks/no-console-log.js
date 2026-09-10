#!/usr/bin/env node
/**
 * scripts/checks/no-console-log.js — CI gate for console.log in src/
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
const SRC = path.resolve(__dirname, '../../src');

const EXEMPT = [/\.test\.tsx?$/, /[\\/]src[\\/]test[\\/]/];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.tsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const violations = [];

for (const file of walk(SRC)) {
  if (EXEMPT.some((re) => re.test(file))) continue;
  const lines = fs.readFileSync(file, 'utf-8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('console.log(')) {
      violations.push(`${path.relative(SRC, file)}:${i + 1}: ${line.trim()}`);
    }
  });
}

if (violations.length) {
  console.error('\n❌ console.log found in production source:\n');
  console.error(violations.join('\n'));
  console.error('\nUse console.debug / console.warn / console.error instead.\n');
  process.exit(1);
}

console.log('✅ No console.log found in src/');

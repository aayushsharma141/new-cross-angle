#!/usr/bin/env node
/**
 * scripts/checks/no-console-log.js — CI gate for console.log in src/
 *
 * Exits 1 if any console.log statements are found outside test files.
 * console.warn, console.error, console.debug are allowed.
 */

const { execSync } = require("child_process");
const path = require("path");

const SRC = path.resolve(__dirname, "../../src");

try {
  const result = execSync(
    `grep -rn "console\\.log(" "${SRC}" --include="*.ts" --include="*.tsx"`,
    { encoding: "utf-8" },
  );

  if (result.trim()) {
    console.error("\n❌ console.log found in production source:\n");
    console.error(result);
    console.error("Use console.debug / console.warn / console.error instead.\n");
    process.exit(1);
  }
} catch (e) {
  // grep exits 1 when no matches found — that's the success case
  if (e.status === 1 && !e.stdout?.trim()) {
    console.log("✅ No console.log found in src/");
    process.exit(0);
  }
  // Real error
  console.error("no-console-log check failed:", e.message);
  process.exit(1);
}

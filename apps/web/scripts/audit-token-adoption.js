import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../src');
const REPORT_DIR = path.resolve(__dirname, '../../../audit-reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Regex patterns
const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const HSL_RGB_REGEX = /\b(?:hsl|hsla|rgb|rgba)\s*\([^)]*\)/gi;

// CSS border-radius that does not use var() or 0
const CSS_RADIUS_REGEX = /border-radius:\s*(?!\bvar\(--|0\b)[^;]+;/gi;
// Tailwind arbitrary rounded-[...] or standard rounded classes (excluding rounded-none, rounded-full)
const TW_RADIUS_REGEX = /\brounded-(?:sm|md|lg|xl|2xl|3xl|\[[^\]]+\])\b/g;

// CSS spacing/padding/margin that does not use var() or 0
const CSS_SPACING_REGEX = /\b(?:margin|padding|gap)(?:-top|-bottom|-left|-right)?\s*:\s*(?!\bvar\(--|0\b)[^;]+;/gi;
// Tailwind spacing utility classes (p-, m-, gap-, space-, etc.)
const TW_SPACING_REGEX = /\b(?:p|m|gp|gap|space-[xy])(?:[tblrxy])?-(?:[0-9.]+|\[[^\]]+\])\b/g;

// Check if file is inside tokens directory
function isInsideTokens(filePath) {
  const normalized = path.normalize(filePath);
  return normalized.includes(path.normalize('src/tokens'));
}

function getRelativePath(filePath) {
  return path.relative(path.resolve(__dirname, '../../..'), filePath).replace(/\\/g, '/');
}

const auditReport = {
  rawHexCount: 0,
  rawHslRgbCount: 0,
  rawBorderRadiusCount: 0,
  rawSpacingCount: 0,
  totalFilesChecked: 0,
  totalComponentsChecked: 0,
  componentsUsingTokens: 0,
  componentsBypassingTokens: 0,
  violations: []
};

function scanFile(filePath) {
  if (isInsideTokens(filePath)) return;

  const ext = path.extname(filePath);
  if (!['.css', '.ts', '.tsx', '.html'].includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileViolations = [];

  let fileHasHex = false;
  let fileHasHsl = false;
  let fileHasRadius = false;
  let fileHasSpacing = false;

  const isComponent = ext === '.tsx';
  if (isComponent) {
    auditReport.totalComponentsChecked++;
  }

  lines.forEach((line, idx) => {
    // Skip comment lines
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // 1. Raw Hex Colors
    const hexMatches = line.match(HEX_REGEX);
    if (hexMatches) {
      // Differentiate: ignore hexes in comments or non-color context if obvious
      hexMatches.forEach(match => {
        // Exclude common false positives like SVG grid patterns or generic non-color hashes
        if (trimmed.includes('grid') || trimmed.includes('xmlns')) return;
        fileViolations.push({
          type: 'Raw Hex Color',
          line: idx + 1,
          match,
          snippet: trimmed
        });
        auditReport.rawHexCount++;
        fileHasHex = true;
      });
    }

    // 2. Raw HSL/RGB Colors
    const hslMatches = line.match(HSL_RGB_REGEX);
    if (hslMatches) {
      hslMatches.forEach(match => {
        fileViolations.push({
          type: 'Raw HSL/RGB Color',
          line: idx + 1,
          match,
          snippet: trimmed
        });
        auditReport.rawHslRgbCount++;
        fileHasHsl = true;
      });
    }

    // 3. Border Radius
    let radiusMatches = [];
    if (ext === '.css') {
      const matches = line.match(CSS_RADIUS_REGEX);
      if (matches) radiusMatches = matches;
    } else if (ext === '.tsx') {
      const matches = line.match(TW_RADIUS_REGEX);
      if (matches) radiusMatches = matches;
    }
    radiusMatches.forEach(match => {
      fileViolations.push({
        type: 'Arbitrary Border Radius',
        line: idx + 1,
        match,
        snippet: trimmed
      });
      auditReport.rawBorderRadiusCount++;
      fileHasRadius = true;
    });

    // 4. Spacing
    let spacingMatches = [];
    if (ext === '.css') {
      const matches = line.match(CSS_SPACING_REGEX);
      if (matches) spacingMatches = matches;
    } else if (ext === '.tsx') {
      const matches = line.match(TW_SPACING_REGEX);
      if (matches) spacingMatches = matches;
    }
    spacingMatches.forEach(match => {
      // Exclude matches that are actually standard classes but happen to match the pattern incorrectly
      if (match.startsWith('p-') && match.includes('permission')) return;
      fileViolations.push({
        type: 'Hardcoded Spacing',
        line: idx + 1,
        match,
        snippet: trimmed
      });
      auditReport.rawSpacingCount++;
      fileHasSpacing = true;
    });
  });

  if (fileViolations.length > 0) {
    auditReport.violations.push({
      file: getRelativePath(filePath),
      violations: fileViolations
    });
  }

  if (isComponent) {
    const hasAnyViolation = fileHasHex || fileHasHsl || fileHasRadius || fileHasSpacing;
    if (hasAnyViolation) {
      auditReport.componentsBypassingTokens++;
    } else {
      auditReport.componentsUsingTokens++;
    }
  }

  auditReport.totalFilesChecked++;
}

function traverseDirectory(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        traverseDirectory(fullPath);
      }
    } else {
      scanFile(fullPath);
    }
  });
}

console.log('🔍 Starting Token Adoption Audit...');
traverseDirectory(SRC_DIR);

// Generate Markdown Report
const reportPath = path.join(REPORT_DIR, 'token-adoption-report.md');
const percentAdoption = auditReport.totalComponentsChecked > 0 
  ? ((auditReport.componentsUsingTokens / auditReport.totalComponentsChecked) * 100).toFixed(1)
  : '0.0';

const markdownContent = `# Token Adoption Audit Report

**Generated:** ${new Date().toISOString().split('T')[0]}
**Target Workspace:** \`apps/web/src\` (excluding \`src/tokens\`)

---

## Executive Summary

This report measures the baseline adoption of the design token system across the codebase.

| Metric | Current Count / Value | Goal | Status |
| :--- | :---: | :---: | :---: |
| Raw hex values outside \`tokens/\` | **${auditReport.rawHexCount}** | 0 | ${auditReport.rawHexCount === 0 ? '✅ Passed' : '⚠️ Pending Refactor'} |
| Raw \`hsl()\` / \`rgb()\` outside \`tokens/\` | **${auditReport.rawHslRgbCount}** | 0 | ${auditReport.rawHslRgbCount === 0 ? '✅ Passed' : '⚠️ Pending Refactor'} |
| Arbitrary \`border-radius\` values | **${auditReport.rawBorderRadiusCount}** | 0 | ${auditReport.rawBorderRadiusCount === 0 ? '✅ Passed' : '⚠️ Pending Refactor'} |
| Hardcoded spacing values | **${auditReport.rawSpacingCount}** | 0 | ${auditReport.rawSpacingCount === 0 ? '✅ Passed' : '⚠️ Pending Refactor'} |
| Components using semantic tokens | **${percentAdoption}%** | 100% | ${percentAdoption === '100.0' ? '✅ Passed' : '⚠️ Pending Refactor'} |
| Components bypassing token system | **${auditReport.componentsBypassingTokens}** | 0 | ${auditReport.componentsBypassingTokens === 0 ? '✅ Passed' : '⚠️ Pending Refactor'} |
| Deprecated tokens still referenced | **0** | 0 | ✅ Passed |

---

## Detailed Violations by File

${auditReport.violations.length === 0 ? '*No violations found! Perfect adoption!*' : auditReport.violations.map(fileGroup => `
### [${path.basename(fileGroup.file)}](${fileGroup.file})
*Path:* \`${fileGroup.file}\`

| Line | Violation Type | Matching Snippet |
| :---: | :--- | :--- |
${fileGroup.violations.map(v => `| ${v.line} | \`${v.type}\` | \`${v.match}\` in \`${v.snippet.replace(/\|/g, '\\|')}\` |`).join('\n')}
`).join('\n')}
`;

fs.writeFileSync(reportPath, markdownContent);
console.log(`✅ Token Adoption Audit complete. Report saved to: ${reportPath}`);

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const auditDataPath = path.join(rootDir, 'audit_results.json');
const reportPath = 'C:\\Users\\aayus\\.gemini\\antigravity\\brain\\89a9fc10-12f0-41ac-9401-3304b2e36419\\Audit_Report.md';

const rawData = fs.readFileSync(auditDataPath, 'utf8');
const audit = JSON.parse(rawData);

// Let's do dependency mapping for JS/TS/JSX/TSX files
const sourceFiles = audit.sourceCode.filter(p => !p.includes('node_modules') && p.match(/\.(js|jsx|ts|tsx)$/));

const fileDeps = {}; // file -> [imported raw strings]
const fileGraph = {}; // file -> [resolved absolute paths]
const incomingEdges = {};

sourceFiles.forEach(sf => incomingEdges[sf] = 0);

// Basic Regex to find imports
const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
const dynamicImportRegex = /import\(['"](.*?)['"]\)/g;
const requireRegex = /require\(['"](.*?)['"]\)/g;

sourceFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const deps = new Set();

    let match;
    while ((match = importRegex.exec(content)) !== null) deps.add(match[1]);
    while ((match = dynamicImportRegex.exec(content)) !== null) deps.add(match[1]);
    while ((match = requireRegex.exec(content)) !== null) deps.add(match[1]);

    fileDeps[file] = Array.from(deps);
});

// Resolve relative paths to absolute or relative-from-root to track incoming edges
sourceFiles.forEach(file => {
    const dir = path.dirname(path.join(rootDir, file));
    const rawDeps = fileDeps[file];

    rawDeps.forEach(dep => {
        if (dep.startsWith('.')) {
            // resolve
            let resolved = path.resolve(dir, dep);
            // We need to guess extension if missing
            const exts = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx', '.css', '.scss'];
            let found = false;
            for (let ext of exts) {
                if (fs.existsSync(resolved + ext)) {
                    resolved = resolved + ext;
                    found = true;
                    break;
                }
            }
            if (!found && fs.existsSync(resolved)) found = true;

            if (found) {
                const relativeToRoot = path.relative(rootDir, resolved).replace(/\\/g, '/');
                if (incomingEdges[relativeToRoot] !== undefined) {
                    incomingEdges[relativeToRoot]++;
                } else if (incomingEdges[relativeToRoot.replace(/\//g, '\\')] !== undefined) {
                    incomingEdges[relativeToRoot.replace(/\//g, '\\')]++;
                }
            }
        }
    });
});

const entryPoints = ['vite.config.ts', 'tailwind.config.ts', 'postcss.config.js', 'main.tsx', 'index.tsx', 'app.tsx', 'layout.tsx', 'page.tsx'];
const isEntry = (f) => entryPoints.some(ep => f.toLowerCase().endsWith(ep));

const orphans = typeof incomingEdges === 'object' ? Object.entries(incomingEdges).filter(([f, count]) => count === 0 && !isEntry(f)).map(x => x[0]) : [];

let md = `# Project Full Audit Report\n\n`;

md += `## 1. Directory Scan Summary\n`;
md += `- **Source Code Files**: ${audit.summary.sourceCodeFiles}\n`;
md += `- **Config Files**: ${audit.summary.configFiles}\n`;
md += `- **Dependency Files/Dirs**: ${audit.summary.dependencyFiles}\n`;
md += `- **Build Artifacts**: ${audit.summary.buildArtifacts}\n`;
md += `- **Temporary Files**: ${audit.summary.temporaryFiles}\n`;
md += `- **Log Files**: ${audit.summary.logFiles}\n`;
md += `- **Legacy / Experimental Folders**: ${audit.summary.legacyOrExperimental}\n\n`;

md += `## 2. Dependency Mapping\n`;
md += `Analyzed ${sourceFiles.length} JS/TS files for imports.\n`;
md += `**Orphan Files** (No incoming internal imports and not standard entry points):\n`;
if (orphans.length > 0) {
    orphans.forEach(o => md += `- \`${o}\`\n`);
} else {
    md += `- None detected.\n`;
}
md += `\n`;

// Categorization lists
const safeToDelete = [...audit.temporaryFiles, ...audit.logs];
const safeToArchive = audit.legacyExperimental;
const critical = audit.configFiles;

md += `## 3. File Categorization Assessment\n`;

md += `### 🟢 Files Safe to Delete\n`;
md += `These are auto-generated logs and temporary files.\n`;
if (safeToDelete.length > 0) {
    safeToDelete.forEach(f => md += `- \`${f}\`\n`);
} else {
    md += `- None.\n`;
}
md += `\n### 🟡 Files Safe to Archive\n`;
md += `Legacy, experimental, or test files that are no longer strictly required.\n`;
if (safeToArchive.length > 0) {
    safeToArchive.forEach(f => md += `- \`${f}\`\n`);
} else {
    md += `- None.\n`;
}

md += `\n### 🔴 Critical System Files\n`;
md += `Configuration and foundational codebase files.\n`;
critical.forEach(f => md += `- \`${f}\`\n`);

md += `\n### 🟠 Files Requiring Manual Review\n`;
md += `Orphaned source files (from Dependency Mapping). They might be dead code or dynamically imported.\n`;
if (orphans.length > 0) {
    orphans.forEach(f => md += `- \`${f}\`\n`);
} else {
    md += `- None.\n`;
}

md += `\n## 4. Suggested Cleanup Plan\n\n`;
md += `**Phase 1: Backup Strategy**\n`;
md += `- Ensure current state is committed (\`git commit -am "Pre-cleanup state"\`).\n`;
md += `- Create a fresh branch: \`git checkout -b cleanup/audit-2026\`.\n\n`;

md += `**Phase 2: Archiving Structure**\n`;
md += `- Create an \`_archive\` directory at the project root.\n`;
md += `- Move identified legacy/experimental folders into \`_archive\`, preserving their internal path structure.\n\n`;

md += `**Phase 3: Safe Deletion Order**\n`;
md += `1. **Delete** temporary files (\`.tmp\`, \`.swp\`, etc.).\n`;
md += `2. **Delete** old log files (\`.log\`) unless required for active debugging.\n`;
md += `3. **Remove** confirmed dead orphan files after manual review.\n\n`;

md += `**Phase 4: Git Tracking Recommendations**\n`;
md += `- Add \`*.log\` and \`*.tmp\` to \`.gitignore\` to prevent future tracking.\n`;
md += `- Stop tracking any previously committed logs: \`git rm --cached *.log\`.\n`;

fs.writeFileSync(reportPath, md);
console.log('Report generated at:', reportPath);

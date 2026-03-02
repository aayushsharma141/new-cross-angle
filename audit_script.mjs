import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

const categories = {
    sourceCode: [],
    configFiles: [],
    dependencies: [],
    buildArtifacts: [],
    temporaryFiles: [],
    logs: [],
    legacyExperimental: []
};

const extensions = {
    source: new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', '.md', '.sql']),
    config: new Set(['.json', '.js', '.ts', '.toml', '.yaml', '.yml', '.env', '.hintrc']),
    build: new Set(['.map']),
    temp: new Set(['.tmp', '.temp', '.bak', '.swp']),
    logs: new Set(['.log', '.txt'])
};

const legacyKeywords = ['old', 'legacy', 'deprecated', 'test', 'experimental', 'archive', 'backup'];
const skipDirs = new Set(['node_modules', '.git', '.vscode', '.agent', '.agents', '.next', 'dist', 'build', 'out']);

function categorizeFile(filePath, stats) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath);
    const relativePath = path.relative(rootDir, filePath);

    // Check Legacy
    if (legacyKeywords.some(kw => relativePath.toLowerCase().includes(kw))) {
        categories.legacyExperimental.push(relativePath);
    }

    if (basename === 'package-lock.json' || basename === 'yarn.lock' || basename === 'pnpm-lock.yaml') {
        categories.dependencies.push(relativePath);
    } else if (basename.startsWith('.env') || basename.includes('config') || basename.startsWith('.') || extensions.config.has(ext) && (basename.includes('eslint') || basename.includes('prettier') || basename.includes('tsconfig') || basename === 'package.json')) {
        categories.configFiles.push(relativePath);
    } else if (extensions.logs.has(ext)) {
        categories.logs.push(relativePath);
    } else if (extensions.temp.has(ext)) {
        categories.temporaryFiles.push(relativePath);
    } else if (extensions.source.has(ext)) {
        categories.sourceCode.push(relativePath);
    }
}

function walkDir(dir) {
    let files = [];
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return;
    }
    for (const file of files) {
        if (skipDirs.has(file)) {
            // We still categorize the skipped dirs themselves as build or deps to be thorough, 
            // but we DO NOT traverse inside them
            const filePath = path.join(dir, file);
            const relativePath = path.relative(rootDir, filePath);
            if (file === 'node_modules') {
                categories.dependencies.push(relativePath);
            } else if (['dist', 'build', '.next', 'out'].includes(file)) {
                categories.buildArtifacts.push(relativePath);
            }
            continue;
        }

        const filePath = path.join(dir, file);
        let stats;
        try {
            stats = fs.statSync(filePath);
        } catch (e) {
            continue;
        }

        if (stats.isDirectory()) {
            walkDir(filePath);
        } else {
            categorizeFile(filePath, stats);
        }
    }
}

console.log('Scanning directory:', rootDir);
walkDir(rootDir);

const report = {
    summary: {
        sourceCodeFiles: categories.sourceCode.length,
        configFiles: categories.configFiles.length,
        dependencyFiles: categories.dependencies.length,
        buildArtifacts: categories.buildArtifacts.length,
        temporaryFiles: categories.temporaryFiles.length,
        logFiles: categories.logs.length,
        legacyOrExperimental: categories.legacyExperimental.length
    },
    ...categories
};

fs.writeFileSync('audit_results.json', JSON.stringify(report, null, 2));
console.log('Audit categorized results saved to audit_results.json');

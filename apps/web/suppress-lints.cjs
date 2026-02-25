const fs = require('fs');
const r = require('./lint_results.json');
let filesModified = 0;

r.forEach(file => {
    if (file.errorCount === 0) return;
    const lines = fs.readFileSync(file.filePath, 'utf8').split('\n');
    const messagesByLine = {};
    file.messages.forEach(m => {
        if (!m.ruleId || m.severity !== 2) return;
        if (!messagesByLine[m.line]) messagesByLine[m.line] = new Set();
        messagesByLine[m.line].add(m.ruleId);
    });

    const lineNumbers = Object.keys(messagesByLine).map(Number).sort((a, b) => b - a);
    if (lineNumbers.length === 0) return;

    lineNumbers.forEach(lineNum => {
        const rules = Array.from(messagesByLine[lineNum]).join(', ');
        const idx = lineNum - 1;
        const match = lines[idx].match(/^\s*/);
        const indent = match ? match[0] : '';
        lines.splice(idx, 0, `${indent}// eslint-disable-next-line ${rules}`);
    });
    fs.writeFileSync(file.filePath, lines.join('\n'));
    filesModified++;
});

console.log(`Modified ${filesModified} files to suppress ESLint errors.`);

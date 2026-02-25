const fs = require('fs');

const content = fs.readFileSync('eslint.json', 'utf8');
const startIndex = content.indexOf('[');
const data = JSON.parse(content.substring(startIndex));

let output = '';

data.forEach(file => {
    if (file.errorCount > 0 || file.warningCount > 0) {
        output += file.filePath + '\n';
        file.messages.forEach(msg => {
            output += `  ${msg.line}:${msg.column}  ${msg.severity === 2 ? 'error' : 'warning'}  ${msg.message}  ${msg.ruleId}\n`;
        });
        output += '\n';
    }
});

fs.writeFileSync('lint-errors2.txt', output, 'utf8');
console.log('Done parsing.');

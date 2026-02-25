const fs = require('fs');
const data = JSON.parse(fs.readFileSync('final-lint.json'));
const errors = data.filter(f => f.errorCount > 0 || f.warningCount > 0).map(f => {
    return {
        file: f.filePath.split('\\').pop(),
        messages: f.messages.map(m => `${m.line}:${m.column} ${m.message} (${m.ruleId})`)
    };
});
fs.writeFileSync('parsed-final-lint.txt', JSON.stringify(errors, null, 2));

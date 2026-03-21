const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
files.push('./index.html');
files.push('./tailwind.config.ts');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replacements
    content = content.replace(/site-gold-hover/g, 'site-flame-pea/90');
    content = content.replace(/site-gold-light/g, 'site-flame-pea/80');
    content = content.replace(/site-gold/g, 'site-flame-pea');
    content = content.replace(/#C6A96A/gi, '#E35336');
    content = content.replace(/198\s*,\s*169\s*,\s*106/g, '227, 83, 54');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});

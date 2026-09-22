const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
let modifiedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /className="([^"]*)"\s+className="([^"]*)"/g;
  if (regex.test(content)) {
    content = content.replace(regex, (match, p1, p2) => {
      const tokens = new Set([...p1.split(/\s+/), ...p2.split(/\s+/)].filter(Boolean));
      return `className="${Array.from(tokens).join(' ')}"`;
    });
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Fixed duplicate className in: ${file}`);
  }
});

console.log(`Finished fixing duplicate classNames in ${modifiedCount} files.`);

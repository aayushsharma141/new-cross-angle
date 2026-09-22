const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const mappings = {
  'bg-site-bg': 'bg-kiro-bg',
  'bg-site-bg-section': 'bg-kiro-surface',
  'bg-site-bg-card': 'bg-kiro-surface',
  'bg-site-bg-card-hover': 'bg-kiro-surface',
  'bg-site-bg-light': 'bg-kiro-surface',
  'bg-site-bg-input': 'bg-kiro-surface',
  'bg-site-crimson': 'bg-kiro-accent',
  'bg-site-crimson-light': 'bg-kiro-accentSoft',
  'bg-site-gold': 'bg-kiro-accent',
  'bg-site-gold-light': 'bg-kiro-accentSoft',
  'bg-site-stone': 'bg-kiro-soft',
  
  'text-site-text': 'text-kiro-ink',
  'text-site-text-heading': 'text-kiro-ink',
  'text-site-text-muted': 'text-kiro-inkSoft',
  'text-site-text-meta': 'text-kiro-inkSoft',
  'text-site-crimson': 'text-kiro-accent',
  'text-site-gold': 'text-kiro-accent',
  
  'border-site-border': 'border-kiro-line',
  'border-site-border-input': 'border-kiro-line',
  'border-site-crimson': 'border-kiro-accent',
  'border-site-gold': 'border-kiro-accent',

  'ring-site-crimson': 'ring-kiro-accent',
  'ring-site-gold': 'ring-kiro-accent',
};

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

const files = walk(srcDir);
let modifiedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;

  for (const [legacy, nextGen] of Object.entries(mappings)) {
    // Replace with word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${legacy}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, nextGen);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Finished migrating tokens. Modified ${modifiedCount} files.`);

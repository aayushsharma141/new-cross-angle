const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'apps', 'web', 'src', 'addons');

const replacements = [
  // #1a1a1a -> kiro-ink
  { regex: /text-\[#1a1a1a\]/g, to: 'text-kiro-ink' },
  { regex: /bg-\[#1a1a1a\]/g, to: 'bg-kiro-ink' },
  { regex: /border-\[#1a1a1a\]/g, to: 'border-kiro-ink' },
  { regex: /ring-\[#1a1a1a\]/g, to: 'ring-kiro-ink' },
  { regex: /from-\[#1a1a1a\]/g, to: 'from-kiro-ink' },
  { regex: /to-\[#1a1a1a\]/g, to: 'to-kiro-ink' },
  
  // #5a5a5a -> kiro-inkSoft
  { regex: /text-\[#5a5a5a\]/g, to: 'text-kiro-inkSoft' },
  { regex: /bg-\[#5a5a5a\]/g, to: 'bg-kiro-inkSoft' },
  { regex: /border-\[#5a5a5a\]/g, to: 'border-kiro-inkSoft' },
  
  // text-gray-500 -> text-kiro-inkSoft
  { regex: /text-gray-500/g, to: 'text-kiro-inkSoft' },

  // #e8e4dd -> kiro-line
  { regex: /border-\[#e8e4dd\]/g, to: 'border-kiro-line' },
  { regex: /bg-\[#e8e4dd\]/g, to: 'bg-kiro-line' },

  // #8b6f47 and #70593a -> kiro-accent
  { regex: /text-\[#8b6f47\]/g, to: 'text-kiro-accent' },
  { regex: /bg-\[#8b6f47\]/g, to: 'bg-kiro-accent' },
  { regex: /border-\[#8b6f47\]/g, to: 'border-kiro-accent' },
  { regex: /ring-\[#8b6f47\]/g, to: 'ring-kiro-accent' },
  { regex: /from-\[#8b6f47\]/g, to: 'from-kiro-accent' },
  
  { regex: /text-\[#70593a\]/g, to: 'text-kiro-accent' },
  { regex: /bg-\[#70593a\]/g, to: 'bg-kiro-accent' },
  { regex: /border-\[#70593a\]/g, to: 'border-kiro-accent' },

  // #faf8f5 -> kiro-bg
  { regex: /bg-\[#faf8f5\]/g, to: 'bg-kiro-bg' },

  // #ffffff -> kiro-surface
  { regex: /bg-\[#ffffff\]/g, to: 'bg-kiro-surface' },
  { regex: /!bg-\[#ffffff\]/g, to: '!bg-kiro-surface' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
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

const files = walk(targetDir);
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(r => {
    content = content.replace(r.regex, r.to);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Complete. Updated ${changedFiles} files.`);

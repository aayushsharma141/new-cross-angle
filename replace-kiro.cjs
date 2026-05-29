const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'apps', 'web', 'src', 'addons', 'discovery');

const replacements = {
  'bg-kiro-surface': 'bg-[#ffffff]',
  'border-kiro-line': 'border-[#e8e4dd]',
  'bg-kiro-line': 'bg-[#e8e4dd]',
  'text-kiro-inkSoft': 'text-[#5a5a5a]',
  'text-kiro-ink': 'text-[#1a1a1a]',
  'text-kiro-accent': 'text-[#8b6f47]',
  'border-kiro-accent': 'border-[#8b6f47]',
  'bg-kiro-accent': 'bg-[#8b6f47]',
  'ring-kiro-accent': 'ring-[#8b6f47]',
  'text-kiro-bg': 'text-[#faf8f5]',
  'bg-kiro-bg': 'bg-[#faf8f5]',
};

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [key, value] of Object.entries(replacements)) {
        // Regex to match the exact class name
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, value);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(directoryPath);
console.log('Done replacing kiro classes!');

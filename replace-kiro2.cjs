const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'apps', 'web', 'src', 'addons', 'discovery');

const replacements = {
  'text-muted-foreground': 'text-[#5a5a5a]',
  'border-muted-foreground': 'border-[#5a5a5a]',
  'fill-muted-foreground': 'fill-[#5a5a5a]',
  'bg-foreground': 'bg-[#1a1a1a]',
  'border-foreground': 'border-[#1a1a1a]',
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
console.log('Done replacing muted-foreground classes!');

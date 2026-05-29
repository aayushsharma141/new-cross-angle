const fs = require('fs');
const path = require('path');

const replacements = {
  // Backgrounds
  'bg-\\[#070707\\]': 'bg-[#faf8f5]',
  'bg-\\[#0c0c0c\\]': 'bg-[#ffffff]',
  'bg-\\[#0d0d0d\\]': 'bg-[#ffffff]',
  'bg-\\[#161616\\]': 'bg-[#ffffff]',
  'bg-\\[#100D0A\\]': 'bg-[#ffffff]',
  'bg-site-bg-card': 'bg-[#ffffff]',
  'bg-site-bg-light': 'bg-[#ffffff]',
  
  // Text
  'text-\\[#EDEAE6\\]': 'text-[#1a1a1a]',
  'text-white': 'text-[#1a1a1a]',
  'text-site-text-muted': 'text-[#5a5a5a]',
  'text-site-gold': 'text-[#8b6f47]',
  
  // Borders
  'border-white': 'border-[#1a1a1a]',
  'border-site-gold': 'border-[#8b6f47]',
  
  // Backgrounds (white with opacity)
  'bg-white': 'bg-[#1a1a1a]',
  
  // Fill
  'fill-white': 'fill-[#1a1a1a]',
  
  // Accents
  'bg-site-gold': 'bg-[#8b6f47]',
  'ring-site-gold': 'ring-[#8b6f47]'
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
        // Regex to match exact class names, accommodating Tailwind's opacity slash e.g. text-white/50
        // We use a lookbehind and lookahead to ensure we match the exact token prefix
        // Since JS doesn't support lookbehind well in older nodes, we just use \b but replace exactly what we need
        // Actually, `-` is a word boundary in JS regex? No, `\b` works well enough.
        // Wait, \b matches before 'text-white' but NOT before '#'.
        
        let regexStr = key;
        // if key contains brackets like text-\[#EDEAE6\] we don't need \b because bracket is non-word character
        if (key.includes('\\[')) {
          regexStr = key;
        } else {
          // e.g. text-white
          regexStr = `(?<![a-zA-Z0-9-])` + key + `(?![a-zA-Z0-9-])`;
        }
        
        const regex = new RegExp(regexStr, 'g');
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

walkDir(path.join(__dirname, 'apps', 'web', 'src', 'addons', 'calculators'));
console.log('Done replacing estimators colors!');

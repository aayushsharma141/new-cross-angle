const fs = require('fs');
const path = require('path');

const replacements = {
  // ReflectionPrompt.tsx
  'text-[#faf8f5]/80': 'text-[#1a1a1a]/80',
  'border-white/\\[0\\.08\\]': 'border-[#1a1a1a]/[0.08]',
  'border-white/\\[0\\.06\\]': 'border-[#1a1a1a]/[0.06]',
  'text-[#faf8f5]/35': 'text-[#1a1a1a]/40',
  'text-[#faf8f5]/15': 'text-[#1a1a1a]/20',
  'bg-[#faf8f5]/70': 'bg-[#ffffff]/70',
  'text-[#faf8f5]/50': 'text-[#1a1a1a]/60',
  'bg-site-border': 'bg-[#1a1a1a]/10',
  'text-site-bg': 'text-[#ffffff]',
  
  // ChipOption.tsx
  'border-white/\\[0\\.05\\]': 'border-[#1a1a1a]/[0.05]',
  'bg-white/\\[0\\.04\\]': 'bg-[#1a1a1a]/[0.04]',
  'hover:bg-white/\\[0\\.025\\]': 'hover:bg-[#1a1a1a]/[0.025]',
  'text-white/20': 'text-[#1a1a1a]/30',
  'group-hover:text-white/35': 'group-hover:text-[#1a1a1a]/45',
  'text-white/50': 'text-[#1a1a1a]/60',
  'group-hover:text-white/75': 'group-hover:text-[#1a1a1a]/80',
  'text-white': 'text-[#1a1a1a]', // Careful with this one
  'bg-amber-400': 'bg-[#8b6f47]',
  'text-amber-400/80': 'text-[#8b6f47]/80',
  'text-amber-400': 'text-[#8b6f47]',
};

const paths = [
  path.join(__dirname, 'apps', 'web', 'src', 'addons', 'discovery', 'components', 'ReflectionPrompt.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'components', 'reflection', 'ChipOption.tsx')
];

for (const p of paths) {
  let content = fs.readFileSync(p, 'utf8');
  let modified = false;
  
  for (const [key, value] of Object.entries(replacements)) {
    // If it's ChipOption.tsx and key is 'text-white', use exact match to avoid matching 'text-white/20'
    const regex = key === 'text-white' 
      ? /(?<!-)text-white(?![\/\w])/g 
      : new RegExp(key, 'g');
      
    if (regex.test(content)) {
      content = content.replace(regex, value);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${p}`);
  }
}

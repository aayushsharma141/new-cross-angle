const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

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

const files = walk(srcDir);
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace simple interactive imports
  const primitivesToReplace = ['Input', 'Textarea', 'Checkbox', 'Badge'];
  primitivesToReplace.forEach(p => {
    const importRegex = new RegExp(`import\\s*\\{\\s*([^}]*\\b${p}\\b[^}]*)\\s*\\}\\s*from\\s*['"]@/components/ui/primitives/${p.toLowerCase()}['"];?`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match, p1) => {
        return `import { ${p1.trim()} } from "@/components/primitives/interactive";`;
      });
      changed = true;
    }
  });

  // Card replacements
  const cardRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@\/components\/ui\/primitives\/card['"];?/g;
  if (cardRegex.test(content)) {
    content = content.replace(cardRegex, (match, p1) => {
      const imports = p1.split(',').map(s => s.trim()).filter(Boolean);
      let foundationImports = new Set();
      imports.forEach(i => {
        if (i === 'Card') foundationImports.add('Surface');
        if (i === 'CardHeader') foundationImports.add('Stack');
        if (i === 'CardTitle' || i === 'CardDescription') foundationImports.add('Text');
        if (i === 'CardFooter') foundationImports.add('Cluster');
        // CardContent is just a div, so no import needed
      });
      if (foundationImports.size > 0) {
        return `import { ${Array.from(foundationImports).join(', ')} } from "@/components/primitives/foundation";`;
      }
      return '';
    });

    // Replace JSX
    content = content.replace(/<Card(\s|>)/g, '<Surface variant="primary" radius="lg" border shadow="sm"$1');
    content = content.replace(/<\/Card>/g, '</Surface>');

    content = content.replace(/<CardHeader(\s|>)/g, '<Stack gap="sm" className="p-6"$1');
    content = content.replace(/<\/CardHeader>/g, '</Stack>');

    content = content.replace(/<CardTitle(\s|>)/g, '<Text as="h3" variant="h3" className="leading-none"$1');
    content = content.replace(/<\/CardTitle>/g, '</Text>');

    content = content.replace(/<CardDescription(\s|>)/g, '<Text as="p" variant="caption" color="muted"$1');
    content = content.replace(/<\/CardDescription>/g, '</Text>');

    content = content.replace(/<CardContent(\s|>)/g, '<div className="p-6 pt-0"$1');
    content = content.replace(/<\/CardContent>/g, '</div>');

    content = content.replace(/<CardFooter(\s|>)/g, '<Cluster className="p-6 pt-0"$1');
    content = content.replace(/<\/CardFooter>/g, '</Cluster>');

    changed = true;
  }

  // Handle Button? No, Button was not deprecated, wait, was it?
  // Let's just trust the 5 deprecated ones for now.

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});
console.log(`Updated ${changedFiles} files.`);

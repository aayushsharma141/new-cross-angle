const fs = require('fs');
const path = require('path');

const dir = 'src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const f of files) {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove <AdminPageHeader ... />
  content = content.replace(/<AdminPageHeader[^>]*\/>\r?\n?/g, '');
  
  // 2. Remove AdminPageHeader from imports from "@/components/admin/shared"
  // E.g. import { AdminPageHeader, AdminMetricsPanel } from "@/components/admin/shared";
  // Becomes import { AdminMetricsPanel } from "@/components/admin/shared";
  
  content = content.replace(/import\s+{\s*([^}]*)\s*}\s+from\s+['"]@\/components\/admin\/shared(\/AdminPageHeader)?['"];?/g, (match, importsStr) => {
    // If it's a direct import of AdminPageHeader, just remove the whole line
    if (match.includes('/AdminPageHeader')) return '';
    
    const imports = importsStr.split(',').map(s => s.trim()).filter(s => s && s !== 'AdminPageHeader');
    if (imports.length === 0) return '';
    return `import { ${imports.join(', ')} } from "@/components/admin/shared";`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + f);
  }
}

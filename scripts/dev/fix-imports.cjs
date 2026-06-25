const fs = require('fs');
const files = [
  'apps/web/src/addons/discovery/pages/BlueprintPage.tsx',
  'apps/web/src/components/admin/analytics/LeadsTab.tsx',
  'apps/web/src/components/admin/CommandPalette.tsx',
  'apps/web/src/components/admin/discovery-flow/ArchetypesEditor.tsx',
  'apps/web/src/components/admin/leads/LeadCard.tsx',
  'apps/web/src/components/admin/leads/LeadDetailSheet.tsx',
  'apps/web/src/components/admin/logs/AuditLogTable.tsx',
  'apps/web/src/components/admin/MediaPickerModal.tsx',
  'apps/web/src/pages/admin/AdminAuth.tsx',
  'apps/web/src/pages/admin/AdminMedia.tsx',
  'apps/web/src/pages/admin/CrmAnalytics.tsx',
  'apps/web/src/pages/BlogDetailPage.tsx',
  'apps/web/src/pages/BlogPage.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add ChevronRight if missing
  if (content.includes('ChevronRight') && !/import[^]*ChevronRight[^]*from.*lucide-react/.test(content)) {
    if (content.includes('from "lucide-react"') || content.includes("from 'lucide-react'")) {
      content = content.replace(/(import\s*\{[^}]*)(\}\s*from\s*['"]lucide-react['"])/, '$1, ChevronRight $2');
    } else {
      content = 'import { ChevronRight } from "lucide-react";\n' + content;
    }
    changed = true;
  }

  // Add useQueryClient if missing
  if (content.includes('useQueryClient') && !/import[^]*useQueryClient[^]*from.*@tanstack\/react-query/.test(content)) {
    if (content.includes('from "@tanstack/react-query"') || content.includes("from '@tanstack/react-query'")) {
      content = content.replace(/(import\s*\{[^}]*)(\}\s*from\s*['"]@tanstack\/react-query['"])/, '$1, useQueryClient $2');
    } else {
      content = 'import { useQueryClient } from "@tanstack/react-query";\n' + content;
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed imports in', file);
  }
}

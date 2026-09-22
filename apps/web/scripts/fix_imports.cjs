const fs = require('fs');
const files = [
  'src/pages/ProjectPage.tsx',
  'src/pages/BlogPage.tsx',
  'src/pages/BlogDetailPage.tsx',
  'src/pages/admin/AdminMedia.tsx',
  'src/pages/admin/AdminAuth.tsx',
  'src/components/admin/shared/AdminPageHeader.tsx',
  'src/components/admin/media/FolderBreadcrumbs.tsx',
  'src/components/admin/media/SidebarTreeView.tsx',
  'src/components/admin/leads/LeadCard.tsx',
  'src/components/admin/discovery-flow/ArchetypesEditor.tsx',
  'src/components/admin/estimator-flow/LocationsEditor.tsx',
  'src/components/ui/primitives/dropdown-menu.tsx',
  'src/components/ui/primitives/calendar.tsx',
  'src/components/ui/primitives/breadcrumb.tsx',
  'src/components/services/ServicesHero.tsx',
  'src/components/shared/SiteBreadcrumb.tsx',
  'src/components/admin/CommandPalette.tsx',
  'src/components/admin/analytics/LeadsTab.tsx',
  'src/components/gallery/GalleryLightbox.tsx',
  'src/components/home/Testimonials.tsx',
  'src/components/home/BeforeAfterShowcase.tsx',
  'src/addons/discovery/pages/BlueprintPage.tsx'
];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf-8');
  if (c.includes('<ChevronRight') && !c.match(/import.*ChevronRight.*from\s+['"]lucide-react['"]/s)) {
    if (c.includes('lucide-react')) {
      c = c.replace(/import\s+\{([^}]*)\}\s+from\s+['"]lucide-react['"]/, (m, p1) => {
        return `import {${p1}, ChevronRight } from 'lucide-react'`;
      });
    } else {
      c = `import { ChevronRight } from 'lucide-react';\n` + c;
    }
    fs.writeFileSync(f, c);
    console.log('Fixed ChevronRight in', f);
  }
});

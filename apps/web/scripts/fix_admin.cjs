const fs = require('fs');
const files = ['AdminMedia.tsx', 'AdminMediaOld.tsx', 'AdminGallery.tsx', 'AdminSiteAssets.tsx'];
files.forEach(f => { 
  let c = fs.readFileSync('src/pages/admin/'+f, 'utf8'); 
  
  // This matches a multiline AdminPageHeader that has actions={ ... } and captures the inside of the actions tag.
  // It relies on balanced braces. We'll do a simple replace that assumes the actions block ends with `}` followed by `/>` eventually.
  
  c = c.replace(/<AdminPageHeader[\s\S]*?actions=\{([\s\S]*?)\}[\s\S]*?\/>/g, '<ModuleActions>$1</ModuleActions>');
  
  fs.writeFileSync('src/pages/admin/'+f, c); 
});

const fs = require('fs');
const path = require('path');

// Fix 'React' is not defined
const filesWithReactError = [
  "src/components/admin/AdminRouteErrorBoundary.tsx",
  "src/components/admin/ConfirmDialog.tsx",
  "src/components/admin/RoleGuard.tsx",
  "src/components/admin/blogs/BlogEditorForm.tsx",
  "src/components/admin/blogs/RichTextEditor.tsx",
  "src/components/admin/media/FolderGrid.tsx",
  "src/components/admin/media/MediaGrid.tsx",
  "src/components/admin/media/MediaPicker.tsx",
  "src/components/admin/portfolio/PortfolioFormDialog.tsx",
  "src/components/admin/shared/AdminFormCard.tsx",
  "src/components/admin/users/SecurityTab.tsx",
  "src/pages/admin/AdminGallery.tsx",
  "src/pages/admin/AdminMedia.tsx",
  "src/pages/admin/AdminMilestones.tsx",
  "src/pages/admin/AdminProcessSteps.tsx",
  "src/pages/admin/AdminServices.tsx",
  "src/pages/admin/AdminStats.tsx",
  "src/pages/admin/AdminTeam.tsx",
  "src/pages/admin/AdminTeamMembers.tsx",
  "src/pages/admin/AdminUserAccessSecurity.tsx",
  "src/pages/admin/CrmAnalytics.tsx"
];

for (const f of filesWithReactError) {
  const fullPath = path.join(__dirname, f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    if (!content.includes("import React") && !content.includes("import * as React")) {
      fs.writeFileSync(fullPath, "import React from 'react';\n" + content);
      console.log(`Added React import to ${f}`);
    }
  }
}

// Fix JSX is not defined in AdminLayout.tsx
const adminLayoutPath = path.join(__dirname, "src/pages/admin/AdminLayout.tsx");
if (fs.existsSync(adminLayoutPath)) {
  let content = fs.readFileSync(adminLayoutPath, 'utf-8');
  if (!content.includes("JSX")) {
    if (content.includes("import { ReactNode } from \"react\";")) {
       content = content.replace("import { ReactNode } from \"react\";", "import { ReactNode, JSX } from \"react\";");
       fs.writeFileSync(adminLayoutPath, content);
       console.log("Added JSX to AdminLayout.tsx");
    }
  }
}

// Fix MediaPickerModal.tsx
const mediaPickerModalPath = path.join(__dirname, "src/components/admin/MediaPickerModal.tsx");
if (fs.existsSync(mediaPickerModalPath)) {
  let content = fs.readFileSync(mediaPickerModalPath, 'utf-8');
  if (!content.includes("useQuery, useMutation")) {
    content = content.replace(
      'import { useQueryClient } from "@tanstack/react-query";',
      'import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";'
    );
    fs.writeFileSync(mediaPickerModalPath, content);
    console.log("Added useQuery to MediaPickerModal.tsx");
  }
}

// Fix AdminBeforeAndAfter.tsx
const transformationsPath = path.join(__dirname, "src/pages/admin/AdminBeforeAndAfter.tsx");
if (fs.existsSync(transformationsPath)) {
  let content = fs.readFileSync(transformationsPath, 'utf-8');
  if (!content.includes("AdminFilterBar")) {
    content = content.replace(
      'import { AdminPageHeader, AdminSafeAction } from "@/components/admin/shared";',
      'import { AdminPageHeader, AdminSafeAction, AdminFilterBar } from "@/components/admin/shared";'
    );
    fs.writeFileSync(transformationsPath, content);
    console.log("Added AdminFilterBar to AdminTransformations.tsx");
  }
}

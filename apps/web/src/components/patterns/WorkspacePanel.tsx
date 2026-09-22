import React from 'react';
import { Grid } from '../primitives/foundation';

export const patternMeta = {
  genomeIds: ["P004", "P005"],
  intents: ["Workspace", "Dashboard", "Application"],
  reusable: true,
};

export interface WorkspacePanelProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  dossierContent?: React.ReactNode;
}

export function WorkspacePanel({ sidebar, mainContent, dossierContent }: WorkspacePanelProps) {
  return (
    <div className="h-screen flex w-full bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)] border border-[var(--s-border-subtle)]" data-environment="workspace">
      <Grid cols={12} gap="none" className="w-full h-full relative">
        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-3 p-0 h-full border-r border-[var(--s-border-subtle)] bg-[var(--s-surface-raised)] overflow-y-auto relative z-20">
          {sidebar}
        </div>
        
        {/* Main Workspace */}
        <div className={dossierContent ? "col-span-12 lg:col-span-6 h-full overflow-y-auto relative z-10 bg-[var(--s-canvas-primary)]" : "col-span-12 lg:col-span-9 h-full overflow-y-auto relative z-10 bg-[var(--s-canvas-primary)]"}>
          {mainContent}
        </div>

        {/* Dossier Card (Right Panel) */}
        {dossierContent && (
          <div className="hidden lg:block lg:col-span-3 p-0 h-full border-l border-[var(--s-border-subtle)] bg-[var(--s-surface-raised)] overflow-y-auto relative z-20">
            {dossierContent}
          </div>
        )}
      </Grid>
    </div>
  );
}

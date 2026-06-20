import React from "react";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import type { MediaFolder } from "@/services/MediaService";

interface SidebarTreeViewProps {
  folders: MediaFolder[];
  currentFolderId: string | null;
  onSelect: (folder: MediaFolder | null) => void;
}

export function SidebarTreeView({ folders, currentFolderId, onSelect }: SidebarTreeViewProps) {
  // Build a tree from flat folders
  const rootFolders = folders.filter((f) => !f.parentId);
  const getChildren = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  const FolderNode = ({ folder, level = 0 }: { folder: MediaFolder; level?: number }) => {
    const children = getChildren(folder.id);
    const [expanded, setExpanded] = React.useState(true);
    const isSelected = currentFolderId === folder.id;

    return (
      <div className="w-full">
        <div
          role="button"
          tabIndex={0}
          className={`flex items-center group cursor-pointer px-2 py-1.5 rounded-md text-sm transition-colors ${
            isSelected ? "bg-admin-primary/10 text-admin-primary font-medium" : "text-admin-text hover:bg-admin-surface"
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => onSelect(folder)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(folder); } }}
        >
          <div
            role="button"
            tabIndex={0}
            className="w-4 h-4 mr-1 flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); } }}
          >
            {children.length > 0 ? (
              expanded ? (
                <ChevronDown className="w-3 h-3 text-admin-text-subtle group-hover:text-admin-text" />
              ) : (
                <ChevronRight className="w-3 h-3 text-admin-text-subtle group-hover:text-admin-text" />
              )
            ) : (
              <span className="w-3 h-3" /> // spacer
            )}
          </div>
          <Folder className={`w-4 h-4 mr-2 ${isSelected ? "text-admin-primary" : "text-admin-text-subtle"}`} />
          <span className="truncate">{folder.name}</span>
        </div>
        {expanded && children.length > 0 && (
          <div className="mt-0.5 space-y-0.5">
            {children.map((child) => (
              <FolderNode key={child.id} folder={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 shrink-0 border-r border-admin-border bg-admin-card overflow-y-auto h-[calc(100vh-12rem)] flex flex-col p-4 rounded-xl shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-admin-text-subtle mb-4">
        Folders
      </div>
      <div
        role="button"
        tabIndex={0}
        className={`flex items-center cursor-pointer px-2 py-1.5 rounded-md text-sm transition-colors mb-2 ${
          currentFolderId === null ? "bg-admin-primary/10 text-admin-primary font-medium" : "text-admin-text hover:bg-admin-surface"
        }`}
        onClick={() => onSelect(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(null); } }}
      >
        <div className="w-4 h-4 mr-1" />
        <Folder className={`w-4 h-4 mr-2 ${currentFolderId === null ? "text-admin-primary" : "text-admin-text-subtle"}`} />
        <span>Root</span>
      </div>
      <div className="space-y-0.5">
        {rootFolders.map((folder) => (
          <FolderNode key={folder.id} folder={folder} />
        ))}
      </div>
    </div>
  );
}

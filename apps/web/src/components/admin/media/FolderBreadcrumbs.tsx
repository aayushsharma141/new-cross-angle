import { ChevronRight, Home } from "lucide-react";
import type { MediaFolder } from "@/services/MediaService";

interface FolderBreadcrumbsProps {
  currentFolder: MediaFolder | null;
  folderPath: MediaFolder[];
  onNavigate: (folder: MediaFolder | null) => void;
}

export const FolderBreadcrumbs = ({
  currentFolder,
  folderPath,
  onNavigate,
}: FolderBreadcrumbsProps) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-admin-text-subtle">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center hover:text-admin-primary transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Root
      </button>

      {folderPath.map((folder) => (
        <div key={folder.id} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-admin-border" />
          <button
            onClick={() => onNavigate(folder)}
            className={`hover:text-admin-primary transition-colors ${
              currentFolder?.id === folder.id ? "text-admin-text font-medium" : ""
            }`}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </div>
  );
};

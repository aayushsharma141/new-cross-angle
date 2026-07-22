import React from 'react';
import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import { Folder, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Surface } from "@/components/primitives/foundation";
import { Button } from "@/components/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import type { MediaFolder } from "@/services/MediaService";

interface FolderGridProps {
  folders: MediaFolder[];
  onNavigate: (folder: MediaFolder) => void;
  onRename: (folder: MediaFolder) => void;
  onDelete: (folder: MediaFolder) => void;
  isReadOnly?: boolean;
  children?: React.ReactNode;
}

interface FolderItemProps {
  folder: MediaFolder;
  onNavigate: (folder: MediaFolder) => void;
  onRename: (folder: MediaFolder) => void;
  onDelete: (folder: MediaFolder) => void;
  isReadOnly?: boolean;
}

const FolderItem = ({ folder, onNavigate, onRename, onDelete, isReadOnly }: FolderItemProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: "folder", folderId: folder.id }
  });

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Surface variant="primary" radius="lg" border shadow="sm"
        role="button"
        tabIndex={0}
        className={`group overflow-hidden relative cursor-pointer hover:shadow-lg border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md transition-all h-full ${isOver ? 'border-admin-primary bg-admin-primary/20 ring-2 ring-admin-primary' : 'hover:border-admin-primary/50 hover:bg-admin-card'}`}
        onClick={() => onNavigate(folder)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(folder); } }}
      >
        <div className="p-6 pt-0" className="p-6 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[140px]">
          <Folder 
            className={`w-14 h-14 shrink-0 transition-transform duration-300 ${isOver ? 'text-white scale-110' : 'text-admin-primary group-hover:scale-110'}`} 
            fill="currentColor" 
            fillOpacity={0.2} 
          />
          <span className="font-medium text-sm truncate w-full px-2">{folder.name}</span>
          
          {!isReadOnly && (
            <div role="button" tabIndex={-1} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none" aria-label="Folder actions">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRename(folder)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(folder)} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </Surface>
    </motion.div>
  );
};

export const FolderGrid = ({
  folders,
  onNavigate,
  onRename,
  onDelete,
  isReadOnly = false,
  children
}: FolderGridProps) => {
  if (folders.length === 0 && !children) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
      {children}
      {folders.map((folder) => (
        <FolderItem 
          key={folder.id} 
          folder={folder} 
          onNavigate={onNavigate} 
          onRename={onRename} 
          onDelete={onDelete} 
          isReadOnly={isReadOnly} 
        />
      ))}
    </div>
  );
};

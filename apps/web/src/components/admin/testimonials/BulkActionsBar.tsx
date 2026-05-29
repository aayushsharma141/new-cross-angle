import { Eye, EyeOff, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";

interface BulkActionsBarProps {
  count: number;
  canWrite: boolean;
  onClear: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

export const BulkActionsBar = ({ count, canWrite, onClear, onActivate, onDeactivate, onDelete }: BulkActionsBarProps) => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
    <div className="bg-[hsl(var(--admin-background))]/95 border border-[hsl(var(--admin-border))] backdrop-blur-md rounded-full shadow-2xl px-6 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 border-r border-[hsl(var(--admin-border))] pr-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]" onClick={onClear}><X className="w-4 h-4" /></Button>
        <span className="text-[hsl(var(--admin-text))] font-medium text-sm">{count} selected</span>
      </div>
      {canWrite && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8" onClick={onActivate}><Eye className="w-4 h-4 mr-1.5" /> Activate</Button>
          <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8" onClick={onDeactivate}><EyeOff className="w-4 h-4 mr-1.5" /> Deactivate</Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1.5" /> Delete</Button>
        </div>
      )}
    </div>
  </div>
);

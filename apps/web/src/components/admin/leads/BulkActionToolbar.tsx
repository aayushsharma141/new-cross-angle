import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/primitives/button";
import { useToast } from "@/hooks/useToast";
import {
  MoreVertical,
  ChevronDown,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import type { Lead } from "@/lib/scoring/leadScoring";
import { CRM_STAGES, type CrmStageId } from "@/lib/crm/stages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";

interface BulkActionToolbarProps {
  selectedLeads: Lead[];
  isLoading?: boolean;
  onActionsComplete?: () => void;
}

export function BulkActionToolbar({ selectedLeads, isLoading = false, onActionsComplete }: BulkActionToolbarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Database update with dynamic fields based on bulk action type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ leadIds, updates }: { leadIds: string[]; updates: any }) => {
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .in("id", leadIds);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: "Updated",
        description: `${selectedLeads.length} lead(s) updated successfully.`,
      });
      onActionsComplete?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (leadIds: string[]) => {
      const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", leadIds);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: "Deleted",
        description: `${selectedLeads.length} lead(s) deleted.`,
      });
      onActionsComplete?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (selectedLeads.length === 0) return null;

  const leadIds = selectedLeads.map((l) => l.id);
  const isBusy = isLoading || bulkUpdateMutation.isPending || bulkDeleteMutation.isPending;

  const handleStageChange = (stage: CrmStageId) => {
    bulkUpdateMutation.mutate({
      leadIds,
      updates: { status: stage },
    });
  };

  const handleDelete = () => {
    if (confirm(`Delete ${selectedLeads.length} lead(s)? This cannot be undone.`)) {
      bulkDeleteMutation.mutate(leadIds);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-xs">
      <span className="font-semibold text-[hsl(var(--admin-text))]">
        {selectedLeads.length} selected
      </span>

      <div className="h-4 w-px bg-[hsl(var(--admin-border))]" />

      {/* Move to Stage */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isBusy}
            className="text-xs"
          >
            Move to <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuLabel>Change Stage</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {CRM_STAGES.map((stageObj) => (
            <DropdownMenuItem
              key={stageObj.id}
              onClick={() => handleStageChange(stageObj.id)}
              disabled={isBusy}
            >
              <div className="flex items-center gap-2 text-xs w-full">
                {stageObj.id === "won" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                {stageObj.id === "lost" && <XCircle className="w-3 h-3 text-red-500" />}
                {!["won", "lost"].includes(stageObj.id) && <Clock className="w-3 h-3 text-amber-500" />}
                <span>{stageObj.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isBusy}
          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          {bulkDeleteMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
          Delete
        </Button>

        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isBusy}>
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs opacity-50">
              Send Email (coming soon)
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs opacity-50">
              Add Tags (coming soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

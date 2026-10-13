import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";

/** Shown instead of an editor whose saved config couldn't be read, so defaults are never saved over it. */
export function ConfigLoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-[hsl(var(--admin-danger))]/30 bg-[hsl(var(--admin-danger))]/5 px-6 py-10 text-center">
      <AlertTriangle className="h-5 w-5 text-[hsl(var(--admin-danger))]" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-[hsl(var(--admin-text))]">Couldn't load the saved {what}</p>
        <p className="mt-1 text-xs text-[hsl(var(--admin-text-muted))]">
          Editing is paused so the live settings aren't overwritten with defaults.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="h-8 gap-1.5 text-xs">
        <RotateCcw className="h-3.5 w-3.5" /> Try again
      </Button>
    </div>
  );
}

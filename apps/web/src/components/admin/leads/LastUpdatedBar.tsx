/**
 * LastUpdatedBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows "Last updated X ago" with a live-ticking relative time.
 * When hasPendingUpdate is true, shows a pulsing amber banner
 * with a "Refresh" button.
 */

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Wifi, WifiOff, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LastUpdatedBarProps {
  lastUpdated: string;
  hasPendingUpdate: boolean;
  isConnected: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function LastUpdatedBar({
  lastUpdated,
  hasPendingUpdate,
  isConnected,
  onRefresh,
  isRefreshing = false,
}: LastUpdatedBarProps) {
  const [relative, setRelative] = useState(() =>
    formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
  );

  // Tick every 15 seconds to keep the relative time fresh
  useEffect(() => {
    const tick = () =>
      setRelative(formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-[10px] transition-all",
        hasPendingUpdate
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-transparent border-transparent text-muted-foreground/60"
      )}
    >
      {/* Left: connection + last updated */}
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <Wifi className="h-3 w-3 text-emerald-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-zinc-600" />
        )}

        {hasPendingUpdate ? (
          <span className="flex items-center gap-1 font-medium">
            <Zap className="h-3 w-3" />
            Pipeline updated — click to refresh
          </span>
        ) : (
          <span>Last updated {relative}</span>
        )}
      </div>

      {/* Right: Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all",
          hasPendingUpdate
            ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
            : "hover:bg-muted/50 text-muted-foreground/60 hover:text-foreground"
        )}
        title="Refresh leads"
      >
        <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
        Refresh
      </button>
    </div>
  );
}

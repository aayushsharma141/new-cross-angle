import React from "react";
import { cn } from "../../../lib/utils";

interface InlineHelpProps {
  text: string;
  className?: string;
}

export function InlineHelp({ text, className }: InlineHelpProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-admin-border/50 text-[9px] text-admin-muted opacity-70 group-hover:opacity-100 transition-opacity cursor-help",
        className
      )}
      title={text}
      aria-label="Help"
    >
      ?
    </span>
  );
}

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export interface AdminSafeActionProps {
  icon?: React.ElementType;
  label: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  danger?: boolean;
}

type ActionState = "idle" | "confirming" | "loading" | "error";

export function AdminSafeAction({
  icon: Icon,
  label,
  confirmLabel = "Confirm?",
  onConfirm,
  danger = true
}: AdminSafeActionProps) {
  const [state, setState] = useState<ActionState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirm = async () => {
    setState("loading");
    setErrorMsg(null);
    try {
      await onConfirm();
      // On success, the parent usually removes the component from the DOM.
      // If not, we could transition to a success state or back to idle.
      setState("idle");
    } catch (error: any) {
      console.error("Action failed:", error);
      setState("idle");
      setErrorMsg(error?.message || "Action failed. Please try again.");
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setErrorMsg((prev) => prev ? null : null);
      }, 5000);
    }
  };

  const handleCancel = () => {
    setState("idle");
    setErrorMsg(null);
  };

  const baseHoverClass = danger 
    ? "hover:text-[hsl(var(--admin-danger))] hover:bg-[hsl(var(--admin-danger)/0.1)] hover:border-[hsl(var(--admin-danger)/0.3)]"
    : "hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] hover:border-[hsl(var(--admin-border-subtle))]";

  const confirmBg = danger ? "bg-[hsl(var(--admin-danger)/0.1)]" : "bg-[hsl(var(--admin-surface))]";
  const confirmBorder = danger ? "border-[hsl(var(--admin-danger)/0.3)]" : "border-[hsl(var(--admin-border))]";
  const confirmText = danger ? "text-[hsl(var(--admin-danger))]" : "text-[hsl(var(--admin-text))]";

  return (
    <div className="relative inline-flex flex-col items-end">
      {state === "confirming" || state === "loading" ? (
        <div className="flex items-center gap-[6px]">
          <span className={`text-[11px] font-medium whitespace-nowrap ${confirmText}`}>
            {confirmLabel}
          </span>
          <button
            onClick={handleConfirm}
            disabled={state === "loading"}
            className={`
              px-3 py-2 rounded-[7px] text-[12px] font-semibold cursor-pointer font-inherit flex items-center justify-center gap-2
              ${confirmBg} border ${confirmBorder} ${confirmText}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {state === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
          </button>
          <button
            onClick={handleCancel}
            disabled={state === "loading"}
            className="px-2.5 py-2 rounded-[7px] text-[12px] cursor-pointer font-inherit bg-transparent border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setState("confirming")}
          className={`
            px-2.5 py-2 rounded-[7px] text-[12px] font-normal cursor-pointer font-inherit transition-all duration-150 flex items-center gap-1
            bg-transparent border border-transparent text-[hsl(var(--admin-text-muted))]
            ${baseHoverClass}
          `}
        >
          {Icon && <Icon className="w-[13px] h-[13px]" aria-hidden="true" />}
          {label}
        </button>
      )}

      {/* Inline Error Message */}
      {errorMsg && state === "idle" && (
        <div className="absolute top-full mt-1 right-0 text-[10px] text-[hsl(var(--admin-danger))] whitespace-nowrap animate-fade-in">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

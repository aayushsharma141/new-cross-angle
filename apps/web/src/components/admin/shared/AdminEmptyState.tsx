import React from "react";
import { type LucideIcon } from "lucide-react";

export interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action
}: AdminEmptyStateProps) {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-[hsl(var(--admin-border))] rounded-xl bg-[hsl(var(--admin-surface)/0.3)]">
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[hsl(var(--admin-text-muted))]" />
      </div>
      <h3 className="text-[15px] font-semibold text-[hsl(var(--admin-text))] mb-1">
        {title}
      </h3>
      <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mb-5 max-w-sm text-center">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[hsl(var(--admin-border))] rounded-lg text-[13px] font-medium text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface))] hover:text-[hsl(var(--admin-accent))] hover:border-[hsl(var(--admin-border-subtle))] transition-all duration-150"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

// Plus the add card from Integrations mockup
export function AdminAddCard({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-5 bg-transparent border-[1.5px] border-dashed border-[hsl(var(--admin-border))] rounded-xl text-[hsl(var(--admin-text-muted))] cursor-pointer flex items-center justify-center gap-2 text-[13px] font-inherit transition-all duration-200 hover:border-[hsl(var(--admin-success)/0.25)] hover:text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-success)/0.12)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      {label}
    </button>
  );
}

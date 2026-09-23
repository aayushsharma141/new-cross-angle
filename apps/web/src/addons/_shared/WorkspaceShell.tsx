import React from "react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import defaultLogo from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";

/**
 * The shared shell for the two tool entry points (/estimate and
 * /aesthetic-discovery-engine).
 *
 * These tools deliberately sit in a light "workspace" room rather than on the
 * dark site canvas: they are focused, form-heavy, and read better on paper.
 * The site runs under `.dark`, so the semantic token layer resolves dark here —
 * hence this scoped light palette, declared once so both doors match instead of
 * each hardcoding its own hex values.
 */

export const WORKSPACE_VARS = {
  "--ws-canvas": "#FAF8F5",
  "--ws-paper": "#FFFFFF",
  "--ws-ink": "#1A1A1A",
  "--ws-muted": "#5A5A5A",
  "--ws-faint": "#8A857E",
  "--ws-line": "rgba(26,26,26,0.12)",
  "--ws-bronze": "#7A5C30",
  "--ws-gold": "#C9A96E",
  "--ws-deep": "#233526",
} as const;

/* Shared type + control classes so both doors are literally the same styles. */
export const wsEyebrow = "inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ws-bronze)]";
export const wsRule = "block h-px w-8 bg-[var(--ws-bronze)]/50";
export const wsDisplay = "font-display font-normal tracking-[-0.02em] text-[var(--ws-ink)] [text-wrap:balance]";
export const wsBody = "text-[15px] md:text-base font-light leading-relaxed text-[var(--ws-muted)]";
export const wsMeta = "text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--ws-faint)]";

/** Filled primary action — deep green, the one obvious next step. */
export const wsPrimaryCta =
  "group inline-flex items-center justify-center gap-3 rounded-full bg-[var(--ws-deep)] px-9 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-[#1a281c] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ws-bronze)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ws-canvas)] motion-reduce:transition-none";

/** Outline secondary action — equal weight typographically, quieter in colour. */
export const wsSecondaryCta =
  "group inline-flex items-center justify-center gap-3 rounded-full border border-[var(--ws-line)] bg-[var(--ws-paper)]/70 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ws-ink)] transition-colors duration-500 hover:border-[var(--ws-bronze)] hover:text-[var(--ws-bronze)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ws-bronze)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ws-canvas)] motion-reduce:transition-none";

/** Quiet text link with a hairline underline. */
export const wsTextLink =
  "inline-flex items-center gap-2 border-b border-[var(--ws-line)] pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ws-muted)] transition-colors duration-300 hover:border-[var(--ws-bronze)] hover:text-[var(--ws-bronze)] focus-visible:outline-none focus-visible:text-[var(--ws-bronze)]";

export const wsArrow = (
  <span aria-hidden="true" className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 motion-reduce:transition-none">→</span>
);

interface WorkspaceShellProps {
  children: React.ReactNode;
  /** Right-hand slot in the header (e.g. the language toggle). */
  headerAside?: React.ReactNode;
  className?: string;
}

export const WorkspaceShell = ({ children, headerAside, className }: WorkspaceShellProps) => {
  const { settings } = useSiteSettings();
  const logoUrl = settings?.company_logo_url || settings?.logo_light_url || defaultLogo;
  const studioName = settings?.studio_name || "Crossangle Interior";

  return (
    <div
      data-environment="workspace"
      style={WORKSPACE_VARS as React.CSSProperties}
      className={cn(
        "relative min-h-[100dvh] w-full overflow-x-hidden bg-[var(--ws-canvas)] text-[var(--ws-ink)] selection:bg-[var(--ws-gold)]/25",
        className,
      )}
    >
      <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-6 px-6 py-6 md:px-10">
        <Link
          to="/"
          aria-label={`${studioName} — back to the site`}
          className="group flex min-w-0 shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ws-bronze)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ws-canvas)]"
        >
          <img src={logoUrl} alt="" className="h-9 w-auto shrink-0 md:h-10" />
          <span className="hidden font-display text-[1.05rem] font-semibold leading-none tracking-[0.18em] text-[var(--ws-ink)] sm:flex items-baseline gap-2 whitespace-nowrap">
            CROSSANGLE <span className="text-[var(--ws-bronze)]">INTERIOR</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-6">
          {headerAside}
          <Link to="/" className={cn(wsTextLink, "hidden md:inline-flex")}>
            Back to site
          </Link>
        </div>
      </header>

      {children}
    </div>
  );
};

export default WorkspaceShell;

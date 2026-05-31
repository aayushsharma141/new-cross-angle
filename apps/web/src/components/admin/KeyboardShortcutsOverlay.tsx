import React, { Fragment, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/primitives/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
    keys: string[];
    label: string;
}

const SHORTCUT_GROUPS: { heading: string; items: Shortcut[] }[] = [
    {
        heading: "Navigation",
        items: [
            { keys: ["Ctrl", "K"], label: "Open command palette" },
            { keys: ["Cmd", "K"], label: "Open command palette (macOS)" },
            { keys: ["?"], label: "Show this shortcuts overlay" },
        ],
    },
    {
        heading: "Dialogs & panels",
        items: [
            { keys: ["Esc"], label: "Close open dialog or overlay" },
            { keys: ["Tab"], label: "Move focus forward (wraps inside dialogs)" },
            { keys: ["Shift", "Tab"], label: "Move focus backward" },
        ],
    },
    {
        heading: "Lists & tables",
        items: [
            { keys: ["↑"], label: "Previous row / item" },
            { keys: ["↓"], label: "Next row / item" },
            { keys: ["↵"], label: "Open selected row" },
        ],
    },
];

interface KeyboardShortcutsOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Discoverability overlay for keyboard shortcuts. Toggle with `?` anywhere
 * inside the admin panel (bound in `AdminLayout`). Uses Radix Dialog so it
 * gets focus trap, Escape-to-close, and aria-modal for free.
 */
export function KeyboardShortcutsOverlay({ open, onOpenChange }: KeyboardShortcutsOverlayProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-admin-card border-admin-border text-admin-text">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-admin-text">
                        <Keyboard className="h-5 w-5 text-admin-primary" />
                        Keyboard shortcuts
                    </DialogTitle>
                    <DialogDescription className="text-admin-muted">
                        Every admin view responds to these. Press Esc to close.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {SHORTCUT_GROUPS.map((group) => (
                        <section key={group.heading} aria-labelledby={`kbd-group-${group.heading}`}>
                            <h3
                                id={`kbd-group-${group.heading}`}
                                className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-admin-muted"
                            >
                                {group.heading}
                            </h3>
                            <ul className="space-y-1.5">
                                {group.items.map((item) => (
                                    <li
                                        key={`${group.heading}-${item.label}`}
                                        className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 hover:bg-admin-surface/40"
                                    >
                                        <span className="text-sm text-admin-text">{item.label}</span>
                                        <span className="flex items-center gap-1">
                                            {item.keys.map((k, i) => (
                                                <Fragment key={`${item.label}-${k}-${i}`}>
                                                    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-admin-border bg-admin-surface px-1.5 font-mono text-[11px] font-medium text-admin-text shadow-sm">
                                                        {k}
                                                    </kbd>
                                                    {i < item.keys.length - 1 && (
                                                        <span className="text-xs text-admin-muted">+</span>
                                                    )}
                                                </Fragment>
                                            ))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook that binds the `?` key to toggle the shortcuts overlay.
 * Respects input focus — typing `?` into a text field won't open the overlay.
 */
export function useKeyboardShortcutsHelp(onToggle: () => void) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key !== "?") return;
            // Don't hijack `?` when the user is typing into an input/textarea/contenteditable.
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const tag = target.tagName;
            if (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT" ||
                target.isContentEditable
            ) {
                return;
            }
            e.preventDefault();
            onToggle();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onToggle]);
}

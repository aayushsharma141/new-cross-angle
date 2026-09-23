import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/primitives/dialog";

const KEYBOARD_SHORTCUTS = [
  {
    category: "Navigation",
    shortcuts: [
      { key: "Tab", description: "Move focus to next interactive element" },
      { key: "Shift + Tab", description: "Move focus to previous element" },
      { key: "Enter", description: "Activate focused button or open dialog" },
      { key: "Esc", description: "Close open dialogs or menus" },
    ],
  },
  {
    category: "Forms",
    shortcuts: [
      { key: "Enter", description: "Submit form (in text input)" },
      { key: "Esc", description: "Cancel and close form" },
    ],
  },
  {
    category: "Lists & Tables",
    shortcuts: [
      { key: "Click checkbox", description: "Select individual item" },
      { key: "Shift + Click", description: "Select range of items" },
      { key: "Drag item", description: "Reorder items (where available)" },
    ],
  },
];

export function KeyboardShortcutsGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Show keyboard shortcuts help">
          <HelpCircle className="h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--admin-text))]">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {KEYBOARD_SHORTCUTS.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-[hsl(var(--admin-text))] mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--admin-text-muted))]">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded text-xs font-mono text-[hsl(var(--admin-text))]">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


import { useEffect } from "react";

interface ShortcutOptions {
    ctrl?: boolean; // Treat Ctrl or Meta (Command) as the modifier
    shift?: boolean;
    alt?: boolean;
}

export function useKeyboardShortcut(
    key: string,
    callback: (e: KeyboardEvent) => void,
    options: ShortcutOptions = {}
) {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const { key: pressedKey, ctrlKey, metaKey, shiftKey, altKey } = event;

            // Ignore input fields unless it's a save action (Ctrl+S) or explicitly desired?
            // For now, allow global interception for admin shortcuts as requested.
            if (pressedKey.toLowerCase() !== key.toLowerCase()) return;

            const needsCtrl = !!options.ctrl;
            const needsShift = !!options.shift;
            const needsAlt = !!options.alt;

            const isCtrlPressed = ctrlKey || metaKey; // Treat Cmd as Ctrl

            if (needsCtrl !== isCtrlPressed) return;
            if (needsShift !== shiftKey) return;
            if (needsAlt !== altKey) return;

            event.preventDefault();
            callback(event);
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [key, callback, options]);
}

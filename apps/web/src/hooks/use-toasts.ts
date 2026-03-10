import { toast as sonnerToast, type ExternalToast } from "sonner";
import type { ReactNode } from "react";

export type ToastInput = string | {
    text: string | ReactNode;
    preserve?: boolean;
    action?: string;
    onUndoAction?: () => void;
};

function handleToast(
    input: ToastInput,
    type: "default" | "success" | "warning" | "error" = "default"
) {
    const isString = typeof input === "string";
    const text = isString ? input : input.text;
    const preserve = isString ? false : input.preserve;
    const actionLabel = isString ? undefined : input.action;
    const onUndoAction = isString ? undefined : input.onUndoAction;

    const options: ExternalToast = {
        duration: preserve ? 10000000 : 4000,
    };

    if (actionLabel || onUndoAction) {
        options.action = {
            label: actionLabel || "Undo",
            onClick: onUndoAction || (() => { }),
        };
    }

    switch (type) {
        case "success":
            sonnerToast.success(text, options);
            break;
        case "warning":
            sonnerToast.warning(text, options);
            break;
        case "error":
            sonnerToast.error(text, options);
            break;
        case "default":
        default:
            sonnerToast(text, options);
            break;
    }
}

export function useToasts() {
    return {
        message: (input: ToastInput) => handleToast(input, "default"),
        success: (input: ToastInput) => handleToast(input, "success"),
        warning: (input: ToastInput) => handleToast(input, "warning"),
        error: (input: ToastInput) => handleToast(input, "error"),
    };
}

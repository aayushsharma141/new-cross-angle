/**
 * OverlayManager
 * 
 * Central platform authority for all active overlays (Dialogs, Drawers, Lightboxes, Command Palettes).
 * Responsibilities:
 * - Stack Order & Z-Index allocation
 * - Top-level Escape Key dispatch
 * - Focus Ownership & Restoration
 * - Body State (scrollbar compensation & data-overlay-active flags)
 * - Listener Notifications on stack change
 */

export interface OverlayEntry {
  id: string
  onClose?: () => void
  returnFocusElement?: HTMLElement | null
}

type Listener = (stack: OverlayEntry[]) => void

class OverlayManager {
  private stack: OverlayEntry[] = []
  private listeners: Set<Listener> = new Set()
  private baseZIndex = 50

  public register(entry: OverlayEntry): () => void {
    // Remove if already exists to re-push to top
    this.stack = this.stack.filter((item) => item.id !== entry.id)
    this.stack.push(entry)
    this.updateBodyState()
    this.notify()

    return () => this.unregister(entry.id)
  }

  public unregister(id: string): void {
    const entry = this.stack.find((item) => item.id === id)
    this.stack = this.stack.filter((item) => item.id !== id)
    this.updateBodyState()
    this.notify()

    // Restore focus to original trigger element if available
    if (entry?.returnFocusElement && typeof entry.returnFocusElement.focus === "function") {
      setTimeout(() => {
        entry.returnFocusElement?.focus()
      }, 0)
    }
  }

  public getZIndex(id: string): number {
    const index = this.stack.findIndex((item) => item.id === id)
    if (index === -1) return this.baseZIndex
    return this.baseZIndex + (index + 1) * 10
  }

  public isTop(id: string): boolean {
    if (this.stack.length === 0) return false
    return this.stack[this.stack.length - 1].id === id
  }

  public handleEscape(): boolean {
    if (this.stack.length === 0) return false
    const top = this.stack[this.stack.length - 1]
    if (top.onClose) {
      top.onClose()
      return true
    }
    return false
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.stack))
  }

  private updateBodyState() {
    if (typeof document === "undefined") return
    if (this.stack.length > 0) {
      document.body.setAttribute("data-overlay-active", "true")
      document.body.setAttribute("data-overlay-count", String(this.stack.length))
    } else {
      document.body.removeAttribute("data-overlay-active")
      document.body.removeAttribute("data-overlay-count")
    }
  }
}

export const overlayManager = new OverlayManager()

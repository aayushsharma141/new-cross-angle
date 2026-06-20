/* ═══════════════════════════════════════════════
   Format Utilities
   ═══════════════════════════════════════════════ */

/** Format number as Indian-style currency (₹) */
export function formatCurrency(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
}

/** Format a min–max range as currency */
export function formatRange(min: number, max: number): string {
    if (min === max || max === 0) return formatCurrency(min);
    return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}


/** Generate a short unique ID */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const typography = {
    fontFamily: {
        sans: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        serif: 'var(--font-serif, Georgia, "Times New Roman", serif)',
        mono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
    },
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem',// 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
    },
    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },
    lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },
    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    }
};

export const textClasses = {
    h1: 'text-4xl font-bold tracking-tight text-text-primary',
    h2: 'text-3xl font-bold tracking-tight text-text-primary',
    h3: 'text-2xl font-semibold tracking-tight text-text-primary',
    h4: 'text-xl font-semibold tracking-tight text-text-primary',
    h5: 'text-lg font-semibold tracking-tight text-text-primary',
    h6: 'text-base font-semibold tracking-tight text-text-primary',
    body: 'text-base text-text-secondary leading-relaxed',
    bodySmall: 'text-sm text-text-secondary leading-normal',
    caption: 'text-xs text-text-muted',
    label: 'text-sm font-medium text-text-primary',
};

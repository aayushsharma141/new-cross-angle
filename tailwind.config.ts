import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: [
        "./apps/web/pages/**/*.{ts,tsx}",
        "./apps/web/components/**/*.{ts,tsx}",
        "./apps/web/app/**/*.{ts,tsx}",
        "./apps/web/src/**/*.{ts,tsx}",
        "./packages/ui/src/**/*.{ts,tsx}"
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                canvas: 'var(--s-canvas-primary)',
                surface: 'var(--s-surface-primary)',
                display: 'var(--s-text-display)',
                body: 'var(--s-text-body)',
                'border-subtle': 'var(--s-border-subtle)',
                'border-default': 'var(--s-border-default)',
                'cx-accent': 'var(--s-action-primary-bg)',
                'cx-focus': 'var(--s-focus-ring)',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                error: {
                    DEFAULT: 'hsl(var(--error))',
                    foreground: 'hsl(var(--error-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },

                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                },
                gold: {
                    DEFAULT: "hsl(38 75% 55%)",
                    light: "hsl(45 80% 65%)",
                    dark: "hsl(35 70% 45%)",
                    dim: "rgba(212, 175, 55, 0.4)",
                },
                diesel: {
                    '50': '#fff3e6',
                    '100': '#ffe1bd',
                    '200': '#ffc17e',
                    '300': '#ff9435',
                    '400': '#ff6c00',
                    '500': '#ff5100',
                    '600': '#de3100',
                    '700': '#b01900',
                    '800': '#911002',
                    '900': '#7a0e09',
                    '950': '#0f0000',
                },
                site: {
                    bg: '#000000',
                    'bg-section': '#080604',
                    'bg-card': '#100D0A',
                    'bg-card-hover': '#1A1614',
                    'bg-light': '#F5F3EF',
                    'bg-input': '#100D0A',
                    crimson: '#C41230',
                    'crimson-light': 'rgba(196, 18, 48, 0.3)',
                    gold: '#D1AF6E',
                    'gold-light': 'rgba(209, 175, 110, 0.3)',
                    stone: '#8B8B8B',
                    text: '#EDEAE6',
                    'text-heading': '#FFFFFF',
                    'text-muted': '#A3A09C',
                    'text-meta': '#6B6B6B',
                    border: 'rgba(237, 234, 230, 0.08)',
                    'border-input': 'rgba(237, 234, 230, 0.1)',
                },

                /* ─── Admin panel tokens ──────────────────────────────────────────
                 * Registered so classes like `bg-admin-card`, `text-admin-muted`,
                 * `border-admin-border`, `hover:bg-admin-surface/30` compile.
                 *
                 * The `<alpha-value>` placeholder enables alpha modifiers
                 * (e.g. `bg-admin-card/50`). CSS variables are defined in
                 * `apps/web/src/styles/admin-theme.css` as space-separated HSL.
                 *
                 * Name aliases:
                 *   admin-muted  → --admin-text-muted   (JSX convention)
                 *   admin-subtle → --admin-text-subtle
                 *   admin-gold   → --admin-primary      (primary IS the gold accent)
                 *   admin-accent → --admin-primary
                 *   admin-primary-foreground → black (text color on gold surfaces)
                 * ─────────────────────────────────────────────────────────────── */
                'admin-bg':             'hsl(var(--admin-bg) / <alpha-value>)',
                'admin-surface':        'hsl(var(--admin-surface) / <alpha-value>)',
                'admin-surface-hover':  'hsl(var(--admin-surface-hover) / <alpha-value>)',
                'admin-card':           'hsl(var(--admin-card) / <alpha-value>)',
                'admin-border':         'hsl(var(--admin-border) / <alpha-value>)',
                'admin-border-subtle':  'hsl(var(--admin-border-subtle) / <alpha-value>)',
                'admin-text':           'hsl(var(--admin-text) / <alpha-value>)',
                'admin-foreground':     'hsl(var(--admin-text) / <alpha-value>)',
                'admin-muted':          'hsl(var(--admin-text-muted) / <alpha-value>)',
                'admin-subtle':         'hsl(var(--admin-text-subtle) / <alpha-value>)',
                'admin-primary':        'hsl(var(--admin-primary) / <alpha-value>)',
                'admin-primary-hover':  'hsl(var(--admin-primary-hover) / <alpha-value>)',
                'admin-primary-foreground': 'hsl(0 0% 0% / <alpha-value>)',
                'admin-success':        'hsl(var(--admin-success) / <alpha-value>)',
                'admin-warning':        'hsl(var(--admin-warning) / <alpha-value>)',
                'admin-danger':         'hsl(var(--admin-danger) / <alpha-value>)',
                'admin-info':           'hsl(var(--admin-info) / <alpha-value>)',
                'admin-gold':           'hsl(var(--admin-primary) / <alpha-value>)',
                'admin-accent':         'hsl(var(--admin-primary) / <alpha-value>)',
            },
            borderRadius: {
                'cx-none': 'var(--p-radius-none)',
                'cx-sm': 'var(--p-radius-sm)',
                'cx-md': 'var(--p-radius-md)',
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            transitionDuration: {
                '850': '850ms',
                '1200': '1200ms',
                '1500': '1500ms',
                '2000': '2000ms',
                '3000': '3000ms',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'scale-down': {
                    '0%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'draw': {
                    '0%': { strokeDashoffset: '200' },
                    '100%': { strokeDashoffset: '0' }
                },
                'dash': {
                    '0%': { strokeDashoffset: '0' },
                    '100%': { strokeDashoffset: '100' }
                },
                'logo-spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                },
                'logo-pulse-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 8px hsl(var(--primary) / 0.3), 0 0 16px hsl(var(--primary) / 0.1)',
                        transform: 'scale(1)'
                    },
                    '50%': {
                        boxShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)',
                        transform: 'scale(1.02)'
                    }
                },
                'logo-breathe': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.9', transform: 'scale(1.03)' }
                },
                'text-shimmer': {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' }
                },
                'flip-in': {
                    '0%': {
                        opacity: '0',
                        transform: 'rotateX(-90deg) translateY(-10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'rotateX(0deg) translateY(0)'
                    }
                },
                'magnetic-bounce': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateX(50px) rotate(15deg)'
                    },
                    '50%': {
                        opacity: '1',
                        transform: 'translateX(-8px) rotate(-3deg)'
                    },
                    '70%': {
                        transform: 'translateX(4px) rotate(1.5deg)'
                    },
                    '85%': {
                        transform: 'translateX(-2px) rotate(-0.5deg)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateX(0) rotate(0deg)'
                    }
                },
                'marquee': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.8s ease-out forwards',
                'draw': 'draw 1.5s ease-out forwards',
                'dash': 'dash 20s linear infinite',
                'logo-spin': 'logo-spin 12s linear infinite',
                'logo-pulse-glow': 'logo-pulse-glow 2.5s ease-in-out infinite',
                'logo-breathe': 'logo-breathe 3s ease-in-out infinite',
                'text-shimmer': 'text-shimmer 4s ease-in-out infinite',
                'marquee': 'marquee 60s linear infinite'
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-gold': 'linear-gradient(135deg, hsl(38 75% 55%) 0%, hsl(45 80% 65%) 50%, hsl(38 75% 55%) 100%)',
            },
            boxShadow: {
                '2xs': 'var(--shadow-2xs)',
                xs: 'var(--shadow-xs)',
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
                '2xl': 'var(--shadow-2xl)'
            },
            fontFamily: {
                display: ['"Playfair Display"', 'Georgia', 'serif'],
                sans: [
                    '"DM Sans"',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Helvetica Neue',
                    'Arial',
                    'Noto Sans',
                    'sans-serif'
                ],
                serif: [
                    '"Cormorant Garamond"',
                    'ui-serif',
                    'Georgia',
                    'Cambria',
                    'Times New Roman',
                    'Times',
                    'serif'
                ],
                mono: [
                    'Roboto Mono',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    'Liberation Mono',
                    'Courier New',
                    'monospace'
                ]
            },
            fontSize: {
              'fluid-h1': ['clamp(2.5rem, 8vw, 7.6rem)', { lineHeight: '0.96', letterSpacing: '-0.05em' }],
              'fluid-h2': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
            },
            spacing: {
              'fluid-py':    'clamp(5rem, 12vh, 10rem)',
              'fluid-pt':    'clamp(7rem, 15vh, 12rem)',
              'section-y':   'clamp(5rem, 10vw, 9rem)',
              'section-top': 'clamp(6rem, 13vh, 11rem)',
            }
        }
    },
    plugins: [tailwindcssAnimate],
} satisfies Config;

import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{ts,tsx,js,jsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				display: ["'Cormorant Garamond'", "serif", ...fontFamily.serif],
				sans: ["'DM Sans'", "system-ui", "sans-serif", ...fontFamily.sans],
				label: ["'Montserrat'", "sans-serif"],
				mono: ["'JetBrains Mono'", "ui-monospace", "monospace", ...fontFamily.mono],
			},
			colors: {
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
				},
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					hover: "hsl(var(--primary-hover) / <alpha-value>)",
					active: "hsl(var(--primary-active) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
				},
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
					foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
					primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
					accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
					border: "hsl(var(--sidebar-border) / <alpha-value>)",
					ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
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
				admin: {
					background: "hsl(var(--admin-background) / <alpha-value>)",
					foreground: "hsl(var(--admin-foreground) / <alpha-value>)",
					card: {
						DEFAULT: "hsl(var(--admin-card) / <alpha-value>)",
						foreground: "hsl(var(--admin-card-foreground) / <alpha-value>)",
					},
					popover: {
						DEFAULT: "hsl(var(--admin-popover) / <alpha-value>)",
						foreground: "hsl(var(--admin-popover-foreground) / <alpha-value>)",
					},
					primary: {
						DEFAULT: "hsl(var(--admin-primary) / <alpha-value>)",
						hover: "hsl(var(--admin-primary-hover) / <alpha-value>)",
						foreground: "hsl(var(--admin-primary-foreground) / <alpha-value>)",
					},
					secondary: {
						DEFAULT: "hsl(var(--admin-secondary) / <alpha-value>)",
						foreground: "hsl(var(--admin-secondary-foreground) / <alpha-value>)",
					},
					muted: {
						DEFAULT: "hsl(var(--admin-muted) / <alpha-value>)",
						foreground: "hsl(var(--admin-muted-foreground) / <alpha-value>)",
					},
					accent: {
						DEFAULT: "hsl(var(--admin-accent) / <alpha-value>)",
						foreground: "hsl(var(--admin-accent-foreground) / <alpha-value>)",
					},
					border: "hsl(var(--admin-border) / <alpha-value>)",
					input: "hsl(var(--admin-input) / <alpha-value>)",
					ring: "hsl(var(--admin-ring) / <alpha-value>)",
					wine: {
						DEFAULT: "hsl(var(--admin-wine) / <alpha-value>)",
						light: "hsl(var(--admin-wine-light) / <alpha-value>)",
					},
					gold: {
						DEFAULT: "hsl(var(--admin-gold) / <alpha-value>)",
						muted: "hsl(var(--admin-gold-muted) / <alpha-value>)",
					},
					obsidian: "hsl(var(--admin-obsidian) / <alpha-value>)",
					charcoal: "hsl(var(--admin-charcoal) / <alpha-value>)",
					stone: "hsl(var(--admin-stone) / <alpha-value>)",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				xl: "calc(var(--radius) + 4px)",
				"2xl": "calc(var(--radius) + 8px)",
			},
			boxShadow: {
				"btn-brand": "0 0 20px hsl(355 85% 42% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
				"btn-gold": "0 0 24px hsl(43 90% 55% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.10)",
				"glass": "0 8px 32px hsl(0 0% 0% / 0.40), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
				"stat": "0 4px 20px hsl(0 0% 0% / 0.50)",
				"stat-value": "0 0 20px hsl(43 90% 55% / 0.40)",
				"surface": "0 2px 12px hsl(0 0% 0% / 0.30)",
				"surface-lg": "0 8px 40px hsl(0 0% 0% / 0.50)",
				"focus-brand": "0 0 0 3px hsl(355 85% 42% / 0.55)",
				"focus-gold": "0 0 0 3px hsl(43 90% 55% / 0.45)",
			},
			backgroundImage: {
				"ambient-body": `radial-gradient(ellipse 80% 50% at 50% -10%, hsl(355 85% 42% / 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 90%,  hsl(43 90% 55% / 0.04) 0%, transparent 50%)`,
				"gradient-wine": "linear-gradient(135deg, hsl(355 85% 42%) 0%, hsl(355 90% 30%) 100%)",
				"gradient-gold": "linear-gradient(90deg, hsl(355 85% 42%) 0%, hsl(43 90% 55%) 100%)",
				"gradient-obsidian": "linear-gradient(180deg, hsl(0 0% 10%) 0%, hsl(0 0% 0%) 100%)",
				"gradient-shine": "linear-gradient(135deg, hsl(0 0% 10%) 0%, hsl(0 0% 5%) 50%, hsl(0 0% 8%) 100%)",
				"gradient-silk": "linear-gradient(160deg, hsl(0 0% 11%) 0%, hsl(0 0% 9%) 100%)",
				"noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
				"grid-pattern": "linear-gradient(hsl(0 0% 100% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.03) 1px, transparent 1px)",
			},
			backgroundSize: {
				"grid-sm": "24px 24px",
				"grid-md": "48px 48px",
				"grid-lg": "80px 80px",
			},
			letterSpacing: {
				"label": "0.10em",
				"btn": "0.08em",
				"wide-xl": "0.15em",
				"tight-display": "-0.02em",
			},
			backdropBlur: {
				xs: "4px",
				sm: "8px",
				md: "12px",
				lg: "24px",
				xl: "40px",
			},
			keyframes: {
				"fade-in": {
					from: { opacity: "0", transform: "translateY(8px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
				slideUp: { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
				"glow-pulse": {
					"0%, 100%": { boxShadow: "0 0 20px hsl(43 90% 55% / 0.3)" },
					"50%": { boxShadow: "0 0 35px hsl(43 90% 55% / 0.55)" },
				},
				"shimmer": {
					from: { backgroundPosition: "-200% center" },
					to: { backgroundPosition: "200% center" },
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
				},
				'meteor-effect': {
					'0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
					'70%': { opacity: '1' },
					'100%': {
						transform: 'rotate(215deg) translateX(-600px)',
						opacity: '0'
					}
				},
				'sparkle-spin': {
					'0%': { transform: 'rotate(0deg) scale(0)', opacity: '0' },
					'50%': { transform: 'rotate(90deg) scale(1)', opacity: '1' },
					'100%': { transform: 'rotate(180deg) scale(0)', opacity: '0' }
				},
				'animate-grid': {
					'0%': { transform: 'translateY(-50%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slide': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'spin-around': {
					'0%': { transform: 'translateZ(0) rotate(0)' },
					'15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
					'65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
					'100%': { transform: 'translateZ(0) rotate(360deg)' }
				},
				'rainbow': {
					'0%': { '--angle': '0deg' },
					'100%': { '--angle': '360deg' }
				},
				'ripple': {
					'0%': { transform: 'scale(1)', opacity: '0.6' },
					'100%': { transform: 'scale(40)', opacity: '0' }
				},
				'border-beam': {
					'100%': { 'offset-distance': '100%' },
				},
				'shine-pulse': {
					'0%': { 'background-position': '0% 0%' },
					'50%': { 'background-position': '100% 100%' },
					'100%': { 'background-position': '0% 0%' },
				},
				orbit: {
					"0%": {
					  transform:
						"rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))",
					},
					"100%": {
					  transform:
						"rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))",
					},
				},
			},
			animation: {
				"fade-in": "fade-in 0.4s ease forwards",
				'site-fade-in': 'fadeIn 0.6s ease-out',
				'site-slide-up': 'slideUp 0.5s ease-out',
				"glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
				"shimmer": "shimmer 2.5s linear infinite",
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'draw': 'draw 1.5s ease-out forwards',
				'dash': 'dash 20s linear infinite',
				'logo-spin': 'logo-spin 12s linear infinite',
				'logo-pulse-glow': 'logo-pulse-glow 2.5s ease-in-out infinite',
				'logo-breathe': 'logo-breathe 3s ease-in-out infinite',
				'text-shimmer': 'text-shimmer 4s ease-in-out infinite',
				'marquee': 'marquee 60s linear infinite',
				'meteor-effect': 'meteor-effect linear infinite',
				'sparkle-spin': 'sparkle-spin 1.8s ease-in-out forwards',
				'animate-grid': 'animate-grid 15s linear infinite',
				'slide': 'slide 2s ease-in-out infinite alternate',
				'spin-around': 'spin-around calc(var(--speed)*2) infinite linear',
				'rainbow': 'rainbow calc(var(--speed,4s)) infinite linear',
				'ripple': 'ripple 0.7s ease-out forwards',
				'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
				'shine-pulse': 'shine-pulse 3s ease-in-out infinite',
				'orbit': "orbit calc(var(--duration)*1s) linear infinite",
			},
			transitionTimingFunction: {
				"luxury": "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
				"spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
			},
			transitionDuration: {
				"250": "250ms",
				"400": "400ms",
				"600": "600ms",
			},
		},
	},
	plugins: [
		tailwindcssAnimate,
		typography,
		function ({ addComponents, addUtilities }: { addComponents: (components: Record<string, unknown>) => void, addUtilities: (utilities: Record<string, unknown>) => void }) {
			addComponents({
				".glass": {
					background: "hsl(0 0% 100% / 0.02)",
					backdropFilter: "blur(24px) saturate(180%)",
					border: "1px solid hsl(0 0% 100% / 0.05)",
					boxShadow: "0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
				},
				".glass-border": {
					border: "1px solid hsl(0 0% 100% / 0.05)",
				},
				".stat-card-gold": {
					borderTop: "2px solid hsl(43 90% 55%)",
					background: "linear-gradient(160deg, hsl(0 0% 10%) 0%, hsl(0 0% 5%) 100%)",
					boxShadow: "0 4px 20px hsl(0 0% 0% / 0.5)",
				},
				".btn-brand": {
					background: "linear-gradient(135deg, hsl(43 90% 55%) 0%, hsl(38 90% 45%) 100%)",
					border: "1px solid hsl(43 90% 55% / 0.4)",
					boxShadow: "0 0 20px hsl(43 90% 55% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
					color: "hsl(0 0% 4%)",
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					fontSize: "0.75rem",
					fontWeight: "700",
					"&:hover": {
						background: "linear-gradient(135deg, hsl(43 90% 50%) 0%, hsl(38 90% 40%) 100%)",
						boxShadow: "0 0 28px hsl(43 90% 55% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
						transform: "translateY(-1px)",
					},
					"&:active": {
						transform: "translateY(0)",
						background: "linear-gradient(135deg, hsl(43 90% 45%) 0%, hsl(38 90% 35%) 100%)",
					},
				},
			});

			addUtilities({
				".text-gradient-wine": {
					background: "linear-gradient(135deg, hsl(355 85% 42%) 0%, hsl(355 90% 30%) 100%)",
					"-webkit-background-clip": "text",
					"background-clip": "text",
					"-webkit-text-fill-color": "transparent",
				},
				".text-gradient-gold": {
					background: "linear-gradient(90deg, hsl(43 90% 55%) 0%, hsl(38 90% 45%) 100%)",
					"-webkit-background-clip": "text",
					"background-clip": "text",
					"-webkit-text-fill-color": "transparent",
				},
				".bg-ambient": {
					backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, hsl(355 85% 42% / 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 90%,  hsl(43 90% 55% / 0.04) 0%, transparent 50%)`,
					backgroundAttachment: "fixed",
				},
			});
		},
	],
} satisfies Config;

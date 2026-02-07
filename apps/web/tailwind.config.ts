import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Add marquee animation for TrustSection

// Add dash animation keyframe

export default {
	darkMode: ["class"],
	content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
				// Brand Wine Colors
				wine: {
					DEFAULT: "#8E1225",
					50: "#FCE8EB",
					100: "#F8C5CC",
					200: "#E8919C",
					300: "#D85D6D",
					400: "#C41E3A",      // Rose Highlight
					500: "#8E1225",      // Brand Primary
					600: "#73101D",      // Hover State
					700: "#5C0C17",      // Active State
					800: "#450912",
					900: "#2E060C",
					950: "#170305",
				},
				// Antique Gold (use sparingly)
				gold: {
					DEFAULT: "#C9A227",
					50: "#FCF8E8",
					100: "#F7EEC4",
					200: "#EFDC8A",
					300: "#E5C64D",
					400: "#C9A227",
					500: "#A6841D",
					600: "#836615",
					700: "#61490F",
					800: "#3F2E0A",
					900: "#1E1504",
				},
				// Deep Teal (commercial sections only)
				teal: {
					DEFAULT: "#1E6E6E",
					50: "#E6F4F4",
					100: "#C2E5E5",
					200: "#85CBCB",
					300: "#47B1B1",
					400: "#1E6E6E",
					500: "#175656",
					600: "#114040",
					700: "#0B2A2A",
					800: "#051515",
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
					'Roboto',
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
					'Playfair Display',
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
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;

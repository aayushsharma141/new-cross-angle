import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

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
				// Brand Primary Colors (Updated to Red)
				wine: {
					DEFAULT: "#C30000",
					50: "#FCE8EB",
					100: "#F8C5CC",
					200: "#EFA0A0",      // Light Pink (User provided)
					300: "#D85D6D",
					400: "#A90913",      // Darker Red (User provided)
					500: "#C30000",      // Brand Primary (User provided)
					600: "#A90913",      // Hover State (User provided)
					700: "#7A0000",
					800: "#450912",
					900: "#2E060C",
					950: "#170305",
				},
				// Luxury Gold (Updated)
				gold: {
					DEFAULT: "#FFC300",
					50: "#FFF9E6",
					100: "#FFEDB3",
					200: "#FFE180",
					300: "#FFD54D",
					400: "#FFC300",      // User Provided
					500: "#E6B000",
					600: "#BF9200",
					700: "#997500",
					800: "#735800",
					900: "#4D3B00",
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
				sans: ["DM Sans", "sans-serif"],
				display: ["Cormorant Garamond", "Playfair Display", "serif"],
				mono: ["JetBrains Mono", "monospace"],
			}
		}
	},
	plugins: [tailwindcssAnimate, typography],
} satisfies Config;

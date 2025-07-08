import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
			fontFamily: {
				'outfit': ['Outfit', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
				'sans': ['Inter', 'sans-serif'],
				'display': ['Outfit', 'sans-serif'],
			},
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
				// App-specific colors
				'app-bg': 'hsl(var(--app-background))',
				'app-fg': 'hsl(var(--app-foreground))',
				'brand-purple': 'hsl(var(--primary-purple))',
				'brand-purple-secondary': 'hsl(var(--secondary-purple))',
				'brand-blue': 'hsl(var(--accent-blue))',
				'success': 'hsl(var(--success-green))',
				'warning': 'hsl(var(--warning-orange))',
				'error': 'hsl(var(--error-red))',
				// Anxiety levels
				'anxiety-very-low': 'hsl(var(--anxiety-very-low))',
				'anxiety-low': 'hsl(var(--anxiety-low))',
				'anxiety-moderate': 'hsl(var(--anxiety-moderate))',
				'anxiety-high': 'hsl(var(--anxiety-high))',
				'anxiety-very-high': 'hsl(var(--anxiety-very-high))',
			},
			backgroundImage: {
				'gradient-purple': 'var(--gradient-purple)',
				'gradient-purple-blue': 'var(--gradient-purple-blue)',
				'gradient-hero': 'var(--gradient-hero)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

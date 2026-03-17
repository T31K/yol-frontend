import type { Config } from 'tailwindcss'
import tailwindAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		width: {
  			container: '1300px'
  		},
  		colors: {
  			bg: '#ECCA9C',
  			main: '#DBA979',
  			sage: '#AFD198',
  			'sage-light': '#E8EFCF',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			base: '12px'
  		},
  		boxShadow: {
  			base: '2px 2px 0px 0px rgba(0,0,0,1)'
  		},
  		translate: {
  			boxShadowX: '4px',
  			boxShadowY: '4px'
  		},
  		fontWeight: {
  			base: '400',
  			heading: '600'
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
  			},
  			marquee: {
  				'0%': {
  					transform: 'translateX(0%)'
  				},
  				'100%': {
  					transform: 'translateX(-100%)'
  				}
  			},
  			marquee2: {
  				'0%': {
  					transform: 'translateX(100%)'
  				},
  				'100%': {
  					transform: 'translateX(0%)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			marquee: 'marquee 15s linear infinite',
  			marquee2: 'marquee2 15s linear infinite'
  		},
  		screens: {
  			w900: {
  				raw: '(max-width: 900px)'
  			},
  			w500: {
  				raw: '(max-width: 500px)'
  			}
  		}
  	}
  },
  plugins: [tailwindAnimate, typography],
}
export default config

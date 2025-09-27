/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Typography System - Ultra-thin modern style
      fontSize: {
        // Display sizes
        'display-1': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '100' }], // 64px
        'display-2': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '100' }], // 56px
        
        // Heading sizes with responsive defaults
        'heading-1': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '100' }], // 48px
        'heading-2': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '200' }], // 36px
        'heading-3': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '200' }], // 30px
        'heading-4': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '300' }], // 24px
        'heading-5': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '300' }], // 20px
        'heading-6': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }], // 16px
        
        // Body text
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '300' }], // 18px
        'body-md': ['1rem', { lineHeight: '1.75', fontWeight: '400' }], // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
        
        // UI text
        'ui-lg': ['1rem', { lineHeight: '1.5', fontWeight: '500' }], // 16px
        'ui-md': ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }], // 14px
        'ui-sm': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }], // 12px
      },
      fontWeight: {
        'thin': '100',
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      letterSpacing: {
        'tighter': '-0.04em',
        'tight': '-0.02em',
        'normal': '0',
        'wide': '0.02em',
        'wider': '0.04em',
        'widest': '0.08em',
      },
      lineHeight: {
        'tighter': '1',
        'tight': '1.1',
        'snug': '1.2',
        'normal': '1.5',
        'relaxed': '1.75',
        'loose': '2',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
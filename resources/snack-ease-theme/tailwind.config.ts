/* ============================================================
   Snack Ease — Tailwind CSS v3 Config für shadcn-vue
   ============================================================ */

import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  // ── Dark mode via .dark class ────────────────────────────
  darkMode: ['class'],

  // ── Content paths (adjust to your project structure) ────
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx,js,jsx}',
    './components/**/*.{vue,ts,tsx}',
    './pages/**/*.{vue,ts,tsx}',
    './layouts/**/*.{vue,ts,tsx}',
    './app/**/*.{vue,ts,tsx}',
  ],

  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1400px',
      },
    },

    extend: {
      // ── Typography ───────────────────────────────────────
      fontFamily: {
        // Mulish – as specified in the moodboard
        sans: ['Mulish', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      fontWeight: {
        // Mulish supports 200–1000; expose useful steps
        light:      '300',
        normal:     '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
        black:      '900',
      },

      // ── Colors – all wired to CSS variables ─────────────
      colors: {
        // shadcn-vue core tokens
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',

        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ── Snack Ease brand palette (extra tokens) ────────
        // Usage: bg-brand-green, text-brand-teal, border-brand-pink …
        brand: {
          green:      'hsl(var(--primary))',            // #1B4D40
          teal:       'hsl(var(--accent))',             // #3AACA7
          pink:       'hsl(var(--brand-pink))',         // #E5B5BF
          gold:       'hsl(var(--brand-gold))',         // #B8955A
          'blue-gray':'hsl(var(--brand-blue-gray))',    // #BFC8D2
          surface:    'hsl(var(--surface-tint))',       // card header bg
        },
      },

      // ── Border radius ────────────────────────────────────
      // --radius = 0.875rem (14px) — drives all components.
      // Components in shadcn use `rounded-lg` (= var(--radius))
      // and `rounded-md` (= calc(var(--radius) - 2px)) etc.
      borderRadius: {
        sm:   'calc(var(--radius) - 6px)',   //  8 px
        md:   'calc(var(--radius) - 2px)',   // 12 px  ← inputs, badges
        lg:   'var(--radius)',               // 14 px  ← cards (shadcn default)
        xl:   'calc(var(--radius) + 4px)',   // 18 px
        '2xl':'calc(var(--radius) + 10px)',  // 24 px
        pill: '9999px',                      // ← CTA buttons (VORBESTELLEN etc.)
      },

      // ── Spacing extras ───────────────────────────────────
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',  // iOS home indicator
      },

      // ── Box shadow ───────────────────────────────────────
      boxShadow: {
        'card-sm': '0 1px 4px 0 hsl(211 33% 18% / 0.06)',
        'card':    '0 2px 8px 0 hsl(211 33% 18% / 0.08)',
        'card-lg': '0 4px 16px 0 hsl(211 33% 18% / 0.12)',
        // teal glow for primary buttons
        'primary': '0 4px 14px 0 hsl(177 49% 45% / 0.35)',
      },

      // ── Keyframes (required by shadcn-vue components) ────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        // Subtle fade-in used by toasts & modals
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to:   { opacity: '0', transform: 'translateY(4px)' },
        },
        // Splash screen loader (matches the loading spinner)
        spin: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.2s ease-out',
        'fade-out':       'fade-out 0.15s ease-in',
        'spin-slow':      'spin 1.2s linear infinite',
      },
    },
  },

  plugins: [
    // Required for shadcn-vue animated components
    animate,
  ],
} satisfies Config

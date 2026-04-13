import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wow: {
          bg:           '#070911',
          surface:      '#0c1120',
          'surface-2':  '#111927',
          border:       '#1c2b45',
          gold:         '#c9a84c',
          'gold-bright':'#f0d060',
          text:         '#ddd6c4',
          muted:        '#6b7a99',
          blue:         '#0078ff',
          red:          '#c41e3a',
          green:        '#40a868',
        },
      },
      fontFamily: {
        heading: ['Cinzel', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'wow-gradient': 'linear-gradient(135deg, #07090f 0%, #0a0f1e 50%, #07090f 100%)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeIn:  { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        fadeIn:  'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config

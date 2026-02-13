/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Enhanced colors for medical/health theme
      colors: {
        slate: {
          950: '#0f172a',
        },
      },
      // Custom spacing for mobile safe areas
      spacing: {
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
        'safe-area-inset-top': 'env(safe-area-inset-top)',
        'safe-area-inset-left': 'env(safe-area-inset-left)',
        'safe-area-inset-right': 'env(safe-area-inset-right)',
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Custom backdrop blur utilities
      backdropBlur: {
        xs: '2px',
      },
      // Extended gradient positions
      gradientColorStops: {
        'teal-500/10': 'rgb(20 184 166 / 0.1)',
        'cyan-500/10': 'rgb(6 182 212 / 0.1)',
        'violet-500/10': 'rgb(139 92 246 / 0.1)',
        'purple-500/10': 'rgb(168 85 247 / 0.1)',
      },
    },
  },
  plugins: [
    // Plugin for line-clamp utility
    function({ addUtilities }) {
      const newUtilities = {
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        '.safe-area-inset-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

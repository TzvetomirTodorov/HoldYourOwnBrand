/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Hold Your Own Brand color palette
      // Fusion of California Beach + Harlem Street aesthetics
      colors: {
        // Primary brand colors
        'ocean': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#1a365d',  // Deep ocean - primary brand color
        },
        'sunset': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d69e2e',  // Sunset gold - accent color
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'street': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#1a1a1a',  // Night black
          950: '#0a0a0a',
        },
        // Subtle accent colors
        'blood': {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#9b2c2c',  // Blood red (used sparingly)
        },
        'palm': {
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#276749',  // Palm green
        },
      },
      // Typography
      fontFamily: {
        'display': ['Bebas Neue', 'Oswald', 'sans-serif'],  // Bold headlines
        'body': ['Inter', 'Open Sans', 'sans-serif'],       // Clean body text
      },
      // Custom spacing for consistent layouts
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

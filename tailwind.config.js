/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 40%, 95%)',
        accent: 'hsl(130, 75%, 55%)',
        border: 'hsl(220, 20%, 85%)',
        primary: 'hsl(210, 95%, 50%)',
        surface: 'hsl(220, 30%, 100%)',
        'text-primary': 'hsl(220, 30%, 20%)',
        'text-secondary': 'hsl(220, 30%, 40%)',
        purple: {
          50: '#f8f6ff',
          100: '#f0ebff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        gradient: {
          from: '#667eea',
          to: '#764ba2',
        }
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      boxShadow: {
        sm: '0 2px 4px hsla(0, 0%, 0%, 0.05)',
        md: '0 5px 15px hsla(0, 0%, 0%, 0.1)',
        lg: '0 10px 25px hsla(0, 0%, 0%, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        'slide-up': 'slideUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1.0)',
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
      },
    },
  },
  plugins: [],
}
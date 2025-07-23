/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
        'black': ['Inter Black', 'system-ui', 'sans-serif']
      },
      colors: {
        'neon-green': '#39ff14',
        'neon-lime': '#ccff00',
        'stadium-green': '#059669'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow: '0 0 5px rgba(34, 197, 94, 0.5), 0 0 10px rgba(34, 197, 94, 0.5), 0 0 15px rgba(34, 197, 94, 0.5)'
          },
          '100%': {
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.8)'
          }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      dropShadow: {
        'glow-sm': '0 0 10px rgba(34, 197, 94, 0.5)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.7)',
        'glow-lg': '0 0 30px rgba(34, 197, 94, 0.9)'
      }
    },
  },
  plugins: [],
}
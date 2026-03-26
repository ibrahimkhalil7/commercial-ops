module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          900: '#001a33'
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a'
        },
        warning: {
          50: '#fffbeb',
          500: '#eab308',
          600: '#ca8a04'
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626'
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151'
          }
        }
      }
    }
  },
  plugins: []
}

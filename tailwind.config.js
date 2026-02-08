/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e293b', // Azul escuro profissional
        secondary: '#f59e0b', // Laranja gastronômico (fome/atenção)
        danger: '#ef4444',
        success: '#22c55e'
      }
    },
  },
  plugins: [],
}
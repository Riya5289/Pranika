/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        roboto: ['Roboto', 'sans-serif'],
        monda: ['Monda', 'sans-serif'],
      },
      colors: {
        brand: {
          pink: '#EFA7A7',
          orange: '#EB5E28',
          cyan: '#23B5D3',
        },
      },
      maxWidth: {
        layout: '1200px',
      },
    },
  },
  plugins: [],
};

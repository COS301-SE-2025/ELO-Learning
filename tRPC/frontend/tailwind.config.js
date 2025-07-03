/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vector-violet': '#7d32ce',
        'vector-violet-light': '#9a3cff',
        'eigen-purple': '#421e68',
        'midnight-theorem': '#1d1a34',
        'blueprint-blue': '#4d5ded',
        'blueprint-blue-light': '#8793ff',
        'radical-rose': '#ff6e99',
        'chalk-dust': '#e8e8e8',
      },
    },
  },
  plugins: [],
};

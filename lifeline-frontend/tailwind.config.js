/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 한국적 정서: 파스텔톤 컬러 미리 정의
        'lifeline-blue': '#E0F2FE', 
        'lifeline-pink': '#FCE7F3',
        'lifeline-yellow': '#FEF9C3',
      },
    },
  },
  plugins: [],
}
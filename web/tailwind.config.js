/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './themes/lpsnc-reporter/layouts/**/*.html',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1e3a8a', // 六盘水师范学院VI主蓝
        'accent-orange': '#ea580c', // 辅助橙色
      },
      fontFamily: {
        'serif': ['"Noto Serif SC"', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
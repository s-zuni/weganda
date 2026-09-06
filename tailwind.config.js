/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#024833",
          light: "#0A6B4D",
          dark: "#012A1E",
        },
        shift: {
          day: "#4F98CA",
          evening: "#E2703A",
          night: "#272727",
          off: "#E84A5F",
          vacation: "#9B51E0",
        },
      },
    },
  },
  plugins: [],
};


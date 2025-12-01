/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Verwende CSS-Variablen aus design-system.css
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--accent)",
        background: "var(--bg-primary)",
        foreground: "var(--primary)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "#1F2121",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--primary)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--accent-muted)",
          foreground: "var(--accent)",
        },
        popover: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--primary)",
        },
        card: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--primary)",
        },
        // Status-Farben
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        success: "var(--accent)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

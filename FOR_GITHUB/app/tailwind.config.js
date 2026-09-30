/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fdfcfa",
        "paper-warm": "#f8f4ee",
        ink: "#151515",
        "ink-soft": "#2b2b2b",
        "ink-muted": "#6b6560",
        "ink-faint": "#9a9590",
        accent: "#1b3a2e",
        "accent-soft": "#24483a",
        "accent-light": "#e6efe9",
        "hairline": "rgba(20,20,20,0.08)",
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}

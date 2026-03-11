/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Use --tw-color-* RGB triplets → supports opacity modifiers like bg-primary/80
                bg:      "rgb(var(--tw-color-bg)      / <alpha-value>)",
                surface: "rgb(var(--tw-color-surface)  / <alpha-value>)",
                border:  "rgb(var(--tw-color-border)   / <alpha-value>)",
                text:    "rgb(var(--tw-color-text)     / <alpha-value>)",
                muted:   "rgb(var(--tw-color-muted)    / <alpha-value>)",
                primary: "rgb(var(--tw-color-primary)  / <alpha-value>)",
                accent:  "rgb(var(--tw-color-accent)   / <alpha-value>)",
                success: "rgb(var(--tw-color-success)  / <alpha-value>)",
                warning: "rgb(var(--tw-color-warning)  / <alpha-value>)",
                danger:  "rgb(var(--tw-color-danger)   / <alpha-value>)",
            },
            fontFamily: {
                heading: ["Outfit", "sans-serif"],
                body: ["Work Sans", "sans-serif"],
            },
            animation: {
                'fade-up':      'fadeUp 0.6s ease-out forwards',
                'micro-bounce': 'microBounce 0.2s ease-out',
            },
            keyframes: {
                fadeUp: {
                    '0%':   { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                microBounce: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%':      { transform: 'scale(0.97)' },
                },
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            /* ─────────────────────────────────────────────────────────
               COLORS - with opacity support via CSS custom properties
               ───────────────────────────────────────────────────────── */
            colors: {
                bg:        "rgb(var(--tw-color-bg)       / <alpha-value>)",
                surface:   "rgb(var(--tw-color-surface)  / <alpha-value>)",
                border:    "rgb(var(--tw-color-border)   / <alpha-value>)",
                text:      "rgb(var(--tw-color-text)     / <alpha-value>)",
                muted:     "rgb(var(--tw-color-muted)    / <alpha-value>)",
                primary:   "rgb(var(--tw-color-primary)  / <alpha-value>)",
                accent:    "rgb(var(--tw-color-accent)   / <alpha-value>)",
                success:   "rgb(var(--tw-color-success)  / <alpha-value>)",
                warning:   "rgb(var(--tw-color-warning)  / <alpha-value>)",
                danger:    "rgb(var(--tw-color-danger)   / <alpha-value>)",
            },

            /* ─────────────────────────────────────────────────────────
               TYPOGRAPHY - Font families
               ───────────────────────────────────────────────────────── */
            fontFamily: {
                heading: ["Outfit", "sans-serif"],
                body:    ["Work Sans", "sans-serif"],
            },

            /* ─────────────────────────────────────────────────────────
               FONT SIZES - Consistent scale (12px → 36px)
               ───────────────────────────────────────────────────────── */
            fontSize: {
                xs:    "var(--text-xs)",     // 12px
                sm:    "var(--text-sm)",     // 14px
                base:  "var(--text-base)",   // 16px
                lg:    "var(--text-lg)",     // 18px
                xl:    "var(--text-xl)",     // 20px
                "2xl": "var(--text-2xl)",    // 24px
                "3xl": "var(--text-3xl)",    // 32px
            },

            /* ─────────────────────────────────────────────────────────
               SPACING - Consistent scale (4px base unit)
               ───────────────────────────────────────────────────────── */
            spacing: {
                "0":   "var(--space-0)",
                "1":   "var(--space-1)",     // 4px
                "2":   "var(--space-2)",     // 8px
                "3":   "var(--space-3)",     // 12px
                "4":   "var(--space-4)",     // 16px
                "5":   "var(--space-5)",     // 20px
                "6":   "var(--space-6)",     // 24px
                "8":   "var(--space-8)",     // 32px
                "10":  "var(--space-10)",    // 40px
                "12":  "var(--space-12)",    // 48px
            },

            /* ─────────────────────────────────────────────────────────
               GAP - Same scale as spacing
               ───────────────────────────────────────────────────────── */
            gap: {
                "0":   "var(--space-0)",
                "1":   "var(--space-1)",
                "2":   "var(--space-2)",
                "3":   "var(--space-3)",
                "4":   "var(--space-4)",
                "5":   "var(--space-5)",
                "6":   "var(--space-6)",
                "8":   "var(--space-8)",
                "10":  "var(--space-10)",
                "12":  "var(--space-12)",
            },

            /* ─────────────────────────────────────────────────────────
               BORDER RADIUS - Consistent scale
               ───────────────────────────────────────────────────────── */
            borderRadius: {
                "none": "var(--radius-none)",
                "sm":   "var(--radius-sm)",      // 4px
                "base": "var(--radius-base)",    // 8px
                "md":   "var(--radius-md)",      // 12px
                "lg":   "var(--radius-lg)",      // 16px
                "xl":   "var(--radius-xl)",      // 20px
                "full": "var(--radius-full)",    // 9999px
            },

            /* ─────────────────────────────────────────────────────────
               BOX SHADOW - Depth system
               ───────────────────────────────────────────────────────── */
            boxShadow: {
                "none":      "var(--shadow-none)",
                "sm":        "var(--shadow-sm)",
                "md":        "var(--shadow-md)",
                "lg":        "var(--shadow-lg)",
                "xl":        "var(--shadow-xl)",
                "xl-hover":  "var(--shadow-xl-hover)",
            },

            /* ─────────────────────────────────────────────────────────
               Z-INDEX - Layering system
               ───────────────────────────────────────────────────────── */
            zIndex: {
                "hide":         "var(--z-hide)",
                "auto":         "var(--z-auto)",
                "base":         "var(--z-base)",
                "dropdown":     "var(--z-dropdown)",
                "sticky":       "var(--z-sticky)",
                "tooltip":      "var(--z-tooltip)",
                "overlay":      "var(--z-overlay)",
                "modal":        "var(--z-modal)",
                "notification": "var(--z-notification)",
            },

            /* ─────────────────────────────────────────────────────────
               LINE HEIGHT
               ───────────────────────────────────────────────────────── */
            lineHeight: {
                "tight":  "var(--line-height-tight)",
                "normal": "var(--line-height-normal)",
                "loose":  "var(--line-height-loose)",
            },

            /* ─────────────────────────────────────────────────────────
               LETTER SPACING
               ───────────────────────────────────────────────────────── */
            letterSpacing: {
                "tight":  "var(--letter-spacing-tight)",
                "normal": "var(--letter-spacing-normal)",
                "wide":   "var(--letter-spacing-wide)",
            },

            /* ─────────────────────────────────────────────────────────
               TRANSITIONS
               ───────────────────────────────────────────────────────── */
            transitionDuration: {
                "fast":   "var(--transition-fast)",
                "normal": "var(--transition-normal)",
                "slow":   "var(--transition-slow)",
            },

            transitionTimingFunction: {
                "smooth": "ease-out",
            },

            /* ─────────────────────────────────────────────────────────
               ANIMATIONS - Smooth entrance effects & interactions
               ───────────────────────────────────────────────────────── */
            animation: {
                "fade-in":       "fadeIn var(--transition-normal) ease-out",
                "slide-up":      "slideUp var(--transition-normal) ease-out",
                "slide-in-right": "slideInRight var(--transition-normal) ease-out",
                "fade-up":       "fadeUp 0.6s ease-out forwards",
                "spin":          "spin 1s linear infinite",
                "pulse":         "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },

            /* ─────────────────────────────────────────────────────────
               KEYFRAMES - Animation definitions
               ───────────────────────────────────────────────────────── */
            keyframes: {
                fadeIn: {
                    "0%":   { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(1rem)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
                slideInRight: {
                    "0%": {
                        opacity: "0",
                        transform: "translateX(1rem)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateX(0)",
                    },
                },
                fadeUp: {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(var(--space-6))",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
                spin: {
                    "0%":   { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
                pulse: {
                    "0%, 100%": { opacity: "1" },
                    "50%":      { opacity: "0.5" },
                },
            },

            /* ─────────────────────────────────────────────────────────
               RING (Focus state styling for accessibility)
               ───────────────────────────────────────────────────────── */
            ringWidth: {
                "ring": "var(--ring-width)",
            },
            ringColor: {
                "ring": "var(--ring-color)",
            },
            ringOffsetWidth: {
                "ring": "var(--ring-offset)",
            },
        },

        /* ─────────────────────────────────────────────────────────
           BREAKPOINTS - Mobile-first responsive design
           ───────────────────────────────────────────────────────── */
        screens: {
            "xs": "0px",       // Mobile
            "sm": "640px",     // Small devices
            "md": "768px",     // Tablets
            "lg": "1024px",    // Desktop
            "xl": "1280px",    // Wide desktop
        },
    },

    plugins: [
        require("tailwindcss-animate"),
    ],
}

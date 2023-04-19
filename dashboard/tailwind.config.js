/** @type {import('tailwindcss').Config} */
module.exports = {
	prefix: "tw-",
	content: ["./app/**/*.{ts,tsx}","./component/**/*.{ts,tsx}"],
	experimental: {
		optimizeUniversalDefaults: true,
	},
	theme: {
		extend: {
			// https://vercel.com/design/color
			colors: {
				bg: "var(--background)",
				fg: "var(--foreground)",
				des: "var(--description)",
				gg: "var(--google-blue)"
			},
			keyframes: ({ theme }) => ({
				rerender: {
					"0%": {
						"border-color": theme("colors.bg"),
					},
					"40%": {
						"border-color": theme("colors.fg"),
					},
				},
				shimmer: {
					"100%": {
						transform: "translateX(100%)",
					},
				},
				translateXReset: {
					"100%": {
						transform: "translateX(0)",
					},
				},
				fadeToTransparent: {
					"0%": {
						opacity: 1,
					},
					"40%": {
						opacity: 1,
					},
					"100%": {
						opacity: 0,
					},
				},
			}),
		},
	},
};

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			animation: {
				border: "border-spin 10s linear infinite",
			},
			keyframes: {
				"border-spin": {
					"100%": {
						"--border-angle": "360deg",
					},
				},
			},
		},
	},
	plugins: [],
};
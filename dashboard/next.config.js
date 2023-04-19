const path = require("node:path");

/** @type {import('next').NextConfig} */
module.exports = {
	// THIS NOT WORK WITH TURBOPACK
	output: "standalone",
	// BLUEPRINT NOT SUPPORT NOW
	reactStrictMode: true,
	transpilePackages: ["ui", "lib"],
	// modularizeImports: {},
	swcMinify: true,
	// images: {
	// 	// https://nextjs.org/docs/api-reference/next/image#remote-patterns
	// 	remotePatterns: [
	// 		{
	// 			protocol: "http",
	// 			hostname: "**",
	// 			// port: "",
	// 			pathname: "**",
	// 		},
	// 	],
	// },
	experimental: {
		appDir: true,
		// enableUndici: true,
		// outputFileTracingRoot: path.join(__dirname, "../../"),
		// https://nextjs.org/docs/advanced-features/output-file-tracing
		// turbotrace:{
		//   contextDirectory: path.join(__dirname, "../../")
		// },
	},
};

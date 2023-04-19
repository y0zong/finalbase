import themePerfight from "lib/perfight";
import "./globals.css";

export default function html({ children }: { children: JSX.Element }) {
	return (
		<html lang='en' suppressHydrationWarning={true}>
			<head>
				<title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/svg" href="/favicon.svg" />
				<script
					// rome-ignore lint/security/noDangerouslySetInnerHtml: <it's safe here>
					dangerouslySetInnerHTML={{ __html: themePerfight("bp4-dark") }}
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}

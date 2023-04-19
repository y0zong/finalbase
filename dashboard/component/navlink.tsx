"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function NavLink({
	href,
	className,
	children,
	text,
	end,
}: {
	href: string;
	text?: string;
	className?: string;
	end?: boolean;
	children?: React.ReactNode | string;
}) {
	const path = usePathname();
	const active =
		href === "/" ? /^(\/|\/(\?|\#).*)$/.test(path) : path?.startsWith(href);

	return (
		<Link
			href={href}
			className={clsx(
				"navlink",
				className,
				{ active, end },
				"tw-p-[5px_7px] tw-rounded hover:tw-bg-[var(--action-background)]",
			)}
		>
			{text || children}
		</Link>
	);
}

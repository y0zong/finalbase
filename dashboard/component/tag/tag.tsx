import clsx from "clsx";
import React, { useState, useEffect } from "react";
import type { Intent } from "@comp/baseline";
import { CSS_VERSION_PREFIX } from "../version";
import "./style.css";

export default function Tag(props: TagProps) {
	const { className, children, icon, intent, round, minimal, ...rest } = props;
	const [loading, setStatus] = useState(false);
	const classGroup = clsx(intent, { round, minimal });
	return (
		<tag className={classGroup}>
			{icon}
			{typeof children === "string" ? <span>{children}</span> : children}
		</tag>
	);
}

export type TagProps = {
	className?: string;
	children: React.ReactElement | string;
	intent?: Intent;
	icon?: string;
	iconRight?: string;
	round?: boolean;
	removable?: boolean;
	minimal?: boolean;
};

declare global {
	namespace JSX {
		interface IntrinsicElements {
			tag: React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			>;
		}
	}
}

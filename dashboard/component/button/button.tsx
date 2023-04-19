import clsx from "clsx";
import React, { useState, useEffect } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { Intent } from "@comp/baseline";
import Loading from "@comp/loading/loading";
import { CSS_VERSION_PREFIX } from "../version";
import "./style.css";

export default function Button(props: ButtonProps) {
	const {
		className,
		children,
		intent,
		minimal,
		outlined,
		fill,
		icon,
		onClick,
		...rest
	} = props;
	const [loading, setStatus] = useState(false);
	const classGroup = clsx(
		intent,
		{ text: minimal, outlined, loading, fill },
		className,
	);
	return (
		<button
			className={classGroup}
			{...rest}
			onClick={async () => {
				if (onClick) {
					setStatus(true);
					await onClick();
					setStatus(false);
				}
			}}
		>
			{icon}
			{typeof children === "string" ? <span>{children}</span> : children}
			{loading && <Loading />}
		</button>
	);
}

export type ButtonProps = {
	className?: string;
	children: React.ReactElement|React.ReactElement[] | string;
	intent?: Intent;
	outlined?: boolean;
	icon?: React.ReactElement;
	minimal?: boolean;
	fill?: boolean;
	onClick?: () => Promise<any>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

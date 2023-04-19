import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ButtonHTMLAttributes } from "react";
import type { Intent } from "@comp/baseline";
import Loading from "@comp/loading/loading";
import { CSS_VERSION_PREFIX } from "../version";
import "./style.css";
import Button from "@comp/button/button";

export default function Dialog(props: DialogProps) {
	const {
		className,
		children,
		open,
		closeFn,
		onSubmit,
		title,
		icon,
		dir,
		submitLabel,
		...rest
	} = props;
	const position = dir || "center";
	const [loading, setStatus] = useState(false);
	const classGroup = clsx("content", dir || "center", className);
	if (open) {
		return createPortal(
			<div className="miuiu-dialog">
				<div className="backdrop" />
				<div className={classGroup}>
					{(icon || title) && (
						<section>
							{icon}
							{title && <h3>{title}</h3>}
						</section>
					)}
					<div>{children}</div>
					<footer>
						<Button onClick={async () => closeFn()}>
							{submitLabel || "cancel"}
						</Button>
						<Button intent="primary" onClick={onSubmit}>
							{submitLabel || "sure"}
						</Button>
					</footer>
				</div>
			</div>,
			document.body,
		);
	}
	return null;
}

export type DialogProps = {
	className?: string;
	children: React.ReactElement | string;
	open?: boolean;
	title?: string;
	icon?: React.ReactElement;
	closeFn: () => void;
	dir?: "center" | "top" | "bottom" | "left" | "right";
	submitLabel?: string;
	onSubmit?: () => Promise<any>;
};

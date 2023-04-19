import clsx from "clsx";
import React, { useState, useEffect } from "react";
import type { InputHTMLAttributes } from "react";
import type { Intent } from "@comp/baseline";
import Loading from "@comp/loading/loading";
import { CSS_VERSION_PREFIX } from "../version";
import "./style.css";

export default function Input(props: ButtonProps) {
	const { className, left, right, intent, name, type, ...rest } =
		props;
	const [loading, setStatus] = useState(false);
	const classGroup = clsx("miuiu-input", intent, className);
	return (
		<label htmlFor={name} className={classGroup}>
			{left}
			<input type={type || "type"} name={name} {...rest} />
			{right}
		</label>
	);
}

export type ButtonProps = {
	className?: string;
	intent?: Intent;
	left?: React.ReactElement;
	right?: React.ReactElement;
} & InputHTMLAttributes<HTMLInputElement>;

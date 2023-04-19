import clsx from "clsx";
import React, { useState, useEffect, InputHTMLAttributes } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { Intent } from "@comp/baseline";
import Input from "./input";
import Loading from "@comp/loading/loading";
import { CSS_VERSION_PREFIX } from "../version";
import "./style.css";

export default function Fields(props: FieldsProps) {
	const {
		className,
		children,
		intent,
		label,
		labelDes,
		fieldsDes,
		inline,
		...inputProps
	} = props;
	const [loading, setStatus] = useState(false);
	const classGroup = clsx("miuiu-fields", intent, { inline }, className);
	if (inline) {
		return (
			<tr className={classGroup}>
				<td>
					{label && (
						<div>
							<h5>{label}</h5>
							{labelDes && <span>{labelDes}</span>}
						</div>
					)}
				</td>
				<td>
					<div>
						{children || <Input {...inputProps} />}
						{fieldsDes}
					</div>
				</td>
			</tr>
		);
	}
	return (
		<section className={classGroup}>
			{label && (
				<div>
					<h5>{label}</h5>
					{labelDes && <span>{labelDes}</span>}
				</div>
			)}
			<div>
				<Input {...inputProps} />
				{fieldsDes}
			</div>
		</section>
	);
}

export type FieldsProps = {
	className?: string;
	children?: React.ReactElement;
	intent?: Intent;
	name: InputHTMLAttributes<HTMLInputElement>["name"];
	inline?: boolean;
	label?: string;
	labelDes?: string;
	fieldsDes?: string;
	type?: InputHTMLAttributes<HTMLInputElement>["type"];
	placeholder?: InputHTMLAttributes<HTMLInputElement>["placeholder"];
	left?: React.ReactElement;
	right?: React.ReactElement;
};

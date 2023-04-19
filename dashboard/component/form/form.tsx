"use client";
import clsx from "clsx";
import React, { useState, InputHTMLAttributes, forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import Fields from "./fields";
import Button from "@comp/button/button";
import { useForm, Controller } from "react-hook-form";
import "./style.css";

export default forwardRef(function Form(
	props: FormProps,
	ref: React.ForwardedRef<HTMLFormElement>,
) {
	const { className, fields, submit, submitFn, inline, ...rest } = props;
	const [loading, setStatus] = useState(false);
	const classGroup = clsx("miuiu-form", { inline }, className);
	const { control, setValue, handleSubmit } = useForm({});
	console.log(fields);
	return (
		<form ref={ref} className={classGroup} onSubmit={handleSubmit(submitFn)}>
			<section>
				{fields.map(({ name, render, ...rest }) => (
					<Controller
						name={name}
						control={control}
						render={({ field }) =>
							render ? (
								<Fields name={name} inline={inline} {...rest}>
									{render({ ...field, setValue })}
								</Fields>
							) : (
								<Fields inline={inline} {...rest} {...field} />
							)
						}
					/>
				))}
			</section>
			{typeof submit === "string" ? (
				<Button fill={true} intent="primary" type="submit">
					{submit}
				</Button>
			) : (
				submit
			)}
		</form>
	);
});

export type FieldsOf = {
	name: string;
	label: string;
	labelDes?: string;
	fieldsDes?: string;
	type?: InputHTMLAttributes<HTMLInputElement>["type"];
	placeholder?: InputHTMLAttributes<HTMLInputElement>["placeholder"];
	validation?: {
		required?: boolean;
		min?: string;
		max?: string;
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
	};
	left?: React.ReactElement;
	render?: ((field: any) => React.ReactElement) | false | undefined | null;
};
export type FormProps = {
	className?: string;
	inline?: boolean;
	fields: FieldsOf[];
	submit?: React.ReactElement | string;
	submitFn: (data: any) => Promise<any>;
} & ButtonHTMLAttributes<HTMLInputElement>;

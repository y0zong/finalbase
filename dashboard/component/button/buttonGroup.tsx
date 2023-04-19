import clsx from "clsx";
import React from "react";

export default function ButtonGroup(props: ButtonGroupProps) {
	const { className, children, minimal, vertical } = props;
	const classGroup = clsx({ vertical }, className);
	return <group className={classGroup}>{children}</group>;
}
export type ButtonGroupProps = {
	className?: string;
	children: React.ReactElement | React.ReactElement[];
	vertical?: boolean;
	minimal?: boolean;
};

declare global {
	namespace JSX {
		interface IntrinsicElements {
			group: React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			>;
		}
	}
}

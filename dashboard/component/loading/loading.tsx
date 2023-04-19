import clsx from "clsx";
import React from "react";
import type { Intent } from "@comp/baseline";
import "./style.css";

export default function Loading(props: { intent?: Intent }) {
	const { intent } = props;
	const classGroup = clsx({ intent });
	return (
		<loading className={classGroup}>
			<span />
			<span />
			<span />
		</loading>
	);
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			loading: React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			>;
		}
	}
}

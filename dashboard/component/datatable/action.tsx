"use client";
import React, { useState } from "react";
import Button from "@comp/button/button";
import Input from "@comp/form/input";
import Cross from "@comp/icon/cross";

export default function Action(props: {
	isSelected: boolean;
	selectedCount: number;
	clearFn: () => Promise<any>;
	searchFn: (str: string) => void;
	selectionElements?: React.ReactElement;
	actionElements?: React.ReactElement;
	clearText?: string;
	selecteText?: string;
	searchPlaceholderText?: string;
}) {
	if (props.isSelected) {
		return (
			<section className="flex-x">
				<Button icon={<Cross />} onClick={props.clearFn}>
					<span>{props.clearText || "Clear"}</span>
					<span className="tw-text-des">
						(<strong>{props.selectedCount}</strong>{" "}
						{props.selecteText || "selected"})
					</span>
				</Button>
				{props.selectionElements}
			</section>
		);
	}
	return (
		<section className="flex-x">
			<Input
				placeholder={props.searchPlaceholderText || "search"}
				onChange={({ target }) => props.searchFn(target.value)}
			/>
			{props.actionElements}
		</section>
	);
}

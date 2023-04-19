"use client";
import { useState } from "react";

export default function Upload(props: {
	text?: string;
	className?: string;
	onUpload: (file: File) => Promise<string> | void;
}) {
	const { className, onUpload, ...rest } = props;
	const [url, setUrl] = useState<string | Blob | null>(null);
	return (
		<div className={`${className}`}>
			<input
				type="file"
				{...rest}
				onChange={({ target }) => {
					if (target.files?.length) {
						const fn = onUpload(target.files[0]);
						if (typeof fn?.then === "function") {
							fn.then(setUrl);
						} else {
							setUrl(URL.createObjectURL(target.files[0]));
						}
					}
				}}
			/>
			<section
				style={
					url
						? {
								backgroundImage: `url(${url})`,
								backgroundSize: "contain",
						  }
						: {}
				}
			/>
		</div>
	);
}

"use client";
import React, { useState, useRef } from "react";
import { Table } from "@comp/datatable/table";
import Upload from "@comp/upload";
import { addFabric, getFabricType, deleteFabric, fabricsColumnMap } from "service/db";

import Button from "@comp/button/button";
import Dialog from "@comp/dialog/dialog";
import Form from "@comp/form/form";
import Select from "@comp/select/select";
import InfoSign from "@comp/icon/infoSign";

const toBase64 = (file: File) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
export default function FabricAction(props: { table: Table<any> }) {
	const [open, setOpen] = useState(false);
	const formRef = useRef(null);
	return (
		<>
			<Button onClick={async () => setOpen(true)}>添加新品</Button>
			<Dialog
				icon={<InfoSign />}
				title="添加新商品"
				className="tw-w-96"
				open={open}
				closeFn={() => setOpen(false)}
				onSubmit={() => Promise.resolve((formRef.current as unknown as HTMLInputElement).dispatchEvent(
					new Event("submit", { cancelable: true, bubbles: true })
				))}
			>
				<Form
					inline={true}
					ref={formRef}
					submitFn={addFabric}
					fields={Object.keys(fabricsColumnMap).map((key) => ({
						name: key,
						label: fabricsColumnMap[key as keyof typeof fabricsColumnMap],
						...(key === "item_img"
							? {
									render: ({ setValue }) => (
										<Upload
											className="upload"
											onUpload={(file) =>
												toBase64(file).then((url) => {
													setValue(key, { base64: url });
													return url as string;
												})
											}
										/>
									),
							  }
							: key === "item_type"
							? {
									render: ({ setValue }) => (
										<Select<{ id: string; name: string }>
											options={getFabricType as any}
											render={({ name }) => <span>{name}</span>}
											selectedRender={(item) => (
												<span>{item?.name || "选择类型"}</span>
											)}
											onSelected={({ id }) => setValue(key, id)}
										/>
									),
							  }
							: {}),
					}))}
				/>
			</Dialog>
		</>
	);
}

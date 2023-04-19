"use client";
import React, { useState, useEffect } from "react";
import DataTable, { CellContext, Table } from "@comp/datatable/table";
import IndeterminateCheckbox from "@comp/indeterminateCheckbox";
import {
	getFabric,
	deleteFabric,
	getUser,
	authorizedUser,
} from "service/db";

import Tag from "@comp/tag/tag";
import Button from "@comp/button/button";
import ButtonGroup from "@comp/button/buttonGroup";

import FabricAction from "./fabricAction";

let actionItems: ((table: Table<any>) => React.ElementType) | undefined =
	undefined;
let selectionItems: ((table: Table<any>) => React.ElementType) | undefined =
	undefined;
export default function Page({ params }: { params: { table: string } }) {
	const [data, setData] = useState<{ records: any[]; columns: any[] }>({
		records: [],
		columns: [],
	});

	useEffect(() => {
		let tableGetter: ((arg?: any) => Promise<any>) | undefined = undefined;
		switch (params.table) {
			case "fabrics":
				tableGetter = getFabric;
				actionItems = (t) => FabricAction;
				selectionItems = FabricSelection;
				break;
			case "users":
				tableGetter = getUser;
				actionItems = UserAction;
				selectionItems = UserSelection;
				break;
			default:
				throw 404;
		}

		if (tableGetter) {
			tableGetter().then(({ data, columnMap }) => {
				setData({
					records: data,
					columns: Object.keys(columnMap).map((key, index) => {
						if (index === 0) {
							return {
								accessorKey: key,
								header: ({ table }: CellContext<any, any>) => (
									<div className="tw-flex tw-items-center tw-space-x-2">
										<IndeterminateCheckbox
											{...{
												checked: table.getIsAllRowsSelected(),
												indeterminate: table.getIsSomeRowsSelected(),
												onChange: table.getToggleAllRowsSelectedHandler(),
											}}
										/>
										<span>{columnMap[key]}</span>
									</div>
								),
								cell: ({ row, getValue }: CellContext<any, any>) => {
									const val = getValue();
									return (
										<div className="tw-flex tw-items-center tw-space-x-2">
											<IndeterminateCheckbox
												{...{
													checked: row.getIsSelected(),
													indeterminate: row.getIsSomeSelected(),
													onChange: row.getToggleSelectedHandler(),
												}}
											/>
											<span>{key === "item_type" ? val.name : val}</span>
										</div>
									);
								},
							};
						}
						return {
							accessorKey: key,
							header: columnMap[key],
							cell: ({
								row,
								column,
								getValue,
								table,
							}: CellContext<any, any>) => {
								if (key === "authorized") {
									const isAuthorized = getValue();
									return (
										<div className="tw-flex tw-items-center">
											<Tag intent={isAuthorized ? "success" : "warning"}>
												{isAuthorized ? "已授权" : "待授权"}
											</Tag>
											{!isAuthorized && (
												<Button
													intent="success"
													className="tw-ml-2"
													onClick={() => {
														return authorizedUser(row.original.id).then(
															({ data, error }) => {
																console.log(data, error);
																if (!error) {
																	// @ts-ignore
																	table.options.meta?.cellUpdate(
																		row.index,
																		column.id,
																		true,
																	);
																}
															},
														);
													}}
												>
													授权
												</Button>
											)}
										</div>
									);
								}
								const val = getValue();
								if (key === "item_img") {
									return (
										<img src={val.base64} className="tw-w-12 tw-h-12" alt="" />
									);
								}
								if (key === "item_type") {
									return val.name;
								}
								return val;
							},
						};
					}),
				});
			});
		}
	}, [params.table]);
	return (
		<DataTable
			columns={data?.columns}
			data={data?.records}
			actionItems={actionItems}
			selectionItems={selectionItems}
			pagination={{
				range: [20, 50, 100],
				prevLabel: "上一页",
				nextLabel: "下一页",
				perLabel: "每页",
				ofLabel: "共",
				recordLabel: "条",
			}}
		/>
	);
}

function UserAction(table: Table<any>) {
	return () => <></>;
}

function UserSelection(table: Table<any>) {
	return () => (
		<ButtonGroup>
			<Button intent="success">授权</Button>
			<Button intent="danger">删除</Button>
		</ButtonGroup>
	);
}

function FabricSelection(table: Table<any>) {
	console.log(table.getSelectedRowModel().rows);
	return () => (
		<ButtonGroup>
			<Button
				intent="danger"
				onClick={() =>
					deleteFabric(
						table.getSelectedRowModel().rows.map((r) => r.original.id),
					)
				}
			>
				删除
			</Button>
		</ButtonGroup>
	);
}

"use client";
import clsx from "clsx";
import React, { useState, useRef, useEffect } from "react";
import {
	Column,
	Table,
	ExpandedState,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getExpandedRowModel,
	ColumnDef,
	flexRender,
} from "@tanstack/react-table";
import Button from "@comp/button/button";
import ButtonGroup from "@comp/button/buttonGroup";
import Input from "@comp/form/input";
import Tag from "@comp/tag/tag";
import Action from "./action";
import "./style.css";

export type { Table, CellContext } from "@tanstack/react-table";
export type RowInfo = {}

type PaginationOption = {
	range: number[];
	prevLabel?: string;
	nextLabel?: string;
	perLabel?: string;
	ofLabel?: string;
	recordLabel?: string;
};
export default function DataTable<T>(props: {
	className?: string;
	columns: ColumnDef<T>[] | undefined | null;
	data: T[] | undefined | null;
	actionItems?: (table: Table<T>) => React.ElementType;
	selectionItems?: (table: Table<T>) => React.ElementType;
	pagination?: PaginationOption;
}) {
	const {className} = props
	const classGroup = clsx("miuiu-table flex-y h-full", className);
	const [data, setData] = useState<T[]>(props.data || []);
	const [expanded, setExpanded] = useState<ExpandedState>({});
	const [globalFilter, setGlobalFilter] = React.useState("");

	const table = useReactTable({
		data,
		columns: props.columns || [],
		state: {
			expanded,
			globalFilter,
		},
		meta: {
			cellUpdate(rIndex: number, cIndex: number, val: any) {
				setData((old) =>
					old.map((row, index) => {
						if (index === rIndex) {
							return {
								...old[rIndex],
								[cIndex]: val,
							};
						}
						return row;
					}),
				);
			},
		},
		onGlobalFilterChange: setGlobalFilter,
		onExpandedChange: setExpanded,
		// getSubRows: (row) => row.subRows,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		debugTable: false,
	});

	useEffect(() => {
		setData(props.data || []);
	}, [props.data]);

	const SelectionElements = props.selectionItems?.(table);
	const ActionElements = props.actionItems?.(table);
	return (
		<div className={classGroup}>
			<Action
				clearFn={() => new Promise(resolve => resolve(table.resetRowSelection))}
				searchFn={setGlobalFilter}
				selectedCount={table.getSelectedRowModel().rows.length}
				isSelected={
					table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
				}
				clearText="取消"
				selecteText="已选"
				searchPlaceholderText="搜索"
				selectionElements={
					SelectionElements ? <SelectionElements /> : undefined
				}
				actionElements={ActionElements ? <ActionElements /> : undefined}
			/>
			<div className="tw-grow tw-overflow-auto">
				<table className="bp4-html-table tw-py-4">
					<thead className="tw tw-sticky tw-top-0">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<th
											key={header.id}
											colSpan={header.colSpan}
											className="tw-whitespace-nowrap"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
												  )}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody className="tw-overflow-auto">
						{table.getRowModel().rows.map((row) => {
							return (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => {
										return (
											<td key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{props.pagination && (
				<section className="flex-x">
					<ButtonGroup>
						<Button
							disabled={!table.getCanPreviousPage()}
							onClick={() => new Promise(resolve => resolve(table.previousPage))}
						>
							{props.pagination.prevLabel || "Prev"}
						</Button>
						<Button disabled={!table.getCanNextPage()} onClick={() => new Promise(resolve => resolve(table.nextPage))}>
							{props.pagination.nextLabel || "Next"}
						</Button>
					</ButtonGroup>
					<Input
						left={
							<Tag minimal={true}>
								<select
									value={table.getState().pagination.pageSize}
									onChange={(e) => {
										table.setPageSize(Number(e.target.value));
									}}
								>
									{props.pagination.range.map((size) => (
										<option key={size} value={size}>
											{size} {props.pagination?.perLabel || "per Page"}
										</option>
									))}
								</select>
							</Tag>
						}
						onChange={(e) => {
							const page = e.target.value ? Number(e.target.value) - 1 : 0;
							table.setPageIndex(page);
						}}
						right={
							<div className="pagination-right">
								<span>{props.pagination.ofLabel || "of"}</span>
								<Tag minimal={true}>{String(table.getPageCount())}</Tag>
							</div>
						}
						defaultValue={String(table.getState().pagination.pageIndex + 1)}
					/>
					<div className="tw-flex tw-items-center tw-space-x-1">
						<strong>{table.getRowModel().rows.length}</strong>
						<span>{props.pagination.ofLabel || "of"}</span>
						<span>{table.getCoreRowModel().rows.length}</span>
						<span>{props.pagination.recordLabel || "Records"}</span>
					</div>
				</section>
			)}
		</div>
	);
}

// function Filter({
// 	column,
// 	table,
// }: {
// 	column: Column<any, any>;
// 	table: Table<any>;
// }) {
// 	const firstValue = table
// 		.getPreFilteredRowModel()
// 		.flatRows[0]?.getValue(column.id);

// 	const columnFilterValue = column.getFilterValue();

// 	return typeof firstValue === "number" ? (
// 		<div className="flex space-x-2">
// 			<input
// 				type="number"
// 				value={(columnFilterValue as [number, number])?.[0] ?? ""}
// 				onChange={(e) =>
// 					column.setFilterValue((old: [number, number]) => [
// 						e.target.value,
// 						old?.[1],
// 					])
// 				}
// 				placeholder={`Min`}
// 				className="w-24 border shadow rounded"
// 			/>
// 			<input
// 				type="number"
// 				value={(columnFilterValue as [number, number])?.[1] ?? ""}
// 				onChange={(e) =>
// 					column.setFilterValue((old: [number, number]) => [
// 						old?.[0],
// 						e.target.value,
// 					])
// 				}
// 				placeholder={`Max`}
// 				className="w-24 border shadow rounded"
// 			/>
// 		</div>
// 	) : (
// 		<input
// 			type="text"
// 			value={(columnFilterValue ?? "") as string}
// 			onChange={(e) => column.setFilterValue(e.target.value)}
// 			placeholder={`Search...`}
// 			className="w-36 border shadow rounded"
// 		/>
// 	);
// }

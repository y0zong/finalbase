import "./style.css";
import React, { useEffect, useState, useRef } from "react";
import {
	useFloating,
	useClick,
	useDismiss,
	useRole,
	useListNavigation,
	useInteractions,
	FloatingFocusManager,
	useTypeahead,
	offset,
	flip,
	size,
	autoUpdate,
	FloatingPortal,
} from "@floating-ui/react";

export default function Select<T extends { id: string }>(
	props: SelectOptions<T>,
) {
	const [options, setOptions] = useState<T[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const { x, y, strategy, refs, context } = useFloating({
		placement: "bottom-start",
		open: isOpen,
		onOpenChange: setIsOpen,
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(5),
			flip({ padding: 10 }),
			size({
				apply({ rects, elements, availableHeight }) {
					Object.assign(elements.floating.style, {
						maxHeight: `${availableHeight}px`,
						width: `${rects.reference.width}px`,
					});
				},
				padding: 10,
			}),
		],
	});

	const listRef = useRef<Array<HTMLElement | null>>([]);
	const listContentRef = useRef((options || []).map((o) => o.id));
	const isTypingRef = useRef(false);

	const click = useClick(context, { event: "mousedown" });
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "listbox" });
	const listNav = useListNavigation(context, {
		listRef,
		activeIndex,
		selectedIndex,
		onNavigate: setActiveIndex,
		// This is a large list, allow looping.
		loop: true,
	});
	const typeahead = useTypeahead(context, {
		listRef: listContentRef,
		activeIndex,
		selectedIndex,
		onMatch: isOpen ? setActiveIndex : setSelectedIndex,
		onTypingChange(isTyping) {
			isTypingRef.current = isTyping;
		},
	});

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
		[click, dismiss, role, listNav, typeahead],
	);

	const handleSelect = (index: number) => {
		setSelectedIndex(index);
		setIsOpen(false);
		props.onSelected?.(options[index]);
	};

	const selectedItem =
		selectedIndex !== null ? options[selectedIndex] : undefined;

	useEffect(() => {
		if (Array.isArray(props.options)) {
			setOptions(props.options);
		} else if (typeof props.options === "function") {
			props.options().then(setOptions);
		}
	}, [props.options]);
	return (
		<section>
			<div
				tabIndex={0}
				ref={refs.setReference}
				aria-labelledby="select-label"
				aria-autocomplete="none"
				style={{ width: 150, lineHeight: 2, margin: "auto" }}
				{...getReferenceProps()}
			>
				{props.selectedRender(selectedItem)}
			</div>
			<FloatingPortal>
				{isOpen && (
					<FloatingFocusManager context={context} modal={false}>
						<div
							ref={refs.setFloating}
							style={{
								position: strategy,
								top: y ?? 0,
								left: x ?? 0,
								overflowY: "auto",
								background: "#eee",
								minWidth: 100,
								borderRadius: 8,
								outline: 0,
							}}
							{...getFloatingProps()}
						>
							{(options || []).map((value, i) => (
								<div
									key={value.id}
									ref={(node) => {
										listRef.current[i] = node;
									}}
									role="option"
									tabIndex={i === activeIndex ? 0 : -1}
									aria-selected={i === selectedIndex && i === activeIndex}
									style={{
										padding: 10,
										cursor: "default",
										background: i === activeIndex ? "cyan" : "",
									}}
									{...getItemProps({
										// Handle pointer select.
										onClick() {
											handleSelect(i);
										},
										// Handle keyboard select.
										onKeyDown(event) {
											if (event.key === "Enter") {
												event.preventDefault();
												handleSelect(i);
											}

											if (event.key === " " && !isTypingRef.current) {
												event.preventDefault();
											}
										},
										onKeyUp(event) {
											if (event.key === " " && !isTypingRef.current) {
												handleSelect(i);
											}
										},
									})}
								>
									{props.render(value)}
									<span
										aria-hidden
										style={{
											position: "absolute",
											right: 10,
										}}
									>
										{i === selectedIndex ? " ✓" : ""}
									</span>
								</div>
							))}
						</div>
					</FloatingFocusManager>
				)}
			</FloatingPortal>
		</section>
	);
}

export type SelectOptions<T extends { id: string }> = {
	options: T[] | (() => Promise<T[]>);
	render: (fields: T) => React.ReactElement;
	selectedRender: (fields: T | undefined) => React.ReactElement;
	onSelected?: (fields: T) => void;
};

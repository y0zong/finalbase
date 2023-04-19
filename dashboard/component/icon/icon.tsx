import "./style.css"

export default function Icon(props: { data: string[] }) {
	return (
		<svg className="icon" viewBox="0 0 16 16">
			{props.data.map((d) => (
				<path d={d} />
			))}
		</svg>
	);
}

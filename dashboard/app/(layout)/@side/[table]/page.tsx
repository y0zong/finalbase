import NavLink from "@comp/navlink";

export default function Page() {
	return (
		<div className="tw-flex tw-flex-col tw-px-8 tw-space-y-2">
			<NavLink end={true} text="布料管理" href="/fabrics" />
			<NavLink end={true} text="授权管理" href="/users" />
		</div>
	);
}

"use client";
import { useState, useEffect } from "react";
import Button from "@comp/button/button";
import Dialog from "@comp/dialog/dialog";
import InfoSign from "./icon/infoSign";
import Link from "next/link";
import Image from "next/image";
import NavLink from "./navlink";
// import { PostgrestClient } from "@supabase/postgrest-js";

// // rome-ignore lint/style/noNonNullAssertion: <not null>
// const db = new PostgrestClient(process.env.DB_ENDPORT!, {
// 	schema: "dashboard",
// });

export default function Nav() {
	const [showHelp, setHelpVisiable] = useState(false);
	// const [modules, setModule] = useState([]);
	// async function getModule() {
	// 	const { data } = await db.from("modules").select();
	// 	setModule(data);
	// }
	// useEffect(() => {
	// 	getModule();
	// }, []);
	return (
		<nav>
			<Button minimal={true}>退出</Button>
			<Dialog
				icon={<InfoSign />}
				title="关于"
				open={showHelp}
				closeFn={() => setHelpVisiable(false)}
			>
				<div>help</div>
			</Dialog>
		</nav>
	);
}

"use client";
import Image from "next/image";
import { validToken } from "service/db";
import Nav from "component/nav";
import logo from "@public/180.jpg";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// @ts-ignore
export default function Dashboard({ group, side, children }) {
	const [islogin, set] = useState<boolean | undefined>(undefined);
	const route = useRouter();
	useEffect(() => {
		validToken().then(set);
	}, []);
	if (islogin === true) {
		return (
			<>
				<Nav />
				{/* {group && <group>{group}</group>} */}
				{side && <side>{side}</side>}
				<main>{children}</main>
				<section className="center">
					<Image src={logo} alt="logo" width={36} height={36} />
				</section>
				<section className="tw-flex tw-px-3 tw-items-center tw-text-2xl tw-font-medium">
					{process.env.NEXT_PUBLIC_APP_NAME}
				</section>
			</>
		);
	}
	if (islogin === false) {
		route.replace("/login");
	}
	return null;
}

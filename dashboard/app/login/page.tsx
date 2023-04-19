"use client"
import Form from "@comp/form/form";
import Image from "next/image";
import logo from "@public/180.jpg";
import loginBg from "@public/firebase_welcome.png";
import Lock from "@comp/icon/lock";
import Phone from "@comp/icon/phone";
import { login } from "service/db";
import { redirect } from "next/navigation";

export default function Page() {
	return (
		<>
			<div
				className="tw-bg-gg"
				style={{ gridRow: "1/span 2", gridColumn: "1/span 2" }}
			>
				<div className="tw-relative tw-h-full tw-w-[150%]">
					<Image
						className="tw-object-contain"
						style={{ transform: "rotateY(180deg)" }}
						src={loginBg}
						alt={"welcome"}
						fill={true}
					/>
				</div>
			</div>
			<div className="center" style={{ gridRow: "1/span 2" }}>
				<div className="card">
					<div className="tw-flex tw-items-center tw-space-x-4 tw-mb-4">
						<div className="tw-relative tw-w-12 tw-h-12">
							<Image
								className="tw-object-contain tw-py-[8px]"
								src={logo}
								alt="logo"
								fill={true}
							/>
						</div>
						<h1 className="tw-text-3xl">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
					</div>
					<Form
						inline={true}
						fields={[
							{
								name: "email",
								label: "手机号",
								placeholder: "手机号",
								left: <Phone />,
							},
							{
								name: "pass",
								label: "密码",
								type: "password",
								placeholder: "密码",
								left: <Lock />,
							},
						]}
						submit="登录"
						submitFn={async(payload) => {
							if (await login(payload)) {
								// redirect("/fabrics")
								location.href = `${location.origin}/fabrics`
							}
						}}
					/>
				</div>
			</div>
		</>
	);
}

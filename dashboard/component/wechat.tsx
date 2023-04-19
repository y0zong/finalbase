"use client";
import Script from "next/script";

export function WechatLogin() {
	return (
		<div>
			<Script
				src="http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"
				onLoad={() => {
					// @ts-ignore
					new WxLogin({
						self_redirect: true,
						id: "login_container",
						appid: process.env.PUBLIC_WECHAT_APP_ID,
						scope: "snsapi_login",
						redirect_uri: "http://localhost:3001",
						state: "",
						style: "",
						href: "",
					});
				}}
			/>
			<div id='login_container' />
		</div>
	);
}

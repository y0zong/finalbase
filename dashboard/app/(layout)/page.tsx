"use client";
import { useRouter,redirect } from "next/navigation";
import { useEffect } from "react";
export default function Home() {
	const route = useRouter();
	// useEffect(() => {
	// 	route.replace("/fabrics");
	// }, [route]);
	// requestAnimationFrame(()=> {
	// 	route.replace("/fabrics");
	// })
	location.href = `${location.origin}/fabrics`
	return null;
}

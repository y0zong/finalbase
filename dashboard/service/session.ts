import { cookies, headers } from "next/headers";

export enum AUTH_KEY {
    STATUS = "Auth-Status",
    ERROR = "Auth-Error",
    OWNER = "Auth-Owner",
    AUTH = "auth",
    TOKEN = "token"
}
export function validSession() {
    const cookie = cookies()
    const session = cookie.get(AUTH_KEY.TOKEN)?.value || ""
    return session
}
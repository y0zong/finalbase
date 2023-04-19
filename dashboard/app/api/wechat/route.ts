import { NextRequest, NextResponse } from "next/server";
import { PostgrestClient } from "@miuiu/postgrest";
// import pg from "service/postgrest";

const pg = new PostgrestClient(process.env.DB_ENDPORT!)
export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code")
    const response = await fetch(`https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_KEY}&js_code=${code}&grant_type=authorization_code`)
    const data = await response.json()
    if (data.errmsg) {
        console.log(data, process.env)
        return new Response(null, { status: 400 })
    }
    const result = await pg.from('users').select().eq('wechat_uuid', data.openid).limit(1).single()
    if (result.error || !result.data.id) {
        return NextResponse.json({ uuid: data.openid })
    }
    return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
    const { uuid, ...rest } = await req.json()
    const result = await pg.from('users').insert(rest).select().limit(1).single()
    return NextResponse.json(result)
}
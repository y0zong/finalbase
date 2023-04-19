import { PostgrestClient } from "@miuiu/postgrest";
const memStorage: { [key: string]: string } = {}
let store: Storage
if (typeof localStorage === "undefined") {
    store = {
        getItem(key) {
            return memStorage[key]
        },
        setItem(key, value) {
            memStorage[key] = value
        },
        removeItem(key) {
            delete memStorage[key]
        },
        clear() {
            Object.keys(memStorage).map(key => delete memStorage[key])
        },
        key(index) {
            return Object.keys(memStorage)[index]
        },
        get length() { return Object.keys(memStorage).length },
    }
} else {
    store = localStorage
}
const token = store.getItem("token")
let db = new PostgrestClient(process.env.NEXT_PUBLIC_API_ENDPORT!, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
export const fabricsColumnMap = {
    item_type: "类型",
    item_no: "货号",
    item_name: "品名",
    item_weight: "克重",
    item_price: "来价",
    item_img: "样图",
    item_composition: "成分",
    item_sample_avaliable: "来样时间",
    wholesaler: "厂家",
    wholesaler_item_no: "厂家货号",
    wholesaler_item_weight: "厂家克重",
};
export const usersColumnMap = {
    name: "名字",
    phone: "手机号",
    company: "公司名称",
    authorized: "授权管理",
    item_img: "样图",
    wechat_uuid: "微信ID",
};

export async function getFabric(search?: string) {
    const query = db.from("fabrics")
    if (search) {
        const data = await query.select('*, item_type(name)')
        return { data, columnMap: fabricsColumnMap }
    }
    const { data, error } = await query.select('*, item_type(name)')
    return { data, columnMap: fabricsColumnMap }
}
export async function addFabric(data: any) {
    return await db.from("fabrics").insert(data)
}
export async function deleteFabric(ids: string[]) {
    console.log(ids)
    return await db.from("fabrics").delete().in("id", ids)
}
export async function getFabricType() {
    const { data } = await db.from("fabric_types").select()
    return data
}

export async function addFabricColumn(data: any) {
    return await db.from("information_schema.columns").insert(data).eq("table_name", "fabrics")
}

export async function getUser() {
    const { data } = await db.from("users").select()
    return { data, columnMap: usersColumnMap }
}

export async function authorizedUser(id: string) {
    return await db.from("users").update({ authorized: true }).eq("id", id)
}

export async function upload(data: File) {
    const body = new FormData()
    body.append("name", data.name)
    body.append("type", data.type)
    body.append("data", data)
    return await fetch(`${process.env.NEXT_PUBLIC_API_ENDPORT}/objects`, {
        method: "post",
        headers: {
            "Content-Profile": "storage",
            "Content-Type": "application/octet-stream",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoiZW1haWwiLCJleHAiOjE2ODE1OTgyNzh9.0ve3dS015rX2gpNLkHiU-1dSwtWCnUqUPyQYFn23rpY"
        },
        body: data
    })
}

export async function login(payload: { email: string, pass: string }): Promise<boolean> {
    const { data } = await (new PostgrestClient(process.env.NEXT_PUBLIC_API_ENDPORT!)).rpc("auth.login", payload)
    if (data.token) {
        store.setItem("token", data.token)
        db = new PostgrestClient(process.env.NEXT_PUBLIC_API_ENDPORT!, { headers: { 'Authorization': `Bearer ${data.token}` } })
        return true
    }
    return false
}

export async function validToken(): Promise<boolean> {
    const { error } = await db.rpc("islogin")
    if (error) {
        console.log(error)
        return false
    }
    return true
}
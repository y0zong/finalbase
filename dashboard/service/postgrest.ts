export class Postgrest {
    base: string | undefined;
    constructor(url?: string) {
        this.base = url || process.env.API_ENDPORT
    }

    async select(table: string, columns: string, filter?: string | string[]) {
        const { schema, name } = Postgrest.parseTable(table)
        let query = `select=${columns}`
        if (filter) {
            query += Array.isArray(filter) ? filter.map(f => `&${f}`) : `&${filter}`
        }
        const res = await this._fetch(name, query, schema)
        return await res.json()
    }

    async insert(table: string, kv: Object | Object[]) {
        const { schema, name } = Postgrest.parseTable(table)
        const keys = Object.keys(kv)
        const query = `columns=${keys.join(",")}`
        const res = await this._fetch(`post ${name}`, query, schema, kv)
        if (res.ok) {
            return 
        }
        return await res.json()
    }
    async upsert(table: string, kv: Object) {
        const { schema, name } = Postgrest.parseTable(table)
    }
    async update() { }
    async delete() { }

    async _fetch(route: string, query: string, schema: string, data?: Object, dataType: DataType = DataType.JSON) {
        let body
        const headers: { [key: string]: string } = { 'Content-Type': dataType }
        let [method, name] = route.split(" ")
        if (!name) {
            name = method
            method = 'get'
        }
        if (method === 'get') {
            headers['Accept-Profile'] = schema
        } else {
            headers['Content-Profile'] = schema
        }
        switch (dataType) {
            case DataType.FORM:
                break;

            case DataType.JSON:
            default:
                body = JSON.stringify(data)
                break;
        }
        if (this.base) {
            return await fetch(`${this.base}/${name}?${encodeURIComponent(query)}`, { method, headers, body })
        }
        throw "api endport is unknow"
    }

    static parseTable(table: string) {
        let [schema, name] = table.split(".")
        if (!name) {
            name = schema
            schema = 'public'
        }
        return { schema, name }
    }
}

enum DataType {
    JSON = 'application/json',
    FORM = 'application/x-www-form-urlencoded',
    BLOB = 'blob'
}

const pg = new Postgrest("http://localhost:3443");
export default pg;
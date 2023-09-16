import { Pool, createPool, RowDataPacket, OkPacket, ResultSetHeader, ProcedureCallPacket }  from "mysql2/promise";
import { DEBUG, ERROR, INFO } from "./logger";

interface DbConfig {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string
}

type DbResponse = OkPacket | RowDataPacket[] | ResultSetHeader[] | RowDataPacket[][] | OkPacket[] | ProcedureCallPacket;


let pool: Pool;


export function initDB (config: DbConfig) {
    INFO("DB initializing...");
    pool = createPool(config);
    INFO("DB initialized");
}

export async function query<T extends DbResponse>(query: string) {
    DEBUG("Executing query", {query});
    try {
        return await pool.query<T>(query);
    } catch (error) {
        ERROR("DB error", {query, error});
        return new Error("DB error");
    }
}

export async function select<T>(table:string, condition: string) {
    const sql = `SELECT * FROM ${table} WHERE ${condition}`;
    const result = await query<RowDataPacket[]>(sql);
    if (result instanceof Error) {
        return result as Error;
    }
    const [data,] = result;
    return data as T[];
}

export async function selectOne<T>(table: string, condition: string) {
    const sql = `SELECT * FROM ${table} WHERE ${condition} LIMIT 1`;
    const result = await query<RowDataPacket[]>(sql);
    if (result instanceof Error) {
        return result as Error;
    }
    const [data,] = result;
    if (data.length === 0) {
        return undefined;
    }
    return (data as T[])[0];
}

export async function insert(table: string, model: object | object[]) {
    const mustBeAffected = Array.isArray(model) ? model.length : 1;
    const {keys, values} = getKeysValues(model);
    const sql = `INSERT INTO ${table} ${keys} VALUES ${values}`;
    const result = await query<ResultSetHeader>(sql);
    if (result instanceof Error) {
        return result as Error;
    }
    const [data,] = result;
    return data.affectedRows === mustBeAffected;
}

export async function delet(table: string, condition: string) {
    const sql = `DELETE FROM ${table} WHERE ${condition}`
    const result = await query<ResultSetHeader>(sql);
    if (result instanceof Error) {
        return result as Error;
    }
    const [data,] = result
    return data.affectedRows;
}


/////////////////////////////////////////////////////////////////////////////////////////////

function getKeysValues(obj: any) {
    if (Array.isArray(obj)) {
        const keys: string[] = [];
        for (const key in obj[0]) {
            if (Object.prototype.hasOwnProperty.call(obj[0], key)) {
                keys.push(key);
            }
        }
        const allValues = [];
        for (const model of obj) {
            const values = [];
            for (const key in model) {
                if (Object.prototype.hasOwnProperty.call(model, key)) {
                    const value = model[key];
                    if (typeof value === "string") {
                        values.push(`'${value}'`);
                    } else if (typeof value === "number") {
                        values.push(`${value}`)
                    } else if (typeof value === "boolean") {
                        const val = value ? 1 : 0
                        values.push(`${val}`)
                    }
                }
            }
            allValues.push(`(${values.join(", ")})`)
        }
        return {keys: `(${keys.join(", ")})`, values: allValues.join(", ")};
    }
    const keys: string[] = [];
    const values: string[] = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            keys.push(key);
            if (typeof value === "string") {
                values.push(`'${value}'`);
            } else if (typeof value === "number") {
                values.push(`${value}`)
            } else if (typeof value === "boolean") {
                const val = value ? 1 : 0
                values.push(`${val}`)
            }
        }
    }
    return {keys: `(${keys.join(", ")})`, values: `(${values.join(", ")})`};
}


function getEquals(obj: any, without?: string) {
    const keyValues = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && key !== without) {
            let value = obj[key];
            if (typeof value === "string") {
                value = `'${value}'`;
            } else if (typeof value === "number") {
                value = `${value}`;
            } else if (typeof value === "boolean") {
                const val = value ? 1 : 0
                value = `${val}`;
            }
            keyValues.push(`${key} = ${value}`);
        }
    }
    return keyValues.join(", ");
}
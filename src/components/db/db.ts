import { Pool, createPool, RowDataPacket, OkPacket }  from "mysql2/promise";
import { getKeysValues } from "../db/helpers";
import { DEBUG, INFO } from "../logger";

interface DbConfig {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string
}


let pool: Pool;


export function init (config: DbConfig) {
    INFO("DB initializing...");
    pool = createPool(config);
    INFO("DB initialized");
}

export async function query(query: string) {
    return pool.query(query);
}

export async function select<T>(query: string) {
    const [data,] = await pool.query<RowDataPacket[]>(query);
    return data as T[];
}

export async function selectOne<T>(condition: string, table: string) {
    const sql = `SELECT * FROM ${table} WHERE ${condition} LIMIT 1`;
    const [data,] = await pool.query<RowDataPacket[]>(sql);
    if (data.length === 0) {
        return undefined;
    }
    return (data as T[])[0];
}

export async function insert(model: object, table: string) {
    const {keys, values} = getKeysValues(model);
    const sql = `INSERT IGNORE INTO ${table} ${keys} VALUES ${values}`;
    const [data,] = await pool.query<OkPacket>(sql);
    return data.affectedRows > 0;
}

export async function delet(query: string) {
    const [data,] = await pool.query<OkPacket>(query);
    return data.affectedRows;
}
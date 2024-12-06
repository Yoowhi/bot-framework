import { AppDataSource } from "../data-source";

export async function initDB() {
    await AppDataSource.initialize();
}
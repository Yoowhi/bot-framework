import { DataSource } from "typeorm"
import { UserEntity } from "./entity/user.entity"
import { db } from "./config.json";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.password,
    database: db.database,
    synchronize: true,
    logging: false,
    entities: [`${__dirname}/entity/**/*.{js,ts}`],
    migrations: [`${__dirname}/migrations/**/*.{js,ts}`],
    subscribers: [],
});


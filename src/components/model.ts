import { insert } from "./db";

export default class Model<T extends object> {
    public data: T;
    public table: string = "";
    private isNewRecord: boolean;

    constructor(data: T, isNewRecord: boolean = true) {
        this.data = data;
        this.isNewRecord = isNewRecord;
    }

    public save() {
        insert(this.table, this.data);
    }
}
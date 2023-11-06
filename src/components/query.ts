
type Operator = "=" | ">" | "<" | ">=" | "<=" | "!=" | "like" | "in" | "not in" | "between" | "not between" | "and" | "or" | "is" | "is not";
type Operand<T extends object> = Condition<T> | keyof T | string | number | boolean;
type Condition<T extends object> = [Operand<T>, Operator, Operand<T>];
type QueryType = "SELECT" | "UPDATE" | "INSERT" | "DELETE"

export default class Query<T extends object> {
    private type: QueryType;
    private table: string;
    private _where?: Condition<T>;
    private _groupBy?: (keyof T)[];
    private _orderBy?: {[K in keyof T]: ("ASC" | "DESC")};
    private _limit?: number;


    constructor(table: string, type: QueryType) {
        this.table = table;
        this.type = type;
    }

    public where(condition: Condition<T>): Query<T> {
        this._where = condition;
        return this;
    }

    public andWhere(condition: Condition<T>): Query<T> {
        this._where = this._where 
            ? [this._where, "and", condition]
            : condition;
        return this;
    }

    public orWhere(condition: Condition<T>): Query<T> {
        this._where = this._where 
            ? [this._where, "or", condition]
            : condition;
        return this;
    }

    public groupBy(...fields: (keyof T)[]): Query<T> {
        this._groupBy = fields;
        return this;
    }

    public orderBy(orders: {[K in keyof T]: ("ASC" | "DESC")}): Query<T> {
        this._orderBy = orders;
        return this;
    }

    public limit(n: number): Query<T> {
        this._limit = n;
        return this;
    }

    public compile(): string {
        switch (this.type) {
            case "SELECT":
                break;
            case "UPDATE":
                break;
            case "INSERT":
                break;
            case "DELETE":
                break;
        }
    }

    private compileSelect(): string {
        let sql = `SELECT * FROM ${this.table}`;
        if (this._where !== undefined) {
            sql += " WHERE " + this.compileCondition(this._where);
        }
        if (this._groupBy !== undefined) {
            sql += " GROUP BY " + this._groupBy.join(", ");
        }
        if (this._orderBy !== undefined) {
            sql += " ORDER BY " + this._orderBy
        }
    }

    private compileUPDATE(): string {
        
    }

    private compileInsert(): string {
        
    }

    private compileDelete(): string {
        
    }

    private compileCondition<T extends object>(condition: Condition<T>): string {
        const [left, operator, right] = condition;
        let leftString = Array.isArray(left) ? this.compileCondition<T>(left) : left;
        let rightString = Array.isArray(right) ? this.compileCondition<T>(right) : right;
        return `(${String(leftString)}) ${operator} (${String(rightString)})`;
    }
}
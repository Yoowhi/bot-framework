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


export class User extends Model<{
    chatId: number;
    userId: number;
}> {
    table = "users";
}

type Operator = "=" | ">" | "<" | ">=" | "<=" | "!=" | "like" | "in" | "not in" | "between" | "not between" | "and" | "or" | "is" | "is not";
type Operand<T extends object> = Condition<T> | keyof T | string | number | boolean;
type Condition<T extends object> = [Operand<T>, Operator, Operand<T>];


const cond: Condition<{
    chatId: number;
    userId: number;
}> = [["chatId", "=", 1], "or", ["userId", "=", 1]];



function compileConditionToSql<T extends object>(condition: Condition<T>): string {
    if (Array.isArray(condition)) {
        const [left, operator, right] = condition;
        if (Array.isArray(left)) {
            const leftSql = compileConditionToSql(left);
            const rightSql = compileConditionToSql(right);
            return `(${leftSql} ${operator} ${rightSql})`;
        } else {
            return `${left} ${operator} ${right}`;
        }
    } else {
        return condition;
    }
}
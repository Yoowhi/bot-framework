export function getKeysValues(obj: any) {
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


export function getEquals(obj: any, without?: string) {
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
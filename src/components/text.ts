import strings from "../strings";

type TextKey = typeof strings


export function t(key: keyof TextKey, ...text: string[]) {
    const result = strings[key];
    if (text.length === 0) {
        return result;
    }
    const regex = /(\?\?\?)/g;
    return result.replace(regex, () => text.shift() ?? "");
}
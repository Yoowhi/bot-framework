import strings from "../strings";

type TextKey = typeof strings


export function t(key: keyof TextKey) {
    return strings[key]
}
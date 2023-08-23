import strings from "../strings.json";

type TextKey = typeof strings


export function t(key: keyof TextKey) {
    return strings[key]
}
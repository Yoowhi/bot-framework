import { readFile } from "fs/promises";

const buffers: {[key: string]: Buffer} = {};

export async function read(path: string) {
    let buffer: Buffer | undefined = buffers[path];
    if (!buffer) {
        buffer = await readFile(path);
        buffers[path] = buffer;
    }
    return buffer;
}
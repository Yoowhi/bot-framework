const LVL_ERROR = 0;
const LVL_WARNING = 1;
const LVL_INFO = 2;
const LVL_DEBUG = 3;

export function ERROR(text: string, obj?: any) {
    const date = new Date();
    const dt = date.toLocaleDateString() + " " + date.toLocaleTimeString() + "." + date.getMilliseconds();
    if (obj) {
        console.error(`[${dt}] [error] ` + text + " ", obj);
    } else {
        console.error(`[${dt}] [error] ` + text);
    }
}

export function WARN(text: string, obj?: any) {
    const date = new Date();
    const dt = date.toLocaleDateString() + " " + date.toLocaleTimeString() + "." + date.getMilliseconds();
    if (obj) {
        console.log(`[${dt}] [warn] ` + text + " ", obj);
    } else {
        console.log(`[${dt}] [warn] ` + text);
    }
}

export function INFO(text: string, obj?: any) {
    const date = new Date();
    const dt = date.toLocaleDateString() + " " + date.toLocaleTimeString() + "." + date.getMilliseconds();
    if (obj) {
        console.log(`[${dt}] [info] ` + text + " ", obj);
    } else {
        console.log(`[${dt}] [info] ` + text);
    }
}

export function DEBUG(text: string, obj?: any) {
    const date = new Date();
    const dt = date.toLocaleDateString() + " " + date.toLocaleTimeString() + "." + date.getMilliseconds();
    if (obj) {
        console.log(`[${dt}] [debug] ` + text + " ", obj);
    } else {
        console.log(`[${dt}] [debug] ` + text);
    }
}
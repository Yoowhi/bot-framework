const mutes: {[key: string]: boolean} = {};


function isFreeMutex(name: string) {
    return mutes[name] != true;
}

export function acquireMutex(name: string) {
    if (!isFreeMutex(name)) {
        return false;
    }
    mutes[name] = true;
    return true;
}

export function releaseMutex(name: string) {
    delete mutes[name];
    return true;
}
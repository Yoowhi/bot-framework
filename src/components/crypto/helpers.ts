export type Token = { address: string, decimals: number }

export function bigToDec(amount: bigint, decimals: number) {
    return Number(amount) / (10 ** decimals);
}

export function decToBig(amount: number, decimals: number) {
    return BigInt(Math.floor(amount * (10 ** decimals)));
}
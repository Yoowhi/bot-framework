export abstract class Wallet {
    protected publicKey: string;
    protected privateKey: string;

    constructor(publicKey: string, privateKey: string) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    public abstract sendCrypto(address: string, amount: bigint): Promise<string>;
    public abstract sendToken(address: string, token: string, amount: bigint): Promise<string>;
    public abstract balanceCrypto(): Promise<bigint>;
    public abstract balanceToken(token: string): Promise<bigint>;
}
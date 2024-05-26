import { Keypair, PublicKey } from "@solana/web3.js";
import { sendSOL, sendToken, solBalance, tokenBalance } from "./solana";
import { Wallet } from "./wallet";
import { decode } from "bs58";

export class SolanaWallet extends Wallet {
    private keypair: Keypair;
    private createAccounts: boolean;

    constructor(publicKey: string, privateKey: string, createAccounts: boolean) {
        super(publicKey, privateKey);
        this.keypair = Keypair.fromSecretKey(decode(this.privateKey));
        this.createAccounts = createAccounts;
    }

    public async sendCrypto(address: string, amount: bigint): Promise<string> {
        const receiver = new PublicKey(address);
        return await sendSOL(this.keypair, receiver, amount);
    }
    
    public async sendToken(address: string, token: string, amount: bigint): Promise<string> {
        const receiver = new PublicKey(address);
        const tokenPubkey = new PublicKey(token);
        return await sendToken(this.keypair, receiver, amount, tokenPubkey, this.createAccounts);
    }

    public async balanceCrypto(): Promise<bigint> {
        const pubkey = new PublicKey(this.publicKey);
        return await solBalance(this.keypair.publicKey);
    }

    public async balanceToken(token: string): Promise<bigint> {
        const tokenPubkey = new PublicKey(token);
        return await tokenBalance(this.keypair.publicKey, tokenPubkey);
    }
}
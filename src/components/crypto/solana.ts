import { createTransferInstruction, getAccount, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { ComputeBudgetProgram, Connection, Keypair, PublicKey, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"), {commitment: "confirmed"})

export async function solBalance(address: PublicKey) {
    return BigInt(await connection.getBalance(address));
}

export async function tokenBalance(address: PublicKey, token: PublicKey) {
    const tokenAccount = await getAssociatedTokenAddress(token, address);
    const account = await getAccount(connection, tokenAccount);
    return account.amount;
}

export async function sendSOL(from: Keypair, to: PublicKey, amount: bigint): Promise<string> {
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to,
            lamports: amount,
        })
    );
    return await sendAndConfirmTransaction(
        connection,
        transaction,
        [from],
        {commitment: "confirmed", maxRetries: 5}
    );
}

export async function sendToken(from: Keypair, to: PublicKey, amount: bigint, token: PublicKey, createAccount = false) {
    const fromTokenAccount = await getAssociatedTokenAddress(token, from.publicKey);
    let toTokenAccount: PublicKey;
    if (createAccount) {
        toTokenAccount = (await getOrCreateAssociatedTokenAccount(
            connection, 
            from, 
            //@ts-ignore
            token, 
            to)
            ).address
    } else {
        toTokenAccount = await getAssociatedTokenAddress(token, to);
    }

    const transaction = new Transaction();
    transaction.add(createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        from.publicKey,
        amount
    ));
    transaction.add(ComputeBudgetProgram.setComputeUnitPrice({microLamports: 2}));
    return await sendAndConfirmTransaction(connection, transaction, [from], {commitment: "confirmed", maxRetries: 5});

    // return await transfer(
    //     connections[network],
    //     from,
    //     fromTokenAccount,
    //     toTokenAccount,
    //     from.publicKey,
    //     amount,
    //     undefined,
    //     {maxRetries: 5},
    // );
}
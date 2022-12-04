

// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        190, 136, 182, 128, 118, 130,  85, 114, 188, 128, 119,
        69,  60, 203,  15, 181,  78,   7, 200, 138,  87, 208,
         3, 123, 181,   7, 219,  37,  59, 217,  61, 179,  90,
       119, 233,  31, 188,  37, 155, 224, 111, 228, 225,  67,
        92,  21,  16, 153,  28,  45, 125,  78,  31, 245, 202,
       236, 112, 115, 125,  81, 142,  49, 140, 169
      ]            
);

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    const fromWalletBalance = await connection.getBalance(
        from.publicKey
    );
    console.log(`1) from Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`);

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    const toWalletBalance = await connection.getBalance(
        to.publicKey
    );
    console.log(`2) to Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`);

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Send money from "from" wallet and into "to" wallet
    const fromHalfWalletBalance = await connection.getBalance(
        from.publicKey
    );

    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: Math.round((parseInt(fromHalfWalletBalance) / 2))
        })
    );

    const fromAfterWalletBalance = await connection.getBalance(
        from.publicKey
    );
    console.log(`3) from Wallet balance: ${parseInt(fromAfterWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    const toAfterWalletBalance = await connection.getBalance(
        to.publicKey
    );
    console.log(`4) to Wallet balance: ${parseInt(toAfterWalletBalance) / LAMPORTS_PER_SOL} SOL`);

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    const fromFinalWalletBalance = await connection.getBalance(
        from.publicKey
    );
    console.log(`5) from Wallet balance: ${parseInt(fromFinalWalletBalance) / LAMPORTS_PER_SOL} SOL`);

    const toFinalWalletBalance = await connection.getBalance(
        to.publicKey
    );
    console.log(`6) to Wallet balance: ${parseInt(toFinalWalletBalance) / LAMPORTS_PER_SOL} SOL`);
}

transferSol();
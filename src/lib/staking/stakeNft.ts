import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { fetchFarm, fetchFarmer, initGemBank, initGemFarm } from "./util";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { programs } from "@metaplex/js";
import BN from "bn.js";
import { findWhitelistProofPDA } from "./sdk";

/**
 * Given an NFT, moves it to the identity's vault and stakes it, creating the farmer in the spot if needed.
 *
 * @param connection        - Connection to the solana network
 * @param wallet            - Wallet adapter from the identity
 * @param sendTransaction   - Function that can send a transaction
 * @param farmId            - PublicKey of the farm
 * @param identity          - PublicKey of the connected wallet
 * @param mint              - PublicKey of the mint address
 * @param source            - PublicKey of the ATA of `mint` on the `identity` wallet
 * @param creator           - PublicKey of the verified creator of `mint`
 * @param onError           - Callback that is executed if the transaction fails or timeouts
 * @param onFinish          - Callback that is executed after the mint is transferred and staked into the vault
 */
export const stakeNft = async (
  connection: Connection,
  wallet: SignerWalletAdapter,
  sendTransaction: Function,
  farmId: PublicKey,
  identity: PublicKey,
  mint: PublicKey,
  source: PublicKey,
  creator: PublicKey,
  onError: (e: Error) => void,
  onFinish: (txid: string) => void
) => {
  const gf = await initGemFarm(connection, wallet);
  const gb = await initGemBank(connection, wallet);
  const txs = new Transaction();
  const farmer = await fetchFarmer(connection, wallet, farmId, identity);
  const farm = await fetchFarm(connection, wallet, farmId);

  let farmerVault: PublicKey;
  if (farmer === null) {
    // Initializes the farmer if it doesn't exist
    const { ix: ixCreateFarmer, vault } = await gf!.initFarmer(
      farmId,
      identity,
      identity
    );
    txs.add(ixCreateFarmer);

    farmerVault = vault;
  } else {
    farmerVault = farmer.account.vault;
  }

  const [mintProof] = await findWhitelistProofPDA(farm.bank, mint);
  const [creatorProof] = await findWhitelistProofPDA(farm.bank, creator);
  const metadata = await programs.metadata.Metadata.getPDA(mint);

  if (identity) {
    if (farmer !== null && farmer.state === "staked") {
      // There's two calls to unstake, the first "unstakes" it
      const { ix: ixUnstake } = await gf!.unstake(farmId, identity);
      // Then, the second ends the cooldown period
      const { ix: ixCooldown } = await gf!.unstake(farmId, identity);
      txs.add(ixUnstake);
      txs.add(ixCooldown);

      const { ix: ixDeposit } = await gb.depositGem(
          farm.bank,
          farmerVault,
          identity,
          new BN(1),
          mint,
          source,
          mintProof,
          metadata,
          creatorProof
      );

      txs.add(ixDeposit);

      const { ix: ixStake } = await gf!.stake(farmId, identity);
      txs.add(ixStake);
    } else {
      const { ix: ixDeposit } = await gb.depositGem(
        farm.bank,
        farmerVault,
        identity,
        new BN(1),
        mint,
        source,
        mintProof,
        metadata,
        creatorProof
      );

      txs.add(ixDeposit);

      const { ix: ixStake } = await gf!.stake(farmId, identity);
      txs.add(ixStake);
    }
  }

  txs.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  txs.feePayer = identity;

  const txid = await sendTransaction(txs, connection);
  try {
    await connection.confirmTransaction(txid);
  } catch (e) {
    onError(e as Error);
  }

  onFinish(txid);
};

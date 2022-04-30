import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { initVault, fetchVault } from "./util";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { programs } from "@metaplex/js";
import BN from "bn.js";

export const claimNft = async (
  connection: Connection,
  wallet: SignerWalletAdapter,
  sendTransaction: Function,
  vaultId: PublicKey,
  identity: PublicKey,
  mint: PublicKey,
  // source: PublicKey,
  // creator: PublicKey,
  onError: (e: Error) => void,
  onFinish: (txid: string) => void
) => {
  const vault = await initVault(connection, wallet);
  // const gb = await initGemBank(connection, wallet);
  const txs = new Transaction();
  const vaultAccount = await fetchVault(connection, wallet, vaultId, identity);
  console.log("vault account : ", vaultAccount);

  if (vaultAccount === null) {
    const { ix: ixCreateVault } = await vault!.initVault(identity, vaultId);
    txs.add(ixCreateVault);
  }

  const { ix: ixStakeNft } = await vault!.unStakeNftToVault(identity, mint);
  txs.add(ixStakeNft);

  console.log("transaction - stake", txs);

  // const farm = await fetchFarm(connection, wallet, farmId);

  // let farmerVault: PublicKey;
  // if (farmer === null) {
  //   // Initializes the farmer if it doesn't exist
  //   const { ix: ixCreateFarmer, vault } = await gf!.initFarmer(
  //     farmId,
  //     identity,
  //     identity
  //   );
  //   txs.add(ixCreateFarmer);

  //   farmerVault = vault;
  // } else {
  //   farmerVault = farmer.account.vault;
  // }

  // const [mintProof] = await findWhitelistProofPDA(farm.bank, mint);
  // const [creatorProof] = await findWhitelistProofPDA(farm.bank, creator);
  // const metadata = await programs.metadata.Metadata.getPDA(mint);

  // if (identity) {
  //   if (farmer !== null && farmer.state === "staked") {
  //     // There's two calls to unstake, the first "unstakes" it
  //     const { ix: ixUnstake } = await gf!.unstake(farmId, identity);
  //     // Then, the second ends the cooldown period
  //     const { ix: ixCooldown } = await gf!.unstake(farmId, identity);
  //     txs.add(ixUnstake);
  //     txs.add(ixCooldown);

  //     const { ix: ixDeposit } = await gb.depositGem(
  //       farm.bank,
  //       farmerVault,
  //       identity,
  //       new BN(1),
  //       mint,
  //       source,
  //       mintProof,
  //       metadata,
  //       creatorProof
  //     );

  //     txs.add(ixDeposit);

  //     const { ix: ixStake } = await gf!.stake(farmId, identity);
  //     txs.add(ixStake);
  //   } else {
  //     const { ix: ixDeposit } = await gb.depositGem(
  //       farm.bank,
  //       farmerVault,
  //       identity,
  //       new BN(1),
  //       mint,
  //       source,
  //       mintProof,
  //       metadata,
  //       creatorProof
  //     );

  //     txs.add(ixDeposit);

  //     const { ix: ixStake } = await gf!.stake(farmId, identity);
  //     txs.add(ixStake);
  //   }
  // }

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

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { fetchFarm, fetchFarmer, initGemBank, initGemFarm } from "./util";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import BN from "bn.js";

/**
 * Given a staked NFT, un-stakes it and moves it to the owner's wallet.
 *
 * @param connection         - Connection to the solana network
 * @param wallet             - Wallet adapter from the identity
 * @param sendTransaction    - Function that can send a transaction
 * @param farmId             - PublicKey of the farm
 * @param identity           - PublicKey of the connected wallet
 * @param mint               - PublicKey of the mint address
 * @param numberOfNFTsStaked - Current number of NFTs staked
 * @param onError            - Callback that is executed if the transaction fails or timeouts
 * @param onFinish           - Callback that is executed after the mint is transferred and staked into the vault
 */
export const unstakeNft = async (
  connection: Connection,
  wallet: SignerWalletAdapter,
  sendTransaction: CallableFunction,
  farmId: PublicKey,
  identity: PublicKey,
  mint: PublicKey,
  numberOfNFTsStaked: number,
  onError: (e: Error) => void,
  onFinish: (txid: string) => void
) => {
  const gf = await initGemFarm(connection, wallet);
  const gb = await initGemBank(connection, wallet);
  const farm = await fetchFarm(connection, wallet, farmId);
  const farmer = await fetchFarmer(connection, wallet, farmId, identity);

  // There's two calls to unstake, the first "unstakes" it
  const { ix: ixUnstake } = await gf!.unstake(farmId, identity);
  // Then, the second ends the cooldown period
  const { ix: ixCooldown } = await gf!.unstake(farmId, identity);
  // Then and only then we can withdraw the gem
  const { ix: ixWithdraw } = await gb!.withdrawGem(
    farm.bank,
    farmer!.account.vault,
    identity,
    new BN(1),
    mint,
    identity
  );

  const txs = new Transaction().add(ixUnstake).add(ixCooldown).add(ixWithdraw);

  // Then, if there was more than this NFT staking, we need to restart
  // staking for the other ones
  if (numberOfNFTsStaked > 1) {
    const { ix: ixStake } = await gf!.stake(farmId, identity);
    txs.add(ixStake);
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

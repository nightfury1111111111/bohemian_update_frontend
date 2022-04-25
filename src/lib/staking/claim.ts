import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { fetchFarm, initGemFarm } from "./util";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { stakingGlobals } from "../../constants/staking";

/**
 * Executes a transaction that claims the tokens of a farmer
 *
 * @param connection        - Connection to the solana network
 * @param wallet            - Wallet adapter from the identity
 * @param sendTransaction   - Function that can send a transaction
 * @param farmId            - PublicKey of the farm
 * @param identity          - PublicKey of the connected wallet
 * @param onError           - Callback that is executed if the transaction fails or timeouts
 * @param onFinish          - Callback that is executed after the mint is transferred and staked into the vault
 */
export const claim = async (
  connection: Connection,
  wallet: SignerWalletAdapter,
  sendTransaction: CallableFunction,
  farmId: PublicKey,
  identity: PublicKey,
  onError: (e: Error) => void,
  onFinish: (txid: string) => void
) => {
  const gf = await initGemFarm(connection, wallet);

  const farmAcc = await fetchFarm(connection, wallet, farmId);
  if (farmAcc === null) return;

  const { ix: ixClaim } = await gf.claim(
    new PublicKey(stakingGlobals.farmId),
    identity,
    new PublicKey(farmAcc.rewardA.rewardMint!),
    new PublicKey(farmAcc.rewardB.rewardMint!)
  );

  const tx = new Transaction().add(ixClaim);
  tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  tx.feePayer = identity;

  const txid = await sendTransaction(tx, connection);
  try {
    await connection.confirmTransaction(txid);
  } catch (e) {
    onError(e as Error);
  }

  onFinish(txid);
};

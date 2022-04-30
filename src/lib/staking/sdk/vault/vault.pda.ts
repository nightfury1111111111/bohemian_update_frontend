import { PublicKey } from "@solana/web3.js";
import { VAULT_PROG_ID } from "../index";

export const findNftVaultPDA = async (vault: PublicKey, identity: PublicKey) => {
  return PublicKey.findProgramAddress(
    [Buffer.from("farmer"), vault.toBytes(), identity.toBytes()],
    VAULT_PROG_ID
  );
};
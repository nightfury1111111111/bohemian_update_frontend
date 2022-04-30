import { PublicKey } from "@solana/web3.js";
import { VAULT_PROG_ID } from "../index";

/** Address of the SPL Token program */
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

/** Address of the SPL Associated Token Account program */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const findNftVaultPDA = async () => {
  return PublicKey.findProgramAddress(
    [Buffer.from("nft-vault")],
    VAULT_PROG_ID
  );
};

export const findStakeNftPDA = async (
  stakerKey: PublicKey,
  tokenMint: PublicKey,
  programId: PublicKey = VAULT_PROG_ID
) => {
  return PublicKey.findProgramAddress(
    [Buffer.from("user-stake"), tokenMint.toBuffer(), stakerKey.toBuffer()],
    programId
  );
};

export const findAtaForMint = async (
  tokenRecipient: PublicKey,
  mintKey: PublicKey,
  tokenProgramID: PublicKey = TOKEN_PROGRAM_ID,
  associatedProgramID: PublicKey = ASSOCIATED_TOKEN_PROGRAM_ID
) => {
  return await PublicKey.findProgramAddress(
    [tokenRecipient.toBuffer(), tokenProgramID.toBuffer(), mintKey.toBuffer()],
    associatedProgramID
  );
};
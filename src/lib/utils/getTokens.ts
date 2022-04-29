import { PublicKey, Connection } from "@solana/web3.js";

import * as configs from "../../configs";
import getNft from "./getNft";

import { mint_list } from "../../configs/mint_list";
import { stakingGlobals } from "../../constants/staking";

type StringPublicKey = string;

const TOKEN_PROGRAM_ID = new PublicKey(configs.TOKEN_PROGRAM_ID);

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  configs.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
);

const BPF_UPGRADE_LOADER_ID = new PublicKey(configs.BPF_UPGRADE_LOADER_ID);

const MEMO_ID = new PublicKey(configs.MEMO_ID);

const METADATA_PROGRAM_ID =
  configs.TOKEN_METADATA_PROGRAM_ID as StringPublicKey;

const VAULT_ID = configs.VAULT_ID as StringPublicKey;

const AUCTION_ID = configs.AUCTION_ID as StringPublicKey;

const METAPLEX_ID = configs.METAPLEX_ID as StringPublicKey;

const SYSTEM = new PublicKey(configs.SYSTEM);

let STORE: PublicKey | undefined;

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
    associatedToken: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    bpf_upgrade_loader: BPF_UPGRADE_LOADER_ID,
    system: SYSTEM,
    metadata: METADATA_PROGRAM_ID,
    memo: MEMO_ID,
    vault: VAULT_ID,
    auction: AUCTION_ID,
    metaplex: METAPLEX_ID,
    store: STORE,
  };
};

// user accounts are updated via ws subscription
export const getTokens = async (
  connection: Connection,
  publicKeyBase64: String
) => {
  const account = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(publicKeyBase64),
    {
      programId: programIds().token,
    }
  );

  console.log("account nft :", account);

  const accounts = account.value;
  const tokens = [];
  for (let index = 0; index < accounts.length; index++) {
    const element = accounts[index];
    if (element.account?.data?.parsed?.info?.tokenAmount?.uiAmount !== 0)
      tokens.push({
        ...element.account?.data?.parsed?.info,
        pubkey: element.pubkey,
        amount: element.account?.data?.parsed?.tokenAmount?.amount,
      });
  }

  console.log("token :", tokens);

  const myArrayOfAccountsDatas = [];
  let tokenAmount = 0;

  for (let index = 0; index < tokens.length; index++) {
    const element = tokens[index];
    if (
      mint_list.find((x) => x.mint === element.mint.toString()) !== undefined
    ) {
      myArrayOfAccountsDatas.push({
        mint: element.mint,
        pubkey: element.pubkey,
        amount: element.amount,
      });
    }
    if (element.mint.toString() === stakingGlobals.tokenMint) {
      tokenAmount = element.tokenAmount.amount;
    }
  }

  console.log("myArrayOfAccountsDatas :", myArrayOfAccountsDatas);

  const result = await getNft(connection, myArrayOfAccountsDatas);

  console.log("result :", result);

  if (result) return { result, tokenAmount };
};

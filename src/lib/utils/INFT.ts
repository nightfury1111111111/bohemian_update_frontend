import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { programs } from "@metaplex/js";

const {
  metadata: { Metadata },
} = programs;

export interface INFT {
  farmer: any;
  pubkey?: PublicKey;
  mint: PublicKey;
  onchainMetadata: unknown;
  externalMetadata: unknown;
}

async function getNFTMetadata(
  mint: string,
  conn: Connection,
  pubkey?: string
): Promise<INFT | undefined> {
  try {
    const metadataPDA = await Metadata.getPDA(mint);
    const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data;
    const externalMetadata = (await axios.get(onchainMetadata.data.uri)).data;
    return {
      pubkey: pubkey ? new PublicKey(pubkey) : undefined,
      mint: new PublicKey(mint),
      onchainMetadata,
      externalMetadata,
      farmer: undefined,
    };
  } catch (e) {
    throw e;
  }
}

export async function getNFTMetadataForMany(
  tokens: any[],
  conn: Connection
): Promise<INFT[]> {
  const promises: Promise<INFT | undefined>[] = [];
  tokens.forEach((t) => promises.push(getNFTMetadata(t.mint, conn, t.pubkey)));

  return (await Promise.all(promises)).filter((n) => !!n) as INFT[];
}

import decodeMetadata from "./metadata";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import axios from "axios";

export const METADATA_PUBKEY_STRING =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

const METADATA_PUBKEY = new PublicKey(METADATA_PUBKEY_STRING);

export default async function getNft(connection: any, tokens: any) {
  try {
    const letsdothis = async () => {
      const addressToBase = [];
      for (let index = 0; index < tokens.length; index++) {
        const element = tokens[index];
        let [pda] = await PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            METADATA_PUBKEY.toBuffer(),
            new PublicKey(element.mint).toBuffer(),
          ],
          METADATA_PUBKEY
        );
        addressToBase.push(pda.toBase58());
      }

      const args = connection._buildArgs([addressToBase], "root", "base64");

      const unsafeRes = await connection._rpcRequest(
        "getMultipleAccounts",
        args
      );
      if (unsafeRes.result.value) {
        const array = unsafeRes.result.value as AccountInfo<string[]>[];
        return { tokens, array };
      }
    };

    const result = await Promise.all(
      chunks(tokens, 99).map((chunk) => letsdothis())
    );

    let array;
    if (result)
      array = result
        .map(
          (a) =>
            a?.array.map((acc: any) => {
              if (!acc) {
                return undefined;
              }

              const { data, ...rest } = acc;
              const obj = {
                ...rest,
                data: Buffer.from(data[0], "base64"),
              } as AccountInfo<Buffer>;
              return obj;
            }) as AccountInfo<Buffer>[]
        )
        .flat();

    if (array) {
      const result: any = [];
      const lastResult: any = [];
      for (let index = 0; index < array.length; index++) {
        const e = array[index];

        const a = decodeMetadata(e.data);
        const f = await axios(a?.data.uri).then(({ data }: any) => data);

        result.push({ ...f, ...a });
      }

      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];

        result.map((element: any) => {
          if (element.mint === token.mint)
            return lastResult.push({ ...token, ...element });
          return null;
        });
      }

      return lastResult;
    }
  } catch (e) {
    console.error(e);
  }
}

function chunks<T>(array: T[], size: number): T[][] {
  return Array.apply<number, T[], T[][]>(
    0,
    new Array(Math.ceil(array.length / size))
  ).map((_, index) => array.slice(index * size, (index + 1) * size));
}

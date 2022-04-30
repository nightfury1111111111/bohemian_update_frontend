import { PublicKey } from "@solana/web3.js";

export const stakingGlobals = {
  gemBankProgramId: new PublicKey(
    "5HVwJR5GtJoHfthX8uJvs6VR165ZqPwdUDAQZhytEvaY"
  ),
  gemFarmProgramId: new PublicKey(
    "aEEXhBMSEr3y4BmukrZBMCtKApH7aXypW9DvWJzHi2u"
  ),
  vaultProgramId: new PublicKey("DXtJ91iQwMPwr6fkVGkfaiiTmy2aNVdBxiBiw4ttGC4p"),
  farmId: new PublicKey("2iMpEcTwq82bSQzfdmvZhxrkP5yNFazqy5deA3rBiS9w"),
  tokenName: "$WOOP",
  tokenDecimals: 5,
  tokenMint: "A3HyGZqe451CBesNqieNPfJ4A9Mu332ui8ni6dobVSLB",
};

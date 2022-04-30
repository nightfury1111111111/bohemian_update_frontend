import * as anchor from "@project-serum/anchor";
import { BN, Idl, Program, Provider } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  AccountInfo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { AccountUtils } from "../gem-common";
import { NftVault } from "../types/nft_vault";
import { isKp } from "../gem-common";

export class VaultClient extends AccountUtils {
  // @ts-ignore
  wallet: anchor.Wallet;
  provider!: anchor.Provider;
  vaultProgram!: anchor.Program<NftVault>;

  constructor(
    conn: Connection,
    // @ts-ignore
    wallet: anchor.Wallet,
    idl?: Idl,
    programId?: PublicKey
  ) {
    super(conn);
    this.wallet = wallet;
    this.setProvider();
    this.setVaultProgram(idl, programId);
  }

  setProvider() {
    this.provider = new Provider(
      this.conn,
      this.wallet,
      Provider.defaultOptions()
    );
    anchor.setProvider(this.provider);
  }

  setVaultProgram(idl?: Idl, programId?: PublicKey) {
    this.vaultProgram = new anchor.Program<NftVault>(
      idl as any,
      programId!,
      this.provider
    );
  }

  async initVault(
    authority: PublicKey | Keypair,
    nftVault: PublicKey | Keypair
  ) {
    // const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farm.publicKey);
    // const [farmTreasury, farmTreasuryBump] = await findFarmTreasuryPDA(
    //   farm.publicKey
    // );
    // const [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(
    //   farm.publicKey,
    //   rewardAMint
    // );
    // const [rewardBPot, rewardBPotBump] = await findRewardsPotPDA(
    //   farm.publicKey,
    //   rewardBMint
    // );

    const signers = [];
    if (isKp(authority)) signers.push(<Keypair>authority);

    const ix = await this.vaultProgram.instruction.initialize({
      accounts: {
        authority,
        nftVault,
        systemProgram: SystemProgram.programId,
      },
      signers,
    });

    return {
      ix,
    };
  }

  async fetchVaultAcc(farmer: PublicKey) {
    return this.vaultProgram.account.nftVault.fetch(farmer);
  }
}

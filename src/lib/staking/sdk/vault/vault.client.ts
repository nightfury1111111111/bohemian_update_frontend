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
import { findNftVaultPDA, findStakeNftPDA, findAtaForMint } from "./vault.pda";

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

  //we don't use this function
  async initVault(authority: PublicKey | Keypair, vaultId: PublicKey) {
    const [vaultAddr, _] = await findNftVaultPDA();
    const signers = [];
    if (isKp(authority)) signers.push(<Keypair>authority);

    console.log("signers : ", isKp(authority));

    const ix = await this.vaultProgram.instruction.initialize({
      accounts: {
        authority,
        nftVault: vaultAddr,
        systemProgram: SystemProgram.programId,
      },
      signers,
    });

    return {
      ix,
    };
  }

  async stakeNftToVault(staker: PublicKey, mint: PublicKey) {
    const [nftVault, _1] = await findNftVaultPDA();
    const [stakeNft, _2] = await findStakeNftPDA(staker, mint);
    const [nftVaultAta, _3] = await findAtaForMint(nftVault, mint);

    const [stakerAta, _] = await findAtaForMint(staker, mint);

    const ix = await this.vaultProgram.instruction.stake({
      accounts: {
        staker,
        stakeNft,
        stakerAta,
        tokenMint: mint,
        nftVaultAta,
        nftVault,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });

    return { ix };
  }
  async unStakeNftToVault(staker: PublicKey, mint: PublicKey) {
    const [nftVault, _1] = await findNftVaultPDA();
    const [stakeNft, _2] = await findStakeNftPDA(staker, mint);
    const [nftVaultAta, _3] = await findAtaForMint(nftVault, mint);

    const [stakerAta, _] = await findAtaForMint(staker, mint);

    const ix = await this.vaultProgram.instruction.unstake({
      accounts: {
        staker,
        stakeNft,
        stakerAta,
        tokenMint: mint,
        nftVaultAta,
        nftVault,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });

    return { ix };
  }

  async fetchVaultAcc(staker: PublicKey) {
    return this.vaultProgram.account.nftVault.fetch(staker);
  }

  async fetchStakedNft(staker: PublicKey) {
    return this.vaultProgram.account.stakeNft.fetch(staker);
  }
}

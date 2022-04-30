import { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components";
import toast, { Toaster } from "react-hot-toast";
import * as anchor from "@project-serum/anchor";
import {Wallet} from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { initVault, fetchVault } from "../../lib/staking/util";
import {
  SignerWalletAdapter,
  WalletNotConnectedError,
} from "@solana/wallet-adapter-base";
import {
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
  SystemProgram,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { StakingInfos } from "./StakingInfo";
import {
  computeClaimableCoins,
  fetchFarm,
  fetchFarmer,
  fetchStakedNft,
  getEarningsPerDay,
  initGemFarm,
} from "../../lib/staking/util";
import { getOrCreateAssociatedTokenAccount } from "../../lib/transferWoop/getOrCreateAssociatedTokenAccount";
import { createTransferInstruction } from "../../lib/transferWoop/createTransferInstructions";

import { IDL as vaultIdl } from "../../lib/staking/sdk/types/nft_vault";

import { stakingGlobals } from "../../constants/staking";

import { getTokens } from "../../lib/utils/getTokens";
import { lockNft } from "../../lib/staking/lockNft";
import { stakeNft } from "../../lib/staking/stakeNft";
import { unstakeNft } from "../../lib/staking/unstakeNft";
import { claimNft } from "../../lib/staking/claimNft";
import { claim } from "../../lib/staking/claim";
import ContentNFT from "./ContentNFT";
import UnstakedNFT from "./UnstakedNFT";
import axios from "axios";
import { VAULT_PROG_ID } from "../../lib/staking/sdk";

// const notify = (status: any) => {
//   if (status == "success")
//     toast("Successfully staked.", {
//       duration: 5000,
//       position: "bottom-right",
//       icon: "👏",
//       iconTheme: {
//         primary: "#000",
//         secondary: "#fff",
//       },
//     });
//   else if (status == "failed") {
//     toast("Stake failed.", {
//       duration: 5000,
//       position: "bottom-right",
//       icon: "😩",
//       iconTheme: {
//         primary: "#000",
//         secondary: "#fff",
//       },
//     });
//   } else if (status === "noGuru") {
//     toast("You don't have any NFT.", {
//       duration: 5000,
//       position: "bottom-right",
//       icon: "😩",
//       iconTheme: {
//         primary: "#000",
//         secondary: "#fff",
//       },
//     });
//   }
// };
const notify = (status: any) => {
  toast(status, {
    duration: 5000,
    position: "bottom-right",
  });
};

const StakingContent: FunctionComponent = () => {
  const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
  const connection = new anchor.web3.Connection(rpcHost);
  // const { connection } = useConnection();
  console.log("connection", connection);
  const { publicKey, wallet, sendTransaction, signTransaction } = useWallet();

  const [availableNFTs, setAvailableNFTs] = useState(new Array<any>());
  const [loadingNft, setLoadingNFT] = useState(false);
  const [loadingInfos, setLoadingInfos] = useState(false);
  const [farm, setFarm]: [any, any] = useState(null);
  const [claimableCoins, setClaimableCoins] = useState(0);
  // const [updateShow, setUpdateShow] = useState(false);

  /**
   * Get all the information after the user connects the wallet
   */
  useEffect(() => {
    if (!publicKey) {
      setAvailableNFTs([]);
      return;
    }

    setLoadingNFT(true);
    setLoadingInfos(true);

    getStakingInfos(stakingGlobals.farmId).then(() => setLoadingInfos(false));
    fetchAllNFTs(stakingGlobals.farmId).then(() => setLoadingNFT(false));
    // eslint-disable-next-line
  }, [publicKey]);

  // useEffect(() => {
  //   if (availableNFTs.length) setUpdateShow(true);
  // }, [availableNFTs]);

  const sendWoopToken = async () => {
    // if (!toPubkey || !amount) return;

    try {
      if (!publicKey || !signTransaction) throw new WalletNotConnectedError();
      const toPublicKey = new PublicKey(
        "HnBxYSVywQzmBBkAB43SiU4jZZnaRk2K8NkEXpH7H3Hy"
      );
      const mint = new PublicKey(
        "A3HyGZqe451CBesNqieNPfJ4A9Mu332ui8ni6dobVSLB"
      );

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        publicKey,
        signTransaction
      );

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        toPublicKey,
        signTransaction
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount.address, // source
          toTokenAccount.address, // dest
          publicKey,
          0.0003 * LAMPORTS_PER_SOL, //3 WOOP
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const blockHash = await connection.getRecentBlockhash();
      transaction.feePayer = await publicKey;
      transaction.recentBlockhash = await blockHash.blockhash;
      const signed = await signTransaction(transaction);

      await connection.sendRawTransaction(signed.serialize());
      notify("👏 WOOP is successfully transferred to admin wallet");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notify("😩 WOOP transfer is failed");
    }
  };

  const burnMasterGuru = async (guruAddress: String) => {
    // if (!toPubkey || !amount) return;

    try {
      if (!publicKey || !signTransaction) throw new WalletNotConnectedError();
      //set burn address
      const toPublicKey = new PublicKey(
        "HnBxYSVywQzmBBkAB43SiU4jZZnaRk2K8NkEXpH7H3Hy"
      );
      const mint = new PublicKey(guruAddress);

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        publicKey,
        signTransaction
      );

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        toPublicKey,
        signTransaction
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount.address, // source
          toTokenAccount.address, // dest
          publicKey,
          1,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const blockHash = await connection.getRecentBlockhash();
      transaction.feePayer = await publicKey;
      transaction.recentBlockhash = await blockHash.blockhash;
      const signed = await signTransaction(transaction);

      await connection.sendRawTransaction(signed.serialize());
      notify("👏 Successfully burn Guru NFT");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notify("😩 Burn Guru NFT failed");
    }
  };

  const getGuruAddress = async () => {
    if (!publicKey) return;
    const { result: guruNft }: any = await getTokens(
      connection,
      publicKey?.toString(),
      "guru"
    );
    if (guruNft.length) {
      return guruNft[
        (guruNft.length, Math.ceil(Math.random() * 10000) % guruNft.length)
      ].mint;
    } else {
      return "";
    }
  };

  // const stakeBohemian=(bohemian)=>{

  // };

  /**
   * Refreshes all the information about the connected wallet
   */
  const refreshStakingData = (farmId: PublicKey) => {
    setTimeout(() => {
      getStakingInfos(farmId).then(() => setLoadingInfos(false));
      fetchAllNFTs(farmId).then(() => setLoadingNFT(false));
    }, 3000);
  };

  const fetchAllNFTs = async (farmId: PublicKey) => {
    if (!publicKey) return;

    const { result: currentNft }: any = await getTokens(
      connection,
      publicKey?.toString(),
      "bohemian"
    );

    console.log("currentNft :", currentNft);

    // const currentStakingNft = await fetchVaultNFTs(
    //   connection,
    //   wallet!.adapter as SignerWalletAdapter,
    //   publicKey,
    //   farmId
    // );

    const currentStakingNft = await fetchStakedNft(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      publicKey,
      VAULT_PROG_ID
    );

    // const stakingNFTs = currentStakingNft?.map((e: any) => {
    //   return {
    //     name: e.externalMetadata.name,
    //     pubkey: e.pubkey,
    //     mint: e.mint,
    //     image: e.externalMetadata.image,
    //     isStaked: true,
    //     farmer: e.farmer,
    //   };
    // });

    const walletNFTs = currentNft.map((e: any) => {
      return {
        name: e.name,
        pubkey: e.pubkey,
        mint: new PublicKey(e.mint),
        image: e.image,
        isStaked: false,
        creator: new PublicKey(e.data.creators[0].address),
      };
    });

    console.log("walletNFT :", walletNFTs);
    setAvailableNFTs(walletNFTs);
    // setAvailableNFTs(walletNFTs.concat(stakingNFTs));

    // const farmer = await fetchFarmer(
    //   connection,
    //   wallet!.adapter as SignerWalletAdapter,
    //   farmId,
    //   publicKey!
    // );

    // setClaimableCoins(
    //   computeClaimableCoins(
    //     farmer.account,
    //     getEarningsPerDay(farmer.account, null),
    //     currentStakingNft.length
    //   )
    // );
  };

  /**
   * Fetches the information about the farm
   *
   * @param farmId - PublicKey of the farm
   */
  const getStakingInfos = async (farmId: PublicKey) => {
    if (!publicKey) return;

    const farm = await fetchFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      farmId
    );

    setFarm(farm);
  };

  const handleStakeNFT = async (
    // farmId: PublicKey,
    vaultId: PublicKey,
    mint: PublicKey,
    source: PublicKey,
    creator: PublicKey
  ) => {
    setLoadingNFT(true);

    // await stakeNft(
    //   connection,
    //   wallet!.adapter as SignerWalletAdapter,
    //   sendTransaction,
    //   farmId,
    //   publicKey!,
    //   mint,
    //   source,
    //   creator,
    //   (e) => {
    //     console.error(e);
    //     setLoadingNFT(false);
    //   },
    //   () => {
    //     refreshStakingData(farmId);
    //   }
    // );

    await lockNft(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      vaultId,
      publicKey!,
      mint,
      source,
      creator,
      (e) => {
        console.error(e);
        setLoadingNFT(false);
      },
      () => {
        refreshStakingData(vaultId);
      }
    );

    // await sendWoopToken();
    // const guruAddr = await getGuruAddress();
    // if (guruAddr) {
    //   await burnMasterGuru(guruAddr);
    // } else {
    //   notify("👏 You don't have any Guru NFT");
    //   return;
    // }
    // // stakeBohemian()
    // // stakeBohemian(mint.toBase58());
    // burnMasterGuru(mint.toBase58());

    // axios
    //   .post("https://retreat-backend.bohemia.gallery/update", { mintAddr: mint.toBase58() })
    //   .then((res) => {
    //     console.log(res);
    //     notify("👏 Metadata successfully updated");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     notify("😩 Metadata update failed"); // we have to save this to db
    //   });
  };

  const handleUnstakeNFT = async () => {
  // const handleUnstakeNFT = async (vaultId: PublicKey, mint: PublicKey) => {
    setLoadingNFT(true);

    // await unstakeNft(
    //   connection,
    //   wallet!.adapter as SignerWalletAdapter,
    //   sendTransaction,
    //   farmId,
    //   publicKey!,
    //   mint,
    //   availableNFTs.filter((x) => x.isStaked === true).length,
    //   (e) => {
    //     console.error(e);
    //     setLoadingNFT(false);
    //   },
    //   () => {
    //     refreshStakingData(farmId);
    //   }
    // );

    await claimNft(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      VAULT_PROG_ID,
      publicKey!,
      new PublicKey("9HevKiZe3BLhDE1ApXJyK1NsRAXpqRigwR66gS6FfmCX"),
      // availableNFTs.filter((x) => x.isStaked === true).length,
      (e) => {
        console.error(e);
        setLoadingNFT(false);
      },
      () => {
        refreshStakingData(VAULT_PROG_ID);
      }
    );
  };

  const handleClaim = (farmId: PublicKey) => {
    setLoadingInfos(true);

    claim(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      farmId,
      publicKey!,
      (e) => {
        console.error(e);
        setLoadingInfos(false);
      },
      () => {
        refreshStakingData(farmId);
      }
    );
  };

  const WALLET = [
    19, 50, 28, 200, 250, 27, 129, 153, 59, 243, 4, 225, 133, 17, 223, 24, 147,
    112, 77, 72, 60, 210, 152, 84, 6, 156, 138, 238, 20, 134, 40, 34, 28, 71,
    248, 199, 198, 87, 146, 144, 1, 15, 71, 23, 86, 88, 245, 212, 63, 69, 88, 3,
    179, 119, 97, 217, 170, 168, 119, 90, 27, 5, 229, 110,
  ];

  const handleTest = async () => {
    const network = clusterApiUrl("devnet");
    const connection = new Connection(network);
    const walletKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(WALLET));
    // const walletK = new Wallet(wallet);
    const provider = new anchor.Provider(
      connection,
      // @ts-ignore
      wallet!.adapter as SignerWalletAdapter,
      anchor.Provider.defaultOptions()
    );
    const program = new anchor.Program(
      vaultIdl,
      "DXtJ91iQwMPwr6fkVGkfaiiTmy2aNVdBxiBiw4ttGC4p",
      provider
    );

    const [programPDA, programBump] = await PublicKey.findProgramAddress(
      [Buffer.from("nft-vault")],
      new PublicKey("DXtJ91iQwMPwr6fkVGkfaiiTmy2aNVdBxiBiw4ttGC4p")
    );

    await program.rpc.initialize({
      accounts: {
        authority: publicKey!,
        nftVault: programPDA,
        systemProgram: SystemProgram.programId,
      },
      signers: [walletKey],
    });
  };

  return (
    <div>
      <Toaster />

      {(loadingInfos || loadingNft) && <div className="loading"></div>}

      {/* <UnstakedNFT
        loading={loadingNft}
        title={"Staked"}
        NFTs={availableNFTs.filter((x) => x.isStaked)}
        claimableCoins={
          claimableCoins /
          (availableNFTs.filter((x) => x.isStaked).length === 0
            ? 1
            : availableNFTs.filter((x) => x.isStaked).length)
        }
        callback={handleUnstakeNFT}
        isStaking={true}
        getStakingInfo={getStakingInfos}
      /> */}

      <ContentNFT
        loading={loadingNft}
        title={"Unstaked"}
        NFTs={availableNFTs.filter((x) => !x.isStaked)}
        callback={handleStakeNFT}
        claimableCoins={0}
        isStaking={false}
        getStakingInfo={getStakingInfos}
      />

      {/* <StakingStyled onClick={handleTest}>aaaaaaaaa</StakingStyled> */}
      <StakingStyled onClick={handleUnstakeNFT}>aaaaaaaaa</StakingStyled>
    </div>
  );
};

export default StakingContent;

const StakingStyled = styled.div`
  color: blueviolet;
  background: coral;
  font-size: 24px;
  width: 200px;
  margin: auto;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  cursor: pointer;
`;


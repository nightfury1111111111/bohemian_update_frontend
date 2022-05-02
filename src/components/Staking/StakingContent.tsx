import { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components";
import toast, { Toaster } from "react-hot-toast";
import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor";
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
import Clock from "./Clock";

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
  // const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
  // const connection = new anchor.web3.Connection(rpcHost);
  const { connection } = useConnection();
  console.log("connection", connection);
  const { publicKey, wallet, sendTransaction, signTransaction } = useWallet();

  const [availableNFTs, setAvailableNFTs] = useState(new Array<any>());
  const [loadingNft, setLoadingNFT] = useState(false);
  const [loadingInfos, setLoadingInfos] = useState(false);
  const [farm, setFarm]: [any, any] = useState(null);
  const [claimableCoins, setClaimableCoins] = useState(0);
  const [stakedNft, setStakedNft] = useState([]);
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
        "HRyCvp4ha6zw6Cepc7kaXkpDfWESiNoEzkYoFS8M5S15"
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
          0.025 * LAMPORTS_PER_SOL, //3 WOOP
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
      // const toPublicKey = new PublicKey("11111111111111111111111111111111");
      const toPublicKey = new PublicKey(
        "FAxFt1qzfrGBBATPDrXAhonhxyPsij58o3kVVk9Vh4Js"
      );
      const mint = new PublicKey(guruAddress);
      console.log("guru :", guruAddress);

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

  const stakeBohemian = async (bohemia: any) => {
    try {
      if (!publicKey || !signTransaction) throw new WalletNotConnectedError();
      //set burn address
      const toPublicKey = new PublicKey(
        "HnBxYSVywQzmBBkAB43SiU4jZZnaRk2K8NkEXpH7H3Hy"
      );
      const mint = new PublicKey(bohemia);

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        publicKey,
        signTransaction
      );

      console.log("ddddddddd", fromTokenAccount.address.toBase58());

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
      notify("👏 Successfully stake Bohemian NFT");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notify("😩 Stake Bohemian failed");
    }
  };

  // const stakeBohemian=(bohemian)=>{

  // };

  /**
   * Refreshes all the information about the connected wallet
   */
  const refreshStakingData = (vaultId: PublicKey) => {
    setTimeout(() => {
      getStakingInfos(vaultId).then(() => setLoadingInfos(false));
      fetchAllNFTs(vaultId).then(() => setLoadingNFT(false));
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
    let tmpMintArray;
    try {
      tmpMintArray = await axios.get(
        `https://retreat-backend.bohemia.gallery/staked${publicKey.toBase58()}`
      );
      // @ts-ignore
      let stakedNftArray = [];
      // @ts-ignore
      if (tmpMintArray.data.length > 0) {
        // @ts-ignore
        tmpMintArray.data.map((nft: any) => {
          stakedNftArray.push({
            addr: nft.mintAddr,
            image: nft.image,
            time: new Date(nft.createdAt).getTime() + 24 * 3600 * 7 * 1000,
          });
        });
      }
      // @ts-ignore
      setStakedNft(stakedNftArray);
    } catch(err) {
      console.log("tmpMintArray", tmpMintArray, err);
    }

    // @ts-ignore

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
    creator: PublicKey,
    image: String
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
    const guruAddr = await getGuruAddress();
    if (guruAddr) {
      await burnMasterGuru(guruAddr);
    } else {
      notify("👏 You don't have any Guru NFT");
      return;
    }

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

    await sendWoopToken();
    await axios
      .post("https://retreat-backend.bohemia.gallery/stake", {
        staker: publicKey?.toBase58(),
        mintAddr: mint.toBase58(),
        image,
      })
      .then((res) => {
        notify("Congratulations! You can get a week later");
      })
      .catch((err) => {
        console.log(err);
        notify("😩 Stake Bohemian failed. Let me know in discord channel");
      });
      // await stakeBohemian(mint);//send nft to wallet
    };

  const handleUnstakeNFT = async (mint: PublicKey) => {
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

    let updateStatus;
    await axios
      .post("https://retreat-backend.bohemia.gallery/update", {
        mintAddr: mint.toBase58(),
      })
      .then((res) => {
        updateStatus = true;
      })
      .catch((err) => {
        updateStatus = true;
        return notify("😩 Metadata update failed"); // we have to save this to db
      });

    if (!updateStatus) return;

    await axios
      .post("https://retreat-backend.bohemia.gallery/unstaked", {
        staker: publicKey?.toBase58(),
        mintAddr: mint.toBase58(),
      })
      .then((res) => {
        claimNft(
          connection,
          wallet!.adapter as SignerWalletAdapter,
          sendTransaction,
          VAULT_PROG_ID,
          publicKey!,
          mint,
          // availableNFTs.filter((x) => x.isStaked === true).length,
          (e) => {
            console.error(e);
            setLoadingNFT(false);
          },
          () => {
            refreshStakingData(VAULT_PROG_ID);
          }
        );
        notify("👏 Withdraw successful");
      })
      .catch((err) => {
        notify(
          "😩 Withdraw failed. This NFT is not staked or lock period problem"
        );
      });
  };

  // const WALLET = [
  //   ... deploy wallet 
  // ];

  // const handleTest = async () => {
  //   const walletKey = anchor.web3.Keypair.fromSecretKey(
  //     Uint8Array.from(WALLET)
  //   );
  //   // const walletK = new Wallet(wallet);
  //   const provider = new anchor.Provider(
  //     connection,
  //     // @ts-ignore
  //     wallet!.adapter as SignerWalletAdapter,
  //     anchor.Provider.defaultOptions()
  //   );
  //   const program = new anchor.Program(
  //     vaultIdl,
  //     "DXtJ91iQwMPwr6fkVGkfaiiTmy2aNVdBxiBiw4ttGC4p",
  //     provider
  //   );

  //   const [programPDA, programBump] = await PublicKey.findProgramAddress(
  //     [Buffer.from("nft-vault")],
  //     new PublicKey("DXtJ91iQwMPwr6fkVGkfaiiTmy2aNVdBxiBiw4ttGC4p")
  //   );
  //   console.log("PDA!!!!!!!!!!!!", programPDA.toBase58());
  //   console.log("PDA!!!!!!!!!!!!", connection);
  //   console.log(
  //     "Pubkey!!!!!!!!!!!!",
  //     publicKey!.toBase58(),
  //     walletKey.publicKey.toBase58()
  //   );

  //   await program.rpc.initialize({
  //     accounts: {
  //       authority: walletKey.publicKey,
  //       nftVault: programPDA,
  //       systemProgram: SystemProgram.programId,
  //     },
  //     // signers: [],
  //     signers: [walletKey],
  //   });
  // };

  return (
    <div>
      <Toaster />

      {(loadingInfos || loadingNft) && <div className="loading"></div>}

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
      {/* <StakingStyled
        onClick={() => {
          handleUnstakeNFT(
            new PublicKey("Btuo1CKqsu1Y7s2mdMc4Df39AED1JCcvjQ4pCdu6eQmB")
          );
        }}
      >
        unstake
      </StakingStyled> */}
      <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide">
        {stakedNft.map((nft, index) => (
          // <StakingStyled
          //   key={index}
          //   onClick={() => {
          //     // @ts-ignore
          //     handleUnstakeNFT(new PublicKey(nft.addr));
          //   }}
          // >
          //   {
          //     // @ts-ignore
          //     nft.addr
          //   }
          // </StakingStyled>
          <div className="w-1/3">
            <div
              className="relative inline-block w-[460px] cursor-pointer"
              onClick={() => {
                // @ts-ignore
                handleUnstakeNFT(new PublicKey(nft.addr));
              }}
            >
              <img src="./staked-frame.gif" alt="staked bohemian" />
              <img
                className="absolute top-[84px] left-[120px] w-[215px]"
                src={
                  // @ts-ignore
                  nft.image
                }
                alt=""
              />
              <div className="absolute bottom-[34px] left-[135px] w-[120px] text-center">
                <h2 className="text-xl mb-[6px] leading-none">
                  {
                    // @ts-ignore
                    <Clock time={nft.time} />
                  }
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakingContent;

const StakingStyled = styled.div`
  color: blueviolet;
  background: coral;
  font-size: 12px;
  width: 200px;
  margin: auto;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  cursor: pointer;
  text-align: center;
  overflow-wrap: anywhere;
  padding: 10px;
`;

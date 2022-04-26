import { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";
import { StakingInfos } from "./StakingInfo";
import {
  computeClaimableCoins,
  fetchFarm,
  fetchFarmer,
  fetchVaultNFTs,
  getEarningsPerDay,
  initGemFarm,
} from "../../lib/staking/util";

import { stakingGlobals } from "../../constants/staking";

import { getTokens } from "../../lib/utils/getTokens";
import { stakeNft } from "../../lib/staking/stakeNft";
import { unstakeNft } from "../../lib/staking/unstakeNft";
import { claim } from "../../lib/staking/claim";
import ContentNFT from "./ContentNFT";
import UnstakedNFT from "./UnstakedNFT";

const StakingContent: FunctionComponent = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, sendTransaction } = useWallet();

  const [availableNFTs, setAvailableNFTs] = useState(new Array<any>());
  const [loadingNft, setLoadingNFT] = useState(false);
  const [loadingInfos, setLoadingInfos] = useState(false);
  const [farm, setFarm]: [any, any] = useState(null);
  const [claimableCoins, setClaimableCoins] = useState(0);
  const [updateShow, setUpdateShow] = useState(false);

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

  useEffect(() => {
    if (availableNFTs.length) setUpdateShow(true);
  }, [availableNFTs]);

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
      publicKey?.toString()
    );

    console.log("currentNft :", currentNft);

    const currentStakingNft = await fetchVaultNFTs(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      publicKey,
      farmId
    );

    const stakingNFTs = currentStakingNft?.map((e: any) => {
      return {
        name: e.externalMetadata.name,
        pubkey: e.pubkey,
        mint: e.mint,
        image: e.externalMetadata.image,
        isStaked: true,
        farmer: e.farmer,
      };
    });

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
    setAvailableNFTs(walletNFTs.concat(stakingNFTs));

    const farmer = await fetchFarmer(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      farmId,
      publicKey!
    );

    setClaimableCoins(
      computeClaimableCoins(
        farmer.account,
        getEarningsPerDay(farmer.account, null),
        currentStakingNft.length
      )
    );
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
    farmId: PublicKey,
    mint: PublicKey,
    source: PublicKey,
    creator: PublicKey
  ) => {
    setLoadingNFT(true);

    await stakeNft(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      farmId,
      publicKey!,
      mint,
      source,
      creator,
      (e) => {
        console.error(e);
        setLoadingNFT(false);
      },
      () => {
        refreshStakingData(farmId);
      }
    );
  };

  const handleUnstakeNFT = async (farmId: PublicKey, mint: PublicKey) => {
    setLoadingNFT(true);

    await unstakeNft(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      farmId,
      publicKey!,
      mint,
      availableNFTs.filter((x) => x.isStaked === true).length,
      (e) => {
        console.error(e);
        setLoadingNFT(false);
      },
      () => {
        refreshStakingData(farmId);
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

  return (
    <div>
      <StakingInfos
        walletStakedNfts={availableNFTs.filter((x) => x.isStaked).length}
        NftStaked={farm !== null ? farm?.gemsStaked.toNumber() : "N/A"}
        claimableCoins={claimableCoins}
        claim={async () => {
          await handleClaim(stakingGlobals.farmId);
        }}
      />

      {(loadingInfos || loadingNft) && <div className="loading"></div>}

      <UnstakedNFT
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
      />

      <ContentNFT
        loading={loadingNft}
        title={"Unstaked"}
        NFTs={availableNFTs.filter((x) => !x.isStaked)}
        callback={handleStakeNFT}
        claimableCoins={0}
        isStaking={false}
        getStakingInfo={getStakingInfos}
      />

      {updateShow && <StakingStyled>Update</StakingStyled>}
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

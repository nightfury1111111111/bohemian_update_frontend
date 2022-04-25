import { mint_list } from "../../configs/mint_list";
import { stakingGlobals } from "../../constants/staking";
import {useEffect, useState} from "react";
export const StakingInfos = ({
  NftStaked,
  claim,
  claimableCoins,
  walletStakedNfts,
}: {
  claim?: CallableFunction;
  NftStaked: number;
  claimableCoins: number;
  walletStakedNfts: number;
}) => {
  const totalSupply = mint_list.length;
  const [nftClaimableCoins, setNftClaimableCoins] = useState(0);

  useEffect(() => {
    setNftClaimableCoins(claimableCoins);

    const interval = setInterval(() => {
      setNftClaimableCoins((prev) => prev + ((15 / 86400) * walletStakedNfts));
    }, 1000);
    return () => clearInterval(interval);
  }, [claimableCoins, walletStakedNfts]);

  return (
    <div className="w-full text-center py-10 relative">
      <div className="absolute h-[196px] w-1/2 right-0 cursor-pointer" onClick={() => {
        if (claim) {
          claim();
        }       
      }}></div>
      <img className="inline-block" src="./claimer.png" alt="claim and info box" />
      <div className="absolute w-[200px] top-[110px] left-[410px] text-center">
        <h4 className="text-xl">
              {(((NftStaked as number) / totalSupply) * 100).toFixed(2)}% Staked ({NftStaked}/{totalSupply})
        </h4>
        <h4>
            {nftClaimableCoins.toFixed(4)} {stakingGlobals.tokenName} earned
        </h4>
      </div>
    </div>
  );
};



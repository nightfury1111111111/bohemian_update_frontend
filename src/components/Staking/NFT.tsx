import { useEffect, useState } from "react";
import moment from "moment";
import { stakingGlobals } from "../../constants/staking";

const NFT = ({
  nft,
  callback,
  isStaking,
  earningsPerDay,
  getStakingInfo,
  loading,
  farmer,
  claimableCoins,
}: {
  nft: any;
  callback: any;
  isStaking: boolean;
  earningsPerDay: number;
  loading: boolean;
  getStakingInfo: any;
  farmer: any;
  claimableCoins: number;
}) => {
  const [nftClaimableCoins, setNftClaimableCoins] = useState(0);

  useEffect(() => {
    setNftClaimableCoins(claimableCoins);
    const interval = setInterval(() => {
      setNftClaimableCoins((prev) => prev + earningsPerDay / 86400);
    }, 1000);
    return () => clearInterval(interval);
  });
  console.log("mint of nft", nft.mint.toBase58());
  console.log("pubkey of nft", nft.pubkey.toBase58());
  console.log("creator of nft", nft.creator.toBase58());

  return (
    <div> 
      {isStaking ? (
      <div className="relative inline-block w-[460px] cursor-pointer"
      onClick={() => {
        callback(stakingGlobals.farmId, nft.mint);
      }}>        
          <img src="./staked-frame.gif" alt="staked bohemian" />           
          <img className="absolute top-[84px] left-[120px] w-[215px]" src={nft.image} alt="" />
          <div className="absolute bottom-[34px] left-[135px] w-[120px] text-center">
              <h2 className="text-xl mb-[6px] leading-none">234 hours 16 min to become Guru Master.</h2>         
          </div>             
       </div>
      ) : (
      <div>
          <div className="relative inline-block w-[460px] cursor-pointer" onClick={() =>
            callback(stakingGlobals.vaultProgramId, nft.mint, nft.pubkey, nft.creator)
          }>        
            <img src="./unstaked-frame.gif" alt="unstaked bohemian" />           
            <img className="absolute top-[25px] left-[55px] w-[240px]" src={nft.image} alt="" />
            <div className="absolute bottom-[150px] left-[85px] w-[180px] text-center">
              <h2 className="text-xl mb-[6px] leading-none">Stake {nft.name} to become a Guru Master.</h2>              
            </div>                 
          </div>        
      </div>
      )}
    </div>
  );
};

export default NFT;

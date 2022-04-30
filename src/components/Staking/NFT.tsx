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
         <div className="absolute bottom-[38px] left-[80px] w-[220px] text-center">
           <h2 className="text-ld mb-[-2px]">coins: {nftClaimableCoins.toFixed(4)}</h2>
           <h3 className="text-md">{earningsPerDay} $WOOP / DAY</h3>
         </div>             
       </div>
      ) : (
     
          <div className="relative inline-block w-[460px] cursor-pointer" onClick={() =>
            callback(stakingGlobals.farmId, nft.mint, nft.pubkey, nft.creator)
          }>        
            <img src="./unstaked-frame.gif" alt="unstaked bohemian" />           
            <img className="absolute top-[25px] left-[55px] w-[240px]" src={nft.image} alt="" />
            <div className="absolute bottom-[150px] left-[65px] w-[220px] text-center">
              <h2 className="text-xl mb-[-2px]">{nft.name}</h2>
              {/* <h3 className="text-lg">15 $WOOP / DAY</h3> */}
            </div>                 
          </div>        
       
      )}
    </div>
  );
};

export default NFT;

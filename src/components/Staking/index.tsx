import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FunctionComponent } from "react";
import styled from "styled-components";
import StakingContent from "./StakingContent";

const Staking: FunctionComponent = () => {
  const { connected } = useWallet();

  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      <StakingStyled>
        {connected ? (
          <StakingContent />
        ) : (
          <div className="w-full text-center pt-10">         
            <WalletMultiButton className="text-4xl" />       
          </div>
        )}
      </StakingStyled>
    </div>
  );
};

const StakingStyled = styled.div`
  .wallet-adapter-button {
    background-color: #facc13;
    color: #043251;
    justify-content: center;
    text-align: center;
    margin: 0 auto;
    width: 300px;
  }
  .wallet-adapter-button:hover {
    background-color: #043251;
    color: #facc13;
  }
  .content-button {
    display: flex;
    justify-content: center;
    margin: 50px 0;
  }
`;

export default Staking;

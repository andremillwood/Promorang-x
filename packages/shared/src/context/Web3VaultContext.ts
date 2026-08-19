import { createContext, useContext } from 'react';

export interface Web3VaultContextType {

  tvlUsdc: number;
  totalLpShares: number;
  apyPercentage: number;
  userLpShares: number;
  userUsdcValue: number;
  depositLiquidity: (amountUsdc: number) => Promise<boolean>;
  withdrawLiquidity: (sharesAmount: number) => Promise<boolean>;
  claimGaslessReward: (campaignId: string) => Promise<boolean>;
}

export const initialWeb3VaultState: Web3VaultContextType = {
  tvlUsdc: 125000,
  totalLpShares: 120000,
  apyPercentage: 18.5,
  userLpShares: 500,
  userUsdcValue: 520,
  depositLiquidity: async () => true,
  withdrawLiquidity: async () => true,
  claimGaslessReward: async () => true,
};

const Web3VaultContext = createContext<Web3VaultContextType>(initialWeb3VaultState);

export const useWeb3Vault = () => useContext(Web3VaultContext);


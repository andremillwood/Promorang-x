import { createContext, useContext } from 'react';

export interface Web3VaultContextType {
  tvlGems: number;
  tvlUsdc: number; // legacy alias
  totalLpShares: number;
  apyPercentage: number;
  userLpShares: number;
  userGemsValue: number;
  userUsdcValue: number; // legacy alias
  depositLiquidity: (amountGems: number) => Promise<boolean>;
  withdrawLiquidity: (sharesAmount: number) => Promise<boolean>;
  claimGaslessReward: (campaignId: string) => Promise<boolean>;
}

export const initialWeb3VaultState: Web3VaultContextType = {
  tvlGems: 125000,
  tvlUsdc: 125000,
  totalLpShares: 125000,
  apyPercentage: 16.4,
  userLpShares: 0,
  userGemsValue: 0,
  userUsdcValue: 0,
  depositLiquidity: async () => true,
  withdrawLiquidity: async () => true,
  claimGaslessReward: async () => true,
};

const Web3VaultContext = createContext<Web3VaultContextType>(initialWeb3VaultState);

export const useWeb3Vault = () => useContext(Web3VaultContext);



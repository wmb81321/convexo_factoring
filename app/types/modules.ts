export type ModuleType = 'home' | 'profile' | 'transfers' | 'defi';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  walletAddress: string;
  createdAt: Date;
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
  };
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contract?: string;
  usdValue?: number;
  icon?: string;
}

export interface LiquidityPool {
  address: string;
  token0: {
    symbol: string;
    address: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    address: string;
    decimals: number;
  };
  tvl: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  price: number;
  priceChange24h: number;
}

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  minimumAmountOut: string;
  route: string[];
  gasEstimate: string;
} 
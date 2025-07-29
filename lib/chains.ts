export interface TokenContract {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorer: string;
  pimlicoBundlerUrl: string;
  tokens: {
    usdc?: TokenContract;
    cope?: TokenContract;
  };
  isDefault?: boolean;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  // Ethereum Sepolia (Default)
  11155111: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    shortName: "ETH Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://rpc.sepolia.org",
    blockExplorer: "https://sepolia.etherscan.io",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/11155111/rpc",
    tokens: {
      usdc: {
        address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      cope: {
        address: "0x9B063Cfa8BDC03492933caA8BEa7c3d89846b2a7",
        symbol: "COPE",
        name: "Cope Token",
        decimals: 18,
      },
    },
    isDefault: true,
  },
  
  // Unichain Sepolia
  1301: {
    chainId: 1301,
    name: "Unichain Sepolia",
    shortName: "UNI Sepolia",
    nativeCurrency: {
      name: "Unichain Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://sepolia.unichain.org",
    blockExplorer: "https://unichain-sepolia.blockscout.com",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/1301/rpc",
    tokens: {
      usdc: {
        address: "0x078d782b760474a361dda0af3839290b0ef57ad6",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      // COPE not deployed on Unichain yet
    },
  },
  
  // Optimism Sepolia
  11155420: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    shortName: "OP Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/11155420/rpc",
    tokens: {
      usdc: {
        address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      // COPE not deployed on Optimism yet
    },
  },
  
  // Base Sepolia
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    shortName: "BASE Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/84532/rpc",
    tokens: {
      usdc: {
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      // COPE not deployed on Base yet
    },
  },
};

export const DEFAULT_CHAIN = SUPPORTED_CHAINS[11155111]; // Ethereum Sepolia

export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId];
}

export function getAllChains(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS);
}

export function getChainTokens(chainId: number): TokenContract[] {
  const chain = getChainById(chainId);
  if (!chain) return [];
  
  const tokens: TokenContract[] = [];
  if (chain.tokens.usdc) tokens.push(chain.tokens.usdc);
  if (chain.tokens.cope) tokens.push(chain.tokens.cope);
  
  return tokens;
} 
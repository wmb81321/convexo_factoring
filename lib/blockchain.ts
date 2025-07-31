import { createPublicClient, http, formatEther, formatUnits, parseAbi } from 'viem';
import { sepolia, optimismSepolia, baseSepolia } from 'viem/chains';
import { getChainById, TokenContract } from './chains';

// ERC-20 ABI for balance and token info
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]);

// Create public clients for different chains
const getPublicClient = (chainId: number) => {
  switch (chainId) {
    case 11155111: // Ethereum Sepolia
      return createPublicClient({
        chain: sepolia,
        transport: http(),
      });
    case 11155420: // Optimism Sepolia  
      return createPublicClient({
        chain: optimismSepolia,
        transport: http(),
      });
    case 84532: // Base Sepolia
      return createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });
    case 1301: // Unichain Sepolia
      return createPublicClient({
        chain: {
          id: 1301,
          name: 'Unichain Sepolia',
          network: 'unichain-sepolia',
          nativeCurrency: {
            decimals: 18,
            name: 'Ether',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: ['https://sepolia.unichain.org'],
            },
            public: {
              http: ['https://sepolia.unichain.org'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Unichain Sepolia Explorer',
              url: 'https://unichain-sepolia.blockscout.com',
            },
          },
          testnet: true,
        },
        transport: http('https://sepolia.unichain.org'),
      });
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  formattedBalance: string;
  usdValue?: string;
  contract?: string;
  isLoading?: boolean;
  error?: string;
}

// Fetch native ETH balance
export async function fetchNativeBalance(
  walletAddress: string, 
  chainId: number
): Promise<TokenBalance> {
  try {
    const chain = getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    const client = getPublicClient(chainId);
    const balance = await client.getBalance({ 
      address: walletAddress as `0x${string}` 
    });

    const balanceInEth = formatEther(balance);
    const formattedBalance = parseFloat(balanceInEth).toFixed(4);

    return {
      symbol: chain.nativeCurrency.symbol,
      name: chain.nativeCurrency.name,
      balance: balanceInEth,
      formattedBalance,
      // Mock USD value - you can integrate with price APIs
      usdValue: `$${(parseFloat(balanceInEth) * 2000).toFixed(2)}`, // Assuming $2000 per ETH
    };
  } catch (error) {
    console.error(`Error fetching native balance:`, error);
    return {
      symbol: 'ETH',
      name: 'Ether',
      balance: '0',
      formattedBalance: '0.0000',
      error: 'Failed to load',
    };
  }
}

// Fetch ERC-20 token balance
export async function fetchTokenBalance(
  walletAddress: string,
  tokenContract: TokenContract,
  chainId: number
): Promise<TokenBalance> {
  try {
    const client = getPublicClient(chainId);
    
    // Get token balance
    const balance = await client.readContract({
      address: tokenContract.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    // Format balance using token decimals
    const balanceFormatted = formatUnits(balance as bigint, tokenContract.decimals);
    const formattedBalance = parseFloat(balanceFormatted).toFixed(
      tokenContract.decimals === 6 ? 2 : 4
    );

    // Real USD values - NO MORE MOCKS
    let usdValue: string | undefined;
    if (tokenContract.symbol === 'USDC') {
      usdValue = `$${formattedBalance}`; // USDC is pegged to $1
    }
    // COPE USD value will be calculated in the UI using real LP price
    // Don't calculate it here since we need the LP price

    return {
      symbol: tokenContract.symbol,
      name: tokenContract.name,
      balance: balanceFormatted,
      formattedBalance,
      usdValue,
      contract: tokenContract.address,
    };
  } catch (error) {
    console.error(`Error fetching ${tokenContract.symbol} balance:`, error);
    return {
      symbol: tokenContract.symbol,
      name: tokenContract.name,
      balance: '0',
      formattedBalance: '0.00',
      usdValue: '$0.00',
      contract: tokenContract.address,
      error: 'Failed to load',
    };
  }
}

// Fetch all balances for a wallet on a specific chain
export async function fetchAllBalances(
  walletAddress: string,
  chainId: number
): Promise<TokenBalance[]> {
  const chain = getChainById(chainId);
  if (!chain) {
    return [];
  }

  const balances: TokenBalance[] = [];

  try {
    // Always fetch native balance first
    const nativeBalance = await fetchNativeBalance(walletAddress, chainId);
    balances.push(nativeBalance);

    // Fetch token balances if available on this chain
    const tokenPromises: Promise<TokenBalance>[] = [];
    
    if (chain.tokens.usdc) {
      tokenPromises.push(fetchTokenBalance(walletAddress, chain.tokens.usdc, chainId));
    }
    
    if (chain.tokens.ecop) {
      tokenPromises.push(fetchTokenBalance(walletAddress, chain.tokens.ecop, chainId));
    }

    // Wait for all token balances
    const tokenBalances = await Promise.all(tokenPromises);
    balances.push(...tokenBalances);

  } catch (error) {
    console.error('Error fetching balances:', error);
  }

  return balances;
}

// Get USD price for tokens (mock implementation - replace with real price API)
export async function getTokenPrice(symbol: string): Promise<number> {
  // Mock prices - integrate with CoinGecko, CoinMarketCap, or other price APIs
  const mockPrices: Record<string, number> = {
    'ETH': 2000,
    'USDC': 1,
    'COPE': 0.25,
  };

  return mockPrices[symbol] || 0;
}

// Format large numbers with proper suffixes
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
} 
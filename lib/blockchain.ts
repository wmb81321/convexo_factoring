import { createPublicClient, http, formatEther, formatUnits, parseAbi } from 'viem';
import { sepolia, optimismSepolia, baseSepolia } from 'viem/chains';
import { getChainById, TokenContract, getAllChains } from './chains';

// ERC-20 ABI for balance and token info
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]);

// Create public clients for different chains with more reliable RPC endpoints
const getPublicClient = (chainId: number) => {
  switch (chainId) {
    case 11155111: // Ethereum Sepolia
      return createPublicClient({
        chain: sepolia,
        transport: http('https://eth-sepolia.g.alchemy.com/v2/demo'), // Using Alchemy demo endpoint for better reliability
      });
    case 11155420: // Optimism Sepolia  
      return createPublicClient({
        chain: optimismSepolia,
        transport: http('https://sepolia.optimism.io'),
      });
    case 84532: // Base Sepolia
      return createPublicClient({
        chain: baseSepolia,
        transport: http('https://sepolia.base.org'),
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
  contractExplorerUrl?: string; // New field for explorer link
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
    console.error(`Error fetching native balance for chain ${chainId}:`, error);
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
    const chain = getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not supported`);
    }

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

    // Create explorer URL for the token contract
    const contractExplorerUrl = `${chain.blockExplorer}/token/${tokenContract.address}`;

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
      contractExplorerUrl,
    };
  } catch (error) {
    console.error(`Error fetching ${tokenContract.symbol} balance on chain ${chainId}:`, error);
    
    // Create explorer URL even for failed requests
    const chain = getChainById(chainId);
    const contractExplorerUrl = chain ? `${chain.blockExplorer}/token/${tokenContract.address}` : undefined;
    
    return {
      symbol: tokenContract.symbol,
      name: tokenContract.name,
      balance: '0',
      formattedBalance: '0.00',
      usdValue: '$0.00',
      contract: tokenContract.address,
      contractExplorerUrl,
      error: 'Failed to load',
    };
  }
}

/**
 * Debug function to test COPE balance fetching specifically
 */
export async function debugCopeBalance(walletAddress: string): Promise<void> {
  console.log('🔍 DEBUG: Testing COPE balance fetching...');
  console.log('Wallet address:', walletAddress);
  
  const chains = getAllChains();
  
  for (const chain of chains) {
    if (chain.tokens.ecop) {
      console.log(`\n🔍 Testing COPE on ${chain.name} (${chain.chainId})`);
      console.log('COPE contract address:', chain.tokens.ecop.address);
      console.log('Block explorer:', chain.blockExplorer);
      
      try {
        const balance = await fetchTokenBalance(walletAddress, chain.tokens.ecop, chain.chainId);
        console.log('✅ COPE balance result:', balance);
        
        if (balance.error) {
          console.log('❌ Error fetching COPE balance:', balance.error);
        } else {
          console.log('✅ COPE balance fetched successfully');
          console.log('Balance:', balance.balance);
          console.log('Formatted:', balance.formattedBalance);
        }
      } catch (error) {
        console.error('❌ Exception fetching COPE balance:', error);
      }
    } else {
      console.log(`\n⚠️ No COPE token configured for ${chain.name} (${chain.chainId})`);
    }
  }
}

/**
 * Test if COPE contract is accessible and returns correct data
 */
export async function testCopeContract(): Promise<void> {
  console.log('🔍 Testing COPE contract accessibility...');
  
  const chain = getChainById(11155111); // Ethereum Sepolia
  if (!chain || !chain.tokens.ecop) {
    console.log('❌ COPE token not configured for Ethereum Sepolia');
    return;
  }
  
  const client = getPublicClient(11155111);
  const contractAddress = chain.tokens.ecop.address;
  
  try {
    // Test reading token symbol
    console.log('🔍 Testing token symbol...');
    const symbol = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'symbol',
    });
    console.log('✅ Token symbol:', symbol);
    
    // Test reading token name
    console.log('🔍 Testing token name...');
    const name = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'name',
    });
    console.log('✅ Token name:', name);
    
    // Test reading token decimals
    console.log('🔍 Testing token decimals...');
    const decimals = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });
    console.log('✅ Token decimals:', decimals);
    
    // Test reading balance for a zero address (should return 0)
    console.log('🔍 Testing balance for zero address...');
    const zeroBalance = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: ['0x0000000000000000000000000000000000000000' as `0x${string}`],
    });
    console.log('✅ Zero address balance:', zeroBalance);
    
    console.log('✅ COPE contract is accessible and working correctly');
    
  } catch (error) {
    console.error('❌ Error testing COPE contract:', error);
  }
}

// Fetch all balances for a wallet on a specific chain
export async function fetchAllBalances(
  walletAddress: string,
  chainId: number
): Promise<TokenBalance[]> {
  const chain = getChainById(chainId);
  if (!chain) {
    console.log(`❌ Chain ${chainId} not found in configuration`);
    return [];
  }

  console.log(`🔍 Fetching balances for ${walletAddress} on ${chain.name} (${chainId})`);
  const balances: TokenBalance[] = [];

  try {
    // Always fetch native balance first
    console.log('🔍 Fetching native balance...');
    const nativeBalance = await fetchNativeBalance(walletAddress, chainId);
    balances.push(nativeBalance);
    console.log('✅ Native balance:', nativeBalance.formattedBalance, nativeBalance.symbol);

    // Fetch token balances if available on this chain
    const tokenPromises: Promise<TokenBalance>[] = [];
    
    if (chain.tokens.usdc) {
      console.log('🔍 Fetching USDC balance...');
      tokenPromises.push(fetchTokenBalance(walletAddress, chain.tokens.usdc, chainId));
    } else {
      console.log('⚠️ No USDC token configured for this chain');
    }
    
    if (chain.tokens.ecop) {
      console.log('🔍 Fetching COPE balance...');
      console.log('COPE contract:', chain.tokens.ecop.address);
      tokenPromises.push(fetchTokenBalance(walletAddress, chain.tokens.ecop, chainId));
    } else {
      console.log('⚠️ No COPE token configured for this chain');
    }

    // Wait for all token balances
    if (tokenPromises.length > 0) {
      console.log(`🔍 Waiting for ${tokenPromises.length} token balances...`);
      const tokenBalances = await Promise.all(tokenPromises);
      balances.push(...tokenBalances);
      
      tokenBalances.forEach(balance => {
        if (balance.error) {
          console.log(`❌ Error fetching ${balance.symbol}:`, balance.error);
        } else {
          console.log(`✅ ${balance.symbol} balance:`, balance.formattedBalance);
        }
      });
    }

    console.log(`✅ Total balances found: ${balances.length}`);

  } catch (error) {
    console.error('❌ Error fetching balances:', error);
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

/**
 * Fetch balances across all supported chains for a wallet address
 */
export async function fetchAllChainsBalances(walletAddress: string): Promise<{
  [chainId: number]: TokenBalance[];
}> {
  const allChains = getAllChains();
  const results: { [chainId: number]: TokenBalance[] } = {};
  
  console.log(`🔍 Fetching balances across ${allChains.length} chains for ${walletAddress}`);
  
  // Fetch balances for all chains in parallel
  const promises = allChains.map(async (chain) => {
    try {
      console.log(`🔍 Fetching balances for chain ${chain.chainId} (${chain.name})`);
      const balances = await fetchAllBalances(walletAddress, chain.chainId);
      results[chain.chainId] = balances;
      console.log(`✅ Chain ${chain.chainId}: Found ${balances.length} tokens`);
      return { chainId: chain.chainId, balances, error: null };
    } catch (error) {
      console.error(`❌ Chain ${chain.chainId}: Error fetching balances:`, error);
      results[chain.chainId] = [];
      return { chainId: chain.chainId, balances: [], error };
    }
  });
  
  await Promise.all(promises);
  
  console.log(`✅ Multi-chain balance fetch complete. Results:`, results);
  return results;
}

/**
 * Get aggregated balance summary across all chains
 */
export function getAggregatedBalanceSummary(allChainsBalances: { [chainId: number]: TokenBalance[] }): {
  totalEth: number;
  totalUsdc: number;
  totalCope: number;
  chainBreakdown: { [chainId: number]: { eth: number; usdc: number; cope: number; } };
} {
  const summary = {
    totalEth: 0,
    totalUsdc: 0,
    totalCope: 0,
    chainBreakdown: {} as { [chainId: number]: { eth: number; usdc: number; cope: number; } }
  };
  
  Object.entries(allChainsBalances).forEach(([chainId, balances]) => {
    const chainSummary = { eth: 0, usdc: 0, cope: 0 };
    
    balances.forEach(balance => {
      const amount = parseFloat(balance.balance);
      if (balance.symbol === 'ETH') {
        chainSummary.eth += amount;
        summary.totalEth += amount;
      } else if (balance.symbol === 'USDC') {
        chainSummary.usdc += amount;
        summary.totalUsdc += amount;
      } else if (balance.symbol === 'COPE') {
        chainSummary.cope += amount;
        summary.totalCope += amount;
      }
    });
    
    summary.chainBreakdown[parseInt(chainId)] = chainSummary;
  });
  
  return summary;
} 
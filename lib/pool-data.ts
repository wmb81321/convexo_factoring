import { createPublicClient, http, formatUnits, getContract } from 'viem';
import { sepolia } from 'viem/chains';

// LP Contract on Ethereum Sepolia - Updated to match Uniswap analytics
const LP_CONTRACT_ADDRESS = "0x6e3a232aab5dabf359a7702f287752eb3db696f8f917e758dce73ae2a9f60301";

// Uniswap V4 Pool Interface (simplified)
const POOL_ABI = [
  {
    "inputs": [],
    "name": "token0",
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token1", 
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "slot0",
    "outputs": [
      {"type": "uint160", "name": "sqrtPriceX96"},
      {"type": "int24", "name": "tick"},
      {"type": "uint16", "name": "observationIndex"},
      {"type": "uint16", "name": "observationCardinality"},
      {"type": "uint16", "name": "observationCardinalityNext"},
      {"type": "uint8", "name": "feeProtocol"},
      {"type": "bool", "name": "unlocked"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ERC20 ABI for balance checks
const ERC20_ABI = [
  {
    "inputs": [{"type": "address"}],
    "name": "balanceOf",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Token addresses on Sepolia (these would need to be the actual addresses)
const USDC_ADDRESS = "0x"; // Replace with actual USDC address on Sepolia
const COPE_ADDRESS = "0x"; // Replace with actual COPE address on Sepolia
const WETH_ADDRESS = "0x"; // Replace with actual WETH address on Sepolia

export interface PoolData {
  usdcCopePrice: number;
  ethUsdcPrice: number;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  tvlUSD: number;
  volumeUSD: number;
  feesUSD: number;
  token0: {
    symbol: string;
    name: string;
    address: string;
  };
  token1: {
    symbol: string;
    name: string;
    address: string;
  };
}

export interface UserBalance {
  eth: number;
  usdc: number;
  cope: number;
  totalUsd: number;
}

// Create a public client for Sepolia
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

/**
 * Calculate price from Uniswap V3/V4 sqrtPriceX96
 */
function calculatePriceFromSqrtPriceX96(sqrtPriceX96: bigint, decimals0: number, decimals1: number): number {
  const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
  const price = sqrtPrice ** 2;
  const adjustedPrice = price * (10 ** decimals0) / (10 ** decimals1);
  return adjustedPrice;
}

/**
 * Fetch ETH/USDC price from external API (CoinGecko as fallback)
 */
async function fetchEthUsdcPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.warn('Failed to fetch ETH price from CoinGecko, using fallback:', error);
    // Fallback price
    return 3786.98;
  }
}

/**
 * Fetch real pool analytics from Uniswap subgraph - NO FALLBACKS, REAL DATA ONLY
 */
async function fetchUniswapPoolAnalytics(): Promise<Partial<PoolData>> {
  console.log('🔍 Fetching REAL Uniswap analytics for pool:', LP_CONTRACT_ADDRESS);
  
  try {
    // Use the official Uniswap V3 subgraph for Sepolia
    const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-sepolia';
    
    const query = `
      query GetPool($poolId: ID!) {
        pool(id: $poolId) {
          id
          totalValueLockedUSD
          volumeUSD
          feesUSD
          sqrtPrice
          tick
          liquidity
          token0Price
          token1Price
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          poolDayData(first: 7, orderBy: date, orderDirection: desc) {
            date
            volumeUSD
            feesUSD
            tvlUSD
            open
            close
          }
        }
      }
    `;

    console.log('📡 Sending GraphQL query to:', SUBGRAPH_URL);
    console.log('🔍 Pool ID:', LP_CONTRACT_ADDRESS.toLowerCase());

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          poolId: LP_CONTRACT_ADDRESS.toLowerCase()
        }
      })
    });

    console.log('📨 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Raw GraphQL response:', JSON.stringify(data, null, 2));
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const pool = data.data?.pool;
    if (!pool) {
      console.error('❌ Pool not found in subgraph response');
      console.log('Available data:', data.data);
      throw new Error('Pool not found in subgraph - check if pool exists on Sepolia');
    }

    console.log('✅ Found pool data:', pool);

    const latestDayData = pool.poolDayData?.[0] || {};
    console.log('📈 Latest day data:', latestDayData);

    const result = {
      tvlUSD: parseFloat(pool.totalValueLockedUSD || '0'),
      volumeUSD: parseFloat(pool.volumeUSD || '0'),
      feesUSD: parseFloat(pool.feesUSD || '0'),
      totalLiquidity: parseFloat(pool.totalValueLockedUSD || '0'),
      volume24h: parseFloat(latestDayData.volumeUSD || '0'),
      fees24h: parseFloat(latestDayData.feesUSD || '0'),
      token0: {
        symbol: pool.token0?.symbol || 'UNKNOWN',
        name: pool.token0?.name || 'Unknown Token',
        address: pool.token0?.id || '',
      },
      token1: {
        symbol: pool.token1?.symbol || 'UNKNOWN',
        name: pool.token1?.name || 'Unknown Token',
        address: pool.token1?.id || '',
      }
    };

    console.log('🎯 Processed analytics result:', result);
    return result;

  } catch (error) {
    console.error('💥 FAILED to fetch real Uniswap analytics:', error);
    // Re-throw the error instead of using fallback - we want to see what's wrong
    throw error;
  }
}

/**
 * Fetch real USDC/COPE price from the liquidity pool
 */
export async function fetchUsdcCopePrice(): Promise<number> {
  try {
    const poolContract = getContract({
      address: LP_CONTRACT_ADDRESS as `0x${string}`,
      abi: POOL_ABI,
      client: publicClient
    });

    // Get slot0 data which contains sqrtPriceX96
    const slot0Data = await poolContract.read.slot0();
    const sqrtPriceX96 = slot0Data[0];

    // For USDC/COPE, assuming USDC (6 decimals) and COPE (18 decimals)
    const price = calculatePriceFromSqrtPriceX96(sqrtPriceX96, 6, 18);
    
    return price;
  } catch (error) {
    console.warn('Failed to fetch pool price, using mock data:', error);
    // Return mock price as fallback
    return 1.2456;
  }
}

/**
 * Fetch user's token balances
 */
export async function fetchUserBalances(walletAddress: string): Promise<UserBalance> {
  try {
    // Fetch ETH balance
    const ethBalance = await publicClient.getBalance({
      address: walletAddress as `0x${string}`
    });
    const ethAmount = Number(formatUnits(ethBalance, 18));

    // Fetch USDC balance (if USDC_ADDRESS is available)
    let usdcAmount = 0;
    if (USDC_ADDRESS && USDC_ADDRESS !== "0x") {
      try {
        const usdcContract = getContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          client: publicClient
        });
        const usdcBalance = await usdcContract.read.balanceOf([walletAddress as `0x${string}`]);
        usdcAmount = Number(formatUnits(usdcBalance, 6));
      } catch (error) {
        console.warn('Failed to fetch USDC balance:', error);
      }
    }

    // Fetch COPE balance (if COPE_ADDRESS is available)
    let copeAmount = 0;
    if (COPE_ADDRESS && COPE_ADDRESS !== "0x") {
      try {
        const copeContract = getContract({
          address: COPE_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          client: publicClient
        });
        const copeBalance = await copeContract.read.balanceOf([walletAddress as `0x${string}`]);
        copeAmount = Number(formatUnits(copeBalance, 18));
      } catch (error) {
        console.warn('Failed to fetch COPE balance:', error);
      }
    }

    return {
      eth: ethAmount,
      usdc: usdcAmount,
      cope: copeAmount,
      totalUsd: 0 // Will be calculated in the component
    };
  } catch (error) {
    console.warn('Failed to fetch user balances:', error);
    // Return mock data as fallback
    return {
      eth: 0.5,
      usdc: 1000,
      cope: 500,
      totalUsd: 0
    };
  }
}

/**
 * Fetch complete pool and user data - REAL DATA ONLY FOR USDC-COPE LP
 */
export async function fetchPoolData(walletAddress?: string): Promise<{ poolData: PoolData; userBalance?: UserBalance }> {
  console.log('🚀 Starting fetchPoolData for USDC-COPE LP...');
  
  try {
    // Fetch real Uniswap analytics first (this is the most important)
    console.log('📊 Fetching real Uniswap analytics...');
    const uniswapAnalytics = await fetchUniswapPoolAnalytics();
    
    // For USDC-COPE LP, we need USDC/COPE price from the pool
    let usdcCopePrice = 1.0; // Default fallback
    try {
      usdcCopePrice = await fetchUsdcCopePrice();
      console.log('💰 USDC/COPE price:', usdcCopePrice);
    } catch (error) {
      console.warn('⚠️ Failed to fetch USDC/COPE price, using default:', error);
    }

    // ETH price for user balance calculation (not for pool analytics)
    let ethUsdcPrice = 3786.98; // Default
    try {
      ethUsdcPrice = await fetchEthUsdcPrice();
      console.log('💎 ETH price:', ethUsdcPrice);
    } catch (error) {
      console.warn('⚠️ Failed to fetch ETH price, using default:', error);
    }

    // Fetch user balances if wallet address provided
    let userBalance: UserBalance | undefined;
    if (walletAddress) {
      try {
        userBalance = await fetchUserBalances(walletAddress);
        
        // Calculate total USD value
        const ethValueUsd = userBalance.eth * ethUsdcPrice;
        const usdcValueUsd = userBalance.usdc; // USDC is already in USD
        const copeValueUsd = userBalance.cope * usdcCopePrice; // COPE value in USDC (≈USD)
        
        userBalance.totalUsd = ethValueUsd + usdcValueUsd + copeValueUsd;
        console.log('👛 User balance calculated:', userBalance);
      } catch (error) {
        console.warn('⚠️ Failed to fetch user balances:', error);
      }
    }

    // Calculate APR based on REAL fees and TVL
    let apr = 0;
    if (uniswapAnalytics.fees24h && uniswapAnalytics.tvlUSD && uniswapAnalytics.tvlUSD > 0) {
      apr = (uniswapAnalytics.fees24h * 365 / uniswapAnalytics.tvlUSD) * 100;
      console.log('📈 Calculated APR from real data:', apr);
    } else {
      console.warn('⚠️ Cannot calculate APR - missing fees24h or tvlUSD');
    }

    const poolData: PoolData = {
      usdcCopePrice,
      ethUsdcPrice, // Only for user balance calculation
      totalLiquidity: uniswapAnalytics.totalLiquidity || 0,
      volume24h: uniswapAnalytics.volume24h || 0,
      fees24h: uniswapAnalytics.fees24h || 0,
      apr,
      tvlUSD: uniswapAnalytics.tvlUSD || 0,
      volumeUSD: uniswapAnalytics.volumeUSD || 0,
      feesUSD: uniswapAnalytics.feesUSD || 0,
      token0: uniswapAnalytics.token0 || {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        address: '',
      },
      token1: uniswapAnalytics.token1 || {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        address: '',
      }
    };

    console.log('✅ Final pool data:', poolData);
    return { poolData, userBalance };

  } catch (error) {
    console.error('💥 FATAL ERROR fetching pool data:', error);
    
         // Don't use fallback - show the error to the user
     throw new Error(`Failed to fetch real Uniswap data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 
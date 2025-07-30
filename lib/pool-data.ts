import { createPublicClient, http, formatUnits, getContract } from 'viem';
import { sepolia } from 'viem/chains';

// LP Contract on Ethereum Sepolia
const LP_CONTRACT_ADDRESS = "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543";

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
    return 2500;
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
 * Fetch complete pool and user data
 */
export async function fetchPoolData(walletAddress?: string): Promise<{ poolData: PoolData; userBalance?: UserBalance }> {
  try {
    // Fetch prices in parallel
    const [usdcCopePrice, ethUsdcPrice] = await Promise.all([
      fetchUsdcCopePrice(),
      fetchEthUsdcPrice()
    ]);

    // Fetch user balances if wallet address provided
    let userBalance: UserBalance | undefined;
    if (walletAddress) {
      userBalance = await fetchUserBalances(walletAddress);
      
      // Calculate total USD value
      const ethValueUsd = userBalance.eth * ethUsdcPrice;
      const usdcValueUsd = userBalance.usdc; // USDC is already in USD
      const copeValueUsd = userBalance.cope * usdcCopePrice; // COPE value in USDC (≈USD)
      
      userBalance.totalUsd = ethValueUsd + usdcValueUsd + copeValueUsd;
    }

    const poolData: PoolData = {
      usdcCopePrice,
      ethUsdcPrice,
      totalLiquidity: 98500, // This would need to be calculated from pool reserves
      volume24h: 45600, // This would need to be fetched from subgraph or API
      fees24h: 230, // This would need to be calculated
      apr: 12.5 // This would need to be calculated based on fees/TVL
    };

    return { poolData, userBalance };
  } catch (error) {
    console.error('Failed to fetch pool data:', error);
    
    // Return fallback data
    const poolData: PoolData = {
      usdcCopePrice: 1.2456,
      ethUsdcPrice: 2500,
      totalLiquidity: 98500,
      volume24h: 45600,
      fees24h: 230,
      apr: 12.5
    };

    const userBalance: UserBalance | undefined = walletAddress ? {
      eth: 0.5,
      usdc: 1000,
      cope: 500,
      totalUsd: 0.5 * 2500 + 1000 + 500 * 1.2456
    } : undefined;

    return { poolData, userBalance };
  }
} 
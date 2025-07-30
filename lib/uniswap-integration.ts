import { createPublicClient, http, getContract, parseUnits, formatUnits } from 'viem';
import { sepolia, mainnet } from 'viem/chains';
import { SUPPORTED_CHAINS } from './chains';

// Uniswap V3 Contract Addresses
const UNISWAP_V3_ADDRESSES = {
  // Ethereum Mainnet
  1: {
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  // Ethereum Sepolia
  11155111: {
    router: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    quoter: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
    factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  },
};

// Uniswap V3 Router ABI (essential functions only)
const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Uniswap V3 Quoter ABI
const QUOTER_ABI = [
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' },
    ],
    name: 'quoteExactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ERC20 ABI for approvals
const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippagePercent: number;
  recipient: string;
  chainId: number;
}

export interface SwapQuote {
  amountOut: string;
  amountOutFormatted: string;
  priceImpact: number;
  minimumAmountOut: string;
  route: string;
}

/**
 * Get quote for exact input swap
 */
export async function getSwapQuote(params: SwapParams): Promise<SwapQuote> {
  const addresses = UNISWAP_V3_ADDRESSES[params.chainId as keyof typeof UNISWAP_V3_ADDRESSES];
  if (!addresses) {
    throw new Error(`Uniswap V3 not supported on chain ${params.chainId}`);
  }

  // Create client for the appropriate chain
  const chain = params.chainId === 11155111 ? sepolia : mainnet;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const quoterContract = getContract({
    address: addresses.quoter as `0x${string}`,
    abi: QUOTER_ABI,
    client: publicClient,
  });

  try {
    const amountInWei = parseUnits(params.amountIn, 18); // Assuming 18 decimals, adjust as needed
    const fee = 3000; // 0.3% fee tier (most common)

    console.log('🔍 Getting swap quote...', {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      amountInWei: amountInWei.toString(),
    });

    const amountOut = await quoterContract.read.quoteExactInputSingle([
      params.tokenIn as `0x${string}`,
      params.tokenOut as `0x${string}`,
      fee,
      amountInWei,
      0n, // sqrtPriceLimitX96 = 0 (no limit)
    ]);

    const amountOutFormatted = formatUnits(amountOut, 18); // Adjust decimals as needed
    
    // Calculate minimum amount out with slippage
    const slippageMultiplier = (100 - params.slippagePercent) / 100;
    const minimumAmountOut = BigInt(Math.floor(Number(amountOut) * slippageMultiplier));

    // Simple price impact calculation (this is simplified)
    const priceImpact = 0.1; // You'd calculate this properly based on pool reserves

    return {
      amountOut: amountOut.toString(),
      amountOutFormatted,
      priceImpact,
      minimumAmountOut: minimumAmountOut.toString(),
      route: `${params.tokenIn} → ${params.tokenOut}`,
    };
  } catch (error) {
    console.error('❌ Error getting swap quote:', error);
    throw new Error(`Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if token approval is needed
 */
export async function checkTokenApproval(
  tokenAddress: string,
  owner: string,
  spender: string,
  amount: string,
  chainId: number
): Promise<boolean> {
  const chain = chainId === 11155111 ? sepolia : mainnet;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const tokenContract = getContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_APPROVE_ABI,
    client: publicClient,
  });

  try {
    const allowance = await tokenContract.read.allowance([
      owner as `0x${string}`,
      spender as `0x${string}`,
    ]);

    const amountWei = parseUnits(amount, 18); // Adjust decimals as needed
    return allowance >= amountWei;
  } catch (error) {
    console.error('❌ Error checking token approval:', error);
    return false;
  }
}

/**
 * Prepare approval transaction data
 */
export function prepareApprovalTransaction(
  tokenAddress: string,
  spenderAddress: string,
  amount: string
) {
  const amountWei = parseUnits(amount, 18); // Adjust decimals as needed
  
  // Encode the approval function call
  const approveCalldata = `0x095ea7b3${spenderAddress.slice(2).padStart(64, '0')}${amountWei.toString(16).padStart(64, '0')}`;

  return {
    to: tokenAddress as `0x${string}`,
    data: approveCalldata as `0x${string}`,
    value: 0n,
  };
}

/**
 * Prepare swap transaction data
 */
export function prepareSwapTransaction(
  params: SwapParams,
  quote: SwapQuote,
  chainId: number
) {
  const addresses = UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
  if (!addresses) {
    throw new Error(`Uniswap V3 not supported on chain ${chainId}`);
  }

  const deadline = Math.floor(Date.now() / 1000) + 20 * 60; // 20 minutes from now
  const amountInWei = parseUnits(params.amountIn, 18);
  const amountOutMinimum = BigInt(quote.minimumAmountOut);

  // Encode exactInputSingle call
  const swapParams = {
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    fee: 3000, // 0.3%
    recipient: params.recipient,
    deadline: BigInt(deadline),
    amountIn: amountInWei,
    amountOutMinimum,
    sqrtPriceLimitX96: 0n,
  };

  // This is a simplified encoding - in a real app you'd use a proper ABI encoder
  console.log('🔧 Preparing swap transaction:', swapParams);

  return {
    to: addresses.router as `0x${string}`,
    data: '0x' as `0x${string}`, // You'd encode the actual call data here
    value: 0n,
  };
}

/**
 * Get pool information for display
 */
export async function getPoolInfo(tokenA: string, tokenB: string, chainId: number) {
  // This would fetch pool information from the factory
  // For now, return mock data structure
  return {
    address: '0x0000000000000000000000000000000000000000',
    fee: 3000,
    token0: tokenA,
    token1: tokenB,
    liquidity: '0',
    sqrtPriceX96: '0',
  };
}
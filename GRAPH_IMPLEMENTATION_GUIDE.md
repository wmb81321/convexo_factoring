# 🔄 The Graph Implementation Guide for Convexo

## Overview
Based on [The Graph documentation](https://thegraph.com/docs/en/) and your current codebase analysis, here's what you need to implement to fix your pricing data fetching.

## 🚨 Critical Issues Fixed

### 1. **Invalid Pool Address**
- **Problem**: Pool address was 66 characters instead of 42
- **Solution**: Need to find actual USDC/COPE pool address from Uniswap V3

### 2. **Disabled Subgraph Route**
- **Problem**: Your API route was returning "SUBGRAPHS ARE DEAD"
- **Solution**: Re-enabled proper Graph API proxy

### 3. **Missing Token Addresses**
- **Problem**: Token addresses were empty strings
- **Solution**: Using addresses from your chains configuration

## 📊 What You Need to Fetch via The Graph

### Required Data Points:
```typescript
interface PoolData {
  // Price Information
  usdcCopePrice: number;        // From pool.token0Price/token1Price
  ethUsdcPrice: number;         // From external API or ETH/USDC pool
  
  // Liquidity Metrics
  totalLiquidity: number;       // From pool.totalValueLockedUSD
  tvlUSD: number;              // From pool.totalValueLockedUSD
  
  // Volume & Fee Data
  volume24h: number;           // From poolDayData[0].volumeUSD
  volumeUSD: number;           // From pool.volumeUSD (all-time)
  fees24h: number;             // From poolDayData[0].feesUSD
  feesUSD: number;             // From pool.feesUSD (all-time)
  
  // Calculated Metrics
  apr: number;                 // Calculated from fees24h and tvlUSD
  
  // Token Information
  token0: TokenInfo;           // From pool.token0
  token1: TokenInfo;           // From pool.token1
}
```

### GraphQL Query Structure:
```graphql
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
```

## 🔧 Implementation Steps

### Step 1: Find Correct Pool Address
```bash
# Search for USDC/COPE pool on Uniswap V3
# Visit: https://info.uniswap.org/#/pools
# Or use The Graph Explorer: https://thegraph.com/explorer
```

### Step 2: Set Up Graph API Key (For Production)
According to [The Graph pricing](https://thegraph.com/pricing/), you get:
- **Free Tier**: 100,000 queries/month
- **Growth Plan**: $100/month for 3M queries
- **Scale Plan**: Custom pricing

```typescript
// Add to your environment variables
GRAPH_API_KEY=your_api_key_here

// Update API route to use Gateway
const SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXuFy4wdAFLmBBH7GwAg`;
```

### Step 3: Network Alignment
**Current Issue**: Your main app uses Optimism, but data fetching targets Ethereum Sepolia.

**Options:**
1. **Use Optimism**: Switch to Optimism Uniswap V3 subgraph
2. **Use Ethereum Mainnet**: Switch to mainnet for real liquidity
3. **Use Cross-chain**: Fetch from multiple networks

**Recommended**: Use Ethereum Mainnet for real USDC/COPE data:
```typescript
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
```

### Step 4: Enhanced Query Implementation
```typescript
// Enhanced query with more data points
const ENHANCED_POOL_QUERY = `
  query GetPoolWithHistory($poolId: ID!) {
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
      
      # Price history for charts
      poolDayData(first: 30, orderBy: date, orderDirection: desc) {
        date
        volumeUSD
        feesUSD
        tvlUSD
        high
        low
        open
        close
      }
      
      # Recent swaps for real-time updates
      swaps(first: 10, orderBy: timestamp, orderDirection: desc) {
        timestamp
        amount0
        amount1
        amountUSD
      }
    }
  }
`;
```

## 🎯 Next Steps

1. **Find the correct USDC/COPE pool address**
2. **Update LP_CONTRACT_ADDRESS in pool-data.ts**
3. **Test the API route with a valid pool**
4. **Consider upgrading to The Graph's paid plan for production**
5. **Implement proper error handling for missing pools**

## 📈 The Graph Pricing Considerations

- **Development**: Use free hosted service
- **Production**: Use Gateway with API key for reliability
- **High Volume**: Consider The Graph's Scale plan

### Cost Estimation:
- **Typical DeFi App**: ~500K-1M queries/month
- **Recommended Plan**: Growth ($100/month)
- **Cost per query**: ~$0.00003

## 🔍 Debugging Steps

1. **Check if pool exists**:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"query":"{ pools(first: 5) { id } }"}' \
     https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-sepolia
   ```

2. **Validate pool address format**:
   - Must be 42 characters (0x + 40 hex)
   - Must be lowercase
   - Must exist in the subgraph

3. **Test with known working pool**:
   ```typescript
   // Use a known USDC/WETH pool for testing
   const TEST_POOL = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"; // USDC/WETH 0.3%
   ```

## 🌐 Alternative Data Sources

If The Graph continues to have issues, consider:

1. **Direct RPC calls** (current fallback)
2. **CoinGecko API** for pricing
3. **DeFiLlama API** for TVL data
4. **Uniswap SDK** for pool calculations

But The Graph remains the best option for comprehensive DeFi data.
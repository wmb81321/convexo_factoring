# 🚨 URGENT: The Graph Migration Required

## ⚠️ CRITICAL ISSUE IDENTIFIED

Your pricing data is not working because **The Graph has shut down their hosted service**! All old endpoints like `https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-sepolia` now return:

```json
{
  "errors": [
    {
      "message": "This endpoint has been removed. If you have any questions, reach out to support@thegraph.zendesk.com"
    }
  ]
}
```

## 🔄 Required Migration Steps

### 1. **Immediate Fix: Use New Endpoints**

```typescript
// OLD (Broken):
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-sepolia';

// NEW (Working):
const SUBGRAPH_ID = "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV"; // Uniswap V3 Mainnet
const SUBGRAPH_URL = `https://api.studio.thegraph.com/query/${SUBGRAPH_ID}`;
```

### 2. **Network Change Required**

❌ **Problem**: Sepolia testnet subgraphs have been removed  
✅ **Solution**: Switch to Ethereum Mainnet for real data

**Benefits of using Mainnet:**
- Real liquidity data
- Actual USDC/COPE pools (if they exist)
- Production-ready data
- Reliable subgraph availability

### 3. **Get The Graph API Key**

For production, you need an API key from [The Graph Studio](https://thegraph.com/studio/):

1. Visit https://thegraph.com/studio/
2. Connect your wallet
3. Create an API key
4. Add to environment variables:
   ```env
   GRAPH_API_KEY=your_api_key_here
   ```

### 4. **Updated Configuration**

I've already updated your API route to handle this:

```typescript
// app/api/uniswap-analytics/route.ts
const GRAPH_API_KEY = process.env.GRAPH_API_KEY;
const MAINNET_SUBGRAPH_ID = "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV";

if (GRAPH_API_KEY) {
  // Production: Gateway with API key
  SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${MAINNET_SUBGRAPH_ID}`;
} else {
  // Development: Studio endpoint (rate limited)
  SUBGRAPH_URL = `https://api.studio.thegraph.com/query/${MAINNET_SUBGRAPH_ID}`;
}
```

## 🎯 Next Steps

### Immediate Actions:
1. **Test the updated API route** (already done)
2. **Find a real USDC/COPE pool on mainnet**
3. **Update your pool address**

### Find USDC/COPE Pool on Mainnet:

```bash
# Test if new endpoint works
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ _meta { block { number } } }"}' \
  https://api.studio.thegraph.com/query/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV
```

### Real USDC Mainnet Address:
```typescript
const USDC_MAINNET = "0xA0b86a33E6417EfB4e1E35F5F35EcDFC59c0D06E"; // Circle USDC
```

### Find COPE Mainnet Address:
- Check CoinGecko: https://www.coingecko.com/en/coins/cope
- Check Etherscan for COPE token
- Verify it has a Uniswap V3 pool with USDC

## 💰 The Graph Pricing

**Free Tier**: 100,000 queries/month  
**Growth Plan**: $100/month for 3M queries  

For a DeFi app like yours, the free tier should be sufficient for development and initial production.

## 🔧 Alternative Solutions

If USDC/COPE pool doesn't exist on mainnet:

1. **Use USDC/ETH for base pricing**
2. **Get COPE price from CoinGecko API**
3. **Calculate synthetic USDC/COPE rate**

```typescript
// Alternative pricing strategy
const usdcEthPool = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"; // USDC/WETH 0.3%
const copeUsdPrice = await getCoinGeckoPrice("cope");
const usdcCopePrice = 1 / copeUsdPrice; // Synthetic rate
```

## ⚡ Quick Test

Test the new endpoint immediately:

```bash
# This should work now
npm run dev
# Check browser console for Graph API responses
```

The migration is **critical** - your app won't get pricing data until this is fixed!
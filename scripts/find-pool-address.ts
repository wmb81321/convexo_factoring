#!/usr/bin/env tsx
/**
 * Script to find the correct USDC/COPE pool address on Uniswap V3
 * Run with: npx tsx scripts/find-pool-address.ts
 */

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-sepolia';

// Token addresses from your chains.ts
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238".toLowerCase();
const COPE_ADDRESS = "0x9B063Cfa8BDC03492933caA8BEa7c3d89846b2a7".toLowerCase();

const FIND_POOLS_QUERY = `
  query FindPools($token0: String!, $token1: String!) {
    pools(
      where: {
        or: [
          { and: [{ token0: $token0 }, { token1: $token1 }] }
          { and: [{ token0: $token1 }, { token1: $token0 }] }
        ]
      }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      feeTier
      totalValueLockedUSD
      volumeUSD
      txCount
    }
  }
`;

async function findPoolAddress() {
  console.log('🔍 Searching for USDC/COPE pools on Ethereum Sepolia...');
  console.log('📍 USDC Address:', USDC_ADDRESS);
  console.log('📍 COPE Address:', COPE_ADDRESS);
  
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: FIND_POOLS_QUERY,
        variables: {
          token0: USDC_ADDRESS,
          token1: COPE_ADDRESS,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return;
    }

    const pools = data.data?.pools || [];
    
    if (pools.length === 0) {
      console.log('❌ No USDC/COPE pools found on Ethereum Sepolia');
      console.log('💡 Suggestions:');
      console.log('   1. Check if pool exists on mainnet instead');
      console.log('   2. Verify token addresses are correct');
      console.log('   3. Create the pool if it doesn\'t exist');
      return;
    }

    console.log(`✅ Found ${pools.length} USDC/COPE pool(s):`);
    
    pools.forEach((pool: any, index: number) => {
      console.log(`\n📊 Pool ${index + 1}:`);
      console.log(`   Address: ${pool.id}`);
      console.log(`   Token0: ${pool.token0.symbol} (${pool.token0.id})`);
      console.log(`   Token1: ${pool.token1.symbol} (${pool.token1.id})`);
      console.log(`   Fee Tier: ${pool.feeTier / 10000}%`);
      console.log(`   TVL: $${parseFloat(pool.totalValueLockedUSD).toLocaleString()}`);
      console.log(`   Volume: $${parseFloat(pool.volumeUSD).toLocaleString()}`);
      console.log(`   Transactions: ${pool.txCount}`);
    });

    // Recommend the pool with highest TVL
    if (pools.length > 0) {
      const bestPool = pools[0];
      console.log(`\n🎯 Recommended pool address for LP_CONTRACT_ADDRESS:`);
      console.log(`   "${bestPool.id}"`);
      console.log(`\n📝 Update your lib/pool-data.ts:`);
      console.log(`   const LP_CONTRACT_ADDRESS = "${bestPool.id}";`);
    }
    
  } catch (error) {
    console.error('💥 Error finding pools:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if Uniswap V3 Sepolia subgraph is working');
    console.log('   2. Verify token addresses exist on Sepolia');
    console.log('   3. Try searching on mainnet instead');
  }
}

// Alternative: Search on mainnet
async function searchMainnet() {
  console.log('\n🌐 Searching on Ethereum Mainnet...');
  
  const MAINNET_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
  
  // You'll need mainnet token addresses
  console.log('⚠️  Need mainnet USDC/COPE addresses for this search');
  console.log('💡 USDC Mainnet: 0xA0b86a33E6417EfB4e1E35F5F35EcDFC59c0D06E');
  console.log('💡 COPE Mainnet: [Find COPE mainnet address]');
}

// Run the script
findPoolAddress().then(() => {
  console.log('\n🏁 Search complete!');
}).catch(console.error);

export { findPoolAddress };
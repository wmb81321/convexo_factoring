#!/usr/bin/env tsx
/**
 * Test script to verify The Graph endpoint is working
 * Run with: npx tsx scripts/test-graph-endpoint.ts
 */

const MAINNET_SUBGRAPH_ID = "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV";
const GRAPH_API_KEY = process.env.GRAPH_API_KEY;

let SUBGRAPH_URL: string;

if (GRAPH_API_KEY) {
  SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${MAINNET_SUBGRAPH_ID}`;
  console.log('🔑 Testing with API key');
} else {
  SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/public/subgraphs/id/${MAINNET_SUBGRAPH_ID}`;
  console.log('🌐 Testing public endpoint');
}

console.log('📡 Endpoint:', SUBGRAPH_URL);

const TEST_QUERY = `
  query TestConnection {
    _meta {
      block {
        number
        timestamp
      }
    }
    pools(first: 3, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
      totalValueLockedUSD
      volumeUSD
    }
  }
`;

async function testEndpoint() {
  console.log('🧪 Testing The Graph endpoint...');
  
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: TEST_QUERY
      }),
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      
      if (response.status === 401 || errorText.includes('auth error')) {
        console.log('\n💡 Suggestion: Get an API key from https://thegraph.com/studio/');
        console.log('   Set environment variable: GRAPH_API_KEY=your_key_here');
      }
      
      return false;
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return false;
    }

    console.log('✅ Success! The Graph endpoint is working');
    console.log('📈 Latest block:', data.data._meta.block.number);
    console.log('🏊 Top pools:');
    
    data.data.pools.forEach((pool: any, index: number) => {
      const tvl = parseFloat(pool.totalValueLockedUSD);
      const volume = parseFloat(pool.volumeUSD);
      console.log(`   ${index + 1}. ${pool.token0.symbol}/${pool.token1.symbol}`);
      console.log(`      TVL: $${tvl.toLocaleString()}`);
      console.log(`      Volume: $${volume.toLocaleString()}`);
      console.log(`      Address: ${pool.id}`);
    });

    return true;
    
  } catch (error) {
    console.error('💥 Network error:', error);
    return false;
  }
}

// Test for USDC pools specifically
async function findUSDCPools() {
  console.log('\n🔍 Searching for USDC pools...');
  
  const USDC_MAINNET = "0xa0b86a33e6417efb4e1e35f5f35ecdfc59c0d06e"; // USDC
  
  const USDC_QUERY = `
    query FindUSDCPools($usdc: String!) {
      pools(
        where: {
          or: [
            { token0: $usdc }
            { token1: $usdc }
          ]
        }
        orderBy: totalValueLockedUSD
        orderDirection: desc
        first: 10
      ) {
        id
        token0 {
          symbol
          name
          id
        }
        token1 {
          symbol
          name
          id
        }
        feeTier
        totalValueLockedUSD
        volumeUSD
      }
    }
  `;

  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: USDC_QUERY,
        variables: {
          usdc: USDC_MAINNET
        }
      }),
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return;
    }

    const pools = data.data?.pools || [];
    console.log(`Found ${pools.length} USDC pools:`);
    
    pools.slice(0, 5).forEach((pool: any, index: number) => {
      const tvl = parseFloat(pool.totalValueLockedUSD);
      const volume = parseFloat(pool.volumeUSD);
      console.log(`\n   ${index + 1}. ${pool.token0.symbol}/${pool.token1.symbol} (${pool.feeTier / 10000}%)`);
      console.log(`      TVL: $${tvl.toLocaleString()}`);
      console.log(`      Volume: $${volume.toLocaleString()}`);
      console.log(`      Address: ${pool.id}`);
    });

    // Look for COPE specifically
    const copePool = pools.find((pool: any) => 
      pool.token0.symbol.toLowerCase().includes('cope') || 
      pool.token1.symbol.toLowerCase().includes('cope')
    );

    if (copePool) {
      console.log(`\n🎯 FOUND COPE POOL!`);
      console.log(`   Address: ${copePool.id}`);
      console.log(`   Pair: ${copePool.token0.symbol}/${copePool.token1.symbol}`);
    } else {
      console.log('\n❌ No COPE pools found with USDC');
      console.log('💡 Consider using ETH/USDC pool and getting COPE price from CoinGecko');
    }
    
  } catch (error) {
    console.error('💥 Error searching USDC pools:', error);
  }
}

// Run tests
testEndpoint()
  .then(success => {
    if (success) {
      return findUSDCPools();
    }
  })
  .then(() => {
    console.log('\n🏁 Graph endpoint test complete!');
  })
  .catch(console.error);
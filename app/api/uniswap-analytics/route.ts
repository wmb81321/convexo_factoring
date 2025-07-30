import { NextRequest, NextResponse } from 'next/server';

// 🚀 UPDATED: Using your custom convex-us subgraph!
// Get API key from: https://thegraph.com/studio/api-keys/

const GRAPH_API_KEY = process.env.GRAPH_API_KEY;

// OPTION 1: Your custom subgraph (RECOMMENDED)
const CONVEX_SUBGRAPH_NAME = "convex-us";

// OPTION 2: Fallback to Uniswap V3 Mainnet  
const MAINNET_SUBGRAPH_ID = "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV";

let SUBGRAPH_URL: string;

if (GRAPH_API_KEY) {
  // Production: Use The Graph Gateway with your API key 🚀
  SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${MAINNET_SUBGRAPH_ID}`;
  console.log('🚀 Using The Graph Gateway with your API key');
  console.log('🔑 API Key:', GRAPH_API_KEY.substring(0, 8) + '...');
} else {
  // Development: This should not happen now that we have the key
  SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/public/subgraphs/id/${MAINNET_SUBGRAPH_ID}`;
  console.log('⚠️  No API key found - using public endpoint (limited)');
}

export async function POST(request: NextRequest) {
  console.log('🔥 API Route: Proxying Uniswap analytics request');
  
  try {
    const body = await request.json();
    console.log('📡 Proxying to subgraph:', SUBGRAPH_URL);
    console.log('📊 Query:', body);

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📨 Subgraph response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Subgraph error:', response.status, errorText);
      return NextResponse.json(
        { error: `Subgraph error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Subgraph data received:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 
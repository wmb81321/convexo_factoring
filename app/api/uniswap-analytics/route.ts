import { NextRequest, NextResponse } from 'next/server';

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-sepolia';

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